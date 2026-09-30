package com.buildasset.auth;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class FullDatabaseCleanerRunner {

    @Test
    void purgeAllBusinessDataAndKeepOnly3Users() {
        int[] ports = {5433, 5432};
        boolean connected = false;

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String adminHash = encoder.encode("admin@123");
        String contractorHash = encoder.encode("contractor@123");
        String operatorHash = encoder.encode("operator@123");

        for (int port : ports) {
            String url = "jdbc:postgresql://localhost:" + port + "/buildasset_db";
            try (Connection conn = DriverManager.getConnection(url, "postgres", "root")) {
                connected = true;
                System.out.println("=============================================================");
                System.out.println("CONNECTED TO POSTGRESQL ON PORT " + port);
                System.out.println("=============================================================");

                try (Statement stmt = conn.createStatement()) {
                    // 1. Discover all user tables across all non-system schemas
                    List<String> tables = new ArrayList<>();
                    String findTablesSql = "SELECT table_schema, table_name FROM information_schema.tables " +
                                           "WHERE table_schema IN ('contractor_schema', 'equipment_schema', 'rental_schema', 'dispatch_schema', 'auth_schema', 'public') " +
                                           "AND table_type = 'BASE TABLE'";

                    try (ResultSet rs = stmt.executeQuery(findTablesSql)) {
                        while (rs.next()) {
                            String schema = rs.getString("table_schema");
                            String table = rs.getString("table_name");
                            tables.add(schema + "." + table);
                        }
                    }

                    System.out.println("Discovered database tables: " + tables);

                    // 2. Truncate all business tables with RESTART IDENTITY CASCADE
                    for (String fullTableName : tables) {
                        if (fullTableName.equalsIgnoreCase("auth_schema.users")) {
                            continue; // handled separately to keep 3 users
                        }
                        try {
                            stmt.executeUpdate("TRUNCATE TABLE " + fullTableName + " RESTART IDENTITY CASCADE");
                            System.out.println("Truncated & reset sequence: " + fullTableName);
                        } catch (Exception ex) {
                            System.out.println("Notice on table " + fullTableName + ": " + ex.getMessage());
                        }
                    }

                    // 3. Clean auth_schema.users and seed only the 3 users
                    stmt.executeUpdate("TRUNCATE TABLE auth_schema.users RESTART IDENTITY CASCADE");
                    System.out.println("Reset auth_schema.users with RESTART IDENTITY.");

                    String insertUserSql = "INSERT INTO auth_schema.users (username, email, password_hash, full_name, role, enabled, created_at, updated_at) " +
                                           "VALUES (?, ?, ?, ?, ?, true, NOW(), NOW())";

                    try (PreparedStatement ps = conn.prepareStatement(insertUserSql)) {
                        // 1. ADMIN
                        ps.setString(1, "admin@gmail.com");
                        ps.setString(2, "admin@gmail.com");
                        ps.setString(3, adminHash);
                        ps.setString(4, "System Administrator");
                        ps.setString(5, "ROLE_ADMIN");
                        ps.executeUpdate();

                        // 2. CONTRACTOR
                        ps.setString(1, "contractor@gmail.com");
                        ps.setString(2, "contractor@gmail.com");
                        ps.setString(3, contractorHash);
                        ps.setString(4, "Contractor Operations");
                        ps.setString(5, "ROLE_CONTRACTOR");
                        ps.executeUpdate();

                        // 3. OPERATOR
                        ps.setString(1, "operator@gmail.com");
                        ps.setString(2, "operator@gmail.com");
                        ps.setString(3, operatorHash);
                        ps.setString(4, "Fleet & Yard Operator");
                        ps.setString(5, "ROLE_OPERATOR");
                        ps.executeUpdate();
                    }

                    // 4. Verify Row Counts Across All Database Tables
                    System.out.println("\n=== DATABASE PURGE VERIFICATION (ALL TABLES) ===");
                    for (String fullTableName : tables) {
                        try (ResultSet countRs = stmt.executeQuery("SELECT count(*) FROM " + fullTableName)) {
                            if (countRs.next()) {
                                long count = countRs.getLong(1);
                                System.out.printf("Table %-40s => %d rows%n", fullTableName, count);
                            }
                        } catch (Exception ex) {
                            System.out.println("Could not count " + fullTableName + ": " + ex.getMessage());
                        }
                    }

                    // 5. Query and Display auth_schema.users
                    System.out.println("\n=== REMAINING ACTIVE USERS IN auth_schema.users ===");
                    try (ResultSet rs = stmt.executeQuery("SELECT id, username, email, role, enabled FROM auth_schema.users ORDER BY id ASC")) {
                        while (rs.next()) {
                            long id = rs.getLong("id");
                            String u = rs.getString("username");
                            String e = rs.getString("email");
                            String r = rs.getString("role");
                            boolean enabled = rs.getBoolean("enabled");
                            System.out.printf("ID: %d | Username: %-22s | Email: %-22s | Role: %-18s | Enabled: %b%n", id, u, e, r, enabled);
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
            System.out.println("Could not connect to PostgreSQL on port 5433 or 5432.");
        }
    }
}
