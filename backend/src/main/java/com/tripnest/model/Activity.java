package com.tripnest.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id")
    @JsonIgnore
    private ItineraryDay day;

    @Column(name = "trip_id", length = 64)
    private String tripId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_time", length = 10)
    private String startTime;

    @Column(name = "end_time", length = 10)
    private String endTime;

    @Column(length = 255)
    private String location;

    @Column(length = 50)
    @Builder.Default
    private String category = "Sightseeing";

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal cost = BigDecimal.ZERO;

    @Column(length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 20)
    @Builder.Default
    private String priority = "Medium";

    @Column(name = "is_completed")
    @Builder.Default
    private Boolean isCompleted = false;

    private Double latitude;
    private Double longitude;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
