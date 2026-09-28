package com.campus.lostfound.service;

import com.campus.lostfound.dto.AuthResponse;
import com.campus.lostfound.dto.LoginRequest;
import com.campus.lostfound.dto.RegisterRequest;
import com.campus.lostfound.model.User;
import com.campus.lostfound.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse register(RegisterRequest req) {
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("An account with this email address already exists");
        }

        if (userRepository.existsByStudentId(req.getStudentId())) {
            throw new IllegalArgumentException("An account with this Student ID already exists");
        }

        User user = new User();
        user.setFullName(req.getFullName().trim());
        user.setEmail(req.getEmail().toLowerCase().trim());
        user.setPhone(req.getPhone().trim());
        user.setStudentId(req.getStudentId().toUpperCase().trim());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole("STUDENT");

        User savedUser = userRepository.save(user);

        // Generate session/bearer token
        String token = "TOKEN-" + UUID.randomUUID().toString();

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getStudentId(),
                savedUser.getRole(),
                "Registration successful"
        );
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = "TOKEN-" + UUID.randomUUID().toString();

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getStudentId(),
                user.getRole(),
                "Login successful"
        );
    }

    public User getCurrentUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public void updateProfile(Long userId, String fullName, String phone) {
        userRepository.updateProfile(userId, fullName, phone);
    }
}
