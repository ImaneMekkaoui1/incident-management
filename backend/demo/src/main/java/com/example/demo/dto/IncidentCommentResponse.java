package com.example.demo.dto;

import com.example.demo.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentCommentResponse {
    private Long id;
    private Long incidentId;
    private String content;
    private Long authorId;
    private String authorName;
    private String authorEmail;
    private Role authorRole;
    private LocalDateTime createdAt;
}
