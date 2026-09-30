package com.buildasset.dispatch.dto;

public class DispatchStatsResponse {

    private long total;
    private long planned;
    private long dispatched;
    private long inTransit;
    private long arrived;
    private long inUse;
    private long returned;
    private long cancelled;

    public DispatchStatsResponse() {
    }

    public DispatchStatsResponse(long total, long planned, long dispatched, long inTransit,
                                 long arrived, long inUse, long returned, long cancelled) {
        this.total = total;
        this.planned = planned;
        this.dispatched = dispatched;
        this.inTransit = inTransit;
        this.arrived = arrived;
        this.inUse = inUse;
        this.returned = returned;
        this.cancelled = cancelled;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getPlanned() {
        return planned;
    }

    public void setPlanned(long planned) {
        this.planned = planned;
    }

    public long getDispatched() {
        return dispatched;
    }

    public void setDispatched(long dispatched) {
        this.dispatched = dispatched;
    }

    public long getInTransit() {
        return inTransit;
    }

    public void setInTransit(long inTransit) {
        this.inTransit = inTransit;
    }

    public long getArrived() {
        return arrived;
    }

    public void setArrived(long arrived) {
        this.arrived = arrived;
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

    public long getCancelled() {
        return cancelled;
    }

    public void setCancelled(long cancelled) {
        this.cancelled = cancelled;
    }
}
