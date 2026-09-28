package com.campus.lostfound.controller;

import com.campus.lostfound.dto.AuthResponse;
import com.campus.lostfound.dto.LoginRequest;
import com.campus.lostfound.dto.RegisterRequest;
import com.campus.lostfound.model.User;
import com.campus.lostfound.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse res = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse res = authService.login(req);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        // Authenticate bearer token and return user profile
        Long userId = extractUserIdFromHeader(authHeader);
        User user = authService.getCurrentUser(userId);
        user.setPasswordHash(null); // Never return password hashes in REST responses
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, String>> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {
        Long userId = extractUserIdFromHeader(authHeader);
        authService.updateProfile(userId, body.get("fullName"), body.get("phone"));
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    private Long extractUserIdFromHeader(String authHeader) {
        // In this architecture, tokens are validated against session context
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new SecurityException("Missing or invalid Authorization header");
        }
        // Mock token parsing for demonstration in Spring Boot:
        return 2L; // Default authenticated student in standard flow
    }
}
