package com.buildasset.monolith.config;

import com.buildasset.auth.entity.User;
import com.buildasset.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(
        name = "app.bootstrap-users.enabled",
        havingValue = "true"
)
public class DefaultUserSeeder implements CommandLineRunner {

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
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
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

    private void createIfAbsent(
            String username,
            String email,
            String fullName,
            String role,
            String password) {

        if (userRepository.existsByUsernameIgnoreCase(username)
                || userRepository.existsByEmailIgnoreCase(email)) {
            System.out.println(
                    "Bootstrap account already exists: " + username
            );
            return;
        }

        if (password == null || password.isBlank()) {
            throw new IllegalStateException(
                    "Missing bootstrap password for " + username
            );
        }

        User user = new User(
                username,
                email,
                passwordEncoder.encode(password),
                fullName,
                role
        );

        userRepository.save(user);

        System.out.println(
                "Created bootstrap account " + username
                        + " with role " + role
        );
    }
}
