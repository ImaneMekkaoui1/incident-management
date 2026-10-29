package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<IncidentResponse> createIncident(@Valid @RequestBody IncidentCreateRequest request) {
        IncidentResponse response = incidentService.createIncident(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<IncidentResponse>> getMyIncidents() {
        return ResponseEntity.ok(incidentService.getMyIncidents());
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<IncidentResponse>> getAssignedIncidents() {
        return ResponseEntity.ok(incidentService.getAssignedIncidents());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<IncidentResponse>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<IncidentResponse> updateStatus(@PathVariable Long id,
                                                         @Valid @RequestBody IncidentStatusUpdateRequest request) {
        return ResponseEntity.ok(incidentService.updateStatus(id, request));
    }

    @PutMapping("/{id}/assign/{technicianId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IncidentResponse> assignIncident(@PathVariable Long id,
                                                           @PathVariable Long technicianId) {
        return ResponseEntity.ok(incidentService.assignIncident(id, technicianId));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<IncidentCommentResponse> addComment(@PathVariable Long id,
                                                              @Valid @RequestBody IncidentCommentRequest request) {
        IncidentCommentResponse response = incidentService.addComment(id, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<IncidentCommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getComments(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<IncidentHistoryResponse>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getHistory(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(incidentService.getDashboardStats());
    }
}
