package com.tripnest.controller;

import com.tripnest.dto.ApiResponse;
import com.tripnest.model.Destination;
import com.tripnest.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationRepository destinationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Destination>>> getDestinations(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String search
    ) {
        List<Destination> list;
        if (search != null && !search.isBlank()) {
            list = destinationRepository.findByNameContainingIgnoreCaseOrCountryContainingIgnoreCase(search, search);
        } else if (category != null && !category.equalsIgnoreCase("All")) {
            list = destinationRepository.findByCategory(category);
        } else if (region != null && !region.equalsIgnoreCase("All")) {
            list = destinationRepository.findByRegion(region);
        } else {
            list = destinationRepository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Destination>> getDestinationById(@PathVariable String id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Destination not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.ok(destination));
    }
}
