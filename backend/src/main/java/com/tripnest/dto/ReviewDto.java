package com.tripnest.dto;

import com.tripnest.model.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ReviewDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReviewRequest {
        private String targetType;
        private String targetId;
        private String targetName;
        private BigDecimal rating;
        private SubRatings subRatings;
        private String title;
        private String comment;
        private String travelerType;
        private String tripDate;
        private Boolean wouldRecommend;
        private List<String> photos;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubRatings {
        private BigDecimal valueForMoney;
        private BigDecimal safety;
        private BigDecimal foodAndDining;
        private BigDecimal walkability;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingSummary {
        private String targetId;
        private String targetName;
        private BigDecimal averageRating;
        private Integer totalReviews;
        private Map<Integer, Integer> ratingDistribution;
        private SubRatings subRatingsAverage;
        private Integer recommendPercentage;
        private List<String> aiHighlights;
        private String aiSummary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewListResponse {
        private List<Review> reviews;
        private RatingSummary summary;
    }
}
