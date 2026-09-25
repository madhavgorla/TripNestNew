package com.tripnest.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "trip_id", nullable = false, length = 64)
    private String tripId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(length = 50)
    @Builder.Default
    private String category = "Other";

    @Column(name = "expense_date", nullable = false)
    private LocalDate date;

    @Column(name = "paid_by_id", length = 64)
    private String paidById;

    @Column(name = "paid_by_name", length = 150)
    private String paidByName;

    @Column(name = "payment_method", length = 50)
    @Builder.Default
    private String paymentMethod = "Credit Card";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExpenseSplit> splits = new ArrayList<>();

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}
