package com.buildasset.eureka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Netflix Eureka Service Registry for BuildAsset Logistics platform.
 * Listens on port 8761 and acts as the central service registry for
 * API Gateway, Auth, Contractor, Equipment, Rental, and Dispatch services.
 */
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
