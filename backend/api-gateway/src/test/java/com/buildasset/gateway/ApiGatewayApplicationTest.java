package com.buildasset.gateway;

import com.buildasset.gateway.config.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

public class ApiGatewayApplicationTest {

    private final String secret = "BuildAssetLogisticsSuperSecretKeyForJWTAuthentication2026Enterprise";
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(secret);
    }

    @Test
    void testValidJwtTokenValidation() {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        String token = Jwts.builder()
                .subject("testuser")
                .claim("role", "ROLE_CONTRACTOR")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key)
                .compact();

        assertTrue(jwtUtil.validateToken(token));
        assertEquals("testuser", jwtUtil.extractUsername(token));
        assertEquals("ROLE_CONTRACTOR", jwtUtil.extractRole(token));
    }

    @Test
    void testExpiredJwtTokenValidation() {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        String token = Jwts.builder()
                .subject("testuser")
                .claim("role", "ROLE_CONTRACTOR")
                .issuedAt(new Date(System.currentTimeMillis() - 7200000))
                .expiration(new Date(System.currentTimeMillis() - 3600000))
                .signWith(key)
                .compact();

        assertFalse(jwtUtil.validateToken(token));
    }

    @Test
    void testMalformedJwtToken() {
        assertFalse(jwtUtil.validateToken("invalid.token.here"));
    }
}
