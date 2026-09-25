package com.tripnest.repository;

import com.tripnest.model.ItineraryDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ItineraryDayRepository extends JpaRepository<ItineraryDay, String> {
    List<ItineraryDay> findByTripIdOrderByDayNumberAsc(String tripId);
}
