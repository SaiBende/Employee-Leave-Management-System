package com.leavemanagement.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;

    public JwtService(@Value("${jwt.secret}") String secret,
                      @Value("${jwt.expiration}") long expiration) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(
            java.util.Base64.getEncoder().encodeToString(secret.getBytes())));
        this.expiration = expiration;
    }

    public String generateToken(String email, Long userId, String role) {
        return Jwts.builder()
            .subject(email)
            .claim("userId", userId)
            .claim("role", role)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(secretKey)
            .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
