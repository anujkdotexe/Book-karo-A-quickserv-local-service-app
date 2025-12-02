package com.bookkaro.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notifications_user_id", columnList = "user_id"),
    @Index(name = "idx_notifications_is_read", columnList = "is_read"),
    @Index(name = "idx_notifications_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"notifications", "vendor", "cart", "addresses", "bookings", "payments", "reviews", "favorites", "password"})
    private User user;

    @Column(nullable = false, length = 50)
    private String type; // BOOKING_UPDATE, ANNOUNCEMENT, PAYMENT_STATUS, REFUND_STATUS, etc.

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id")
    @JsonIgnoreProperties({"notifications"})
    private Announcement announcement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    @JsonIgnoreProperties({"user", "service", "vendor", "payments", "reviews", "notifications"})
    private Booking booking;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Notification Types
     */
    public static class NotificationType {
        public static final String BOOKING_CREATED = "BOOKING_CREATED";
        public static final String BOOKING_CONFIRMED = "BOOKING_CONFIRMED";
        public static final String BOOKING_COMPLETED = "BOOKING_COMPLETED";
        public static final String BOOKING_CANCELLED = "BOOKING_CANCELLED";
        public static final String ANNOUNCEMENT = "ANNOUNCEMENT";
        public static final String PAYMENT_SUCCESS = "PAYMENT_SUCCESS";
        public static final String PAYMENT_FAILED = "PAYMENT_FAILED";
        public static final String REFUND_INITIATED = "REFUND_INITIATED";
        public static final String REFUND_COMPLETED = "REFUND_COMPLETED";
        public static final String VENDOR_APPROVED = "VENDOR_APPROVED";
        public static final String VENDOR_REJECTED = "VENDOR_REJECTED";
        public static final String SERVICE_APPROVED = "SERVICE_APPROVED";
        public static final String SERVICE_REJECTED = "SERVICE_REJECTED";
    }
}
