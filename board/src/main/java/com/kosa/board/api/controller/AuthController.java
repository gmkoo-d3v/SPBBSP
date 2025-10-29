package com.kosa.board.api.controller;

import com.kosa.board.api.dto.*;
import com.kosa.board.api.dto.ApiResponse;
import com.kosa.board.dto.UserDTO;
import com.kosa.board.exception.BusinessException;
import com.kosa.board.security.JwtProperties;
import com.kosa.board.security.JwtTokenProvider;
import com.kosa.board.service.UserService;
import com.kosa.board.service.CustomUserDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final JwtProperties jwtProperties;
    private final UserService userService;
    private final CustomUserDetailsService userDetailsService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String access = tokenProvider.generateAccessToken(authentication);
        String refresh = tokenProvider.generateRefreshToken(authentication.getName());
        AuthResponse body = new AuthResponse(access, refresh, jwtProperties.getAccessTtlSeconds());
        return ResponseEntity.ok(ApiResponse.success("Login successful", body));
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@Valid @RequestBody SignupRequest request) {
        if (userService.checkDuplicate(request.getUsername())) {
            throw new BusinessException("Username already exists");
        }
        UserDTO dto = new UserDTO();
        dto.setUsername(request.getUsername());
        dto.setPassword(request.getPassword());
        dto.setEmail(request.getEmail());
        userService.save(dto);
        return ResponseEntity.ok(ApiResponse.successMessage("Signup successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("Invalid refresh token");
        }
        String username = tokenProvider.getUsernameFromToken(refreshToken);
        // issue a new access token; include roles
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        String newAccess = tokenProvider.generateAccessToken(userDetails);
        String newRefresh = tokenProvider.generateRefreshToken(username);
        AuthResponse body = new AuthResponse(newAccess, newRefresh, jwtProperties.getAccessTtlSeconds());
        return ResponseEntity.ok(ApiResponse.success(body));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new com.kosa.board.exception.UnauthorizedException("Not authenticated");
        }
        String username = auth.getName();
        UserDTO user = userService.findByUsername(username);
        if (user != null) {
            user.setPassword(null); // do not expose
        }
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
