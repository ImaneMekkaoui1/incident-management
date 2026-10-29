package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.entities.Incident;
import com.example.demo.entities.IncidentComment;
import com.example.demo.entities.IncidentHistory;
import com.example.demo.entities.User;
import com.example.demo.enums.IncidentPriority;
import com.example.demo.enums.IncidentStatus;
import com.example.demo.enums.Role;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ForbiddenException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.IncidentCommentRepository;
import com.example.demo.repository.IncidentHistoryRepository;
import com.example.demo.repository.IncidentRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentHistoryRepository historyRepository;
    private final IncidentCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public IncidentResponse createIncident(IncidentCreateRequest request) {
        User currentUser = userService.getCurrentAuthenticatedUser();

        Incident incident = Incident.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(IncidentStatus.OPEN)
                .createdBy(currentUser)
                .build();

        incident = incidentRepository.save(incident);

        // Record creation in history (Section 20)
        IncidentHistory history = IncidentHistory.builder()
                .incident(incident)
                .action("Incident créé")
                .changedBy(currentUser)
                .newStatus(IncidentStatus.OPEN)
                .details("Incident déclaré avec la catégorie " + request.getCategory() + " et priorité " + request.getPriority())
                .build();
        historyRepository.save(history);

        return mapToResponse(incident);
    }

    public List<IncidentResponse> getMyIncidents() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        return incidentRepository.findByCreatedByOrderByCreatedAtDesc(currentUser).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<IncidentResponse> getAssignedIncidents() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        return incidentRepository.findByAssignedToOrderByCreatedAtDesc(currentUser).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<IncidentResponse> getAllIncidents() {
        return incidentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public IncidentResponse getIncidentById(Long id) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident introuvable avec l'id : " + id));

        verifyReadAccess(incident, currentUser);

        return mapToResponse(incident);
    }

    @Transactional
    public IncidentResponse updateStatus(Long id, IncidentStatusUpdateRequest request) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident introuvable avec l'id : " + id));

        // Rule 5: A technician can only modify incidents assigned to them
        if (currentUser.getRole() == Role.TECHNICIAN) {
            if (incident.getAssignedTo() == null || !incident.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("Accès refusé : vous ne pouvez modifier que les incidents qui vous sont affectés");
            }
        }

        // Rule 8: When an incident is CLOSED, its status cannot be modified normally
        if (incident.getStatus() == IncidentStatus.CLOSED) {
            throw new BadRequestException("Impossible de modifier le statut : cet incident est déjà clôturé (CLOSED)");
        }

        IncidentStatus oldStatus = incident.getStatus();
        IncidentStatus newStatus = request.getStatus();

        incident.setStatus(newStatus);
        incident = incidentRepository.save(incident);

        // Record history
        IncidentHistory history = IncidentHistory.builder()
                .incident(incident)
                .action("Statut modifié : " + oldStatus + " -> " + newStatus)
                .changedBy(currentUser)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .details(request.getNote() != null && !request.getNote().isBlank() ? request.getNote().trim() : "Mise à jour du statut")
                .build();
        historyRepository.save(history);

        // If a note was provided, save it as a comment as well
        if (request.getNote() != null && !request.getNote().isBlank()) {
            IncidentComment comment = IncidentComment.builder()
                    .incident(incident)
                    .author(currentUser)
                    .content(request.getNote().trim())
                    .build();
            commentRepository.save(comment);
        }

        return mapToResponse(incident);
    }

    @Transactional
    public IncidentResponse assignIncident(Long id, Long technicianId) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident introuvable avec l'id : " + id));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technicien introuvable avec l'id : " + technicianId));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new BadRequestException("L'utilisateur spécifié n'est pas un technicien (rôle : " + technician.getRole() + ")");
        }

        if (!technician.isEnabled()) {
            throw new BadRequestException("Impossible d'affecter l'incident à un technicien dont le compte est désactivé");
        }

        IncidentStatus oldStatus = incident.getStatus();
        incident.setAssignedTo(technician);

        // If OPEN, move to ASSIGNED
        if (incident.getStatus() == IncidentStatus.OPEN) {
            incident.setStatus(IncidentStatus.ASSIGNED);
        }

        incident = incidentRepository.save(incident);

        // Record assignment in history
        IncidentHistory history = IncidentHistory.builder()
                .incident(incident)
                .action("Affecté à " + technician.getFullName())
                .changedBy(currentUser)
                .oldStatus(oldStatus)
                .newStatus(incident.getStatus())
                .details("Incident affecté au technicien " + technician.getFullName() + " (" + technician.getEmail() + ")")
                .build();
        historyRepository.save(history);

        return mapToResponse(incident);
    }

    @Transactional
    public IncidentCommentResponse addComment(Long incidentId, IncidentCommentRequest request) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident introuvable avec l'id : " + incidentId));

        // Check rights to add comment
        if (currentUser.getRole() == Role.TECHNICIAN) {
            if (incident.getAssignedTo() == null || !incident.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("Accès refusé : vous ne pouvez ajouter une note que sur les incidents qui vous sont affectés");
            }
        } else if (currentUser.getRole() == Role.EMPLOYEE) {
            if (!incident.getCreatedBy().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("Accès refusé : cet incident ne vous appartient pas");
            }
        }

        IncidentComment comment = IncidentComment.builder()
                .incident(incident)
                .author(currentUser)
                .content(request.getContent().trim())
                .build();

        comment = commentRepository.save(comment);

        // Record comment addition in history
        IncidentHistory history = IncidentHistory.builder()
                .incident(incident)
                .action("Note ajoutée")
                .changedBy(currentUser)
                .details(request.getContent().trim())
                .build();
        historyRepository.save(history);

        return mapToCommentResponse(comment);
    }

    public List<IncidentCommentResponse> getComments(Long incidentId) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident introuvable avec l'id : " + incidentId));

        verifyReadAccess(incident, currentUser);

        return commentRepository.findByIncidentIdOrderByCreatedAtAsc(incidentId).stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    public List<IncidentHistoryResponse> getHistory(Long incidentId) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident introuvable avec l'id : " + incidentId));

        verifyReadAccess(incident, currentUser);

        return historyRepository.findByIncidentIdOrderByTimestampAsc(incidentId).stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    public DashboardStatsResponse getDashboardStats() {
        User currentUser = userService.getCurrentAuthenticatedUser();

        if (currentUser.getRole() == Role.EMPLOYEE) {
            long total = incidentRepository.countByCreatedBy(currentUser);
            long open = incidentRepository.countByCreatedByAndStatus(currentUser, IncidentStatus.OPEN);
            long inProgress = incidentRepository.countByCreatedByAndStatus(currentUser, IncidentStatus.IN_PROGRESS);
            long assigned = incidentRepository.countByCreatedByAndStatus(currentUser, IncidentStatus.ASSIGNED);
            long resolved = incidentRepository.countByCreatedByAndStatus(currentUser, IncidentStatus.RESOLVED);
            long closed = incidentRepository.countByCreatedByAndStatus(currentUser, IncidentStatus.CLOSED);

            return DashboardStatsResponse.builder()
                    .totalIncidents(total)
                    .openIncidents(open)
                    .assignedIncidents(assigned)
                    .inProgressIncidents(inProgress)
                    .resolvedIncidents(resolved + closed)
                    .closedIncidents(closed)
                    .build();
        } else if (currentUser.getRole() == Role.TECHNICIAN) {
            long assigned = incidentRepository.countByAssignedTo(currentUser);
            long critical = incidentRepository.countByAssignedToAndPriority(currentUser, IncidentPriority.CRITICAL);
            long inProgress = incidentRepository.countByAssignedToAndStatus(currentUser, IncidentStatus.IN_PROGRESS);
            long resolved = incidentRepository.countByAssignedToAndStatus(currentUser, IncidentStatus.RESOLVED);
            long closed = incidentRepository.countByAssignedToAndStatus(currentUser, IncidentStatus.CLOSED);

            return DashboardStatsResponse.builder()
                    .totalIncidents(assigned)
                    .assignedIncidents(assigned)
                    .criticalIncidents(critical)
                    .inProgressIncidents(inProgress)
                    .resolvedIncidents(resolved)
                    .closedIncidents(closed)
                    .build();
        } else {
            // ADMIN
            return userService.getAdminStatistics();
        }
    }

    // Section 12: Ownership / Access Verification
    private void verifyReadAccess(Incident incident, User currentUser) {
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }

        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (!incident.getCreatedBy().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("Accès refusé : cet incident ne vous appartient pas");
            }
            return;
        }

        if (currentUser.getRole() == Role.TECHNICIAN) {
            // Technicians can view incidents assigned to them
            if (incident.getAssignedTo() != null && incident.getAssignedTo().getId().equals(currentUser.getId())) {
                return;
            }
            throw new ForbiddenException("Accès refusé : cet incident ne vous est pas affecté");
        }
    }

    private IncidentResponse mapToResponse(Incident incident) {
        int commentsCount = commentRepository.findByIncidentIdOrderByCreatedAtAsc(incident.getId()).size();
        int historyCount = historyRepository.findByIncidentIdOrderByTimestampAsc(incident.getId()).size();

        return IncidentResponse.builder()
                .id(incident.getId())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .category(incident.getCategory())
                .priority(incident.getPriority())
                .status(incident.getStatus())
                .createdAt(incident.getCreatedAt())
                .updatedAt(incident.getUpdatedAt())
                .createdBy(userService.mapToSummaryResponse(incident.getCreatedBy()))
                .assignedTo(userService.mapToSummaryResponse(incident.getAssignedTo()))
                .commentsCount(commentsCount)
                .historyCount(historyCount)
                .build();
    }

    private IncidentCommentResponse mapToCommentResponse(IncidentComment comment) {
        return IncidentCommentResponse.builder()
                .id(comment.getId())
                .incidentId(comment.getIncident().getId())
                .content(comment.getContent())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getFullName())
                .authorEmail(comment.getAuthor().getEmail())
                .authorRole(comment.getAuthor().getRole())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private IncidentHistoryResponse mapToHistoryResponse(IncidentHistory history) {
        return IncidentHistoryResponse.builder()
                .id(history.getId())
                .incidentId(history.getIncident().getId())
                .action(history.getAction())
                .changedById(history.getChangedBy().getId())
                .changedByName(history.getChangedBy().getFullName())
                .oldStatus(history.getOldStatus())
                .newStatus(history.getNewStatus())
                .details(history.getDetails())
                .timestamp(history.getTimestamp())
                .build();
    }
}
