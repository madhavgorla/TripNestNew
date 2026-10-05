package com.tripnest.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "expense_splits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseSplit {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id")
    @JsonIgnore
    private Expense expense;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "user_name", length = 150)
    private String userName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column
    @Builder.Default
    private Boolean settled = false;
}
