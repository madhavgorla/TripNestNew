package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

public class TripDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateTripRequest {
        private String tripName;
        private String description;
        private String destination;
        private String country;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer travelers;
        private BigDecimal budget;
        private String currency;
        private String travelStyle;
        private String coverImage;
        private String visibility;
        private Double latitude;
        private Double longitude;
    }
}
