package com.example.demo.dto;

import com.example.demo.enums.IncidentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentStatusUpdateRequest {

    @NotNull(message = "Le statut est obligatoire")
    private IncidentStatus status;

    private String note;
}
