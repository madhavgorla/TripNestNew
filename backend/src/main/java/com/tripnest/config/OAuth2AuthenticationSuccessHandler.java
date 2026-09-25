package com.tripnest.config;

import com.tripnest.model.Role;
import com.tripnest.model.User;
import com.tripnest.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${tripnest.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String sub = oAuth2User.getAttribute("sub");

        if (email == null) {
            response.sendRedirect(frontendUrl + "?error=email_not_provided");
            return;
        }

        // Find or create User in PostgreSQL
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .id("usr-" + UUID.randomUUID().toString().substring(0, 8))
                    .fullName(name != null ? name : "Google Traveler")
                    .email(email)
                    .avatarUrl(picture != null ? picture : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150")
                    .provider("GOOGLE")
                    .providerId(sub)
                    .role(Role.TRAVELER)
                    .preferredCurrency("USD")
                    .build();
            return userRepository.save(newUser);
        });

        // Generate JWT token
        String token = jwtService.generateToken(user);

        // Redirect to Frontend with JWT token in URL query parameter
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                .queryParam("token", token)
                .queryParam("userId", user.getId())
                .queryParam("email", user.getEmail())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
