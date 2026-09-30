package com.buildasset.equipment.service;

import com.buildasset.equipment.dto.*;
import com.buildasset.equipment.entity.Equipment;
import com.buildasset.equipment.entity.MaintenanceLog;
import com.buildasset.equipment.exception.BadRequestException;
import com.buildasset.equipment.exception.ResourceNotFoundException;
import com.buildasset.equipment.repository.EquipmentRepository;
import com.buildasset.equipment.repository.MaintenanceLogRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipmentService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(EquipmentService.class);

    private final EquipmentRepository equipmentRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private org.springframework.web.client.RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${rental.service.url:http://localhost:8083/api/rentals}")
    private String rentalServiceUrl;

    public EquipmentService(EquipmentRepository equipmentRepository,
                            MaintenanceLogRepository maintenanceLogRepository) {
        this.equipmentRepository = equipmentRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
    }

    public List<EquipmentResponse> getAllEquipment(String category, String status, String location, String keyword) {
        Specification<Equipment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category.trim())) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.trim().toLowerCase()));
            }
            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }
            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
            }
            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), pattern);
                Predicate manufacturerLike = cb.like(cb.lower(root.get("manufacturer")), pattern);
                Predicate modelLike = cb.like(cb.lower(root.get("model")), pattern);
                Predicate codeLike = cb.like(cb.lower(root.get("equipmentCode")), pattern);
                predicates.add(cb.or(nameLike, manufacturerLike, modelLike, codeLike));
            }

            return predicates.isEmpty() ? null : cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Equipment> list = equipmentRepository.findAll(spec);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public EquipmentResponse getEquipmentById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));
        return mapToResponse(equipment);
    }

    public EquipmentResponse getEquipmentByCode(String code) {
        Equipment equipment = equipmentRepository.findByEquipmentCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with code: " + code));
        return mapToResponse(equipment);
    }

    @Transactional
    public EquipmentResponse createEquipment(EquipmentRequest request) {
        if (equipmentRepository.existsByEquipmentCode(request.getEquipmentCode())) {
            throw new BadRequestException("Equipment code already exists: " + request.getEquipmentCode());
        }

        Equipment equipment = new Equipment();
        copyProperties(request, equipment);

        Equipment saved = equipmentRepository.save(equipment);
        return mapToResponse(saved);
    }

    @Transactional
    public EquipmentResponse updateEquipment(Long id, EquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));

        if (!equipment.getEquipmentCode().equalsIgnoreCase(request.getEquipmentCode())
                && equipmentRepository.existsByEquipmentCode(request.getEquipmentCode())) {
            throw new BadRequestException("Equipment code already exists: " + request.getEquipmentCode());
        }

        copyProperties(request, equipment);
        Equipment updated = equipmentRepository.save(equipment);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteEquipment(Long id) {
        if (!equipmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Equipment not found with ID: " + id);
        }
        equipmentRepository.deleteById(id);
    }

    @Transactional
    public EquipmentResponse updateEquipmentStatus(Long id, String newStatus) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + id));
        equipment.setStatus(newStatus.toUpperCase());
        Equipment updated = equipmentRepository.save(equipment);
        return mapToResponse(updated);
    }

    public EquipmentStatsResponse getEquipmentStats() {
        long total = equipmentRepository.count();
        long available = equipmentRepository.countByStatus("AVAILABLE");
        long reserved = equipmentRepository.countByStatus("RESERVED");
        long dispatched = equipmentRepository.countByStatus("DISPATCHED");
        long inUse = equipmentRepository.countByStatus("IN_USE");
        long returned = equipmentRepository.countByStatus("RETURNED");
        long maintenance = equipmentRepository.countByStatus("MAINTENANCE");
        long maintenanceDue = maintenanceLogRepository.countByStatus("SCHEDULED");

        return new EquipmentStatsResponse(total, available, reserved, dispatched, inUse, returned, maintenance, maintenanceDue);
    }

    // Maintenance operations
    @Transactional
    public MaintenanceLogResponse scheduleMaintenance(Long equipmentId, MaintenanceLogRequest request) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with ID: " + equipmentId));

        MaintenanceLog log = new MaintenanceLog();
        log.setEquipmentId(equipmentId);
        log.setMaintenanceType(request.getMaintenanceType());
        log.setScheduledDate(request.getScheduledDate());
        log.setCompletedDate(request.getCompletedDate());
        log.setDescription(request.getDescription());
        log.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "SCHEDULED");
        log.setCost(request.getCost());
        log.setTechnicianName(request.getTechnicianName());

        MaintenanceLog saved = maintenanceLogRepository.save(log);

        // Immediate transition to MAINTENANCE
        equipment.setStatus("MAINTENANCE");
        equipmentRepository.save(equipment);

        return mapToLogResponse(saved);
    }

    public List<MaintenanceLogResponse> getMaintenanceLogs(Long equipmentId) {
        if (!equipmentRepository.existsById(equipmentId)) {
            throw new ResourceNotFoundException("Equipment not found with ID: " + equipmentId);
        }
        return maintenanceLogRepository.findByEquipmentIdOrderByScheduledDateDesc(equipmentId)
                .stream().map(this::mapToLogResponse).collect(Collectors.toList());
    }

    @Transactional
    public MaintenanceLogResponse updateMaintenanceStatus(Long logId, String newStatus) {
        MaintenanceLog log = maintenanceLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance log not found with ID: " + logId));

        log.setStatus(newStatus.toUpperCase());
        Equipment equipment = equipmentRepository.findById(log.getEquipmentId()).orElse(null);

        if ("COMPLETED".equalsIgnoreCase(newStatus)) {
            log.setCompletedDate(LocalDate.now());
            if (equipment != null) {
                equipment.setStatus("AVAILABLE");
                equipment.setLastMaintenanceDate(LocalDate.now());
                equipmentRepository.save(equipment);
            }
        } else if ("IN_PROGRESS".equalsIgnoreCase(newStatus) || "SCHEDULED".equalsIgnoreCase(newStatus)) {
            if (equipment != null) {
                equipment.setStatus("MAINTENANCE");
                equipmentRepository.save(equipment);
            }
        }

        MaintenanceLog updated = maintenanceLogRepository.save(log);
        return mapToLogResponse(updated);
    }

    private void copyProperties(EquipmentRequest source, Equipment target) {
        target.setEquipmentCode(source.getEquipmentCode());
        target.setName(source.getName());
        target.setCategory(source.getCategory());
        target.setManufacturer(source.getManufacturer());
        target.setModel(source.getModel());
        target.setYearOfManufacture(source.getYearOfManufacture());
        target.setDailyRate(source.getDailyRate());
        target.setStatus(source.getStatus() != null ? source.getStatus().toUpperCase() : "AVAILABLE");
        target.setLocation(source.getLocation());
        target.setImageUrl(source.getImageUrl());
        target.setDescription(source.getDescription());
        target.setLastMaintenanceDate(source.getLastMaintenanceDate());
        target.setNextMaintenanceDate(source.getNextMaintenanceDate());
    }

    private LocalDate toLocalDate(Object obj) {
        if (obj == null) return null;
        if (obj instanceof LocalDate) return (LocalDate) obj;
        if (obj instanceof java.sql.Date) return ((java.sql.Date) obj).toLocalDate();
        if (obj instanceof java.sql.Timestamp) return ((java.sql.Timestamp) obj).toLocalDateTime().toLocalDate();
        try {
            return LocalDate.parse(obj.toString().split("T")[0].split(" ")[0]);
        } catch (Exception ignored) {
            return null;
        }
    }

    private EquipmentResponse mapToResponse(Equipment e) {
        EquipmentResponse res = new EquipmentResponse();
        res.setId(e.getId());
        res.setEquipmentCode(e.getEquipmentCode());
        res.setName(e.getName());
        res.setCategory(e.getCategory());
        res.setManufacturer(e.getManufacturer());
        res.setModel(e.getModel());
        res.setYearOfManufacture(e.getYearOfManufacture());
        res.setDailyRate(e.getDailyRate());
        res.setStatus(e.getStatus());
        res.setLocation(e.getLocation());
        res.setImageUrl(e.getImageUrl());
        res.setDescription(e.getDescription());
        res.setLastMaintenanceDate(e.getLastMaintenanceDate());
        res.setNextMaintenanceDate(e.getNextMaintenanceDate());
        res.setCreatedAt(e.getCreatedAt());
        res.setUpdatedAt(e.getUpdatedAt());

        if (e.getId() == null) {
            return res;
        }

        log.info("[EquipmentService] Resolving relational telemetry for Equipment ID: {}, Code: {}", e.getId(), e.getEquipmentCode());

        // 1. Relational query: Current Active Rental from rental_schema.rentals
        if (entityManager != null) {
            try {
                List<?> rawRentalRows = entityManager.createNativeQuery(
                        "SELECT r.id, r.contractor_id, r.start_date, r.end_date, r.status, r.booking_reference, r.delivery_address " +
                        "FROM rental_schema.rentals r " +
                        "WHERE r.equipment_id = :equipmentId AND r.status IN ('ACTIVE', 'CONFIRMED', 'PENDING') " +
                        "ORDER BY CASE " +
                        "    WHEN r.status IN ('ACTIVE', 'CONFIRMED') THEN 1 " +
                        "    WHEN r.status = 'PENDING' THEN 2 " +
                        "    ELSE 3 " +
                        "END, r.created_at DESC " +
                        "LIMIT 1"
                ).setParameter("equipmentId", e.getId()).getResultList();

                if (!rawRentalRows.isEmpty()) {
                    Object firstItem = rawRentalRows.get(0);
                    Object[] rRow = (firstItem instanceof Object[]) ? (Object[]) firstItem : rawRentalRows.toArray();

                    Long rentalId = rRow[0] != null ? ((Number) rRow[0]).longValue() : null;
                    Long contractorId = rRow[1] != null ? ((Number) rRow[1]).longValue() : null;
                    Object sDateObj = rRow.length > 2 ? rRow[2] : null;
                    Object eDateObj = rRow.length > 3 ? rRow[3] : null;
                    String rStatus = rRow.length > 4 ? (String) rRow[4] : null;
                    String bookingRef = rRow.length > 5 ? (String) rRow[5] : null;
                    String deliveryAddr = rRow.length > 6 ? (String) rRow[6] : null;

                    res.setCurrentRentalId(rentalId);
                    res.setCurrentRentalReference(bookingRef);
                    res.setCurrentRentalStatus(rStatus);
                    res.setRentalStartDate(toLocalDate(sDateObj));
                    res.setRentalEndDate(toLocalDate(eDateObj));
                    res.setJobSiteAddress(deliveryAddr);
                    res.setContractorId(contractorId);

                    log.info("[EquipmentService] Matched DB rental - ID: {}, Ref: {}, Status: {}, ContractorId: {}",
                            rentalId, bookingRef, rStatus, contractorId);
                }
            } catch (Exception ex) {
                log.warn("[EquipmentService] Database query to rental_schema failed: {}", ex.getMessage());
            }
        }

        // 2. Microservice REST fallback: Rental Service API via RestTemplate if DB query yielded no active rental
        if (res.getCurrentRentalId() == null && restTemplate != null) {
            try {
                String url = (rentalServiceUrl != null ? rentalServiceUrl : "http://localhost:8083/api/rentals")
                        + "?equipmentId=" + e.getId();
                log.info("[EquipmentService] Querying Rental Service API endpoint: {}", url);
                org.springframework.http.ResponseEntity<List<java.util.Map<String, Object>>> resp =
                        restTemplate.exchange(
                                url,
                                org.springframework.http.HttpMethod.GET,
                                null,
                                new org.springframework.core.ParameterizedTypeReference<List<java.util.Map<String, Object>>>() {}
                        );
                List<java.util.Map<String, Object>> rList = resp.getBody();
                if (rList != null && !rList.isEmpty()) {
                    java.util.Map<String, Object> rMap = rList.stream()
                            .filter(m -> {
                                String st = (String) m.get("status");
                                return "CONFIRMED".equalsIgnoreCase(st) || "ACTIVE".equalsIgnoreCase(st) || "PENDING".equalsIgnoreCase(st);
                            })
                            .findFirst()
                            .orElse(null);

                    if (rMap != null) {
                        Number rId = (Number) rMap.get("id");
                        Number cId = (Number) rMap.get("contractorId");
                        String rStat = (String) rMap.get("status");
                        String bRef = (String) rMap.get("bookingReference");
                        String delAddr = (String) rMap.get("deliveryAddress");
                        String cName = (String) rMap.get("contractorName");
                        String cEmail = (String) rMap.get("contractorEmail");
                        String cPhone = (String) rMap.get("contractorPhone");
                        Object sDate = rMap.get("startDate");
                        Object eDate = rMap.get("endDate");

                        if (rId != null) {
                            res.setCurrentRentalId(rId.longValue());
                            res.setCurrentRentalReference(bRef);
                            res.setCurrentRentalStatus(rStat);
                            res.setRentalStartDate(toLocalDate(sDate));
                            res.setRentalEndDate(toLocalDate(eDate));
                            res.setJobSiteAddress(delAddr);
                            if (cId != null) res.setContractorId(cId.longValue());
                            if (cName != null) {
                                res.setContractorName(cName);
                                res.setContractorCompany(cName);
                            }
                            if (cEmail != null) res.setContractorEmail(cEmail);
                            if (cPhone != null) res.setContractorPhone(cPhone);

                            log.info("[EquipmentService] Matched REST rental - ID: {}, Ref: {}, Status: {}, Contractor: {}",
                                    rId, bRef, rStat, cName);
                        }
                    }
                }
            } catch (Exception ex) {
                log.debug("[EquipmentService] Rental Service REST fallback exception: {}", ex.getMessage());
            }
        }

        // 3. Resolve Contractor Name, Company, Email, Phone
        if (res.getContractorId() != null && entityManager != null) {
            try {
                List<?> rawCRows = entityManager.createNativeQuery(
                        "SELECT company_name, email, phone FROM contractor_schema.contractors WHERE id = :cid"
                ).setParameter("cid", res.getContractorId()).getResultList();

                if (!rawCRows.isEmpty()) {
                    Object firstItem = rawCRows.get(0);
                    Object[] cRow = (firstItem instanceof Object[]) ? (Object[]) firstItem : rawCRows.toArray();
                    res.setContractorCompany((String) cRow[0]);
                    res.setContractorName((String) cRow[0]);
                    res.setContractorEmail((String) cRow[1]);
                    res.setContractorPhone((String) cRow[2]);
                } else {
                    List<?> rawURows = entityManager.createNativeQuery(
                            "SELECT full_name, email, username FROM auth_schema.users WHERE id = :uid"
                    ).setParameter("uid", res.getContractorId()).getResultList();

                    if (!rawURows.isEmpty()) {
                        Object firstItem = rawURows.get(0);
                        Object[] uRow = (firstItem instanceof Object[]) ? (Object[]) firstItem : rawURows.toArray();
                        String fn = (String) uRow[0];
                        String em = (String) uRow[1];
                        String un = (String) uRow[2];
                        res.setContractorName((fn != null && !fn.isBlank()) ? fn : (un != null ? un : em));
                        res.setContractorCompany(res.getContractorName());
                        res.setContractorEmail(em);

                        // Try matching contractor profile by email or username
                        try {
                            List<?> rawMatch = entityManager.createNativeQuery(
                                    "SELECT company_name, phone FROM contractor_schema.contractors WHERE email = :em OR username = :un"
                            ).setParameter("em", em).setParameter("un", un).getResultList();
                            if (!rawMatch.isEmpty()) {
                                Object fMatch = rawMatch.get(0);
                                Object[] mRow = (fMatch instanceof Object[]) ? (Object[]) fMatch : rawMatch.toArray();
                                if (mRow[0] != null) {
                                    res.setContractorName((String) mRow[0]);
                                    res.setContractorCompany((String) mRow[0]);
                                }
                                if (mRow[1] != null) res.setContractorPhone((String) mRow[1]);
                            }
                        } catch (Exception ignored) {}
                    }
                }
            } catch (Exception ex) {
                log.warn("[EquipmentService] Contractor lookup failed for ID {}: {}", res.getContractorId(), ex.getMessage());
            }

            if (res.getContractorName() == null) {
                res.setContractorName("Contractor #" + res.getContractorId());
                res.setContractorCompany("Contractor #" + res.getContractorId());
            }
        }

        // 4. Resolve Linked Dispatch & Assigned Operator
        if (entityManager != null && (res.getCurrentRentalId() != null || e.getId() != null)) {
            try {
                List<?> rawDRows = entityManager.createNativeQuery(
                        "SELECT d.id, d.status, d.operator_name, d.carrier_name, d.job_site " +
                        "FROM dispatch_schema.dispatches d " +
                        "WHERE d.rental_id = :rentalId OR (d.equipment_id = :equipmentId AND d.status NOT IN ('RETURNED', 'CANCELLED')) " +
                        "ORDER BY CASE WHEN d.status NOT IN ('RETURNED', 'CANCELLED') THEN 1 ELSE 2 END, d.created_at DESC " +
                        "LIMIT 1"
                ).setParameter("rentalId", res.getCurrentRentalId() != null ? res.getCurrentRentalId() : -1L)
                 .setParameter("equipmentId", e.getId()).getResultList();

                if (!rawDRows.isEmpty()) {
                    Object firstItem = rawDRows.get(0);
                    Object[] dRow = (firstItem instanceof Object[]) ? (Object[]) firstItem : rawDRows.toArray();
                    Long dispatchId = ((Number) dRow[0]).longValue();
                    String dStatus = (String) dRow[1];
                    String opName = (String) dRow[2];
                    String dJobSite = (String) dRow[4];

                    res.setCurrentDispatchId(dispatchId);
                    res.setCurrentDispatchStatus(dStatus);
                    if (opName != null && !opName.trim().isEmpty()) {
                        res.setAssignedOperator(opName.trim());
                    }
                    if (res.getJobSiteAddress() == null || res.getJobSiteAddress().isBlank()) {
                        res.setJobSiteAddress(dJobSite);
                    }

                    log.info("[EquipmentService] Matched Dispatch - ID: {}, Status: {}, Operator: {}",
                            dispatchId, dStatus, res.getAssignedOperator());
                }
            } catch (Exception ex) {
                log.warn("[EquipmentService] Dispatch lookup failed: {}", ex.getMessage());
            }
        }

        // 5. Dynamic status synchronization
        if (!"MAINTENANCE".equalsIgnoreCase(e.getStatus())) {
            String dispatchStat = res.getCurrentDispatchStatus();
            String rStatus = res.getCurrentRentalStatus();
            if ("DISPATCHED".equalsIgnoreCase(dispatchStat) || "IN_TRANSIT".equalsIgnoreCase(dispatchStat)) {
                res.setStatus("DISPATCHED");
            } else if ("ARRIVED".equalsIgnoreCase(dispatchStat) || "IN_USE".equalsIgnoreCase(dispatchStat)) {
                res.setStatus("IN_USE");
            } else if (("CONFIRMED".equalsIgnoreCase(rStatus) || "ACTIVE".equalsIgnoreCase(rStatus)) && "AVAILABLE".equalsIgnoreCase(e.getStatus())) {
                res.setStatus("RESERVED");
            }
        }

        return res;
    }

    private MaintenanceLogResponse mapToLogResponse(MaintenanceLog l) {
        MaintenanceLogResponse res = new MaintenanceLogResponse();
        res.setId(l.getId());
        res.setEquipmentId(l.getEquipmentId());
        res.setMaintenanceType(l.getMaintenanceType());
        res.setScheduledDate(l.getScheduledDate());
        res.setCompletedDate(l.getCompletedDate());
        res.setDescription(l.getDescription());
        res.setStatus(l.getStatus());
        res.setCost(l.getCost());
        res.setTechnicianName(l.getTechnicianName());
        res.setCreatedAt(l.getCreatedAt());
        res.setUpdatedAt(l.getUpdatedAt());
        return res;
    }
}
