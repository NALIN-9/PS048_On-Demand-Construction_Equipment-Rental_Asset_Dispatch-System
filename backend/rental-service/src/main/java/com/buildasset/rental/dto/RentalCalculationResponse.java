package com.buildasset.rental.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RentalCalculationResponse {

    private Long equipmentId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer durationDays;
    private BigDecimal dailyRate;
    private BigDecimal totalAmount;
    private boolean available;
    private String message;

    public RentalCalculationResponse() {
    }

    public RentalCalculationResponse(Long equipmentId, LocalDate startDate, LocalDate endDate,
                                     Integer durationDays, BigDecimal dailyRate, BigDecimal totalAmount,
                                     boolean available, String message) {
        this.equipmentId = equipmentId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.durationDays = durationDays;
        this.dailyRate = dailyRate;
        this.totalAmount = totalAmount;
        this.available = available;
        this.message = message;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public BigDecimal getDailyRate() {
        return dailyRate;
    }

    public void setDailyRate(BigDecimal dailyRate) {
        this.dailyRate = dailyRate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
