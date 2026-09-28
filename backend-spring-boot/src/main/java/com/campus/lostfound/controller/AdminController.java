package com.campus.lostfound.controller;

import com.campus.lostfound.dto.DashboardStatsResponse;
import com.campus.lostfound.model.User;
import com.campus.lostfound.repository.UserRepository;
import com.campus.lostfound.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public AdminController(DashboardService dashboardService, UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(dashboardService.getStatistics());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestHeader("Authorization") String authHeader) {
        List<User> users = userRepository.findAll();
        // Protect sensitive security credentials
        users.forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
}
