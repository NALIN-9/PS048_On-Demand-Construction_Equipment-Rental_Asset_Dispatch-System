package com.buildasset.equipment.dto;

public class EquipmentStatsResponse {

    private long total;
    private long available;
    private long reserved;
    private long dispatched;
    private long inUse;
    private long returned;
    private long maintenance;
    private long maintenanceDue;

    public EquipmentStatsResponse() {
    }

    public EquipmentStatsResponse(long total, long available, long reserved, long dispatched,
                                  long inUse, long returned, long maintenance, long maintenanceDue) {
        this.total = total;
        this.available = available;
        this.reserved = reserved;
        this.dispatched = dispatched;
        this.inUse = inUse;
        this.returned = returned;
        this.maintenance = maintenance;
        this.maintenanceDue = maintenanceDue;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getAvailable() {
        return available;
    }

    public void setAvailable(long available) {
        this.available = available;
    }

    public long getReserved() {
        return reserved;
    }

    public void setReserved(long reserved) {
        this.reserved = reserved;
    }

    public long getDispatched() {
        return dispatched;
    }

    public void setDispatched(long dispatched) {
        this.dispatched = dispatched;
    }

    public long getInUse() {
        return inUse;
    }

    public void setInUse(long inUse) {
        this.inUse = inUse;
    }

    public long getReturned() {
        return returned;
    }

    public void setReturned(long returned) {
        this.returned = returned;
    }

    public long getMaintenance() {
        return maintenance;
    }

    public void setMaintenance(long maintenance) {
        this.maintenance = maintenance;
    }

    public long getMaintenanceDue() {
        return maintenanceDue;
    }

    public void setMaintenanceDue(long maintenanceDue) {
        this.maintenanceDue = maintenanceDue;
    }
}
