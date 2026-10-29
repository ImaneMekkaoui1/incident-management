package com.example.demo;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.security.JwtUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration validant les tests de sécurité obligatoires (Section 25 du sujet)
 */
@SpringBootTest
public class SecurityIntegrationTests {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Autowired
    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    private String obtainAccessToken(String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseStr = result.getResponse().getContentAsString();
        Map<?, ?> responseMap = objectMapper.readValue(responseStr, Map.class);
        return (String) responseMap.get("token");
    }

    @Test
    @DisplayName("Test 1: Accès à une API protégée sans JWT -> 401 Unauthorized")
    void test1_accessProtectedApiWithoutToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/incidents/my"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test 2: Accès avec un JWT invalide -> 401 Unauthorized")
    void test2_accessWithInvalidToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/incidents/my")
                        .header("Authorization", "Bearer invalid.jwt.token.here"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test 3: Accès avec un JWT expiré -> 401 Unauthorized")
    void test3_accessWithExpiredToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/incidents/my")
                        .header("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlbXBsb3llZTFAMS5jb20iLCJleHAiOjE2MDAwMDAwMDB9.invalidSig"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test 4: EMPLOYEE essayant d'accéder à une route ADMIN -> 403 Forbidden")
    void test4_employeeAccessingAdminRoute_shouldReturn403() throws Exception {
        String employeeToken = obtainAccessToken("employee1@incident.com", "password123");

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + employeeToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test 5: EMPLOYEE essayant d'accéder à un incident d'un autre utilisateur -> 403 Forbidden")
    void test5_employeeAccessingOtherIncident_shouldReturn403() throws Exception {
        // employee1 tries to access Incident #3 (which belongs to employee2)
        String employee1Token = obtainAccessToken("employee1@incident.com", "password123");

        mockMvc.perform(get("/api/incidents/3")
                        .header("Authorization", "Bearer " + employee1Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test 6: TECHNICIAN essayant de modifier un incident non affecté -> 403 Forbidden")
    void test6_technicianModifyingUnassignedIncident_shouldReturn403() throws Exception {
        // tech2 tries to update status of Incident #1 (which is assigned to tech1)
        String tech2Token = obtainAccessToken("tech2@incident.com", "password123");

        String statusUpdatePayload = "{\"status\": \"RESOLVED\", \"note\": \"Tentative non autorisée\"}";

        mockMvc.perform(put("/api/incidents/1/status")
                        .header("Authorization", "Bearer " + tech2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusUpdatePayload))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test 7: Utilisateur désactivé essayant de se connecter -> 403 Forbidden")
    void test7_disabledUserLogin_shouldReturn403() throws Exception {
        LoginRequest disabledLogin = new LoginRequest("disabled@incident.com", "password123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(disabledLogin)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test 8: Inscription avec un email déjà existant -> 400 Bad Request")
    void test8_registerWithDuplicateEmail_shouldReturn400() throws Exception {
        RegisterRequest dupRequest = new RegisterRequest();
        dupRequest.setFullName("Duplicate Test");
        dupRequest.setEmail("employee1@incident.com");
        dupRequest.setPassword("newPassword123");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test 9: Création d'incident avec données invalides -> 400 Bad Request")
    void test9_createIncidentWithInvalidData_shouldReturn400() throws Exception {
        String employee1Token = obtainAccessToken("employee1@incident.com", "password123");

        // Missing required title and description
        String invalidIncident = "{\"category\": \"MALWARE\", \"priority\": \"HIGH\"}";

        mockMvc.perform(post("/api/incidents")
                        .header("Authorization", "Bearer " + employee1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidIncident))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Règle 8: Statut d'un incident CLOSED ne peut plus être modifié -> 400 Bad Request")
    void test_closedIncidentCannotBeModified() throws Exception {
        String adminToken = obtainAccessToken("admin@incident.com", "password123");

        // First close incident 3
        mockMvc.perform(put("/api/incidents/3/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"CLOSED\", \"note\": \"Clôture administrative\"}"))
                .andExpect(status().isOk());

        // Now attempt to change it back to IN_PROGRESS
        mockMvc.perform(put("/api/incidents/3/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"IN_PROGRESS\", \"note\": \"Réouverture non permise\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Impossible de modifier le statut : cet incident est déjà clôturé (CLOSED)"));
    }
}
