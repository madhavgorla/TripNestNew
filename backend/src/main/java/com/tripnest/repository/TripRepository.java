package com.tripnest.repository;

import com.tripnest.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, String> {
    List<Trip> findByOwnerIdOrderByStartDateAsc(String ownerId);
    List<Trip> findByVisibility(String visibility);
}
