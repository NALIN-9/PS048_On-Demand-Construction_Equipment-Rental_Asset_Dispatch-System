package com.buildasset.equipment;

import com.buildasset.equipment.dto.*;
import com.buildasset.equipment.entity.Equipment;
import com.buildasset.equipment.entity.MaintenanceLog;
import com.buildasset.equipment.exception.BadRequestException;
import com.buildasset.equipment.exception.ResourceNotFoundException;
import com.buildasset.equipment.repository.EquipmentRepository;
import com.buildasset.equipment.repository.MaintenanceLogRepository;
import com.buildasset.equipment.service.EquipmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EquipmentServiceTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private MaintenanceLogRepository maintenanceLogRepository;

    private EquipmentService equipmentService;

    @BeforeEach
    void setUp() {
        equipmentService = new EquipmentService(equipmentRepository, maintenanceLogRepository);
    }

    @Test
    void testGetAllEquipmentEmptyInitially() {
        when(equipmentRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class))).thenReturn(Collections.emptyList());

        List<EquipmentResponse> result = equipmentService.getAllEquipment(null, null, null, null);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testCreateEquipmentSuccess() {
        EquipmentRequest req = new EquipmentRequest();
        req.setEquipmentCode("EQ-TEST-001");
        req.setName("Test Hydraulic Excavator");
        req.setCategory("Excavator");
        req.setManufacturer("Caterpillar");
        req.setModel("320 GC");
        req.setYearOfManufacture(2023);
        req.setDailyRate(new BigDecimal("15000.00"));
        req.setLocation("Mumbai Yard A");

        when(equipmentRepository.existsByEquipmentCode("EQ-TEST-001")).thenReturn(false);

        Equipment saved = new Equipment();
        saved.setId(1L);
        saved.setEquipmentCode("EQ-TEST-001");
        saved.setName("Test Hydraulic Excavator");
        saved.setStatus("AVAILABLE");
        saved.setDailyRate(new BigDecimal("15000.00"));

        when(equipmentRepository.save(any(Equipment.class))).thenReturn(saved);

        EquipmentResponse res = equipmentService.createEquipment(req);
        assertNotNull(res);
        assertEquals(1L, res.getId());
        assertEquals("EQ-TEST-001", res.getEquipmentCode());
        assertEquals("AVAILABLE", res.getStatus());
    }

    @Test
    void testCreateEquipmentDuplicateCodeThrows() {
        EquipmentRequest req = new EquipmentRequest();
        req.setEquipmentCode("EQ-DUPLICATE");

        when(equipmentRepository.existsByEquipmentCode("EQ-DUPLICATE")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> equipmentService.createEquipment(req));
        verify(equipmentRepository, never()).save(any());
    }

    @Test
    void testGetEquipmentByIdSuccess() {
        Equipment eq = new Equipment();
        eq.setId(10L);
        eq.setEquipmentCode("EQ-010");
        eq.setName("Tower Crane");
        eq.setStatus("AVAILABLE");
        eq.setDailyRate(new BigDecimal("25000.00"));

        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(eq));

        EquipmentResponse res = equipmentService.getEquipmentById(10L);
        assertNotNull(res);
        assertEquals(10L, res.getId());
        assertEquals("Tower Crane", res.getName());
    }

    @Test
    void testGetEquipmentByIdNotFoundThrows() {
        when(equipmentRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> equipmentService.getEquipmentById(999L));
    }

    @Test
    void testUpdateEquipmentSuccess() {
        Equipment existing = new Equipment();
        existing.setId(2L);
        existing.setEquipmentCode("EQ-002");
        existing.setName("Old Bulldozer");
        existing.setDailyRate(new BigDecimal("12000.00"));

        when(equipmentRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(equipmentRepository.save(any(Equipment.class))).thenReturn(existing);

        EquipmentRequest req = new EquipmentRequest();
        req.setEquipmentCode("EQ-002");
        req.setName("Updated Bulldozer D8T");
        req.setCategory("Bulldozer");
        req.setDailyRate(new BigDecimal("14000.00"));

        EquipmentResponse updated = equipmentService.updateEquipment(2L, req);
        assertNotNull(updated);
        assertEquals("Updated Bulldozer D8T", existing.getName());
    }

    @Test
    void testDeleteEquipmentSuccess() {
        when(equipmentRepository.existsById(5L)).thenReturn(true);
        equipmentService.deleteEquipment(5L);
        verify(equipmentRepository).deleteById(5L);
    }

    @Test
    void testUpdateStatusTransitions() {
        Equipment eq = new Equipment();
        eq.setId(1L);
        eq.setStatus("AVAILABLE");

        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(eq));
        when(equipmentRepository.save(any(Equipment.class))).thenReturn(eq);

        EquipmentResponse res = equipmentService.updateEquipmentStatus(1L, "RESERVED");
        assertEquals("RESERVED", res.getStatus());
    }

    @Test
    void testScheduleMaintenanceSetsEquipmentMaintenanceStatus() {
        Equipment eq = new Equipment();
        eq.setId(5L);
        eq.setStatus("AVAILABLE");

        when(equipmentRepository.findById(5L)).thenReturn(Optional.of(eq));

        MaintenanceLog log = new MaintenanceLog();
        log.setId(101L);
        log.setEquipmentId(5L);
        log.setStatus("IN_PROGRESS");
        log.setScheduledDate(LocalDate.now());

        when(maintenanceLogRepository.save(any(MaintenanceLog.class))).thenReturn(log);

        MaintenanceLogRequest req = new MaintenanceLogRequest();
        req.setMaintenanceType("Hydraulic Check");
        req.setScheduledDate(LocalDate.now());
        req.setStatus("IN_PROGRESS");
        req.setDescription("500hr service");

        MaintenanceLogResponse res = equipmentService.scheduleMaintenance(5L, req);
        assertNotNull(res);
        assertEquals("IN_PROGRESS", res.getStatus());
        assertEquals("MAINTENANCE", eq.getStatus());
        verify(equipmentRepository).save(eq);
    }

    @Test
    void testCompleteMaintenanceSetsEquipmentAvailable() {
        Equipment eq = new Equipment();
        eq.setId(5L);
        eq.setStatus("MAINTENANCE");

        MaintenanceLog log = new MaintenanceLog();
        log.setId(10L);
        log.setEquipmentId(5L);
        log.setStatus("IN_PROGRESS");

        when(maintenanceLogRepository.findById(10L)).thenReturn(Optional.of(log));
        when(equipmentRepository.findById(5L)).thenReturn(Optional.of(eq));
        when(maintenanceLogRepository.save(any(MaintenanceLog.class))).thenReturn(log);

        MaintenanceLogResponse res = equipmentService.updateMaintenanceStatus(10L, "COMPLETED");
        assertEquals("COMPLETED", res.getStatus());
        assertEquals("AVAILABLE", eq.getStatus());
        verify(equipmentRepository).save(eq);
    }

    @Test
    void testGetEquipmentStatsZeroInitially() {
        when(equipmentRepository.count()).thenReturn(0L);
        when(equipmentRepository.countByStatus(anyString())).thenReturn(0L);
        when(maintenanceLogRepository.countByStatus(anyString())).thenReturn(0L);

        EquipmentStatsResponse stats = equipmentService.getEquipmentStats();
        assertNotNull(stats);
        assertEquals(0, stats.getTotal());
        assertEquals(0, stats.getAvailable());
        assertEquals(0, stats.getReserved());
    }

    @Test
    void testEquipmentRentalContractorDispatchOperatorChain() {
        jakarta.persistence.EntityManager mockEm = mock(jakarta.persistence.EntityManager.class);
        jakarta.persistence.Query mockRentalQuery = mock(jakarta.persistence.Query.class);
        jakarta.persistence.Query mockContractorQuery = mock(jakarta.persistence.Query.class);
        jakarta.persistence.Query mockDispatchQuery = mock(jakarta.persistence.Query.class);

        // Inject entityManager via reflection for testing
        org.springframework.test.util.ReflectionTestUtils.setField(equipmentService, "entityManager", mockEm);

        Equipment eq = new Equipment();
        eq.setId(1L);
        eq.setEquipmentCode("JCB-3D");
        eq.setName("JCB 3DX Backhoe Loader");
        eq.setStatus("AVAILABLE");

        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(eq));

        // Mock rental lookup query returning RNT-0001 for Contractor 2
        when(mockEm.createNativeQuery(contains("FROM rental_schema.rentals"))).thenReturn(mockRentalQuery);
        when(mockRentalQuery.setParameter(eq("equipmentId"), any())).thenReturn(mockRentalQuery);
        Object[] rentalRow = new Object[]{
                1L, // rental id
                2L, // contractor id
                java.sql.Date.valueOf("2026-09-21"), // start date
                java.sql.Date.valueOf("2026-09-25"), // end date
                "CONFIRMED", // status
                "RNT-0001", // booking ref
                "Downtown Metro Rail Project Site, Mumbai" // delivery address
        };
        when(mockRentalQuery.getResultList()).thenReturn(Collections.singletonList(rentalRow));

        // Mock contractor lookup query
        when(mockEm.createNativeQuery(contains("FROM contractor_schema.contractors WHERE id = :cid"))).thenReturn(mockContractorQuery);
        when(mockContractorQuery.setParameter(eq("cid"), any())).thenReturn(mockContractorQuery);
        Object[] contractorRow = new Object[]{
                "Apex Infrastructure Ltd",
                "contractor2@apex.com",
                "+91 9876543210"
        };
        when(mockContractorQuery.getResultList()).thenReturn(Collections.singletonList(contractorRow));

        // Mock dispatch lookup query returning DSP-0001 and Operator
        when(mockEm.createNativeQuery(contains("FROM dispatch_schema.dispatches"))).thenReturn(mockDispatchQuery);
        when(mockDispatchQuery.setParameter(eq("rentalId"), any())).thenReturn(mockDispatchQuery);
        when(mockDispatchQuery.setParameter(eq("equipmentId"), any())).thenReturn(mockDispatchQuery);
        Object[] dispatchRow = new Object[]{
                1L, // dispatch id
                "PLANNED", // status
                "Rajesh Sharma", // operator name
                "National Logistics", // carrier name
                "Downtown Metro Rail Project Site, Mumbai" // job site
        };
        when(mockDispatchQuery.getResultList()).thenReturn(Collections.singletonList(dispatchRow));

        EquipmentResponse res = equipmentService.getEquipmentById(1L);

        assertNotNull(res);
        assertEquals(1L, res.getId());
        assertEquals("JCB-3D", res.getEquipmentCode());
        // Verify synchronized status
        assertEquals("RESERVED", res.getStatus());
        // Verify rental details
        assertEquals(1L, res.getCurrentRentalId());
        assertEquals("RNT-0001", res.getCurrentRentalReference());
        assertEquals("CONFIRMED", res.getCurrentRentalStatus());
        assertEquals(LocalDate.parse("2026-09-21"), res.getRentalStartDate());
        assertEquals(LocalDate.parse("2026-09-25"), res.getRentalEndDate());
        assertEquals("Downtown Metro Rail Project Site, Mumbai", res.getJobSiteAddress());
        // Verify contractor details
        assertEquals(2L, res.getContractorId());
        assertEquals("Apex Infrastructure Ltd", res.getContractorName());
        assertEquals("contractor2@apex.com", res.getContractorEmail());
        assertEquals("+91 9876543210", res.getContractorPhone());
        // Verify dispatch and assigned operator
        assertEquals(1L, res.getCurrentDispatchId());
        assertEquals("PLANNED", res.getCurrentDispatchStatus());
        assertEquals("Rajesh Sharma", res.getAssignedOperator());
    }
}
