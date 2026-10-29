package com.example.demo.dto;

import com.example.demo.enums.IncidentCategory;
import com.example.demo.enums.IncidentPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentCreateRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 200, message = "Le titre doit comporter entre 3 et 200 caractères")
    private String title;

    @NotBlank(message = "La description est obligatoire")
    @Size(min = 10, max = 4000, message = "La description doit comporter entre 10 et 4000 caractères")
    private String description;

    @NotNull(message = "La catégorie est obligatoire")
    private IncidentCategory category;

    @NotNull(message = "La priorité est obligatoire")
    private IncidentPriority priority;
}
