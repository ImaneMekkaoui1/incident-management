package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entities.User;
import com.example.demo.enums.IncidentStatus;
import com.example.demo.enums.Role;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.IncidentRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;
    private final PasswordEncoder passwordEncoder;

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Aucun utilisateur authentifié");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + email));
    }

    public UserResponse getProfile() {
        User user = getCurrentAuthenticatedUser();
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(ProfileUpdateRequest request) {
        User user = getCurrentAuthenticatedUser();

        String newEmail = request.getEmail().toLowerCase().trim();
        if (!user.getEmail().equalsIgnoreCase(newEmail)) {
            if (userRepository.existsByEmail(newEmail)) {
                throw new BadRequestException("Cet email est déjà utilisé par un autre compte");
            }
            user.setEmail(newEmail);
        }

        user.setFullName(request.getFullName().trim());
        user = userRepository.save(user);

        return mapToUserResponse(user);
    }

    @Transactional
    public ApiResponse changePassword(PasswordChangeRequest request) {
        User user = getCurrentAuthenticatedUser();

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("L'ancien mot de passe est incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Le nouveau mot de passe et sa confirmation ne correspondent pas");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("Le nouveau mot de passe doit être différent de l'ancien");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ApiResponse.builder()
                .success(true)
                .message("Mot de passe mis à jour avec succès")
                .build();
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public List<UserSummaryResponse> getTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN).stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse setUserEnabled(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id : " + userId));

        user.setEnabled(enabled);
        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    public DashboardStatsResponse getAdminStatistics() {
        long totalUsers = userRepository.count();
        long employeeCount = userRepository.countByRole(Role.EMPLOYEE);
        long technicianCount = userRepository.countByRole(Role.TECHNICIAN);
        long adminCount = userRepository.countByRole(Role.ADMIN);

        long totalIncidents = incidentRepository.count();
        long openCount = incidentRepository.countByStatus(IncidentStatus.OPEN);
        long assignedCount = incidentRepository.countByStatus(IncidentStatus.ASSIGNED);
        long inProgressCount = incidentRepository.countByStatus(IncidentStatus.IN_PROGRESS);
        long resolvedCount = incidentRepository.countByStatus(IncidentStatus.RESOLVED);
        long closedCount = incidentRepository.countByStatus(IncidentStatus.CLOSED);

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .employeeCount(employeeCount)
                .technicianCount(technicianCount)
                .adminCount(adminCount)
                .totalIncidents(totalIncidents)
                .openIncidents(openCount)
                .assignedIncidents(assignedCount)
                .inProgressIncidents(inProgressCount)
                .resolvedIncidents(resolvedCount)
                .closedIncidents(closedCount)
                .build();
    }

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserSummaryResponse mapToSummaryResponse(User user) {
        if (user == null) return null;
        return UserSummaryResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
