package com.buildasset.contractor.service;

import com.buildasset.contractor.dto.ContractorRequest;
import com.buildasset.contractor.dto.ContractorResponse;
import com.buildasset.contractor.entity.Contractor;
import com.buildasset.contractor.exception.BadRequestException;
import com.buildasset.contractor.exception.ResourceNotFoundException;
import com.buildasset.contractor.repository.ContractorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContractorService {

    private final ContractorRepository contractorRepository;

    public ContractorService(ContractorRepository contractorRepository) {
        this.contractorRepository = contractorRepository;
    }

    public List<ContractorResponse> getAllContractors(String search, String status) {
        List<Contractor> list;
        if (search != null || status != null) {
            list = contractorRepository.searchContractors(
                    (search != null && !search.isBlank()) ? search : null,
                    (status != null && !status.isBlank()) ? status : null
            );
        } else {
            list = contractorRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ContractorResponse getContractorById(Long id) {
        Contractor contractor = contractorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contractor not found with ID: " + id));
        return mapToResponse(contractor);
    }

    public ContractorResponse getContractorByUsername(String username) {
        Contractor contractor = contractorRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Contractor not found with username: " + username));
        return mapToResponse(contractor);
    }

    @Transactional
    public ContractorResponse createContractor(ContractorRequest request) {
        if (contractorRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Contractor with email already exists: " + request.getEmail());
        }
        if (contractorRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Contractor with username already exists: " + request.getUsername());
        }

        Contractor contractor = new Contractor();
        copyProperties(request, contractor);

        Contractor saved = contractorRepository.save(contractor);
        return mapToResponse(saved);
    }

    @Transactional
    public ContractorResponse updateContractor(Long id, ContractorRequest request) {
        Contractor contractor = contractorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contractor not found with ID: " + id));

        if (!contractor.getEmail().equals(request.getEmail()) && contractorRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Contractor with email already exists: " + request.getEmail());
        }

        copyProperties(request, contractor);
        Contractor updated = contractorRepository.save(contractor);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteContractor(Long id) {
        if (!contractorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contractor not found with ID: " + id);
        }
        contractorRepository.deleteById(id);
    }

    private void copyProperties(ContractorRequest source, Contractor target) {
        target.setCompanyName(source.getCompanyName());
        target.setContactPerson(source.getContactPerson());
        target.setEmail(source.getEmail());
        target.setPhone(source.getPhone());
        target.setAddress(source.getAddress());
        target.setUsername(source.getUsername());
        target.setRole(source.getRole() != null ? source.getRole() : "ROLE_CONTRACTOR");
        target.setBusinessLicenseNumber(source.getBusinessLicenseNumber());
        target.setTaxId(source.getTaxId());
        target.setStatus(source.getStatus() != null ? source.getStatus() : "ACTIVE");
    }

    private ContractorResponse mapToResponse(Contractor c) {
        ContractorResponse res = new ContractorResponse();
        res.setId(c.getId());
        res.setCompanyName(c.getCompanyName());
        res.setContactPerson(c.getContactPerson());
        res.setEmail(c.getEmail());
        res.setPhone(c.getPhone());
        res.setAddress(c.getAddress());
        res.setUsername(c.getUsername());
        res.setRole(c.getRole());
        res.setBusinessLicenseNumber(c.getBusinessLicenseNumber());
        res.setTaxId(c.getTaxId());
        res.setStatus(c.getStatus());
        res.setCreatedAt(c.getCreatedAt());
        res.setUpdatedAt(c.getUpdatedAt());
        return res;
    }
}
