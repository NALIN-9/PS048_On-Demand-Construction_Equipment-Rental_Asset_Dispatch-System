package com.buildasset.equipment.config;

import com.buildasset.equipment.entity.Equipment;
import com.buildasset.equipment.repository.EquipmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class EquipmentDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(EquipmentDataInitializer.class);
    private final EquipmentRepository equipmentRepository;

    public EquipmentDataInitializer(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    @Override
    public void run(String... args) {
        if (equipmentRepository.count() == 0) {
            log.info("Fleet directory is empty. Seeding standard BuildAsset heavy construction equipment fleet...");
            seedFleet();
        } else {
            log.info("Fleet directory already contains {} equipment assets. Skipping initialization.", equipmentRepository.count());
        }
    }

    private void seedFleet() {
        List<Equipment> defaultFleet = List.of(
                create("EQ-EXC-320D", "Caterpillar 320D Heavy Excavator", "Excavator", "Caterpillar", "320D L Series", 2022,
                        new BigDecimal("12500.00"), "AVAILABLE", "North Yard Fleet Hub",
                        "[\"https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80\",\"https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=1200&q=80\"]",
                        "Heavy crawler excavator with Cat C6.4 ACERT diesel engine, 1.2 m³ rock bucket, and advanced hydraulics for bulk earthwork."),

                create("EQ-JCB-3DX", "JCB 3DX Super Backhoe Loader", "Backhoe", "JCB", "3DX Super 4WD", 2023,
                        new BigDecimal("6800.00"), "AVAILABLE", "Central Depot Bay 2",
                        "[\"https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80\",\"https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80\"]",
                        "Versatile 4-in-1 loader bucket with 0.3 m³ excavator arm, eco-max engine, and reinforced boom for urban roadwork and site prep."),

                create("EQ-DOZ-D6T", "Caterpillar D6T Crawler Dozer", "Bulldozer", "Caterpillar", "D6T XL Differential", 2021,
                        new BigDecimal("16500.00"), "AVAILABLE", "West Quarry Yard",
                        "[\"https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80\",\"https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80\"]",
                        "Powerful crawler dozer with variable pitch blade, elevated sprocket drive, and rear ripper for mass grading."),

                create("EQ-VOL-FMX", "Volvo FMX 460 Heavy Tipper Truck", "Dump Truck", "Volvo", "FMX 460 8x4 Tipper", 2023,
                        new BigDecimal("8900.00"), "AVAILABLE", "East Highway Logistics Hub",
                        "[\"https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80\",\"https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80\"]",
                        "Robust 20.5 m³ tipping body truck equipped with 460 HP D13 diesel engine and heavy-duty suspension for quarry transit."),

                create("EQ-CRN-SCC", "Sany SCC800A Crawler Crane", "Crane", "Sany", "SCC800A 80T", 2022,
                        new BigDecimal("24000.00"), "AVAILABLE", "Metro Rail Staging Yard",
                        "[\"https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?auto=format&fit=crop&w=1200&q=80\",\"https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80\"]",
                        "80-ton lattice boom crawler crane engineered for high-altitude precast girder erection and industrial infrastructure."),

                create("EQ-LDR-950M", "Caterpillar 950M Wheel Loader", "Wheel Loader", "Caterpillar", "950M Aggregate Plus", 2022,
                        new BigDecimal("11200.00"), "AVAILABLE", "South Transit Depot",
                        "[\"https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80\",\"https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80\"]",
                        "Articulated wheel loader featuring 3.3 m³ high-capacity material bucket, joystick steering, and onboard payload telemetry."),

                create("EQ-TEL-540", "JCB 540-170 Loadall Telehandler", "Telehandler", "JCB", "540-170 Construction", 2023,
                        new BigDecimal("9500.00"), "AVAILABLE", "North Yard Fleet Hub",
                        "[\"https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80\"]",
                        "17-meter reach telescopic handler with 4,000 kg payload capacity, sway control frame, pallet forks, and crane hook attachment."),

                create("EQ-KOM-PC210", "Komatsu PC210-10M0 Excavator", "Excavator", "Komatsu", "PC210-10M0", 2023,
                        new BigDecimal("13800.00"), "AVAILABLE", "Central Depot Bay 2",
                        "[\"https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80\",\"https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80\"]",
                        "Hydraulic excavator with high-output engine, heavy-duty boom, KOMTRAX tracking, and hydraulic breaker line.")
        );

        equipmentRepository.saveAll(defaultFleet);
        log.info("Standard fleet of {} machinery items seeded successfully.", defaultFleet.size());
    }

    private Equipment create(String code, String name, String category, String manufacturer,
                             String model, int year, BigDecimal dailyRate, String status,
                             String location, String imageUrl, String description) {
        Equipment e = new Equipment();
        e.setEquipmentCode(code);
        e.setName(name);
        e.setCategory(category);
        e.setManufacturer(manufacturer);
        e.setModel(model);
        e.setYearOfManufacture(year);
        e.setDailyRate(dailyRate);
        e.setStatus(status);
        e.setLocation(location);
        e.setImageUrl(imageUrl);
        e.setDescription(description);
        return e;
    }
}
