package com.buildasset.auth.service;

import com.buildasset.auth.config.JwtUtil;
import com.buildasset.auth.dto.*;
import com.buildasset.auth.entity.User;
import com.buildasset.auth.exception.BadRequestException;
import com.buildasset.auth.exception.UnauthorizedException;
import com.buildasset.auth.repository.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${APP_ADMIN_REGISTRATION_KEY:}")
    private String adminRegistrationKey;

    @PersistenceContext
    private EntityManager entityManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ================= REGISTER =================

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (request.getPassword() == null ||
                request.getConfirmPassword() == null ||
                !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new BadRequestException("Username is required");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        String userRole = "ROLE_CONTRACTOR";

        if (request.getRole() != null && !request.getRole().isBlank()) {
            String role = request.getRole().trim().toUpperCase();

            if ("ROLE_ADMIN".equals(role) || "ADMIN".equals(role)) {
                if (adminRegistrationKey == null || adminRegistrationKey.isBlank()
                        || request.getAdminRegistrationKey() == null
                        || request.getAdminRegistrationKey().isBlank()
                        || !MessageDigest.isEqual(
                                adminRegistrationKey.getBytes(StandardCharsets.UTF_8),
                                request.getAdminRegistrationKey().getBytes(StandardCharsets.UTF_8))) {
                    throw new BadRequestException(
                            "A valid administrator registration key is required"
                    );
                }
                userRole = "ROLE_ADMIN";

            } else if ("ROLE_OPERATOR".equals(role) || "OPERATOR".equals(role)) {
                userRole = "ROLE_OPERATOR";

            } else if ("ROLE_CONTRACTOR".equals(role) || "CONTRACTOR".equals(role)) {
                userRole = "ROLE_CONTRACTOR";

            } else {
                throw new BadRequestException("Invalid registration role");
            }
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getUsername().trim(),
                request.getEmail().trim(),
                hashedPassword,
                request.getContactPerson(),
                userRole
        );

        User savedUser = userRepository.save(user);

        // Only contractor accounts require a contractor profile record.
        if ("ROLE_CONTRACTOR".equals(userRole)) {
            try {
                entityManager.createNativeQuery(
                        "INSERT INTO contractor_schema.contractors " +
                        "(company_name, contact_person, email, phone, address, username, role, status) " +
                        "VALUES (:companyName, :contactPerson, :email, :phone, :address, :username, :role, 'ACTIVE') " +
                        "ON CONFLICT (username) DO NOTHING"
                )
                .setParameter("companyName", request.getCompanyName())
                .setParameter("contactPerson", request.getContactPerson())
                .setParameter("email", request.getEmail())
                .setParameter("phone", request.getPhone())
                .setParameter("address", "Registered Office")
                .setParameter("username", request.getUsername().trim())
                .setParameter("role", "ROLE_CONTRACTOR")
                .executeUpdate();
            } catch (Exception ignored) {
                // Contractor service can maintain its own profile records.
            }
        }

        String token = jwtUtil.generateToken(
                savedUser.getUsername(),
                savedUser.getRole(),
                savedUser.getId()
        );

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole()
        );
    }

    // ================= LOGIN =================

    public AuthResponse login(LoginRequest request) {

        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new BadRequestException("Username or email is required");
        }

        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new BadRequestException("Password is required");
        }

        String identifier = request.getUsername().trim();

        User user = userRepository
                .findByUsernameIgnoreCase(identifier)
                .or(() -> userRepository.findByEmailIgnoreCase(identifier))
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        if (!user.isEnabled()) {
            throw new UnauthorizedException("User account is disabled");
        }

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole(),
                user.getId()
        );

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }

    // ================= VALIDATE TOKEN =================

    public ValidateTokenResponse validateToken(String token) {

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (token == null || !jwtUtil.validateToken(token)) {
            return new ValidateTokenResponse(
                    false,
                    null,
                    null,
                    "Token is invalid or expired"
            );
        }

        String username = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);

        return new ValidateTokenResponse(
                true,
                username,
                role,
                "Token is valid"
        );
    }

    // ================= GET USERS BY ROLE =================

    public java.util.List<UserResponse> getUsersByRole(String role) {

        java.util.List<User> list;

        if (role != null && !role.isBlank()) {
            String r = role.trim().toUpperCase();

            if (!r.startsWith("ROLE_")) {
                r = "ROLE_" + r;
            }

            list = userRepository.findByRole(r);
        } else {
            list = userRepository.findAll();
        }

        return list.stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getRole()
                ))
                .collect(java.util.stream.Collectors.toList());
    }
}
