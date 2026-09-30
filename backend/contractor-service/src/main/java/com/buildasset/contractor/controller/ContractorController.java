package com.buildasset.contractor.controller;

import com.buildasset.contractor.dto.ContractorRequest;
import com.buildasset.contractor.dto.ContractorResponse;
import com.buildasset.contractor.service.ContractorService;
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
@RequestMapping("/api/contractors")
@Tag(name = "Contractor Service", description = "Endpoints for Contractor Profiles, Licensing, and Directory Operations")
public class ContractorController {

    private final ContractorService contractorService;

    public ContractorController(ContractorService contractorService) {
        this.contractorService = contractorService;
    }

    @GetMapping
    @Operation(summary = "Get Contractors", description = "Retrieve list of registered contractors with optional search and status filters")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of contractors retrieved successfully")
    })
    public ResponseEntity<List<ContractorResponse>> getAllContractors(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "status", required = false) String status) {
        List<ContractorResponse> contractors = contractorService.getAllContractors(search, status);
        return ResponseEntity.ok(contractors);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Contractor By ID", description = "Fetch complete profile details of a single contractor by primary key")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Contractor found"),
            @ApiResponse(responseCode = "404", description = "Contractor not found")
    })
    public ResponseEntity<ContractorResponse> getContractorById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(contractorService.getContractorById(id));
    }

    @GetMapping("/username/{username}")
    @Operation(summary = "Get Contractor By Username", description = "Lookup contractor record using unique system username")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Contractor found"),
            @ApiResponse(responseCode = "404", description = "Contractor not found")
    })
    public ResponseEntity<ContractorResponse> getContractorByUsername(@PathVariable("username") String username) {
        return ResponseEntity.ok(contractorService.getContractorByUsername(username));
    }

    @PostMapping
    @Operation(summary = "Create Contractor", description = "Create a new contractor company profile")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Contractor created successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failure or duplicate email/username")
    })
    public ResponseEntity<ContractorResponse> createContractor(@Valid @RequestBody ContractorRequest request) {
        ContractorResponse created = contractorService.createContractor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Contractor", description = "Modify an existing contractor profile")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Contractor updated successfully"),
            @ApiResponse(responseCode = "404", description = "Contractor not found")
    })
    public ResponseEntity<ContractorResponse> updateContractor(
            @PathVariable("id") Long id,
            @Valid @RequestBody ContractorRequest request) {
        return ResponseEntity.ok(contractorService.updateContractor(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Contractor", description = "Remove contractor record from the database")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Contractor deleted"),
            @ApiResponse(responseCode = "404", description = "Contractor not found")
    })
    public ResponseEntity<Void> deleteContractor(@PathVariable("id") Long id) {
        contractorService.deleteContractor(id);
        return ResponseEntity.noContent().build();
    }
}
