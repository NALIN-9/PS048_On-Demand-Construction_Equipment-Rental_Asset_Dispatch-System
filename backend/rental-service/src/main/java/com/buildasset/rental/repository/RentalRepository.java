package com.buildasset.rental.repository;

import com.buildasset.rental.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {
    List<Rental> findByContractorIdOrderByCreatedAtDesc(Long contractorId);
    List<Rental> findByEquipmentIdOrderByCreatedAtDesc(Long equipmentId);
    List<Rental> findByStatusOrderByCreatedAtDesc(String status);
    Optional<Rental> findByBookingReference(String bookingReference);
    long countByStatus(String status);

    boolean existsByEquipmentIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long equipmentId, List<String> statuses, LocalDate endDate, LocalDate startDate);
}
