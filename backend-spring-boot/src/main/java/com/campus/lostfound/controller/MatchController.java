package com.campus.lostfound.controller;

import com.campus.lostfound.model.PossibleMatch;
import com.campus.lostfound.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "*")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping
    public ResponseEntity<List<PossibleMatch>> getAllPotentialMatches() {
        return ResponseEntity.ok(matchService.getPotentialMatches());
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<PossibleMatch>> getMatchesForItem(
            @PathVariable Long itemId,
            @RequestParam(defaultValue = "LOST") String type) {
        return ResponseEntity.ok(matchService.getMatchesForItem(itemId, type));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateMatchStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        matchService.updateMatchStatus(id, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Match status updated"));
    }
}
