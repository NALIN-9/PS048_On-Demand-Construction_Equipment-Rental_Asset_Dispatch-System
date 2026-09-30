package com.buildasset.rental.controller;

import com.buildasset.rental.dto.*;
import com.buildasset.rental.service.RentalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@Tag(name = "Rental Service", description = "Endpoints for Machinery Booking Reservations, Server-Side Rate Calculation, and Booking Lifecycle")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @GetMapping
    @Operation(summary = "Get Rentals", description = "Retrieve rental bookings filtered by contractor ID, equipment ID, or status")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rental bookings retrieved successfully")
    })
    public ResponseEntity<List<RentalResponse>> getAllRentals(
            @RequestParam(name = "contractorId", required = false) Long contractorId,
            @RequestParam(name = "equipmentId", required = false) Long equipmentId,
            @RequestParam(name = "status", required = false) String status) {
        List<RentalResponse> list = rentalService.getAllRentals(contractorId, equipmentId, status);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Rental By ID", description = "Fetch single rental booking record by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rental booking found"),
            @ApiResponse(responseCode = "404", description = "Rental booking not found")
    })
    public ResponseEntity<RentalResponse> getRentalById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(rentalService.getRentalById(id));
    }

    @PostMapping("/calculate")
    @Operation(summary = "Calculate Rental Duration & Rate", description = "Calculates exact days and total amount on the server without creating a reservation")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Calculation performed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid date range or equipment unavailable")
    })
    public ResponseEntity<RentalCalculationResponse> calculateRental(
            @Valid @RequestBody RentalCalculationRequest request) {
        RentalCalculationResponse response = rentalService.calculateRental(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Create Rental Booking", description = "Validates equipment availability, calculates duration and total cost on server, locks equipment as RESERVED, and creates booking")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Booking created successfully"),
            @ApiResponse(responseCode = "400", description = "Equipment unavailable or conflicting booking dates")
    })
    public ResponseEntity<RentalResponse> createRental(@Valid @RequestBody RentalRequest request) {
        RentalResponse response = rentalService.createRental(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Rental Booking", description = "Modify rental dates or booking notes")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rental updated successfully"),
            @ApiResponse(responseCode = "404", description = "Rental booking not found")
    })
    public ResponseEntity<RentalResponse> updateRental(
            @PathVariable("id") Long id,
            @RequestBody RentalRequest request) {
        return ResponseEntity.ok(rentalService.updateRental(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update Rental Status", description = "Update booking status (CONFIRMED, ACTIVE, COMPLETED, CANCELLED). If COMPLETED or CANCELLED, releases equipment back to AVAILABLE.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rental status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Rental booking not found")
    })
    public ResponseEntity<RentalResponse> updateRentalStatus(
            @PathVariable("id") Long id,
            @RequestParam(name = "status") String status) {
        return ResponseEntity.ok(rentalService.updateRentalStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete / Cancel Rental", description = "Cancel rental booking and release equipment back to AVAILABLE")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Rental deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Rental booking not found")
    })
    public ResponseEntity<Void> deleteRental(@PathVariable("id") Long id) {
        rentalService.deleteRental(id);
        return ResponseEntity.noContent().build();
    }
}
