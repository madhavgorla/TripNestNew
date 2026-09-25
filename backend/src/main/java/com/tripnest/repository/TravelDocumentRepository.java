package com.tripnest.repository;

import com.tripnest.model.TravelDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TravelDocumentRepository extends JpaRepository<TravelDocument, String> {
    List<TravelDocument> findByTripIdOrderByUploadDateDesc(String tripId);
}
