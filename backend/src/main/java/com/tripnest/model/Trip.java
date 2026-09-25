package com.tripnest.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "trip_name", nullable = false, length = 200)
    private String tripName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 150)
    private String destination;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column
    @Builder.Default
    private Integer travelers = 1;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal budget = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal spent = BigDecimal.ZERO;

    @Column(length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(length = 30)
    @Builder.Default
    private String status = "PLANNING"; // UPCOMING, PLANNING, COMPLETED, ONGOING

    @Column(length = 30)
    @Builder.Default
    private String visibility = "PRIVATE"; // PRIVATE, GROUP, PUBLIC

    @Column(name = "cover_image", length = 500)
    private String coverImage;

    @Column(name = "owner_id", length = 64)
    private String ownerId;

    @Column(name = "owner_name", length = 150)
    private String ownerName;

    @Column(name = "travel_style", length = 50)
    @Builder.Default
    private String travelStyle = "Standard";

    private Double latitude;
    private Double longitude;

    @Column(name = "group_id", length = 64)
    private String groupId;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ItineraryDay> itineraryDays = new ArrayList<>();

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
