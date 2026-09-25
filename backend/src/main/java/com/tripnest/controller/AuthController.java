package com.tripnest.controller;

import com.tripnest.dto.ApiResponse;
import com.tripnest.dto.AuthDto;
import com.tripnest.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> login(@RequestBody AuthDto.LoginRequest request) {
        AuthDto.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> register(@RequestBody AuthDto.RegisterRequest request) {
        AuthDto.AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthDto.AuthResponse>> loginWithGoogle(@RequestBody AuthDto.GoogleLoginRequest request) {
        AuthDto.AuthResponse response = authService.loginWithGoogle(request);
        return ResponseEntity.ok(ApiResponse.ok("Google authentication successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthDto.UserDto>> getCurrentUser(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "lara@tripnest.com";
        AuthDto.UserDto user = authService.getCurrentUser(email);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }
}
