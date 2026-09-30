package com.buildasset.auth.service;

import com.buildasset.auth.config.JwtUtil;
import com.buildasset.auth.dto.*;
import com.buildasset.auth.entity.User;
import com.buildasset.auth.exception.BadRequestException;
import com.buildasset.auth.exception.UnauthorizedException;
import com.buildasset.auth.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PersistenceContext
    private EntityManager entityManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        String userRole = "ROLE_CONTRACTOR";
        if (request.getRole() != null && !request.getRole().isBlank()) {
            String r = request.getRole().trim().toUpperCase();
            if ("ROLE_ADMIN".equals(r) || "ROLE_OPERATOR".equals(r) || "ROLE_CONTRACTOR".equals(r)) {
                userRole = r;
            }
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                hashedPassword,
                request.getContactPerson(),
                userRole
        );

        User savedUser = userRepository.save(user);

        // Also synchronize profile into contractor_schema.contractors
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
            .setParameter("username", request.getUsername())
            .setParameter("role", "ROLE_CONTRACTOR")
            .executeUpdate();
        } catch (Exception ignored) {
            // Contractor service will maintain independent records if schemas differ
        }

        String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getRole(), savedUser.getId());
        return new AuthResponse(token, savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new BadRequestException("Username or email is required");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new BadRequestException("Password is required");
        }

        String identifier = request.getUsername().trim();
        User user = userRepository.findByUsernameIgnoreCase(identifier)
                .or(() -> userRepository.findByEmailIgnoreCase(identifier))
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        if (!user.isEnabled()) {
            throw new UnauthorizedException("User account is disabled");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getId());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole());
    }

    public ValidateTokenResponse validateToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        if (token == null || !jwtUtil.validateToken(token)) {
            return new ValidateTokenResponse(false, null, null, "Token is invalid or expired");
        }

        String username = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);
        return new ValidateTokenResponse(true, username, role, "Token is valid");
    }

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
                .map(u -> new UserResponse(u.getId(), u.getUsername(), u.getEmail(), u.getFullName(), u.getRole()))
                .collect(java.util.stream.Collectors.toList());
    }
}
