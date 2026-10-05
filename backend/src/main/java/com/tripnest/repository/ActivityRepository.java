package com.tripnest.repository;

import com.tripnest.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, String> {
    List<Activity> findByDayIdOrderBySortOrderAsc(String dayId);
    List<Activity> findByTripId(String tripId);
}
