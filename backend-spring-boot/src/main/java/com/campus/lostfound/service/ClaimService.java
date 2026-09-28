package com.campus.lostfound.service;

import com.campus.lostfound.dto.ClaimRequest;
import com.campus.lostfound.dto.ClaimStatusRequest;
import com.campus.lostfound.model.Claim;
import com.campus.lostfound.model.Item;
import com.campus.lostfound.model.User;
import com.campus.lostfound.repository.ClaimRepository;
import com.campus.lostfound.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;

    public ClaimService(ClaimRepository claimRepository, ItemRepository itemRepository) {
        this.claimRepository = claimRepository;
        this.itemRepository = itemRepository;
    }

    public Claim submitClaim(ClaimRequest req, User claimant) {
        Item item = itemRepository.findById(req.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found with ID: " + req.getItemId()));

        if (!"FOUND".equalsIgnoreCase(item.getType())) {
            throw new IllegalArgumentException("Claims can only be filed against FOUND items");
        }

        if (!"ACTIVE".equalsIgnoreCase(item.getStatus())) {
            throw new IllegalArgumentException("This item is currently not active for claims (status: " + item.getStatus() + ")");
        }

        if (item.getUserId().equals(claimant.getId())) {
            throw new IllegalArgumentException("You reported this found item; you cannot claim your own found report");
        }

        if (claimRepository.hasUserAlreadyClaimed(item.getId(), claimant.getId())) {
            throw new IllegalArgumentException("You already have an active or accepted claim on this item");
        }

        Claim claim = new Claim();
        claim.setItemId(item.getId());
        claim.setUserId(claimant.getId());
        claim.setClaimantName(req.getClaimantName().trim());
        claim.setClaimantEmail(req.getClaimantEmail().trim());
        claim.setClaimantPhone(req.getClaimantPhone().trim());
        claim.setProofDetails(req.getProofDetails().trim());
        claim.setExplanation(req.getExplanation() != null ? req.getExplanation().trim() : "");
        claim.setStatus("PENDING");

        Claim saved = claimRepository.save(claim);
        return claimRepository.findById(saved.getId()).orElse(saved);
    }

    public Claim updateClaimStatus(Long claimId, ClaimStatusRequest req, User adminUser) {
        if (!"ADMIN".equalsIgnoreCase(adminUser.getRole())) {
            throw new SecurityException("Only administrators can review and approve claims");
        }

        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found with ID: " + claimId));

        String newStatus = req.getStatus().toUpperCase();
        if (!"ACCEPTED".equals(newStatus) && !"REJECTED".equals(newStatus)) {
            throw new IllegalArgumentException("Claim status must be ACCEPTED or REJECTED");
        }

        claimRepository.updateStatus(claimId, newStatus, req.getAdminNotes());

        // Correct Workflow:
        // If ACCEPTED -> update item status to CLAIMED
        if ("ACCEPTED".equals(newStatus)) {
            itemRepository.updateStatus(claim.getItemId(), "CLAIMED");
        }

        return claimRepository.findById(claimId).orElse(claim);
    }

    public List<Claim> getUserClaims(Long userId) {
        return claimRepository.findByUserId(userId);
    }

    public List<Claim> getAllClaims(String status) {
        return claimRepository.findAll(status);
    }

    public Claim getClaimById(Long claimId) {
        return claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found"));
    }
}
