package com.buildasset.equipment.repository;

import com.buildasset.equipment.entity.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {
    List<MaintenanceLog> findByEquipmentIdOrderByScheduledDateDesc(Long equipmentId);
    List<MaintenanceLog> findByStatusOrderByScheduledDateAsc(String status);
    long countByStatus(String status);
}
