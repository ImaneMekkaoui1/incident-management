package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentAssignRequest {

    @NotNull(message = "L'identifiant du technicien est obligatoire")
    private Long technicianId;
}
