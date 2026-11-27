package com.buildasset.contractor.config;

import com.buildasset.contractor.entity.Contractor;
import com.buildasset.contractor.repository.ContractorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class ContractorDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ContractorDataInitializer.class);
    private final ContractorRepository contractorRepository;

    public ContractorDataInitializer(ContractorRepository contractorRepository) {
        this.contractorRepository = contractorRepository;
    }

    @Override
    public void run(String... args) {
        if (!contractorRepository.existsByEmail("contractor@gmail.com")) {
            log.info("Contractor record missing. Seeding default contractor profile for contractor@gmail.com...");
            Contractor c = new Contractor();
            c.setCompanyName("Apex Heavy Infrastructure Ltd");
            c.setContactPerson("Contractor Operations");
            c.setEmail("contractor@gmail.com");
            c.setPhone("+91 98765 43210");
            c.setAddress("Plot 42, Industrial Development Corridor, Sector 18, Bangalore, KA - 560100");
            c.setUsername("contractor@gmail.com");
            c.setRole("ROLE_CONTRACTOR");
            c.setBusinessLicenseNumber("BL-2024-KA-889012");
            c.setTaxId("GSTIN29AAACA1234A1Z5");
            c.setStatus("ACTIVE");
            contractorRepository.save(c);
            log.info("Default contractor profile initialized successfully.");
        }
    }
}
