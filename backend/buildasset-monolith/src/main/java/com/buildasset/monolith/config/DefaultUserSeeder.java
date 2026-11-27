package com.buildasset.monolith.config;

import com.buildasset.auth.entity.User;
import com.buildasset.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Optional, idempotent bootstrap for the three demo roles.
 *
 * Enable explicitly with BOOTSTRAP_USERS_ENABLED=true and provide each
 * password through environment variables. Passwords are BCrypt-hashed and
 * are never stored in source control. Existing users are never overwritten.
 */
@Component
@ConditionalOnProperty(
        name = "app.bootstrap-users.enabled",
        havingValue = "true"
)
public class DefaultUserSeeder implements CommandLineRunner {

    private static final Logger log =
            LoggerFactory.getLogger(DefaultUserSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-users.admin-password:}")
    private String adminPassword;

    @Value("${app.bootstrap-users.contractor-password:}")
    private String contractorPassword;

    @Value("${app.bootstrap-users.operator-password:}")
    private String operatorPassword;

    public DefaultUserSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        requirePassword("admin", adminPassword);
        requirePassword("contractor", contractorPassword);
        requirePassword("operator", operatorPassword);

        createIfAbsent(
                "admin",
                "admin@gmail.com",
                "Platform Administrator",
                "ROLE_ADMIN",
                adminPassword
        );

        createIfAbsent(
                "contractor",
                "contractor@gmail.com",
                "Demo Contractor",
                "ROLE_CONTRACTOR",
                contractorPassword
        );

        createIfAbsent(
                "operator",
                "operator@gmail.com",
                "Demo Equipment Operator",
                "ROLE_OPERATOR",
                operatorPassword
        );
    }

    private void requirePassword(String account, String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalStateException(
                    "Missing bootstrap password for " + account
                            + ". Configure the corresponding Render environment variable."
            );
        }
    }

    private void createIfAbsent(
            String username,
            String email,
            String fullName,
            String role,
            String rawPassword
    ) {
        if (userRepository.existsByUsernameIgnoreCase(username)
                || userRepository.existsByEmailIgnoreCase(email)) {
            log.info(
                    "Bootstrap account {} already exists; leaving it unchanged.",
                    username
            );
            return;
        }

        User user = new User(
                username,
                email,
                passwordEncoder.encode(rawPassword),
                fullName,
                role
        );

        userRepository.save(user);
        log.info("Created bootstrap account {} with role {}.", username, role);
    }
}
