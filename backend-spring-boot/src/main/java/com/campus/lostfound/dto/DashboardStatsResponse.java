package com.campus.lostfound.dto;

public class DashboardStatsResponse {
    private long totalUsers;
    private long totalLostItems;
    private long totalFoundItems;
    private long activeItems;
    private long pendingClaims;
    private long claimedItems;
    private long returnedItems;
    private long resolvedItems;

    public DashboardStatsResponse() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalLostItems() { return totalLostItems; }
    public void setTotalLostItems(long totalLostItems) { this.totalLostItems = totalLostItems; }

    public long getTotalFoundItems() { return totalFoundItems; }
    public void setTotalFoundItems(long totalFoundItems) { this.totalFoundItems = totalFoundItems; }

    public long getActiveItems() { return activeItems; }
    public void setActiveItems(long activeItems) { this.activeItems = activeItems; }

    public long getPendingClaims() { return pendingClaims; }
    public void setPendingClaims(long pendingClaims) { this.pendingClaims = pendingClaims; }

    public long getClaimedItems() { return claimedItems; }
    public void setClaimedItems(long claimedItems) { this.claimedItems = claimedItems; }

    public long getReturnedItems() { return returnedItems; }
    public void setReturnedItems(long returnedItems) { this.returnedItems = returnedItems; }

    public long getResolvedItems() { return resolvedItems; }
    public void setResolvedItems(long resolvedItems) { this.resolvedItems = resolvedItems; }
}
