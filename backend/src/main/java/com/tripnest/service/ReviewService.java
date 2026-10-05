package com.tripnest.service;

import com.tripnest.dto.ReviewDto;
import com.tripnest.model.Review;
import com.tripnest.model.User;
import com.tripnest.repository.ReviewRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ReviewDto.ReviewListResponse getReviews(String targetType, String targetId, Integer rating, String travelerType, String sortBy) {
        List<Review> list;
        if (targetId != null && !targetId.isBlank()) {
            list = reviewRepository.findByTargetIdOrderByCreatedAtDesc(targetId.toLowerCase().trim());
        } else if (targetType != null && !targetType.isBlank()) {
            list = reviewRepository.findByTargetTypeOrderByCreatedAtDesc(targetType);
        } else {
            list = reviewRepository.findAll();
        }

        // Calculate summary across all reviews for this target
        String targetName = list.isEmpty() ? (targetId != null ? targetId : "All Destinations") : list.get(0).getTargetName();
        ReviewDto.RatingSummary summary = computeRatingSummary(targetId != null ? targetId : "all", targetName, list);

        // Apply filters
        if (rating != null) {
            list = list.stream()
                    .filter(r -> r.getRating().setScale(0, RoundingMode.HALF_UP).intValue() == rating)
                    .collect(Collectors.toList());
        }

        if (travelerType != null && !travelerType.equalsIgnoreCase("All")) {
            list = list.stream()
                    .filter(r -> travelerType.equalsIgnoreCase(r.getTravelerType()))
                    .collect(Collectors.toList());
        }

        // Sorting
        if ("highest".equalsIgnoreCase(sortBy)) {
            list.sort(Comparator.comparing(Review::getRating).reversed());
        } else if ("lowest".equalsIgnoreCase(sortBy)) {
            list.sort(Comparator.comparing(Review::getRating));
        } else if ("helpful".equalsIgnoreCase(sortBy)) {
            list.sort(Comparator.comparing(Review::getHelpfulVotes).reversed());
        } else {
            list.sort(Comparator.comparing(Review::getCreatedAt).reversed());
        }

        return ReviewDto.ReviewListResponse.builder()
                .reviews(list)
                .summary(summary)
                .build();
    }

    public List<Review> getFeaturedReviews() {
        return reviewRepository.findTopFeatured().stream().limit(6).collect(Collectors.toList());
    }

    @Transactional
    public Review createReview(ReviewDto.CreateReviewRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);

        Review review = Review.builder()
                .id("rev-" + UUID.randomUUID().toString().substring(0, 8))
                .targetType(request.getTargetType() != null ? request.getTargetType() : "destination")
                .targetId(request.getTargetId().toLowerCase().trim())
                .targetName(request.getTargetName() != null ? request.getTargetName() : request.getTargetId())
                .userId(user != null ? user.getId() : "usr-guest")
                .userName(user != null ? user.getFullName() : "Verified Traveler")
                .userAvatar(user != null && user.getAvatarUrl() != null ? user.getAvatarUrl() : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150")
                .userCountry(user != null && user.getCountry() != null ? user.getCountry() + " 🌍" : "Global Traveler ✈️")
                .rating(request.getRating())
                .valueForMoney(request.getSubRatings() != null ? request.getSubRatings().getValueForMoney() : request.getRating())
                .safety(request.getSubRatings() != null ? request.getSubRatings().getSafety() : BigDecimal.valueOf(5.0))
                .foodAndDining(request.getSubRatings() != null ? request.getSubRatings().getFoodAndDining() : request.getRating())
                .walkability(request.getSubRatings() != null ? request.getSubRatings().getWalkability() : BigDecimal.valueOf(4.5))
                .title(request.getTitle())
                .comment(request.getComment())
                .travelerType(request.getTravelerType() != null ? request.getTravelerType() : "Solo")
                .tripDate(request.getTripDate() != null ? request.getTripDate() : "Recent Visit")
                .wouldRecommend(request.getWouldRecommend() != null ? request.getWouldRecommend() : true)
                .helpfulVotes(1)
                .verifiedTraveler(true)
                .createdAt(Instant.now())
                .build();

        return reviewRepository.save(review);
    }

    @Transactional
    public Review voteHelpful(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with id: " + reviewId));
        review.setHelpfulVotes(review.getHelpfulVotes() + 1);
        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(String id) {
        reviewRepository.deleteById(id);
    }

    public ReviewDto.RatingSummary computeRatingSummary(String targetId, String targetName, List<Review> reviews) {
        if (reviews.isEmpty()) {
            Map<Integer, Integer> distribution = new HashMap<>();
            for (int i = 1; i <= 5; i++) distribution.put(i, 0);
            return ReviewDto.RatingSummary.builder()
                    .targetId(targetId)
                    .targetName(targetName)
                    .averageRating(BigDecimal.valueOf(5.0))
                    .totalReviews(0)
                    .ratingDistribution(distribution)
                    .subRatingsAverage(new ReviewDto.SubRatings(BigDecimal.valueOf(5.0), BigDecimal.valueOf(5.0), BigDecimal.valueOf(5.0), BigDecimal.valueOf(5.0)))
                    .recommendPercentage(100)
                    .aiHighlights(List.of("No reviews yet. Be the first traveler to share your experience!"))
                    .aiSummary("Be the first to review this journey.")
                    .build();
        }

        int total = reviews.size();
        BigDecimal sumRating = BigDecimal.ZERO;
        Map<Integer, Integer> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) distribution.put(i, 0);

        int recommendCount = 0;
        BigDecimal sumValue = BigDecimal.ZERO;
        BigDecimal sumSafety = BigDecimal.ZERO;
        BigDecimal sumFood = BigDecimal.ZERO;
        BigDecimal sumWalk = BigDecimal.ZERO;

        for (Review r : reviews) {
            sumRating = sumRating.add(r.getRating());
            int star = Math.max(1, Math.min(5, r.getRating().setScale(0, RoundingMode.HALF_UP).intValue()));
            distribution.put(star, distribution.get(star) + 1);
            if (Boolean.TRUE.equals(r.getWouldRecommend())) recommendCount++;

            if (r.getValueForMoney() != null) sumValue = sumValue.add(r.getValueForMoney());
            if (r.getSafety() != null) sumSafety = sumSafety.add(r.getSafety());
            if (r.getFoodAndDining() != null) sumFood = sumFood.add(r.getFoodAndDining());
            if (r.getWalkability() != null) sumWalk = sumWalk.add(r.getWalkability());
        }

        BigDecimal avg = sumRating.divide(BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP);
        int recPct = (int) Math.round(((double) recommendCount / total) * 100);

        ReviewDto.SubRatings subAvg = new ReviewDto.SubRatings(
                sumValue.divide(BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP),
                sumSafety.divide(BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP),
                sumFood.divide(BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP),
                sumWalk.divide(BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP)
        );

        List<String> highlights = List.of(
                recPct + "% of travelers recommend visiting this destination",
                "High pedestrian friendliness and outstanding authentic culinary ratings",
                "Travelers advise early booking for top cultural landmarks"
        );

        String summaryText = targetName + " has achieved a remarkable " + avg + "/5.0 traveler score with " +
                total + " community reviews praised for culture, cuisine, and safety.";

        return ReviewDto.RatingSummary.builder()
                .targetId(targetId)
                .targetName(targetName)
                .averageRating(avg)
                .totalReviews(total)
                .ratingDistribution(distribution)
                .subRatingsAverage(subAvg)
                .recommendPercentage(recPct)
                .aiHighlights(highlights)
                .aiSummary(summaryText)
                .build();
    }
}
