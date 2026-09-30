package com.buildasset.dispatch.dto;

public class DispatchStatusUpdateRequest {

    private String status;
    private String reason;
    private String changedBy;

    public DispatchStatusUpdateRequest() {
    }

    public DispatchStatusUpdateRequest(String status, String reason, String changedBy) {
        this.status = status;
        this.reason = reason;
        this.changedBy = changedBy;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }
}
