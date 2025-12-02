package com.bookkaro.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(length = 3)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // Wallet security fields for fraud prevention
    @Column(name = "daily_topup_total", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal dailyTopupTotal = BigDecimal.ZERO;
    
    @Column(name = "last_topup_date")
    private LocalDateTime lastTopupDate;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Reset daily top-up total if it's a new day
     */
    public void resetDailyTopupIfNeeded() {
        if (lastTopupDate == null || !lastTopupDate.toLocalDate().equals(LocalDateTime.now().toLocalDate())) {
            dailyTopupTotal = BigDecimal.ZERO;
            lastTopupDate = LocalDateTime.now();
        }
    }
    
    /**
     * Track top-up amount for daily limit enforcement
     */
    public void recordTopup(BigDecimal amount) {
        resetDailyTopupIfNeeded();
        dailyTopupTotal = dailyTopupTotal.add(amount);
        lastTopupDate = LocalDateTime.now();
    }

    public void credit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) > 0) {
            this.balance = this.balance.add(amount);
        }
    }

    public boolean debit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) > 0 && this.balance.compareTo(amount) >= 0) {
            this.balance = this.balance.subtract(amount);
            return true;
        }
        return false;
    }
}
