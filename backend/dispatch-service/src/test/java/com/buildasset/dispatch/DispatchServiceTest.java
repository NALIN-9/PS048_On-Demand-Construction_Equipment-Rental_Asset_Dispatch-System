package com.buildasset.dispatch;

import com.buildasset.dispatch.dto.DispatchRequest;
import com.buildasset.dispatch.dto.DispatchResponse;
import com.buildasset.dispatch.dto.DispatchStatsResponse;
import com.buildasset.dispatch.dto.DispatchStatusHistoryResponse;
import com.buildasset.dispatch.entity.Dispatch;
import com.buildasset.dispatch.entity.DispatchStatusHistory;
import com.buildasset.dispatch.repository.DispatchRepository;
import com.buildasset.dispatch.repository.DispatchStatusHistoryRepository;
import com.buildasset.dispatch.service.DispatchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DispatchServiceTest {

    @Mock
    private DispatchRepository dispatchRepository;

    @Mock
    private DispatchStatusHistoryRepository historyRepository;

    @Mock
    private RestTemplate restTemplate;

    private DispatchService dispatchService;

    @BeforeEach
    void setUp() {
        dispatchService = new DispatchService(dispatchRepository, historyRepository, restTemplate);
    }

    @Test
    void testGetAllDispatchesEmptyInitially() {
        when(dispatchRepository.findAll()).thenReturn(Collections.emptyList());

        List<DispatchResponse> result = dispatchService.getAllDispatches(null, null, null);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testCreateDispatchSavesAndRecordsHistory() {
        DispatchRequest req = new DispatchRequest();
        req.setRentalId(1L);
        req.setEquipmentId(10L);
        req.setContractorId(5L);
        req.setJobSite("Metro Line Phase 2");
        req.setDispatchDate(OffsetDateTime.now());
        req.setExpectedReturnDate(OffsetDateTime.now().plusDays(7));
        req.setStatus("PLANNED");

        Dispatch saved = new Dispatch();
        saved.setId(100L);
        saved.setRentalId(1L);
        saved.setEquipmentId(10L);
        saved.setStatus("PLANNED");
        saved.setJobSite("Metro Line Phase 2");

        when(dispatchRepository.save(any(Dispatch.class))).thenReturn(saved);

        DispatchResponse res = dispatchService.createDispatch(req);
        assertNotNull(res);
        assertEquals(100L, res.getId());
        assertEquals("PLANNED", res.getStatus());

        verify(historyRepository).save(any(DispatchStatusHistory.class));
    }

    @Test
    void testUpdateDispatchDetails() {
        Dispatch d = new Dispatch();
        d.setId(100L);
        d.setJobSite("Old Site");

        when(dispatchRepository.findById(100L)).thenReturn(Optional.of(d));
        when(dispatchRepository.save(any(Dispatch.class))).thenReturn(d);

        DispatchRequest req = new DispatchRequest();
        req.setJobSite("New Highway Pier 4");
        req.setCarrierName("Apex Transporters");

        DispatchResponse res = dispatchService.updateDispatch(100L, req);
        assertNotNull(res);
        assertEquals("New Highway Pier 4", d.getJobSite());
        assertEquals("Apex Transporters", d.getCarrierName());
    }

    @Test
    void testUpdateDispatchStatusTransitionsAndAudits() {
        Dispatch d = new Dispatch();
        d.setId(100L);
        d.setEquipmentId(10L);
        d.setStatus("PLANNED");

        when(dispatchRepository.findById(100L)).thenReturn(Optional.of(d));
        when(dispatchRepository.save(any(Dispatch.class))).thenReturn(d);

        DispatchResponse res = dispatchService.updateDispatchStatus(100L, "DISPATCHED", "Truck loaded", "DISPATCHER_1");
        assertEquals("DISPATCHED", res.getStatus());
        verify(historyRepository).save(any(DispatchStatusHistory.class));
    }

    @Test
    void testFullStatusLifecycle() {
        Dispatch d = new Dispatch();
        d.setId(100L);
        d.setEquipmentId(10L);
        d.setStatus("PLANNED");

        when(dispatchRepository.findById(100L)).thenReturn(Optional.of(d));
        when(dispatchRepository.save(any(Dispatch.class))).thenReturn(d);

        // 1. PLANNED -> DISPATCHED
        DispatchResponse r1 = dispatchService.updateDispatchStatus(100L, "DISPATCHED", "Truck loaded", "OPERATOR");
        assertEquals("DISPATCHED", r1.getStatus());
        assertEquals("DISPATCHED", d.getStatus());

        // 2. DISPATCHED -> IN_TRANSIT
        DispatchResponse r2 = dispatchService.updateDispatchStatus(100L, "IN_TRANSIT", "On highway route", "OPERATOR");
        assertEquals("IN_TRANSIT", r2.getStatus());
        assertEquals("IN_TRANSIT", d.getStatus());

        // 3. IN_TRANSIT -> ARRIVED
        DispatchResponse r3 = dispatchService.updateDispatchStatus(100L, "ARRIVED", "Arrived at job site", "OPERATOR");
        assertEquals("ARRIVED", r3.getStatus());
        assertEquals("ARRIVED", d.getStatus());

        // 4. ARRIVED -> IN_USE
        DispatchResponse r4 = dispatchService.updateDispatchStatus(100L, "IN_USE", "Active drilling operation", "OPERATOR");
        assertEquals("IN_USE", r4.getStatus());
        assertEquals("IN_USE", d.getStatus());

        // 5. IN_USE -> RETURNED
        DispatchResponse r5 = dispatchService.updateDispatchStatus(100L, "RETURNED", "Returned to central yard", "OPERATOR");
        assertEquals("RETURNED", r5.getStatus());
        assertEquals("RETURNED", d.getStatus());
        assertNotNull(d.getActualReturnDate());

        verify(historyRepository, times(5)).save(any(DispatchStatusHistory.class));
    }

    @Test
    void testGetDispatchStatsZeroInitially() {
        when(dispatchRepository.count()).thenReturn(0L);
        when(dispatchRepository.countByStatus(anyString())).thenReturn(0L);

        DispatchStatsResponse stats = dispatchService.getDispatchStats();
        assertNotNull(stats);
        assertEquals(0, stats.getTotal());
        assertEquals(0, stats.getDispatched());
        assertEquals(0, stats.getInUse());
    }
}
