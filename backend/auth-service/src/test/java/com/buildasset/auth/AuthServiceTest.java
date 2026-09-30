package com.buildasset.auth;

import com.buildasset.auth.config.JwtUtil;
import com.buildasset.auth.dto.AuthResponse;
import com.buildasset.auth.dto.LoginRequest;
import com.buildasset.auth.dto.RegisterRequest;
import com.buildasset.auth.dto.ValidateTokenResponse;
import com.buildasset.auth.entity.User;
import com.buildasset.auth.exception.BadRequestException;
import com.buildasset.auth.exception.UnauthorizedException;
import com.buildasset.auth.repository.UserRepository;
import com.buildasset.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtUtil = new JwtUtil("BuildAssetLogisticsSuperSecretKeyForJWTAuthentication2026Enterprise", 3600000);
        authService = new AuthService(userRepository, passwordEncoder, jwtUtil);
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("newcontractor");
        req.setEmail("contractor@test.com");
        req.setPassword("SecurePass@123");
        req.setConfirmPassword("SecurePass@123");
        req.setCompanyName("Apex Infra");
        req.setContactPerson("Nalin");
        req.setPhone("9876543210");

        when(userRepository.existsByUsername("newcontractor")).thenReturn(false);
        when(userRepository.existsByEmail("contractor@test.com")).thenReturn(false);

        User savedUser = new User("newcontractor", "contractor@test.com", passwordEncoder.encode("SecurePass@123"), "Nalin", "ROLE_CONTRACTOR");
        savedUser.setId(10L);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        AuthResponse resp = authService.register(req);
        assertNotNull(resp);
        assertEquals("newcontractor", resp.getUsername());
        assertEquals("contractor@test.com", resp.getEmail());
        assertNotNull(resp.getToken());
        assertTrue(jwtUtil.validateToken(resp.getToken()));
    }

    @Test
    void testRegisterDuplicateUsernameThrows() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("duplicateUser");
        req.setEmail("unique@test.com");
        req.setPassword("Password@123");
        req.setConfirmPassword("Password@123");

        when(userRepository.existsByUsername("duplicateUser")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testRegisterDuplicateEmailThrows() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("uniqueUser");
        req.setEmail("existing@test.com");
        req.setPassword("Password@123");
        req.setConfirmPassword("Password@123");

        when(userRepository.existsByUsername("uniqueUser")).thenReturn(false);
        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testRegisterPasswordMismatchThrows() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("user1");
        req.setEmail("user1@test.com");
        req.setPassword("Password123");
        req.setConfirmPassword("Password456");

        assertThrows(BadRequestException.class, () -> authService.register(req));
    }

    @Test
    void testLoginSuccessWithUsername() {
        String hash = passwordEncoder.encode("SecretPass123");
        User user = new User("validuser", "user@test.com", hash, "John", "ROLE_CONTRACTOR");
        user.setId(5L);

        when(userRepository.findByUsernameIgnoreCase("validuser")).thenReturn(Optional.of(user));

        LoginRequest req = new LoginRequest();
        req.setUsername("validuser");
        req.setPassword("SecretPass123");

        AuthResponse resp = authService.login(req);
        assertNotNull(resp);
        assertEquals("validuser", resp.getUsername());
        assertNotNull(resp.getToken());
    }

    @Test
    void testLoginInvalidPasswordThrows() {
        String hash = passwordEncoder.encode("CorrectPassword");
        User user = new User("validuser", "user@test.com", hash, "John", "ROLE_CONTRACTOR");

        when(userRepository.findByUsernameIgnoreCase("validuser")).thenReturn(Optional.of(user));

        LoginRequest req = new LoginRequest();
        req.setUsername("validuser");
        req.setPassword("WrongPassword");

        assertThrows(UnauthorizedException.class, () -> authService.login(req));
    }

    @Test
    void testLoginUserNotFoundThrows() {
        when(userRepository.findByUsernameIgnoreCase("nonexistent")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("nonexistent")).thenReturn(Optional.empty());

        LoginRequest req = new LoginRequest();
        req.setUsername("nonexistent");
        req.setPassword("Pass123");

        assertThrows(UnauthorizedException.class, () -> authService.login(req));
    }

    @Test
    void testValidateTokenValid() {
        String token = jwtUtil.generateToken("user1", "ROLE_CONTRACTOR", 1L);
        ValidateTokenResponse res = authService.validateToken("Bearer " + token);

        assertTrue(res.isValid());
        assertEquals("user1", res.getUsername());
        assertEquals("ROLE_CONTRACTOR", res.getRole());
    }

    @Test
    void testValidateTokenInvalid() {
        ValidateTokenResponse res = authService.validateToken("Bearer invalid.token.value");
        assertFalse(res.isValid());
    }

    @Test
    void testJwtExpiration() throws InterruptedException {
        JwtUtil shortLivedJwt = new JwtUtil("BuildAssetLogisticsSuperSecretKeyForJWTAuthentication2026Enterprise", 1);
        String token = shortLivedJwt.generateToken("expireUser", "ROLE_ADMIN", 99L);
        Thread.sleep(10);
        assertFalse(shortLivedJwt.validateToken(token));
    }

    @Test
    void testPasswordBCryptEncoding() {
        String raw = "MyStrongPassword#2026";
        String encoded = passwordEncoder.encode(raw);

        assertNotEquals(raw, encoded);
        assertTrue(passwordEncoder.matches(raw, encoded));
        assertFalse(passwordEncoder.matches("WrongPass", encoded));
    }

    @Test
    void testPermanentAdminLogin() {
        String hash = passwordEncoder.encode("admin@123");
        User adminUser = new User("admin@gmail.com", "admin@gmail.com", hash, "System Administrator", "ROLE_ADMIN");
        adminUser.setId(1L);

        when(userRepository.findByUsernameIgnoreCase("admin@gmail.com")).thenReturn(Optional.of(adminUser));

        LoginRequest req = new LoginRequest();
        req.setUsername("admin@gmail.com");
        req.setPassword("admin@123");

        AuthResponse resp = authService.login(req);
        assertNotNull(resp);
        assertEquals("admin@gmail.com", resp.getUsername());
        assertEquals("ROLE_ADMIN", resp.getRole());
        assertTrue(jwtUtil.validateToken(resp.getToken()));
        assertEquals("ROLE_ADMIN", jwtUtil.extractRole(resp.getToken()));
    }

    @Test
    void testPermanentContractorLogin() {
        String hash = passwordEncoder.encode("contractor@123");
        User contractorUser = new User("contractor@gmail.com", "contractor@gmail.com", hash, "Contractor Operations", "ROLE_CONTRACTOR");
        contractorUser.setId(2L);

        when(userRepository.findByUsernameIgnoreCase("contractor@gmail.com")).thenReturn(Optional.of(contractorUser));

        LoginRequest req = new LoginRequest();
        req.setUsername("contractor@gmail.com");
        req.setPassword("contractor@123");

        AuthResponse resp = authService.login(req);
        assertNotNull(resp);
        assertEquals("contractor@gmail.com", resp.getUsername());
        assertEquals("ROLE_CONTRACTOR", resp.getRole());
        assertTrue(jwtUtil.validateToken(resp.getToken()));
        assertEquals("ROLE_CONTRACTOR", jwtUtil.extractRole(resp.getToken()));
    }

    @Test
    void testPermanentOperatorLogin() {
        String hash = passwordEncoder.encode("operator@123");
        User operatorUser = new User("operator@gmail.com", "operator@gmail.com", hash, "Fleet & Yard Operator", "ROLE_OPERATOR");
        operatorUser.setId(3L);

        when(userRepository.findByUsernameIgnoreCase("operator@gmail.com")).thenReturn(Optional.of(operatorUser));

        LoginRequest req = new LoginRequest();
        req.setUsername("operator@gmail.com");
        req.setPassword("operator@123");

        AuthResponse resp = authService.login(req);
        assertNotNull(resp);
        assertEquals("operator@gmail.com", resp.getUsername());
        assertEquals("ROLE_OPERATOR", resp.getRole());
        assertTrue(jwtUtil.validateToken(resp.getToken()));
        assertEquals("ROLE_OPERATOR", jwtUtil.extractRole(resp.getToken()));
    }

    @Test
    void testCaseInsensitiveAndTrimmedLogin() {
        String hash = passwordEncoder.encode("admin@123");
        User adminUser = new User("admin@gmail.com", "admin@gmail.com", hash, "System Administrator", "ROLE_ADMIN");
        adminUser.setId(1L);

        when(userRepository.findByUsernameIgnoreCase("Admin@gmail.com")).thenReturn(Optional.of(adminUser));

        LoginRequest req = new LoginRequest();
        req.setUsername("  Admin@gmail.com  ");
        req.setPassword("admin@123");

        AuthResponse resp = authService.login(req);
        assertNotNull(resp);
        assertEquals("admin@gmail.com", resp.getUsername());
        assertEquals("ROLE_ADMIN", resp.getRole());
    }
}
