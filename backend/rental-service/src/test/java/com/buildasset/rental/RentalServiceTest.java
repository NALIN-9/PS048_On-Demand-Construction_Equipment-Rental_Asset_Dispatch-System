package com.buildasset.rental;

import com.buildasset.rental.dto.*;
import com.buildasset.rental.entity.Rental;
import com.buildasset.rental.exception.BadRequestException;
import com.buildasset.rental.exception.ResourceNotFoundException;
import com.buildasset.rental.repository.RentalRepository;
import com.buildasset.rental.service.RentalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RentalServiceTest {

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private RestTemplate restTemplate;

    private RentalService rentalService;

    @BeforeEach
    void setUp() {
        rentalService = new RentalService(rentalRepository, restTemplate);
    }

    @Test
    void testDurationCalculationExactDays() {
        LocalDate start = LocalDate.of(2026, 9, 10);
        LocalDate end = LocalDate.of(2026, 9, 15);

        int duration = rentalService.calculateDurationDays(start, end);
        assertEquals(5, duration);
    }

    @Test
    void testDurationCalculationSameDayIsOneDay() {
        LocalDate start = LocalDate.of(2026, 9, 10);
        LocalDate end = LocalDate.of(2026, 9, 10);

        int duration = rentalService.calculateDurationDays(start, end);
        assertEquals(1, duration);
    }

    @Test
    void testRentalCalculationTotalAmountFormula() {
        LocalDate start = LocalDate.of(2026, 9, 10);
        LocalDate end = LocalDate.of(2026, 9, 15);

        Map<String, Object> mockEquipment = new HashMap<>();
        mockEquipment.put("id", 1);
        mockEquipment.put("status", "AVAILABLE");
        mockEquipment.put("dailyRate", 5000.00);

        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(mockEquipment);

        RentalCalculationRequest request = new RentalCalculationRequest();
        request.setEquipmentId(1L);
        request.setStartDate(start);
        request.setEndDate(end);

        RentalCalculationResponse response = rentalService.calculateRental(request);
        assertNotNull(response);
        assertEquals(5, response.getDurationDays());
        assertEquals(new BigDecimal("5000.0"), response.getDailyRate());
        assertEquals(new BigDecimal("25000.0"), response.getTotalAmount());
        assertTrue(response.isAvailable());
    }

    @Test
    void testCreateRentalSuccessLocksReserved() {
        LocalDate start = LocalDate.of(2026, 9, 10);
        LocalDate end = LocalDate.of(2026, 9, 15);

        Map<String, Object> mockEquipment = new HashMap<>();
        mockEquipment.put("id", 1);
        mockEquipment.put("status", "AVAILABLE");
        mockEquipment.put("dailyRate", 8000.00);

        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(mockEquipment);
        when(rentalRepository.existsByEquipmentIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                anyLong(), anyList(), any(LocalDate.class), any(LocalDate.class))).thenReturn(false);

        Rental saved = new Rental();
        saved.setId(10L);
        saved.setEquipmentId(1L);
        saved.setContractorId(5L);
        saved.setStartDate(start);
        saved.setEndDate(end);
        saved.setDurationDays(5);
        saved.setDailyRate(new BigDecimal("8000.00"));
        saved.setTotalAmount(new BigDecimal("40000.00"));
        saved.setStatus("CONFIRMED");
        saved.setBookingReference("BK-20260910-ABCD");

        when(rentalRepository.save(any(Rental.class))).thenReturn(saved);

        RentalRequest req = new RentalRequest();
        req.setContractorId(5L);
        req.setEquipmentId(1L);
        req.setStartDate(start);
        req.setEndDate(end);

        RentalResponse res = rentalService.createRental(req);
        assertNotNull(res);
        assertEquals(10L, res.getId());
        assertEquals("CONFIRMED", res.getStatus());
        assertEquals(new BigDecimal("40000.00"), res.getTotalAmount());
    }

    @Test
    void testCreateRentalUnavailableEquipmentThrows() {
        LocalDate start = LocalDate.of(2026, 9, 10);
        LocalDate end = LocalDate.of(2026, 9, 15);

        Map<String, Object> mockEquipment = new HashMap<>();
        mockEquipment.put("id", 2);
        mockEquipment.put("status", "MAINTENANCE");
        mockEquipment.put("dailyRate", 6000.00);

        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(mockEquipment);

        RentalRequest req = new RentalRequest();
        req.setContractorId(5L);
        req.setEquipmentId(2L);
        req.setStartDate(start);
        req.setEndDate(end);

        assertThrows(BadRequestException.class, () -> rentalService.createRental(req));
        verify(rentalRepository, never()).save(any());
    }

    @Test
    void testInvalidDatesThrowsBadRequest() {
        RentalCalculationRequest request = new RentalCalculationRequest();
        request.setEquipmentId(1L);
        request.setStartDate(LocalDate.of(2026, 9, 20));
        request.setEndDate(LocalDate.of(2026, 9, 10)); // End is before start!

        assertThrows(BadRequestException.class, () -> rentalService.calculateRental(request));
    }

    @Test
    void testUpdateRentalStatusCompletedReleasesEquipment() {
        Rental rental = new Rental();
        rental.setId(10L);
        rental.setEquipmentId(1L);
        rental.setStatus("CONFIRMED");

        when(rentalRepository.findById(10L)).thenReturn(Optional.of(rental));
        when(rentalRepository.save(any(Rental.class))).thenReturn(rental);

        RentalResponse res = rentalService.updateRentalStatus(10L, "COMPLETED");
        assertEquals("COMPLETED", res.getStatus());
    }

    @Test
    void testDeleteRentalReleasesEquipment() {
        Rental rental = new Rental();
        rental.setId(10L);
        rental.setEquipmentId(1L);

        when(rentalRepository.findById(10L)).thenReturn(Optional.of(rental));

        rentalService.deleteRental(10L);
        verify(rentalRepository).deleteById(10L);
    }
}
