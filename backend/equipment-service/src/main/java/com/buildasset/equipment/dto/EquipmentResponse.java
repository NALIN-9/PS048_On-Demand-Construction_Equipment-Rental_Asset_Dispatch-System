package com.buildasset.equipment.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public class EquipmentResponse {

    private Long id;
    private String equipmentCode;
    private String name;
    private String category;
    private String manufacturer;
    private String model;
    private Integer yearOfManufacture;
    private BigDecimal dailyRate;
    private String status;
    private String location;
    private String imageUrl;
    private String description;
    private LocalDate lastMaintenanceDate;
    private LocalDate nextMaintenanceDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Current Rental & Assignment telemetry
    private Long currentRentalId;
    private String currentRentalReference;
    private String currentRentalStatus;
    private LocalDate rentalStartDate;
    private LocalDate rentalEndDate;
    private Long contractorId;
    private String contractorName;
    private String contractorCompany;
    private String contractorEmail;
    private String contractorPhone;
    private String jobSiteAddress;
    private Long currentDispatchId;
    private String currentDispatchStatus;
    private String assignedOperator;

    public EquipmentResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEquipmentCode() {
        return equipmentCode;
    }

    public void setEquipmentCode(String equipmentCode) {
        this.equipmentCode = equipmentCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getYearOfManufacture() {
        return yearOfManufacture;
    }

    public void setYearOfManufacture(Integer yearOfManufacture) {
        this.yearOfManufacture = yearOfManufacture;
    }

    public BigDecimal getDailyRate() {
        return dailyRate;
    }

    public void setDailyRate(BigDecimal dailyRate) {
        this.dailyRate = dailyRate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getLastMaintenanceDate() {
        return lastMaintenanceDate;
    }

    public void setLastMaintenanceDate(LocalDate lastMaintenanceDate) {
        this.lastMaintenanceDate = lastMaintenanceDate;
    }

    public LocalDate getNextMaintenanceDate() {
        return nextMaintenanceDate;
    }

    public void setNextMaintenanceDate(LocalDate nextMaintenanceDate) {
        this.nextMaintenanceDate = nextMaintenanceDate;
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

    public Long getCurrentRentalId() {
        return currentRentalId;
    }

    public void setCurrentRentalId(Long currentRentalId) {
        this.currentRentalId = currentRentalId;
    }

    public String getCurrentRentalReference() {
        return currentRentalReference;
    }

    public void setCurrentRentalReference(String currentRentalReference) {
        this.currentRentalReference = currentRentalReference;
    }

    public String getCurrentRentalStatus() {
        return currentRentalStatus;
    }

    public void setCurrentRentalStatus(String currentRentalStatus) {
        this.currentRentalStatus = currentRentalStatus;
    }

    public LocalDate getRentalStartDate() {
        return rentalStartDate;
    }

    public void setRentalStartDate(LocalDate rentalStartDate) {
        this.rentalStartDate = rentalStartDate;
    }

    public LocalDate getRentalEndDate() {
        return rentalEndDate;
    }

    public void setRentalEndDate(LocalDate rentalEndDate) {
        this.rentalEndDate = rentalEndDate;
    }

    public Long getContractorId() {
        return contractorId;
    }

    public void setContractorId(Long contractorId) {
        this.contractorId = contractorId;
    }

    public String getContractorName() {
        return contractorName;
    }

    public void setContractorName(String contractorName) {
        this.contractorName = contractorName;
    }

    public String getContractorCompany() {
        return contractorCompany;
    }

    public void setContractorCompany(String contractorCompany) {
        this.contractorCompany = contractorCompany;
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

    public String getJobSiteAddress() {
        return jobSiteAddress;
    }

    public void setJobSiteAddress(String jobSiteAddress) {
        this.jobSiteAddress = jobSiteAddress;
    }

    public Long getCurrentDispatchId() {
        return currentDispatchId;
    }

    public void setCurrentDispatchId(Long currentDispatchId) {
        this.currentDispatchId = currentDispatchId;
    }

    public String getCurrentDispatchStatus() {
        return currentDispatchStatus;
    }

    public void setCurrentDispatchStatus(String currentDispatchStatus) {
        this.currentDispatchStatus = currentDispatchStatus;
    }

    public String getAssignedOperator() {
        return assignedOperator;
    }

    public void setAssignedOperator(String assignedOperator) {
        this.assignedOperator = assignedOperator;
    }
}
