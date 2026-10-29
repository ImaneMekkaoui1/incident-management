package com.example.demo.service;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RefreshTokenRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entities.RefreshToken;
import com.example.demo.entities.User;
import com.example.demo.enums.Role;
import com.example.demo.exception.BadRequestException;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtils;
import com.example.demo.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public ApiResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new BadRequestException("Cet email est déjà utilisé par un autre compte");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.EMPLOYEE) // Business rule 1 & 2: automatically assigned EMPLOYEE
                .enabled(true)
                .build();

        userRepository.save(user);

        return ApiResponse.builder()
                .success(true)
                .message("Compte créé avec succès avec le rôle EMPLOYEE")
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Email ou mot de passe incorrect"));

        if (!user.isEnabled()) {
            throw new DisabledException("Compte désactivé. Veuillez contacter l'administrateur.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String token = jwtUtils.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken.getToken())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .id(user.getId())
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateTokenFromUsername(
                            user.getEmail(),
                            user.getRole().name(),
                            user.getFullName(),
                            user.getId()
                    );
                    return AuthResponse.builder()
                            .token(token)
                            .refreshToken(request.getRefreshToken())
                            .role(user.getRole().name())
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .id(user.getId())
                            .build();
                })
                .orElseThrow(() -> new BadRequestException("Refresh token introuvable ou expiré"));
    }
}
