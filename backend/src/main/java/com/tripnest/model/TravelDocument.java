package com.tripnest.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "travel_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelDocument {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "trip_id", nullable = false, length = 64)
    private String tripId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 50)
    @Builder.Default
    private String category = "Other";

    @Column(name = "file_size", length = 30)
    private String fileSize;

    @Column(name = "file_type", length = 50)
    @Builder.Default
    private String fileType = "application/pdf";

    @Column(name = "upload_date")
    private LocalDate uploadDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}
