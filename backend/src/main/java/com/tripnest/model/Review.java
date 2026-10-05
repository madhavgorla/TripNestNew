package com.tripnest.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "target_type", length = 30)
    @Builder.Default
    private String targetType = "destination"; // destination, hotel, activity, trip

    @Column(name = "target_id", nullable = false, length = 64)
    private String targetId;

    @Column(name = "target_name", nullable = false, length = 150)
    private String targetName;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "user_name", nullable = false, length = 150)
    private String userName;

    @Column(name = "user_avatar", length = 500)
    private String userAvatar;

    @Column(name = "user_country", length = 100)
    private String userCountry;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(name = "value_for_money", precision = 3, scale = 1)
    private BigDecimal valueForMoney;

    @Column(precision = 3, scale = 1)
    private BigDecimal safety;

    @Column(name = "food_and_dining", precision = 3, scale = 1)
    private BigDecimal foodAndDining;

    @Column(precision = 3, scale = 1)
    private BigDecimal walkability;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "traveler_type", length = 50)
    @Builder.Default
    private String travelerType = "Solo";

    @Column(name = "trip_date", length = 50)
    private String tripDate;

    @Column(name = "would_recommend")
    @Builder.Default
    private Boolean wouldRecommend = true;

    @Column(name = "helpful_votes")
    @Builder.Default
    private Integer helpfulVotes = 0;

    @Column(name = "verified_traveler")
    @Builder.Default
    private Boolean verifiedTraveler = true;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}
