package com.example.demo.dto;

import com.example.demo.enums.IncidentCategory;
import com.example.demo.enums.IncidentPriority;
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
public class IncidentResponse {
    private Long id;
    private String title;
    private String description;
    private IncidentCategory category;
    private IncidentPriority priority;
    private IncidentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserSummaryResponse createdBy;
    private UserSummaryResponse assignedTo;
    private int commentsCount;
    private int historyCount;
}
