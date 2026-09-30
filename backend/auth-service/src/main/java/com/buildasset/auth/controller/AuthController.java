package com.buildasset.auth.controller;

import com.buildasset.auth.dto.*;
import com.buildasset.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth Service", description = "Endpoints for Contractor Registration, Login, and Stateless JWT Validation")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register Contractor", description = "Creates a new contractor user account with BCrypt password hashing and persists to auth_schema.users")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Contractor registered successfully"),
            @ApiResponse(responseCode = "400", description = "Validation error or username/email already taken")
    })
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "User registered successfully",
                "user", response
        ));
    }

    @PostMapping("/login")
    @Operation(summary = "Login & Issue JWT", description = "Verifies username/password credentials and issues a signed stateless HMAC-SHA256 JWT")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authentication successful, returns JWT token"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials or disabled account")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate Token", description = "Validates JWT passed via Authorization Bearer header")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token validity status returned")
    })
    public ResponseEntity<ValidateTokenResponse> validateToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        ValidateTokenResponse response = authService.validateToken(authHeader);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/operators")
    @Operation(summary = "Get Operators", description = "Retrieve list of registered operators for dispatch assignment")
    public ResponseEntity<java.util.List<UserResponse>> getOperators() {
        return ResponseEntity.ok(authService.getUsersByRole("ROLE_OPERATOR"));
    }

    @GetMapping("/users")
    @Operation(summary = "Get Users", description = "Retrieve list of users optionally filtered by role")
    public ResponseEntity<java.util.List<UserResponse>> getUsers(
            @RequestParam(name = "role", required = false) String role) {
        return ResponseEntity.ok(authService.getUsersByRole(role));
    }
}
