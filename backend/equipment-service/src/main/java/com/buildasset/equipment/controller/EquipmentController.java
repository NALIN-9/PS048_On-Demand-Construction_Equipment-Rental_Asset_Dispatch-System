package com.buildasset.equipment.controller;

import com.buildasset.equipment.dto.*;
import com.buildasset.equipment.service.EquipmentService;
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
@RequestMapping("/api/equipment")
@Tag(name = "Equipment Service", description = "Endpoints for Fleet Inventory, Machinery Specifications, Search Filters, and Maintenance")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping
    @Operation(summary = "Get Equipment", description = "Retrieve machinery fleet with category, status, location, and keyword filters")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Fleet list returned")
    })
    public ResponseEntity<List<EquipmentResponse>> getAllEquipment(
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "location", required = false) String location,
            @RequestParam(name = "keyword", required = false) String keyword) {
        List<EquipmentResponse> list = equipmentService.getAllEquipment(category, status, location, keyword);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Equipment By ID", description = "Fetch single machinery asset details by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Equipment found"),
            @ApiResponse(responseCode = "404", description = "Equipment not found")
    })
    public ResponseEntity<EquipmentResponse> getEquipmentById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get Equipment By Code", description = "Fetch single machinery asset by unique equipment code")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Equipment found"),
            @ApiResponse(responseCode = "404", description = "Equipment not found")
    })
    public ResponseEntity<EquipmentResponse> getEquipmentByCode(@PathVariable("code") String code) {
        return ResponseEntity.ok(equipmentService.getEquipmentByCode(code));
    }

    @PostMapping
    @Operation(summary = "Create Equipment", description = "Register a new heavy machinery asset in the fleet")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Equipment created successfully"),
            @ApiResponse(responseCode = "400", description = "Validation error or duplicate equipment code")
    })
    public ResponseEntity<EquipmentResponse> createEquipment(@Valid @RequestBody EquipmentRequest request) {
        EquipmentResponse created = equipmentService.createEquipment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Equipment", description = "Modify details of an existing machinery asset")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Equipment updated"),
            @ApiResponse(responseCode = "404", description = "Equipment not found")
    })
    public ResponseEntity<EquipmentResponse> updateEquipment(
            @PathVariable("id") Long id,
            @Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.ok(equipmentService.updateEquipment(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Equipment", description = "Delete machinery asset from fleet inventory")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Equipment deleted"),
            @ApiResponse(responseCode = "404", description = "Equipment not found")
    })
    public ResponseEntity<Void> deleteEquipment(@PathVariable("id") Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update Equipment Status", description = "Transition machinery status (AVAILABLE, RESERVED, DISPATCHED, IN_USE, RETURNED, MAINTENANCE)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Equipment not found")
    })
    public ResponseEntity<EquipmentResponse> updateEquipmentStatus(
            @PathVariable("id") Long id,
            @RequestParam(name = "status") String status) {
        return ResponseEntity.ok(equipmentService.updateEquipmentStatus(id, status));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get Fleet Statistics", description = "Aggregate counts of fleet by status for dashboard cards")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Fleet statistics calculated")
    })
    public ResponseEntity<EquipmentStatsResponse> getEquipmentStats() {
        return ResponseEntity.ok(equipmentService.getEquipmentStats());
    }

    @PostMapping("/{id}/maintenance")
    @Operation(summary = "Schedule Maintenance", description = "Book preventative maintenance service for machinery asset")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Maintenance scheduled"),
            @ApiResponse(responseCode = "404", description = "Equipment not found")
    })
    public ResponseEntity<MaintenanceLogResponse> scheduleMaintenance(
            @PathVariable("id") Long id,
            @Valid @RequestBody MaintenanceLogRequest request) {
        MaintenanceLogResponse response = equipmentService.scheduleMaintenance(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/maintenance")
    @Operation(summary = "Get Maintenance Logs", description = "Retrieve service history logs for an equipment asset")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Maintenance logs returned")
    })
    public ResponseEntity<List<MaintenanceLogResponse>> getMaintenanceLogs(@PathVariable("id") Long id) {
        return ResponseEntity.ok(equipmentService.getMaintenanceLogs(id));
    }

    @PatchMapping("/maintenance/{logId}/status")
    @Operation(summary = "Update Maintenance Status", description = "Update service log status (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED). If COMPLETED, releases equipment back to AVAILABLE.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Maintenance status updated")
    })
    public ResponseEntity<MaintenanceLogResponse> updateMaintenanceStatus(
            @PathVariable("logId") Long logId,
            @RequestParam(name = "status") String status) {
        return ResponseEntity.ok(equipmentService.updateMaintenanceStatus(logId, status));
    }
}
