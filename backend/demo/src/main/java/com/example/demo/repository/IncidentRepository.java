package com.example.demo.repository;

import com.example.demo.entities.Incident;
import com.example.demo.entities.User;
import com.example.demo.enums.IncidentPriority;
import com.example.demo.enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByCreatedByOrderByCreatedAtDesc(User user);
    List<Incident> findByAssignedToOrderByCreatedAtDesc(User user);
    List<Incident> findAllByOrderByCreatedAtDesc();

    long countByStatus(IncidentStatus status);
    long countByCreatedBy(User user);
    long countByCreatedByAndStatus(User user, IncidentStatus status);
    long countByAssignedTo(User user);
    long countByAssignedToAndStatus(User user, IncidentStatus status);
    long countByAssignedToAndPriority(User user, IncidentPriority priority);
}
