package com.buildasset.contractor.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI contractorServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BuildAsset Logistics - Contractor Service API")
                        .description("Contractor Profiles, Enterprise Directory, and Licensing Management.")
                        .version("1.0.0")
                        .contact(new Contact().name("BuildAsset Logistics Engineering").email("dev@buildasset.com"))
                        .license(new License().name("Enterprise Proprietary License")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .name("bearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token (without 'Bearer ' prefix).")));
    }
}
