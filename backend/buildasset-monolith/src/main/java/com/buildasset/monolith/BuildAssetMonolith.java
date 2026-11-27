package com.buildasset.monolith;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.buildasset")
@EntityScan(basePackages = "com.buildasset")
@EnableJpaRepositories(basePackages = "com.buildasset")
public class BuildAssetMonolith {
    public static void main(String[] args) {
        SpringApplication.run(BuildAssetMonolith.class, args);
    }
}