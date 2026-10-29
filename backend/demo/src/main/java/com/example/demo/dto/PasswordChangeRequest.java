package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordChangeRequest {

    @NotBlank(message = "L'ancien mot de passe est obligatoire")
    private String oldPassword;

    @NotBlank(message = "Le nouveau mot de passe est obligatoire")
    @Size(min = 6, max = 50, message = "Le nouveau mot de passe doit comporter au moins 6 caractères")
    private String newPassword;

    @NotBlank(message = "La confirmation du nouveau mot de passe est obligatoire")
    private String confirmPassword;
}
