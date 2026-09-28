package com.campus.lostfound.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ClaimRequest {
    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotBlank(message = "Claimant name is required")
    private String claimantName;

    @NotBlank(message = "Contact email is required")
    private String claimantEmail;

    @NotBlank(message = "Contact phone number is required")
    private String claimantPhone;

    @NotBlank(message = "Detailed proof of ownership is required")
    private String proofDetails;

    private String explanation;

    public ClaimRequest() {}

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public String getClaimantName() { return claimantName; }
    public void setClaimantName(String claimantName) { this.claimantName = claimantName; }

    public String getClaimantEmail() { return claimantEmail; }
    public void setClaimantEmail(String claimantEmail) { this.claimantEmail = claimantEmail; }

    public String getClaimantPhone() { return claimantPhone; }
    public void setClaimantPhone(String claimantPhone) { this.claimantPhone = claimantPhone; }

    public String getProofDetails() { return proofDetails; }
    public void setProofDetails(String proofDetails) { this.proofDetails = proofDetails; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
