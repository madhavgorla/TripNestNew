package com.tripnest.controller;

import com.tripnest.dto.ApiResponse;
import com.tripnest.dto.ReviewDto;
import com.tripnest.model.Review;
import com.tripnest.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<ReviewDto.ReviewListResponse>> getReviews(
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) String targetId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String travelerType,
            @RequestParam(required = false, defaultValue = "recent") String sortBy
    ) {
        ReviewDto.ReviewListResponse response = reviewService.getReviews(targetType, targetId, rating, travelerType, sortBy);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<Review>>> getFeaturedReviews() {
        List<Review> featured = reviewService.getFeaturedReviews();
        return ResponseEntity.ok(ApiResponse.ok(featured));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Review>> createReview(
            @RequestBody ReviewDto.CreateReviewRequest request,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : "lara@tripnest.com";
        Review created = reviewService.createReview(request, email);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Review posted successfully! Thank you for sharing your experience.", created));
    }

    @PostMapping("/{id}/helpful")
    public ResponseEntity<ApiResponse<Review>> voteHelpful(@PathVariable String id) {
        Review updated = reviewService.voteHelpful(id);
        return ResponseEntity.ok(ApiResponse.ok("Marked as helpful", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.ok("Review deleted successfully", null));
    }
}
