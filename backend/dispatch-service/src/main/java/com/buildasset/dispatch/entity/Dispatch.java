package com.buildasset.dispatch.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "dispatches", schema = "dispatch_schema")
public class Dispatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rental_id", nullable = false)
    private Long rentalId;

    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "contractor_id", nullable = false)
    private Long contractorId;

    @Column(name = "job_site", nullable = false)
    private String jobSite;

    @Column(name = "dispatch_date", nullable = false)
    private OffsetDateTime dispatchDate;

    @Column(name = "expected_return_date", nullable = false)
    private OffsetDateTime expectedReturnDate;

    @Column(name = "actual_return_date")
    private OffsetDateTime actualReturnDate;

    @Column(nullable = false, length = 30)
    private String status = "PLANNED";

    @Column(name = "carrier_name", length = 100)
    private String carrierName;

    @Column(name = "operator_name", length = 100)
    private String operatorName;

    @Column(name = "site_contact_phone", length = 25)
    private String siteContactPhone;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public Dispatch() {
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

    public String getJobSite() {
        return jobSite;
    }

    public void setJobSite(String jobSite) {
        this.jobSite = jobSite;
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
