package com.tripnest.repository;

import com.tripnest.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByTargetIdOrderByCreatedAtDesc(String targetId);
    List<Review> findByTargetTypeOrderByCreatedAtDesc(String targetType);
    
    @Query("SELECT r FROM Review r ORDER BY r.helpfulVotes DESC, r.rating DESC")
    List<Review> findTopFeatured();
}
