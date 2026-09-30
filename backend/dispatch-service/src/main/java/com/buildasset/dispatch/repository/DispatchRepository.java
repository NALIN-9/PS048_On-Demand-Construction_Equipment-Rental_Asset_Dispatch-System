package com.buildasset.dispatch.repository;

import com.buildasset.dispatch.entity.Dispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DispatchRepository extends JpaRepository<Dispatch, Long> {
    List<Dispatch> findByRentalId(Long rentalId);
    List<Dispatch> findByEquipmentId(Long equipmentId);
    List<Dispatch> findByContractorId(Long contractorId);
    List<Dispatch> findByStatusOrderByDispatchDateDesc(String status);
    long countByStatus(String status);
}
