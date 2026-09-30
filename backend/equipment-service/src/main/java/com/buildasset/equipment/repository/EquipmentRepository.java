package com.buildasset.equipment.repository;

import com.buildasset.equipment.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long>, JpaSpecificationExecutor<Equipment> {
    Optional<Equipment> findByEquipmentCode(String equipmentCode);
    boolean existsByEquipmentCode(String equipmentCode);
    long countByStatus(String status);
}

