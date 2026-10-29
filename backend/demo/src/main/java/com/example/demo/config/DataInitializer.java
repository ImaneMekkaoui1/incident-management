package com.example.demo.config;

import com.example.demo.entities.Incident;
import com.example.demo.entities.IncidentComment;
import com.example.demo.entities.IncidentHistory;
import com.example.demo.entities.User;
import com.example.demo.enums.IncidentCategory;
import com.example.demo.enums.IncidentPriority;
import com.example.demo.enums.IncidentStatus;
import com.example.demo.enums.Role;
import com.example.demo.repository.IncidentCommentRepository;
import com.example.demo.repository.IncidentHistoryRepository;
import com.example.demo.repository.IncidentRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentHistoryRepository historyRepository;
    private final IncidentCommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        logger.info("--- Initialisation des données de test (Scénario Section 24) ---");

        // 1. ADMIN
        User admin = User.builder()
                .fullName("Directeur Sécurité (Admin)")
                .email("admin@incident.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ADMIN)
                .enabled(true)
                .build();
        userRepository.save(admin);

        // 2. TECHNICIANS
        User tech1 = User.builder()
                .fullName("Karim Alami (Technicien)")
                .email("tech1@incident.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.TECHNICIAN)
                .enabled(true)
                .build();
        userRepository.save(tech1);

        User tech2 = User.builder()
                .fullName("Fatima Zahra (Technicienne)")
                .email("tech2@incident.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.TECHNICIAN)
                .enabled(true)
                .build();
        userRepository.save(tech2);

        // 3. EMPLOYEES
        User employee1 = User.builder()
                .fullName("Ahmed Benali (Employé 1)")
                .email("employee1@incident.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.EMPLOYEE)
                .enabled(true)
                .build();
        userRepository.save(employee1);

        User employee2 = User.builder()
                .fullName("Sara Mansouri (Employée 2)")
                .email("employee2@incident.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.EMPLOYEE)
                .enabled(true)
                .build();
        userRepository.save(employee2);

        // 4. DISABLED USER (Pour test de sécurité 7)
        User disabledUser = User.builder()
                .fullName("Youssef Désactivé")
                .email("disabled@incident.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.EMPLOYEE)
                .enabled(false)
                .build();
        userRepository.save(disabledUser);

        // 5. Initial Incidents
        // Incident 1: créé par Employee 1, affecté à Tech 1, en cours avec historique et note
        Incident inc1 = Incident.builder()
                .title("Poste de travail infecté par un Ransomware")
                .description("Fichiers chiffrés avec extension suspecte .locked sur le poste de travail de la comptabilité après ouverture d'une pièce jointe.")
                .category(IncidentCategory.MALWARE)
                .priority(IncidentPriority.CRITICAL)
                .status(IncidentStatus.IN_PROGRESS)
                .createdBy(employee1)
                .assignedTo(tech1)
                .build();
        inc1 = incidentRepository.save(inc1);

        historyRepository.save(IncidentHistory.builder()
                .incident(inc1)
                .action("Incident créé")
                .changedBy(employee1)
                .newStatus(IncidentStatus.OPEN)
                .details("Déclaration initiale de l'incident critique")
                .timestamp(LocalDateTime.now().minusHours(4))
                .build());

        historyRepository.save(IncidentHistory.builder()
                .incident(inc1)
                .action("Affecté à Karim Alami")
                .changedBy(admin)
                .oldStatus(IncidentStatus.OPEN)
                .newStatus(IncidentStatus.ASSIGNED)
                .details("Attribution d'urgence par l'administrateur")
                .timestamp(LocalDateTime.now().minusHours(3))
                .build());

        historyRepository.save(IncidentHistory.builder()
                .incident(inc1)
                .action("Statut modifié : ASSIGNED -> IN_PROGRESS")
                .changedBy(tech1)
                .oldStatus(IncidentStatus.ASSIGNED)
                .newStatus(IncidentStatus.IN_PROGRESS)
                .details("Prise en charge technique et isolation du poste")
                .timestamp(LocalDateTime.now().minusHours(2))
                .build());

        commentRepository.save(IncidentComment.builder()
                .incident(inc1)
                .author(tech1)
                .content("Le poste a été immédiatement déconnecté du réseau LAN et Wi-Fi pour stopper la propagation.")
                .createdAt(LocalDateTime.now().minusHours(2))
                .build());

        commentRepository.save(IncidentComment.builder()
                .incident(inc1)
                .author(tech1)
                .content("Analyse forensique en cours avec l'outil de scan mémoire.")
                .createdAt(LocalDateTime.now().minusHours(1))
                .build());

        // Incident 2: créé par Employee 1, non affecté, OPEN
        Incident inc2 = Incident.builder()
                .title("Email de phishing suspect imitant la direction")
                .description("Réception d'un mail demandant un virement bancaire urgent avec un lien suspect pointant vers un faux portail.")
                .category(IncidentCategory.PHISHING)
                .priority(IncidentPriority.HIGH)
                .status(IncidentStatus.OPEN)
                .createdBy(employee1)
                .build();
        inc2 = incidentRepository.save(inc2);

        historyRepository.save(IncidentHistory.builder()
                .incident(inc2)
                .action("Incident créé")
                .changedBy(employee1)
                .newStatus(IncidentStatus.OPEN)
                .details("Signalement de campagne de phishing")
                .timestamp(LocalDateTime.now().minusHours(2))
                .build());

        // Incident 3: créé par Employee 2, affecté à Tech 2, RESOLVED
        Incident inc3 = Incident.builder()
                .title("Perte d'accès au VPN entreprise depuis le domicile")
                .description("Erreur d'authentification lors de la connexion au VPN GlobalProtect après mise à jour système.")
                .category(IncidentCategory.ACCESS)
                .priority(IncidentPriority.MEDIUM)
                .status(IncidentStatus.RESOLVED)
                .createdBy(employee2)
                .assignedTo(tech2)
                .build();
        inc3 = incidentRepository.save(inc3);

        historyRepository.save(IncidentHistory.builder()
                .incident(inc3)
                .action("Incident créé")
                .changedBy(employee2)
                .newStatus(IncidentStatus.OPEN)
                .details("Déclaration problème d'accès VPN")
                .timestamp(LocalDateTime.now().minusHours(6))
                .build());

        historyRepository.save(IncidentHistory.builder()
                .incident(inc3)
                .action("Affecté à Fatima Zahra")
                .changedBy(admin)
                .oldStatus(IncidentStatus.OPEN)
                .newStatus(IncidentStatus.ASSIGNED)
                .timestamp(LocalDateTime.now().minusHours(5))
                .build());

        historyRepository.save(IncidentHistory.builder()
                .incident(inc3)
                .action("Statut modifié : ASSIGNED -> IN_PROGRESS")
                .changedBy(tech2)
                .oldStatus(IncidentStatus.ASSIGNED)
                .newStatus(IncidentStatus.IN_PROGRESS)
                .timestamp(LocalDateTime.now().minusHours(4))
                .build());

        historyRepository.save(IncidentHistory.builder()
                .incident(inc3)
                .action("Statut modifié : IN_PROGRESS -> RESOLVED")
                .changedBy(tech2)
                .oldStatus(IncidentStatus.IN_PROGRESS)
                .newStatus(IncidentStatus.RESOLVED)
                .details("Certificat VPN renouvelé avec succès")
                .timestamp(LocalDateTime.now().minusHours(1))
                .build());

        commentRepository.save(IncidentComment.builder()
                .incident(inc3)
                .author(tech2)
                .content("Le certificat client avait expiré. Un nouveau certificat a été poussé via MDM. Accès rétabli.")
                .createdAt(LocalDateTime.now().minusHours(1))
                .build());

        logger.info("--- Initialisation terminée avec succès ---");
        logger.info("Comptes de test disponibles (mot de passe: 'password123') :");
        logger.info("  Admin:       admin@incident.com");
        logger.info("  Technicien:  tech1@incident.com, tech2@incident.com");
        logger.info("  Employé:     employee1@incident.com, employee2@incident.com");
        logger.info("  Désactivé:   disabled@incident.com");
    }
}
