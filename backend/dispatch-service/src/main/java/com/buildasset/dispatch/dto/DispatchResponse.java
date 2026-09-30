package com.buildasset.dispatch.dto;

import java.time.OffsetDateTime;

public class DispatchResponse {

    private Long id;
    private Long rentalId;
    private Long equipmentId;
    private Long contractorId;
    private String equipmentName;
    private String equipmentCode;
    private String contractorName;
    private String contractorEmail;
    private String contractorPhone;
    private String rentalBookingReference;
    private String jobSite;
    private OffsetDateTime dispatchDate;
    private OffsetDateTime expectedReturnDate;
    private OffsetDateTime actualReturnDate;
    private String status;
    private String carrierName;
    private String operatorName;
    private String siteContactPhone;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public DispatchResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getEquipmentCode() {
        return equipmentCode;
    }

    public void setEquipmentCode(String equipmentCode) {
        this.equipmentCode = equipmentCode;
    }

    public String getContractorName() {
        return contractorName;
    }

    public void setContractorName(String contractorName) {
        this.contractorName = contractorName;
    }

    public String getContractorEmail() {
        return contractorEmail;
    }

    public void setContractorEmail(String contractorEmail) {
        this.contractorEmail = contractorEmail;
    }

    public String getContractorPhone() {
        return contractorPhone;
    }

    public void setContractorPhone(String contractorPhone) {
        this.contractorPhone = contractorPhone;
    }

    public String getRentalBookingReference() {
        return rentalBookingReference;
    }

    public void setRentalBookingReference(String rentalBookingReference) {
        this.rentalBookingReference = rentalBookingReference;
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
        this.jobSite = jobSiteAddress;
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

    public OffsetDateTime getActualReturnDate() {
        return actualReturnDate;
    }

    public void setActualReturnDate(OffsetDateTime actualReturnDate) {
        this.actualReturnDate = actualReturnDate;
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

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
