package com.kosa.board.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Log minimal request context for debugging auth issues (debug level only)
        if (log.isDebugEnabled()) {
            log.debug("JWT filter dispatch: uri={}, method={}, contentType={}, hasAuthHeader={}",
                    request.getRequestURI(), request.getMethod(), request.getContentType(),
                    request.getHeader(HttpHeaders.AUTHORIZATION) != null);
        }

        String jwt = resolveToken(request);
        if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
            String username = tokenProvider.getUsernameFromToken(jwt);
            String roles = tokenProvider.getRolesFromToken(jwt);
            List<SimpleGrantedAuthority> authorities = roles == null || roles.isEmpty()
                    ? List.of()
                    : Arrays.stream(roles.split(","))
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(username, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            if (log.isDebugEnabled()) {
                log.debug("JWT filter: authentication established for user='{}' with roles={}", username, roles);
            }
        } else {
            if (log.isDebugEnabled()) {
                log.debug("JWT filter: no valid JWT found; proceeding unauthenticated");
            }
        }
        filterChain.doFilter(request, response);
    }

    // Ensure the filter also runs for async dispatches (e.g., WebAsyncTask, DeferredResult)
    // Multipart uploads that use async processing may otherwise miss authentication on the second dispatch.
    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return false;
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
