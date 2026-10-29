package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentCommentRequest {

    @NotBlank(message = "Le contenu de la note est obligatoire")
    @Size(min = 2, max = 3000, message = "La note doit comporter entre 2 et 3000 caractères")
    private String content;
}
