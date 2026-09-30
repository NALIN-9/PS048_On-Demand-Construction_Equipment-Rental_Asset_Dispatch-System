package com.buildasset.gateway.filter;

import com.buildasset.gateway.config.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    private static final List<String> EXCLUDED_PATHS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/validate",
            "/v3/api-docs",
            "/swagger-ui",
            "/swagger-ui.html"
    );

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Allow CORS pre-flight OPTIONS requests unconditionally
        if (request.getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        // Allow public/whitelisted endpoints
        boolean isExcluded = EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
        if (isExcluded) {
            return chain.filter(exchange);
        }

        // Check Authorization header for protected routes
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, HttpStatus.UNAUTHORIZED, "Missing or malformed Authorization Bearer header");
        }

        String token = authHeader.substring(7).trim();
        if (!jwtUtil.validateToken(token)) {
            return onError(exchange, HttpStatus.UNAUTHORIZED, "Invalid or expired JWT token");
        }

        // Token is valid: extract username and role and decorate request
        try {
            String username = jwtUtil.extractUsername(token);
            String role = jwtUtil.extractRole(token);
            if (role == null || role.isBlank()) {
                role = "ROLE_CONTRACTOR";
            }

            HttpMethod method = request.getMethod();

            // Role-Based Authorization Enforcement at Edge Gateway
            if (!"ROLE_ADMIN".equals(role)) {
                // Contractors cannot modify equipment, maintenance, dispatches, or contractors
                if ("ROLE_CONTRACTOR".equals(role)) {
                    if (path.startsWith("/api/equipment") && (method == HttpMethod.POST || method == HttpMethod.PUT || method == HttpMethod.DELETE || method == HttpMethod.PATCH)) {
                        return onError(exchange, HttpStatus.FORBIDDEN, "Access Denied: Contractors cannot perform equipment or maintenance modifications");
                    }
                    if ((path.startsWith("/api/dispatch") || path.startsWith("/api/dispatches")) && (method == HttpMethod.POST || method == HttpMethod.PUT || method == HttpMethod.DELETE || method == HttpMethod.PATCH)) {
                        return onError(exchange, HttpStatus.FORBIDDEN, "Access Denied: Contractors cannot manage dispatch operations");
                    }
                    if (path.startsWith("/api/contractors") && (method == HttpMethod.POST || method == HttpMethod.PUT || method == HttpMethod.DELETE || method == HttpMethod.PATCH)) {
                        return onError(exchange, HttpStatus.FORBIDDEN, "Access Denied: Contractors cannot manage contractor administrative accounts");
                    }
                }

                // Operators cannot book rentals, manage contractors, or alter equipment master data
                if ("ROLE_OPERATOR".equals(role)) {
                    if (path.startsWith("/api/rentals") && method == HttpMethod.POST) {
                        return onError(exchange, HttpStatus.FORBIDDEN, "Access Denied: Operators cannot book rental contracts");
                    }
                    if (path.startsWith("/api/contractors") && (method == HttpMethod.POST || method == HttpMethod.PUT || method == HttpMethod.DELETE || method == HttpMethod.PATCH)) {
                        return onError(exchange, HttpStatus.FORBIDDEN, "Access Denied: Operators cannot manage contractor accounts");
                    }
                    // Operator can perform maintenance & status updates, but cannot create or delete master equipment or alter master rates/specs
                    if (path.startsWith("/api/equipment")) {
                        boolean isMaintOrStatus = path.contains("/maintenance") || path.contains("/status");
                        if (!isMaintOrStatus && (method == HttpMethod.POST || method == HttpMethod.PUT || method == HttpMethod.DELETE)) {
                            return onError(exchange, HttpStatus.FORBIDDEN, "Access Denied: Operators cannot modify equipment master specifications or delete assets");
                        }
                    }
                }
            }

            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-Auth-Username", username != null ? username : "")
                    .header("X-Auth-Role", role)
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        } catch (Exception e) {
            return onError(exchange, HttpStatus.UNAUTHORIZED, "Failed to parse JWT claims");
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String json = String.format("{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\"}",
                java.time.Instant.now().toString(), status.value(), status.getReasonPhrase(), message);

        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -100; // Run ahead of standard routing filters
    }
}
