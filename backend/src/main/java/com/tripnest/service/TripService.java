package com.tripnest.service;

import com.tripnest.dto.TripDto;
import com.tripnest.model.Trip;
import com.tripnest.model.User;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public List<Trip> getAllUserTrips(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user != null) {
            return tripRepository.findByOwnerIdOrderByStartDateAsc(user.getId());
        }
        return tripRepository.findAll();
    }

    public Trip getTripById(String id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with id: " + id));
    }

    @Transactional
    public Trip createTrip(TripDto.CreateTripRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);

        Trip trip = Trip.builder()
                .id("trip-" + UUID.randomUUID().toString().substring(0, 8))
                .tripName(request.getTripName())
                .description(request.getDescription())
                .destination(request.getDestination())
                .country(request.getCountry())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .travelers(request.getTravelers() != null ? request.getTravelers() : 1)
                .budget(request.getBudget())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .travelStyle(request.getTravelStyle() != null ? request.getTravelStyle() : "Standard")
                .coverImage(request.getCoverImage())
                .visibility(request.getVisibility() != null ? request.getVisibility() : "PRIVATE")
                .ownerId(user != null ? user.getId() : "usr-guest")
                .ownerName(user != null ? user.getFullName() : "Guest Traveler")
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return tripRepository.save(trip);
    }

    @Transactional
    public Trip updateTrip(String id, Trip updatedData) {
        Trip existing = getTripById(id);
        if (updatedData.getTripName() != null) existing.setTripName(updatedData.getTripName());
        if (updatedData.getDescription() != null) existing.setDescription(updatedData.getDescription());
        if (updatedData.getBudget() != null) existing.setBudget(updatedData.getBudget());
        if (updatedData.getSpent() != null) existing.setSpent(updatedData.getSpent());
        if (updatedData.getStatus() != null) existing.setStatus(updatedData.getStatus());
        if (updatedData.getStartDate() != null) existing.setStartDate(updatedData.getStartDate());
        if (updatedData.getEndDate() != null) existing.setEndDate(updatedData.getEndDate());
        if (updatedData.getTravelers() != null) existing.setTravelers(updatedData.getTravelers());
        existing.setUpdatedAt(Instant.now());

        return tripRepository.save(existing);
    }

    @Transactional
    public void deleteTrip(String id) {
        tripRepository.deleteById(id);
    }
}
