package com.buildasset.auth.config;

import com.buildasset.auth.entity.User;
import com.buildasset.auth.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing permanent BuildAsset Logistics users and purging obsolete business records...");

        // 1. Purge obsolete business/test data from PostgreSQL schemas while keeping schemas and tables intact
        cleanBusinessData();

        // 2. Ensure the 3 permanent users exist with their exact credentials, roles and hashed passwords
        seedOrUpdateUser("admin@gmail.com", "admin@gmail.com", "admin@123", "System Administrator", "ROLE_ADMIN");
        seedOrUpdateUser("contractor@gmail.com", "contractor@gmail.com", "contractor@123", "Contractor Operations", "ROLE_CONTRACTOR");
        seedOrUpdateUser("operator@gmail.com", "operator@gmail.com", "operator@123", "Fleet & Yard Operator", "ROLE_OPERATOR");

        // 3. Remove any other user accounts from auth_schema.users
        removeNonPermanentUsers();

        log.info("Permanent users successfully initialized: admin@gmail.com, contractor@gmail.com, operator@gmail.com.");
    }

    private void seedOrUpdateUser(String username, String email, String rawPassword, String fullName, String role) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(email))
                .orElse(null);

        String encodedPassword = passwordEncoder.encode(rawPassword);

        if (user == null) {
            user = new User(username, email, encodedPassword, fullName, role);
            user.setEnabled(true);
            userRepository.save(user);
            log.info("Created permanent user: {} with role {}", username, role);
        } else {
            user.setUsername(username);
            user.setEmail(email);
            user.setPasswordHash(encodedPassword);
            user.setFullName(fullName);
            user.setRole(role);
            user.setEnabled(true);
            userRepository.save(user);
            log.info("Updated/verified permanent user: {} with role {}", username, role);
        }
    }

    private void removeNonPermanentUsers() {
        Set<String> permanentUsernames = Set.of("admin@gmail.com", "contractor@gmail.com", "operator@gmail.com");
        List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            if (!permanentUsernames.contains(u.getUsername()) && !permanentUsernames.contains(u.getEmail())) {
                userRepository.delete(u);
                log.info("Purged non-permanent user record: {} ({})", u.getUsername(), u.getEmail());
            }
        }
    }

    private void cleanBusinessData() {
        String[] cleanupQueries = {
            "TRUNCATE TABLE dispatch_schema.dispatch_status_history CASCADE",
            "TRUNCATE TABLE dispatch_schema.dispatches CASCADE",
            "TRUNCATE TABLE rental_schema.rentals CASCADE",
            "TRUNCATE TABLE equipment_schema.maintenance_logs CASCADE",
            "TRUNCATE TABLE equipment_schema.equipment CASCADE",
            "TRUNCATE TABLE contractor_schema.contractors CASCADE"
        };

        for (String sql : cleanupQueries) {
            try {
                entityManager.createNativeQuery(sql).executeUpdate();
                log.info("Purged business data table: {}", sql);
            } catch (Exception e) {
                log.warn("Notice executing table cleanup for '{}': {}", sql, e.getMessage());
            }
        }
    }
}
