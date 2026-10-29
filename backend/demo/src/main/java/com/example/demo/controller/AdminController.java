package com.example.demo.controller;

import com.example.demo.dto.DashboardStatsResponse;
import com.example.demo.dto.UserResponse;
import com.example.demo.dto.UserSummaryResponse;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<UserSummaryResponse>> getTechnicians() {
        return ResponseEntity.ok(userService.getTechnicians());
    }

    @PutMapping("/users/{id}/enable")
    public ResponseEntity<UserResponse> enableUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.setUserEnabled(id, true));
    }

    @PutMapping("/users/{id}/disable")
    public ResponseEntity<UserResponse> disableUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.setUserEnabled(id, false));
    }

    @GetMapping("/statistics")
    public ResponseEntity<DashboardStatsResponse> getStatistics() {
        return ResponseEntity.ok(userService.getAdminStatistics());
    }
}
