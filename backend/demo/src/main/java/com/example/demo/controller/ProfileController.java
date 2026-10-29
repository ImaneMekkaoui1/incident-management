package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.PasswordChangeRequest;
import com.example.demo.dto.ProfileUpdateRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserResponse> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody PasswordChangeRequest request) {
        return ResponseEntity.ok(userService.changePassword(request));
    }
}
