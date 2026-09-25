package com.tripnest.repository;

import com.tripnest.model.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, String> {
    List<Destination> findByCategory(String category);
    List<Destination> findByRegion(String region);
    List<Destination> findByNameContainingIgnoreCaseOrCountryContainingIgnoreCase(String name, String country);
}
