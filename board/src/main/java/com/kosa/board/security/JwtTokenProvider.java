package com.kosa.board.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private final JwtProperties properties;
    private final SecretKey secretKey;

    public JwtTokenProvider(JwtProperties properties) {
        this.properties = properties;
        // supports both raw string and base64
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(properties.getSecret());
        } catch (IllegalArgumentException e) {
            keyBytes = properties.getSecret().getBytes();
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(Authentication authentication) {
        String username = authentication.getName();
        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        return buildToken(username, roles, properties.getAccessTtlSeconds());
    }

    public String generateAccessToken(UserDetails user) {
        String roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        return buildToken(user.getUsername(), roles, properties.getAccessTtlSeconds());
    }

    public String generateRefreshToken(String username) {
        return buildToken(username, null, properties.getRefreshTtlSeconds());
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return parseClaims(token).getPayload().getSubject();
    }

    public String getRolesFromToken(String token) {
        Object roles = parseClaims(token).getPayload().get("roles");
        return roles != null ? roles.toString() : null;
    }

    private String buildToken(String username, String roles, long ttlSeconds) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(ttlSeconds);
        var builder = Jwts.builder()
                .subject(username)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(secretKey);

        if (roles != null && !roles.isEmpty()) {
            builder.claim("roles", roles);
        }

        return builder.compact();
    }

    private Jws<Claims> parseClaims(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
    }
}

