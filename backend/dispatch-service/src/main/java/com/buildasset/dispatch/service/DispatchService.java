package com.buildasset.dispatch.service;

import com.buildasset.dispatch.dto.*;
import com.buildasset.dispatch.entity.Dispatch;
import com.buildasset.dispatch.entity.DispatchStatusHistory;
import com.buildasset.dispatch.exception.BadRequestException;
import com.buildasset.dispatch.exception.ResourceNotFoundException;
import com.buildasset.dispatch.repository.DispatchRepository;
import com.buildasset.dispatch.repository.DispatchStatusHistoryRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DispatchService {

    private final DispatchRepository dispatchRepository;
    private final DispatchStatusHistoryRepository historyRepository;
    private final RestTemplate restTemplate;

    @Value("${equipment.service.url:http://localhost:8082/api/equipment}")
    private String equipmentServiceUrl;

    @PersistenceContext
    private EntityManager entityManager;

    public DispatchService(DispatchRepository dispatchRepository,
                           DispatchStatusHistoryRepository historyRepository,
                           RestTemplate restTemplate) {
        this.dispatchRepository = dispatchRepository;
        this.historyRepository = historyRepository;
        this.restTemplate = restTemplate;
    }

    public List<DispatchResponse> getAllDispatches(String status, Long contractorId, Long equipmentId) {
        List<Dispatch> list;
        if (contractorId != null) {
            list = dispatchRepository.findByContractorId(contractorId);
        } else if (equipmentId != null) {
            list = dispatchRepository.findByEquipmentId(equipmentId);
        } else if (status != null && !status.isBlank()) {
            list = dispatchRepository.findByStatusOrderByDispatchDateDesc(status.toUpperCase());
        } else {
            list = dispatchRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public DispatchResponse getDispatchById(Long id) {
        Dispatch dispatch = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch not found with ID: " + id));
        return mapToResponse(dispatch);
    }

    @Transactional
    public DispatchResponse createDispatch(DispatchRequest request) {
        Dispatch dispatch = new Dispatch();
        dispatch.setRentalId(request.getRentalId());
        dispatch.setEquipmentId(request.getEquipmentId());
        dispatch.setContractorId(request.getContractorId());
        dispatch.setJobSite(request.getJobSite());
        dispatch.setDispatchDate(request.getDispatchDate());
        dispatch.setExpectedReturnDate(request.getExpectedReturnDate());
        dispatch.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "PLANNED");
        dispatch.setCarrierName(request.getCarrierName());
        dispatch.setOperatorName(request.getOperatorName());
        dispatch.setSiteContactPhone(request.getSiteContactPhone());
        dispatch.setNotes(request.getNotes());

        Dispatch saved = dispatchRepository.save(dispatch);

        // Record initial status in history
        DispatchStatusHistory history = new DispatchStatusHistory(
                saved.getId(),
                null,
                saved.getStatus(),
                "Initial Dispatch Creation",
                "SYSTEM"
        );
        historyRepository.save(history);

        if ("DISPATCHED".equalsIgnoreCase(saved.getStatus())) {
            updateEquipmentStatusRemote(saved.getEquipmentId(), "DISPATCHED");
        }

        return mapToResponse(saved);
    }

    @Transactional
    public DispatchResponse updateDispatch(Long id, DispatchRequest request) {
        Dispatch dispatch = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch not found with ID: " + id));

        if (request.getJobSite() != null) dispatch.setJobSite(request.getJobSite());
        if (request.getDispatchDate() != null) dispatch.setDispatchDate(request.getDispatchDate());
        if (request.getExpectedReturnDate() != null) dispatch.setExpectedReturnDate(request.getExpectedReturnDate());
        if (request.getCarrierName() != null) dispatch.setCarrierName(request.getCarrierName());
        if (request.getOperatorName() != null) dispatch.setOperatorName(request.getOperatorName());
        if (request.getSiteContactPhone() != null) dispatch.setSiteContactPhone(request.getSiteContactPhone());
        if (request.getNotes() != null) dispatch.setNotes(request.getNotes());

        Dispatch updated = dispatchRepository.save(dispatch);
        return mapToResponse(updated);
    }

    @Transactional
    public DispatchResponse updateDispatchStatus(Long id, String newStatus, String reason, String changedBy) {
        Dispatch dispatch = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch not found with ID: " + id));

        String oldStatus = dispatch.getStatus();
        String upperNewStatus = newStatus.toUpperCase();
        dispatch.setStatus(upperNewStatus);

        if ("RETURNED".equalsIgnoreCase(upperNewStatus)) {
            dispatch.setActualReturnDate(OffsetDateTime.now());
        }

        Dispatch updated = dispatchRepository.save(dispatch);

        // Record audit history
        DispatchStatusHistory history = new DispatchStatusHistory(
                id,
                oldStatus,
                upperNewStatus,
                (reason != null && !reason.isBlank()) ? reason : "Status transition to " + upperNewStatus,
                (changedBy != null && !changedBy.isBlank()) ? changedBy : "OPERATIONS"
        );
        historyRepository.save(history);

        // Sync Equipment status
        syncEquipmentStatus(dispatch.getEquipmentId(), upperNewStatus);

        return mapToResponse(updated);
    }

    public List<DispatchStatusHistoryResponse> getDispatchHistory(Long dispatchId) {
        if (!dispatchRepository.existsById(dispatchId)) {
            throw new ResourceNotFoundException("Dispatch not found with ID: " + dispatchId);
        }
        return historyRepository.findByDispatchIdOrderByRecordedAtAsc(dispatchId)
                .stream().map(this::mapToHistoryResponse).collect(Collectors.toList());
    }

    public DispatchStatsResponse getDispatchStats() {
        long total = dispatchRepository.count();
        long planned = dispatchRepository.countByStatus("PLANNED");
        long dispatched = dispatchRepository.countByStatus("DISPATCHED");
        long inTransit = dispatchRepository.countByStatus("IN_TRANSIT");
        long arrived = dispatchRepository.countByStatus("ARRIVED");
        long inUse = dispatchRepository.countByStatus("IN_USE");
        long returned = dispatchRepository.countByStatus("RETURNED");
        long cancelled = dispatchRepository.countByStatus("CANCELLED");

        return new DispatchStatsResponse(total, planned, dispatched, inTransit, arrived, inUse, returned, cancelled);
    }

    private void syncEquipmentStatus(Long equipmentId, String dispatchStatus) {
        if (equipmentId == null) {
            return;
        }

        String equipmentTargetStatus;
        switch (dispatchStatus.toUpperCase()) {
            case "DISPATCHED":
            case "IN_TRANSIT":
                equipmentTargetStatus = "DISPATCHED";
                break;
            case "ARRIVED":
            case "IN_USE":
                equipmentTargetStatus = "IN_USE";
                break;
            case "RETURNED":
            case "CANCELLED":
                equipmentTargetStatus = "AVAILABLE";
                break;
            default:
                return;
        }

        updateEquipmentStatusRemote(equipmentId, equipmentTargetStatus);
    }

    private void updateEquipmentStatusRemote(Long equipmentId, String status) {
        if (equipmentId == null) {
            return;
        }

        // Direct schema update in PostgreSQL
        try {
            if (entityManager != null) {
                entityManager.createNativeQuery(
                        "UPDATE equipment_schema.equipment SET status = :status, updated_at = NOW() WHERE id = :id"
                ).setParameter("status", status).setParameter("id", equipmentId).executeUpdate();
            }
        } catch (Exception ex) {
            // Direct schema update attempt handled
        }

        // REST call to equipment-service
        try {
            if (restTemplate != null && equipmentServiceUrl != null && !equipmentServiceUrl.isBlank()) {
                String url = equipmentServiceUrl + "/" + equipmentId + "/status?status=" + status;
                restTemplate.patchForObject(url, null, Map.class);
            }
        } catch (Exception ignored) {
            // Equipment service notified or schema already updated
        }
    }

    @Transactional
    public DispatchResponse assignOperator(Long id, String operatorName) {
        Dispatch dispatch = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch not found with ID: " + id));

        String trimmedOperator = (operatorName != null && !operatorName.trim().isEmpty()) ? operatorName.trim() : null;
        dispatch.setOperatorName(trimmedOperator);
        Dispatch updated = dispatchRepository.save(dispatch);

        // Record history
        DispatchStatusHistory history = new DispatchStatusHistory(
                id,
                dispatch.getStatus(),
                dispatch.getStatus(),
                "Assigned operator: " + (trimmedOperator != null ? trimmedOperator : "Unassigned"),
                "ADMIN"
        );
        historyRepository.save(history);

        return mapToResponse(updated);
    }

    private DispatchResponse mapToResponse(Dispatch d) {
        DispatchResponse res = new DispatchResponse();
        res.setId(d.getId());
        res.setRentalId(d.getRentalId());
        res.setEquipmentId(d.getEquipmentId());
        res.setContractorId(d.getContractorId());
        res.setJobSite(d.getJobSite());
        res.setDispatchDate(d.getDispatchDate());
        res.setExpectedReturnDate(d.getExpectedReturnDate());
        res.setActualReturnDate(d.getActualReturnDate());
        res.setStatus(d.getStatus());
        res.setCarrierName(d.getCarrierName());
        res.setOperatorName((d.getOperatorName() != null && !d.getOperatorName().trim().isEmpty()) ? d.getOperatorName().trim() : null);
        res.setSiteContactPhone(d.getSiteContactPhone());
        res.setNotes(d.getNotes());
        res.setCreatedAt(d.getCreatedAt());
        res.setUpdatedAt(d.getUpdatedAt());

        // Enrich Equipment Name & Code from equipment_schema
        if (d.getEquipmentId() != null && entityManager != null) {
            try {
                @SuppressWarnings("unchecked")
                List<Object[]> eqRows = entityManager.createNativeQuery(
                        "SELECT name, equipment_code FROM equipment_schema.equipment WHERE id = :id"
                ).setParameter("id", d.getEquipmentId()).getResultList();
                if (!eqRows.isEmpty()) {
                    Object[] row = eqRows.get(0);
                    res.setEquipmentName((String) row[0]);
                    res.setEquipmentCode((String) row[1]);
                }
            } catch (Exception ignored) {}
        }
        if (res.getEquipmentName() == null && d.getEquipmentId() != null) {
            res.setEquipmentName("Equipment #" + d.getEquipmentId());
        }

        // Enrich Contractor Company Name, Email & Phone from contractor_schema and auth_schema
        if (d.getContractorId() != null && entityManager != null) {
            try {
                @SuppressWarnings("unchecked")
                List<Object[]> cRows = entityManager.createNativeQuery(
                        "SELECT company_name, email, phone FROM contractor_schema.contractors WHERE id = :id"
                ).setParameter("id", d.getContractorId()).getResultList();
                if (!cRows.isEmpty()) {
                    Object[] row = cRows.get(0);
                    res.setContractorName((String) row[0]);
                    res.setContractorEmail((String) row[1]);
                    res.setContractorPhone((String) row[2]);
                } else {
                    @SuppressWarnings("unchecked")
                    List<Object[]> uRows = entityManager.createNativeQuery(
                            "SELECT full_name, email, username FROM auth_schema.users WHERE id = :id"
                    ).setParameter("id", d.getContractorId()).getResultList();
                    if (!uRows.isEmpty()) {
                        Object[] row = uRows.get(0);
                        String fn = (String) row[0];
                        String em = (String) row[1];
                        String un = (String) row[2];
                        res.setContractorName((fn != null && !fn.isBlank()) ? fn : (un != null ? un : em));
                        res.setContractorEmail(em);

                        // Match contractor profile for phone & company
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
        if (res.getContractorName() == null && d.getContractorId() != null) {
            res.setContractorName("Contractor #" + d.getContractorId());
        }

        // Enrich Rental Booking Reference from rental_schema
        if (d.getRentalId() != null && entityManager != null) {
            try {
                @SuppressWarnings("unchecked")
                List<Object> rRows = entityManager.createNativeQuery(
                        "SELECT booking_reference FROM rental_schema.rentals WHERE id = :id"
                ).setParameter("id", d.getRentalId()).getResultList();
                if (!rRows.isEmpty()) {
                    res.setRentalBookingReference((String) rRows.get(0));
                }
            } catch (Exception ignored) {}
        }

        return res;
    }

    private DispatchStatusHistoryResponse mapToHistoryResponse(DispatchStatusHistory h) {
        DispatchStatusHistoryResponse res = new DispatchStatusHistoryResponse();
        res.setId(h.getId());
        res.setDispatchId(h.getDispatchId());
        res.setPreviousStatus(h.getPreviousStatus());
        res.setNewStatus(h.getNewStatus());
        res.setChangeReason(h.getChangeReason());
        res.setChangedBy(h.getChangedBy());
        res.setRecordedAt(h.getRecordedAt());
        return res;
    }
}
