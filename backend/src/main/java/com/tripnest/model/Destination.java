package com.tripnest.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "destinations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Destination {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(length = 100)
    private String region;

    @Column(length = 50)
    private String category;

    @Column(precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "long_description", columnDefinition = "TEXT")
    private String longDescription;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "average_cost_per_day", precision = 10, scale = 2)
    private BigDecimal averageCostPerDay;

    @Column(name = "best_time_to_visit", length = 150)
    private String bestTimeToVisit;

    private Double latitude;
    private Double longitude;
}
