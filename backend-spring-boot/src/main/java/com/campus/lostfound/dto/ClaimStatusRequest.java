package com.campus.lostfound.dto;

import jakarta.validation.constraints.NotBlank;

public class ClaimStatusRequest {
    @NotBlank(message = "Status is required (ACCEPTED or REJECTED)")
    private String status; // 'ACCEPTED' or 'REJECTED'

    private String adminNotes;

    public ClaimStatusRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
}
