package com.example.demo.dto;

import com.example.demo.enums.IncidentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentHistoryResponse {
    private Long id;
    private Long incidentId;
    private String action;
    private Long changedById;
    private String changedByName;
    private IncidentStatus oldStatus;
    private IncidentStatus newStatus;
    private String details;
    private LocalDateTime timestamp;
}
