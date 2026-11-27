package com.buildasset.monolith.config;

import com.buildasset.auth.config.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
public class MonolithSecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/validate",
                    "/actuator/health", "/error", "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/auth/users", "/api/auth/operators").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/contractors/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/contractors/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/contractors/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/contractors/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/equipment/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/equipment/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/equipment/**").hasAnyRole("ADMIN", "OPERATOR")
                .requestMatchers(HttpMethod.DELETE, "/api/equipment/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/equipment/*/maintenance/**", "/api/equipment/*/status/**").hasAnyRole("ADMIN", "OPERATOR")
                .requestMatchers(HttpMethod.PUT, "/api/equipment/*/maintenance/**", "/api/equipment/*/status/**").hasAnyRole("ADMIN", "OPERATOR")
                .requestMatchers(HttpMethod.POST, "/api/dispatch/**", "/api/dispatches/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/dispatch/**", "/api/dispatches/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/dispatch/**", "/api/dispatches/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/dispatch/**", "/api/dispatches/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/rentals/**").hasAnyRole("ADMIN", "CONTRACTOR")
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
        @org.springframework.beans.factory.annotation.Value("${CORS_ALLOWED_ORIGINS:https://ps048-on-demand-construction-equipment.onrender.com}") String origins) {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOriginPatterns(List.of(origins.split(",")));
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", c);
        return source;
    }
}