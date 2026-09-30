package com.buildasset.dispatch.dto;

import com.buildasset.dispatch.config.FlexibleOffsetDateTimeDeserializer;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public class DispatchRequest {

    @NotNull(message = "Rental ID is required")
    private Long rentalId;

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "Contractor ID is required")
    private Long contractorId;

    @NotBlank(message = "Job site location is required")
    @JsonAlias({"jobSiteAddress", "job_site", "deliveryAddress"})
    private String jobSite;

    @NotNull(message = "Dispatch date is required")
    @JsonDeserialize(using = FlexibleOffsetDateTimeDeserializer.class)
    private OffsetDateTime dispatchDate;

    @NotNull(message = "Expected return date is required")
    @JsonDeserialize(using = FlexibleOffsetDateTimeDeserializer.class)
    private OffsetDateTime expectedReturnDate;

    private String status = "PLANNED";
    private String carrierName;
    private String operatorName;
    private String siteContactPhone;
    private String notes;

    public DispatchRequest() {
    }

    public Long getRentalId() {
        return rentalId;
    }

    public void setRentalId(Long rentalId) {
        this.rentalId = rentalId;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public Long getContractorId() {
        return contractorId;
    }

    public void setContractorId(Long contractorId) {
        this.contractorId = contractorId;
    }

    public String getJobSite() {
        return jobSite;
    }

    public void setJobSite(String jobSite) {
        this.jobSite = jobSite;
    }

    public String getJobSiteAddress() {
        return jobSite;
    }

    public void setJobSiteAddress(String jobSiteAddress) {
        if (jobSiteAddress != null && !jobSiteAddress.isBlank()) {
            this.jobSite = jobSiteAddress;
        }
    }

    public OffsetDateTime getDispatchDate() {
        return dispatchDate;
    }

    public void setDispatchDate(OffsetDateTime dispatchDate) {
        this.dispatchDate = dispatchDate;
    }

    public OffsetDateTime getExpectedReturnDate() {
        return expectedReturnDate;
    }

    public void setExpectedReturnDate(OffsetDateTime expectedReturnDate) {
        this.expectedReturnDate = expectedReturnDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCarrierName() {
        return carrierName;
    }

    public void setCarrierName(String carrierName) {
        this.carrierName = carrierName;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public String getSiteContactPhone() {
        return siteContactPhone;
    }

    public void setSiteContactPhone(String siteContactPhone) {
        this.siteContactPhone = siteContactPhone;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
