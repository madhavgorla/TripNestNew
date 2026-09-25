package com.tripnest.service;

import com.tripnest.config.JwtService;
import com.tripnest.dto.AuthDto;
import com.tripnest.model.Role;
import com.tripnest.model.User;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .id("usr-" + UUID.randomUUID().toString().substring(0, 8))
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .avatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150")
                .country(request.getCountry() != null ? request.getCountry() : "Global")
                .preferredCurrency(request.getPreferredCurrency() != null ? request.getPreferredCurrency() : "USD")
                .role(Role.TRAVELER)
                .provider("LOCAL")
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return buildAuthResponse(user, token);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (user.getPassword() != null && !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        return buildAuthResponse(user, token);
    }

    @Transactional
    public AuthDto.AuthResponse loginWithGoogle(AuthDto.GoogleLoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .id("usr-" + UUID.randomUUID().toString().substring(0, 8))
                    .fullName(request.getFullName() != null ? request.getFullName() : "Google Explorer")
                    .email(email)
                    .avatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl() : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150")
                    .role(Role.TRAVELER)
                    .provider("GOOGLE")
                    .preferredCurrency("USD")
                    .build();
            return userRepository.save(newUser);
        });

        String token = jwtService.generateToken(user);
        return buildAuthResponse(user, token);
    }

    public AuthDto.UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToUserDto(user);
    }

    private AuthDto.AuthResponse buildAuthResponse(User user, String token) {
        return AuthDto.AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationMs() / 1000)
                .user(mapToUserDto(user))
                .build();
    }

    private AuthDto.UserDto mapToUserDto(User user) {
        return AuthDto.UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .country(user.getCountry())
                .preferredCurrency(user.getPreferredCurrency())
                .role(user.getRole())
                .provider(user.getProvider())
                .build();
    }
}
