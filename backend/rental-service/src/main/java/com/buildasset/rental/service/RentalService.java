package com.buildasset.rental.service;

import com.buildasset.rental.dto.*;
import com.buildasset.rental.entity.Rental;
import com.buildasset.rental.exception.BadRequestException;
import com.buildasset.rental.exception.ResourceNotFoundException;
import com.buildasset.rental.repository.RentalRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final RestTemplate restTemplate;

    @Value("${equipment.service.url:http://localhost:8082/api/equipment}")
    private String equipmentServiceUrl;

    @PersistenceContext
    private EntityManager entityManager;

    public RentalService(RentalRepository rentalRepository, RestTemplate restTemplate) {
        this.rentalRepository = rentalRepository;
        this.restTemplate = restTemplate;
    }

    public List<RentalResponse> getAllRentals(Long contractorId, Long equipmentId, String status) {
        List<Rental> list;
        if (equipmentId != null) {
            list = rentalRepository.findByEquipmentIdOrderByCreatedAtDesc(equipmentId);
            if (status != null && !status.isBlank()) {
                list = list.stream().filter(r -> r.getStatus().equalsIgnoreCase(status.trim())).collect(Collectors.toList());
            }
        } else if (contractorId != null) {
            list = rentalRepository.findByContractorIdOrderByCreatedAtDesc(contractorId);
            if (status != null && !status.isBlank()) {
                list = list.stream().filter(r -> r.getStatus().equalsIgnoreCase(status.trim())).collect(Collectors.toList());
            }
        } else if (status != null && !status.isBlank()) {
            list = rentalRepository.findByStatusOrderByCreatedAtDesc(status.trim().toUpperCase());
        } else {
            list = rentalRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public RentalResponse getRentalById(Long id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with ID: " + id));
        return mapToResponse(rental);
    }

    public RentalCalculationResponse calculateRental(RentalCalculationRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());
        int durationDays = calculateDurationDays(request.getStartDate(), request.getEndDate());

        EquipmentDetailsDto equipment = fetchEquipmentDetails(request.getEquipmentId());
        boolean isAvailable = "AVAILABLE".equalsIgnoreCase(equipment.getStatus());

        BigDecimal totalAmount = equipment.getDailyRate().multiply(BigDecimal.valueOf(durationDays));

        String message = isAvailable ? "Equipment is available for booking"
                : "Equipment is currently " + equipment.getStatus() + " and cannot be booked";

        return new RentalCalculationResponse(
                request.getEquipmentId(),
                request.getStartDate(),
                request.getEndDate(),
                durationDays,
                equipment.getDailyRate(),
                totalAmount,
                isAvailable,
                message
        );
    }

    @Transactional
    public RentalResponse createRental(RentalRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());
        int durationDays = calculateDurationDays(request.getStartDate(), request.getEndDate());

        // Check equipment availability
        EquipmentDetailsDto equipment = fetchEquipmentDetails(request.getEquipmentId());
        if (!"AVAILABLE".equalsIgnoreCase(equipment.getStatus())) {
            throw new BadRequestException("Equipment is currently " + equipment.getStatus() + " and cannot be booked");
        }

        // Check for conflicting active bookings
        boolean hasOverlap = rentalRepository.existsByEquipmentIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                request.getEquipmentId(),
                Arrays.asList("CONFIRMED", "ACTIVE"),
                request.getEndDate(),
                request.getStartDate()
        );
        if (hasOverlap) {
            throw new BadRequestException("Equipment already has a confirmed booking for the selected dates");
        }

        BigDecimal dailyRate = equipment.getDailyRate();
        BigDecimal totalAmount = dailyRate.multiply(BigDecimal.valueOf(durationDays));

        Rental rental = new Rental();
        rental.setContractorId(request.getContractorId());
        rental.setEquipmentId(request.getEquipmentId());
        rental.setStartDate(request.getStartDate());
        rental.setEndDate(request.getEndDate());
        rental.setDurationDays(durationDays);
        rental.setDailyRate(dailyRate);
        rental.setTotalAmount(totalAmount);
        rental.setStatus("CONFIRMED");
        rental.setBookingReference(generateBookingReference());
        rental.setDeliveryAddress(request.getDeliveryAddress());
        rental.setNotes(request.getNotes());

        Rental saved = rentalRepository.save(rental);

        // Transition equipment status to RESERVED
        updateEquipmentStatusRemote(request.getEquipmentId(), "RESERVED");

        return mapToResponse(saved);
    }

    @Transactional
    public RentalResponse updateRental(Long id, RentalRequest request) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with ID: " + id));

        if (request.getStartDate() != null && request.getEndDate() != null) {
            validateDates(request.getStartDate(), request.getEndDate());
            int durationDays = calculateDurationDays(request.getStartDate(), request.getEndDate());
            rental.setStartDate(request.getStartDate());
            rental.setEndDate(request.getEndDate());
            rental.setDurationDays(durationDays);
            rental.setTotalAmount(rental.getDailyRate().multiply(BigDecimal.valueOf(durationDays)));
        }

        if (request.getDeliveryAddress() != null) {
            rental.setDeliveryAddress(request.getDeliveryAddress());
        }

        if (request.getNotes() != null) {
            rental.setNotes(request.getNotes());
        }

        Rental updated = rentalRepository.save(rental);
        return mapToResponse(updated);
    }

    @Transactional
    public RentalResponse updateRentalStatus(Long id, String status) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with ID: " + id));

        String upperStatus = status.toUpperCase();
        rental.setStatus(upperStatus);
        Rental updated = rentalRepository.save(rental);

        // If completed or cancelled, release equipment to AVAILABLE
        if ("COMPLETED".equalsIgnoreCase(upperStatus) || "CANCELLED".equalsIgnoreCase(upperStatus)) {
            updateEquipmentStatusRemote(rental.getEquipmentId(), "AVAILABLE");
        }

        return mapToResponse(updated);
    }

    @Transactional
    public void deleteRental(Long id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with ID: " + id));
        updateEquipmentStatusRemote(rental.getEquipmentId(), "AVAILABLE");
        rentalRepository.deleteById(id);
    }

    public int calculateDurationDays(LocalDate start, LocalDate end) {
        long days = ChronoUnit.DAYS.between(start, end);
        return days <= 0 ? 1 : (int) days;
    }

    private void validateDates(LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            throw new BadRequestException("Start date and end date are required");
        }
        if (end.isBefore(start)) {
            throw new BadRequestException("End date cannot be before start date");
        }
    }

    private EquipmentDetailsDto fetchEquipmentDetails(Long equipmentId) {
        try {
            String url = equipmentServiceUrl + "/" + equipmentId;
            Map resp = restTemplate.getForObject(url, Map.class);
            if (resp != null) {
                String status = (String) resp.get("status");
                Number rateNum = (Number) resp.get("dailyRate");
                BigDecimal rate = rateNum != null ? new BigDecimal(rateNum.toString()) : new BigDecimal("10000.00");
                return new EquipmentDetailsDto(equipmentId, status, rate);
            }
        } catch (Exception ignored) {
            // Fallback: direct database read if REST endpoint temporarily unreachable
        }

        try {
            Object[] row = (Object[]) entityManager.createNativeQuery(
                    "SELECT status, daily_rate FROM equipment_schema.equipment WHERE id = :id"
            ).setParameter("id", equipmentId).getSingleResult();

            if (row != null) {
                String status = (String) row[0];
                BigDecimal rate = new BigDecimal(row[1].toString());
                return new EquipmentDetailsDto(equipmentId, status, rate);
            }
        } catch (Exception e) {
            throw new ResourceNotFoundException("Equipment not found with ID: " + equipmentId);
        }

        throw new ResourceNotFoundException("Equipment not found with ID: " + equipmentId);
    }

    private void updateEquipmentStatusRemote(Long equipmentId, String status) {
        try {
            String url = equipmentServiceUrl + "/" + equipmentId + "/status?status=" + status;
            restTemplate.patchForObject(url, null, Map.class);
        } catch (Exception ignored) {
            // Fallback direct schema update
            try {
                entityManager.createNativeQuery(
                        "UPDATE equipment_schema.equipment SET status = :status, updated_at = NOW() WHERE id = :id"
                ).setParameter("status", status).setParameter("id", equipmentId).executeUpdate();
            } catch (Exception ex) {
                // log warning
            }
        }
    }

    private String generateBookingReference() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "BK-" + datePart + "-" + randomPart;
    }

    private RentalResponse mapToResponse(Rental r) {
        RentalResponse res = new RentalResponse();
        res.setId(r.getId());
        res.setContractorId(r.getContractorId());
        res.setEquipmentId(r.getEquipmentId());
        res.setStartDate(r.getStartDate());
        res.setEndDate(r.getEndDate());
        res.setDurationDays(r.getDurationDays());
        res.setDailyRate(r.getDailyRate());
        res.setTotalAmount(r.getTotalAmount());
        res.setStatus(r.getStatus());
        res.setBookingReference(r.getBookingReference());
        res.setDeliveryAddress(r.getDeliveryAddress());
        res.setNotes(r.getNotes());
        res.setCreatedAt(r.getCreatedAt());
        res.setUpdatedAt(r.getUpdatedAt());

        // Enrich Equipment Name & Code from equipment_schema
        if (r.getEquipmentId() != null && entityManager != null) {
            try {
                @SuppressWarnings("unchecked")
                List<Object[]> eqRows = entityManager.createNativeQuery(
                        "SELECT name, equipment_code FROM equipment_schema.equipment WHERE id = :id"
                ).setParameter("id", r.getEquipmentId()).getResultList();
                if (!eqRows.isEmpty()) {
                    Object[] row = eqRows.get(0);
                    res.setEquipmentName((String) row[0]);
                    res.setEquipmentCode((String) row[1]);
                }
            } catch (Exception ignored) {}
        }
        if (res.getEquipmentName() == null && r.getEquipmentId() != null) {
            res.setEquipmentName("Equipment #" + r.getEquipmentId());
        }

        // Enrich Contractor Name, Email & Phone from contractor_schema or auth_schema
        if (r.getContractorId() != null && entityManager != null) {
            try {
                @SuppressWarnings("unchecked")
                List<Object[]> cRows = entityManager.createNativeQuery(
                        "SELECT company_name, email, phone FROM contractor_schema.contractors WHERE id = :id"
                ).setParameter("id", r.getContractorId()).getResultList();
                if (!cRows.isEmpty()) {
                    Object[] row = cRows.get(0);
                    res.setContractorName((String) row[0]);
                    res.setContractorEmail((String) row[1]);
                    res.setContractorPhone((String) row[2]);
                } else {
                    @SuppressWarnings("unchecked")
                    List<Object[]> uRows = entityManager.createNativeQuery(
                            "SELECT full_name, email, username FROM auth_schema.users WHERE id = :id"
                    ).setParameter("id", r.getContractorId()).getResultList();
                    if (!uRows.isEmpty()) {
                        Object[] row = uRows.get(0);
                        String fn = (String) row[0];
                        String em = (String) row[1];
                        String un = (String) row[2];
                        res.setContractorName((fn != null && !fn.isBlank()) ? fn : (un != null ? un : em));
                        res.setContractorEmail(em);

                        // Try to find phone and company from contractor profile with matching email/username
                        try {
                            @SuppressWarnings("unchecked")
                            List<Object[]> cMatch = entityManager.createNativeQuery(
                                    "SELECT company_name, phone FROM contractor_schema.contractors WHERE email = :em OR username = :un"
                            ).setParameter("em", em).setParameter("un", un).getResultList();
                            if (!cMatch.isEmpty()) {
                                Object[] mRow = cMatch.get(0);
                                if (mRow[0] != null) res.setContractorName((String) mRow[0]);
                                if (mRow[1] != null) res.setContractorPhone((String) mRow[1]);
                            }
                        } catch (Exception ignored) {}
                    }
                }
            } catch (Exception ignored) {}
        }
        if (res.getContractorName() == null && r.getContractorId() != null) {
            res.setContractorName("Contractor #" + r.getContractorId());
        }

        return res;
    }

    public static class EquipmentDetailsDto {
        private Long id;
        private String status;
        private BigDecimal dailyRate;

        public EquipmentDetailsDto(Long id, String status, BigDecimal dailyRate) {
            this.id = id;
            this.status = status;
            this.dailyRate = dailyRate;
        }

        public Long getId() {
            return id;
        }

        public String getStatus() {
            return status;
        }

        public BigDecimal getDailyRate() {
            return dailyRate;
        }
    }
}
