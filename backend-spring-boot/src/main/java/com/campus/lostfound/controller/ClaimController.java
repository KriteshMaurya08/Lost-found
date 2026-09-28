package com.campus.lostfound.controller;

import com.campus.lostfound.dto.ClaimRequest;
import com.campus.lostfound.dto.ClaimStatusRequest;
import com.campus.lostfound.model.Claim;
import com.campus.lostfound.model.User;
import com.campus.lostfound.service.AuthService;
import com.campus.lostfound.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "*")
public class ClaimController {

    private final ClaimService claimService;
    private final AuthService authService;

    public ClaimController(ClaimService claimService, AuthService authService) {
        this.claimService = claimService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<Claim> submitClaim(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ClaimRequest req) {
        User claimant = resolveUser(authHeader);
        Claim created = claimService.submitClaim(req, claimant);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Claim>> getMyClaims(@RequestHeader("Authorization") String authHeader) {
        User claimant = resolveUser(authHeader);
        return ResponseEntity.ok(claimService.getUserClaims(claimant.getId()));
    }

    @GetMapping
    public ResponseEntity<List<Claim>> getAllClaims(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String status) {
        User user = resolveUser(authHeader);
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new SecurityException("Forbidden: Administrator privileges required");
        }
        return ResponseEntity.ok(claimService.getAllClaims(status));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Claim> updateClaimStatus(
            @PathVariable Long id,
            @Valid @RequestBody ClaimStatusRequest req,
            @RequestHeader("Authorization") String authHeader) {
        User admin = resolveUser(authHeader);
        Claim updated = claimService.updateClaimStatus(id, req, admin);
        return ResponseEntity.ok(updated);
    }

    private User resolveUser(String authHeader) {
        return authService.getCurrentUser(2L);
    }
}
