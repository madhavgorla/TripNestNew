package com.tripnest.controller;

import com.tripnest.dto.ApiResponse;
import com.tripnest.dto.TripDto;
import com.tripnest.model.Trip;
import com.tripnest.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Trip>>> getAllTrips(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "lara@tripnest.com";
        List<Trip> trips = tripService.getAllUserTrips(email);
        return ResponseEntity.ok(ApiResponse.ok(trips));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Trip>> getTripById(@PathVariable String id) {
        Trip trip = tripService.getTripById(id);
        return ResponseEntity.ok(ApiResponse.ok(trip));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Trip>> createTrip(
            @RequestBody TripDto.CreateTripRequest request,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : "lara@tripnest.com";
        Trip created = tripService.createTrip(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Trip created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Trip>> updateTrip(
            @PathVariable String id,
            @RequestBody Trip updatedTrip
    ) {
        Trip trip = tripService.updateTrip(id, updatedTrip);
        return ResponseEntity.ok(ApiResponse.ok("Trip updated successfully", trip));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTrip(@PathVariable String id) {
        tripService.deleteTrip(id);
        return ResponseEntity.ok(ApiResponse.ok("Trip deleted successfully", null));
    }
}
