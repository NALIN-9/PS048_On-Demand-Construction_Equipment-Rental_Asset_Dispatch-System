package com.buildasset.dispatch.controller;

import com.buildasset.dispatch.dto.*;
import com.buildasset.dispatch.exception.BadRequestException;
import com.buildasset.dispatch.service.DispatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/dispatch", "/api/dispatches"})
@Tag(name = "Dispatch Service", description = "Endpoints for Job-Site Dispatches, Carrier Logistics, and Machinery Status Synchronization")
public class DispatchController {

    private final DispatchService dispatchService;

    public DispatchController(DispatchService dispatchService) {
        this.dispatchService = dispatchService;
    }

    @GetMapping
    @Operation(summary = "Get Dispatches", description = "Retrieve list of job-site dispatches with optional status, contractor, or equipment filters")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dispatches retrieved successfully")
    })
    public ResponseEntity<List<DispatchResponse>> getAllDispatches(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "contractorId", required = false) Long contractorId,
            @RequestParam(name = "equipmentId", required = false) Long equipmentId) {
        List<DispatchResponse> list = dispatchService.getAllDispatches(status, contractorId, equipmentId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Dispatch By ID", description = "Fetch single job-site dispatch record details by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dispatch found"),
            @ApiResponse(responseCode = "404", description = "Dispatch not found")
    })
    public ResponseEntity<DispatchResponse> getDispatchById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(dispatchService.getDispatchById(id));
    }

    @PostMapping
    @Operation(summary = "Create Dispatch", description = "Schedule new equipment dispatch to job site and log initial PLANNED status")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Dispatch created successfully"),
            @ApiResponse(responseCode = "400", description = "Validation error")
    })
    public ResponseEntity<DispatchResponse> createDispatch(@Valid @RequestBody DispatchRequest request) {
        DispatchResponse response = dispatchService.createDispatch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Dispatch", description = "Modify job-site, dates, carrier, operator, or logistics notes")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dispatch updated successfully"),
            @ApiResponse(responseCode = "404", description = "Dispatch not found")
    })
    public ResponseEntity<DispatchResponse> updateDispatch(
            @PathVariable("id") Long id,
            @RequestBody DispatchRequest request) {
        return ResponseEntity.ok(dispatchService.updateDispatch(id, request));
    }

    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @Operation(summary = "Update Dispatch Status", description = "Advance dispatch lifecycle (PLANNED -> DISPATCHED -> IN_TRANSIT -> ARRIVED -> IN_USE -> RETURNED). Synchronizes machinery status automatically.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dispatch status updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid status or missing parameters"),
            @ApiResponse(responseCode = "404", description = "Dispatch not found")
    })
    public ResponseEntity<DispatchResponse> updateDispatchStatus(
            @PathVariable("id") Long id,
            @RequestParam(name = "status", required = false) String statusParam,
            @RequestParam(name = "reason", required = false) String reasonParam,
            @RequestParam(name = "changedBy", required = false) String changedByParam,
            @RequestBody(required = false) DispatchStatusUpdateRequest body) {

        String status = statusParam;
        String reason = reasonParam;
        String changedBy = changedByParam;

        if (body != null) {
            if (status == null || status.isBlank()) {
                status = body.getStatus();
            }
            if (reason == null || reason.isBlank()) {
                reason = body.getReason();
            }
            if (changedBy == null || changedBy.isBlank()) {
                changedBy = body.getChangedBy();
            }
        }

        if (status == null || status.isBlank()) {
            throw new BadRequestException("Status parameter is required to transition dispatch state");
        }

        DispatchResponse updated = dispatchService.updateDispatchStatus(id, status, reason, changedBy);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/assign-operator")
    @Operation(summary = "Assign Operator", description = "Assign or update the operator handling this dispatch order")
    public ResponseEntity<DispatchResponse> assignOperator(
            @PathVariable("id") Long id,
            @RequestParam(name = "operatorName", required = false) String operatorNameParam,
            @RequestBody(required = false) Map<String, String> body) {
        String operator = operatorNameParam;
        if (body != null && (operator == null || operator.isBlank()) && body.containsKey("operatorName")) {
            operator = body.get("operatorName");
        }
        return ResponseEntity.ok(dispatchService.assignOperator(id, operator));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get Dispatch History", description = "Audit trail timeline of transit milestones and operator changes")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "History log returned"),
            @ApiResponse(responseCode = "404", description = "Dispatch not found")
    })
    public ResponseEntity<List<DispatchStatusHistoryResponse>> getDispatchHistory(@PathVariable("id") Long id) {
        return ResponseEntity.ok(dispatchService.getDispatchHistory(id));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get Dispatch Statistics", description = "Aggregate counts of dispatches grouped by lifecycle status")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dispatch statistics calculated")
    })
    public ResponseEntity<DispatchStatsResponse> getDispatchStats() {
        return ResponseEntity.ok(dispatchService.getDispatchStats());
    }
}
