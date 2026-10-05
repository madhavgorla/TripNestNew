package com.tripnest.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash")
    private String password;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(length = 100)
    private String country;

    @Column(name = "preferred_currency", length = 10)
    @Builder.Default
    private String preferredCurrency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private Role role = Role.TRAVELER;

    @Column(length = 20)
    @Builder.Default
    private String provider = "LOCAL"; // LOCAL or GOOGLE

    @Column(name = "provider_id", length = 150)
    private String providerId;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}
