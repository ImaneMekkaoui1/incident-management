package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    // Admin specific
    private Long totalUsers;
    private Long employeeCount;
    private Long technicianCount;
    private Long adminCount;

    // Common / Role specific incident stats
    private Long totalIncidents;
    private Long openIncidents;
    private Long assignedIncidents;
    private Long inProgressIncidents;
    private Long resolvedIncidents;
    private Long closedIncidents;
    private Long criticalIncidents;
}
