package com.buildasset.auth;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class DatabaseUserResetRunner {

    @Test
    void resetAndVerifyDatabaseUsers() {
        // Try port 5433 first, fallback to 5432
        int[] ports = {5433, 5432};
        boolean connected = false;

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String adminHash = encoder.encode("admin@123");
        String contractorHash = encoder.encode("contractor@123");
        String operatorHash = encoder.encode("operator@123");

        for (int port : ports) {
            String url = "jdbc:postgresql://localhost:" + port + "/buildasset_db?currentSchema=auth_schema";
            try (Connection conn = DriverManager.getConnection(url, "postgres", "root")) {
                connected = true;
                System.out.println("=== CONNECTED TO POSTGRESQL ON PORT " + port + " ===");

                try (Statement stmt = conn.createStatement()) {
                    // 1. Delete ALL existing records from auth_schema.users
                    int deleted = stmt.executeUpdate("DELETE FROM auth_schema.users");
                    System.out.println("Deleted " + deleted + " old user records from auth_schema.users.");

                    // 2. Insert the 3 permanent users with BCrypt hashed passwords
                    String insertSql = "INSERT INTO auth_schema.users (username, email, password_hash, full_name, role, enabled, created_at, updated_at) " +
                                       "VALUES (?, ?, ?, ?, ?, true, NOW(), NOW())";

                    try (PreparedStatement ps = conn.prepareStatement(insertSql)) {
                        // ADMIN
                        ps.setString(1, "admin@gmail.com");
                        ps.setString(2, "admin@gmail.com");
                        ps.setString(3, adminHash);
                        ps.setString(4, "System Administrator");
                        ps.setString(5, "ROLE_ADMIN");
                        ps.executeUpdate();

                        // CONTRACTOR
                        ps.setString(1, "contractor@gmail.com");
                        ps.setString(2, "contractor@gmail.com");
                        ps.setString(3, contractorHash);
                        ps.setString(4, "Contractor Operations");
                        ps.setString(5, "ROLE_CONTRACTOR");
                        ps.executeUpdate();

                        // OPERATOR
                        ps.setString(1, "operator@gmail.com");
                        ps.setString(2, "operator@gmail.com");
                        ps.setString(3, operatorHash);
                        ps.setString(4, "Fleet & Yard Operator");
                        ps.setString(5, "ROLE_OPERATOR");
                        ps.executeUpdate();
                    }

                    // 3. Query and display SELECT username, email, role FROM auth_schema.users
                    System.out.println("=== SELECT username, email, role FROM auth_schema.users; ===");
                    try (ResultSet rs = stmt.executeQuery("SELECT username, email, role FROM auth_schema.users ORDER BY id ASC")) {
                        while (rs.next()) {
                            String u = rs.getString("username");
                            String e = rs.getString("email");
                            String r = rs.getString("role");
                            System.out.printf("%-22s %-22s %-20s%n", u, e, r);
                        }
                    }
                    System.out.println("=============================================================");
                }
                break;
            } catch (Exception ex) {
                System.out.println("Connection attempt on port " + port + " failed: " + ex.getMessage());
            }
        }

        if (!connected) {
            System.out.println("Could not connect to PostgreSQL on standard ports. Ensure PostgreSQL is active.");
        }
    }
}
