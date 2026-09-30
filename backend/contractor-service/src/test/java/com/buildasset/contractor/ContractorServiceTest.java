package com.buildasset.contractor;

import com.buildasset.contractor.dto.ContractorRequest;
import com.buildasset.contractor.dto.ContractorResponse;
import com.buildasset.contractor.entity.Contractor;
import com.buildasset.contractor.exception.BadRequestException;
import com.buildasset.contractor.exception.ResourceNotFoundException;
import com.buildasset.contractor.repository.ContractorRepository;
import com.buildasset.contractor.service.ContractorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ContractorServiceTest {

    @Mock
    private ContractorRepository contractorRepository;

    private ContractorService contractorService;

    @BeforeEach
    void setUp() {
        contractorService = new ContractorService(contractorRepository);
    }

    @Test
    void testGetAllContractorsEmptyList() {
        when(contractorRepository.findAll()).thenReturn(Collections.emptyList());

        List<ContractorResponse> result = contractorService.getAllContractors(null, null);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testCreateContractorSuccess() {
        ContractorRequest req = new ContractorRequest();
        req.setCompanyName("Pioneer Heavy Civils");
        req.setContactPerson("Rohan Deshmukh");
        req.setEmail("rohan@pioneer.com");
        req.setPhone("9876543210");
        req.setAddress("Industrial Area");
        req.setUsername("rohan_pioneer");

        when(contractorRepository.existsByEmail("rohan@pioneer.com")).thenReturn(false);
        when(contractorRepository.existsByUsername("rohan_pioneer")).thenReturn(false);

        Contractor saved = new Contractor();
        saved.setId(10L);
        saved.setCompanyName(req.getCompanyName());
        saved.setEmail(req.getEmail());
        saved.setUsername(req.getUsername());

        when(contractorRepository.save(any(Contractor.class))).thenReturn(saved);

        ContractorResponse res = contractorService.createContractor(req);
        assertNotNull(res);
        assertEquals(10L, res.getId());
        assertEquals("Pioneer Heavy Civils", res.getCompanyName());
    }

    @Test
    void testCreateContractorDuplicateEmailThrows() {
        ContractorRequest req = new ContractorRequest();
        req.setEmail("existing@corp.com");
        req.setUsername("user1");

        when(contractorRepository.existsByEmail("existing@corp.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> contractorService.createContractor(req));
        verify(contractorRepository, never()).save(any());
    }

    @Test
    void testGetContractorNotFoundThrows() {
        when(contractorRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> contractorService.getContractorById(999L));
    }
}
