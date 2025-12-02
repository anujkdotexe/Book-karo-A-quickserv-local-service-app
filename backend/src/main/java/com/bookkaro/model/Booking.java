package com.bookkaro.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Booking Entity - Represents service bookings by customers
 */
@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_bookings_user", columnList = "user_id"),
    @Index(name = "idx_bookings_vendor", columnList = "vendor_id"),
    @Index(name = "idx_bookings_service", columnList = "service_id"),
    @Index(name = "idx_bookings_address", columnList = "address_id"),
    @Index(name = "idx_bookings_status", columnList = "status"),
    @Index(name = "idx_bookings_scheduled_at", columnList = "scheduled_at"),
    @Index(name = "idx_bookings_payment_status", columnList = "payment_status")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address address;

    // Payment relationship for refund calculation based on payment time
    @OneToOne(mappedBy = "booking", fetch = FetchType.LAZY)
    private Payment payment;

    @Column(name = "booking_reference", unique = true, length = 50)
    private String bookingReference;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "booking_date")
    private LocalDate bookingDate;

    @Column(name = "booking_time")
    private LocalTime bookingTime;

    @Column(name = "time_slot", length = 50)
    private String timeSlot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Column(name = "price_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceTotal;

    @Column(name = "price_service", precision = 10, scale = 2)
    private BigDecimal priceService;

    @Column(name = "price_tax", precision = 10, scale = 2)
    private BigDecimal priceTax;

    @Column(name = "price_discount", precision = 10, scale = 2)
    private BigDecimal priceDiscount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "service_name_at_booking", length = 255)
    private String serviceNameAtBooking;

    @Column(name = "service_price_at_booking", precision = 10, scale = 2)
    private BigDecimal servicePriceAtBooking;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_by")
    private Long cancelledBy;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private Long createdBy;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    private Long updatedBy;

    private LocalDateTime deletedAt;

    // Convenience methods for backward compatibility
    public String getNotes() {
        return this.specialRequests;
    }

    public void setNotes(String notes) {
        this.specialRequests = notes;
    }

    public String getPriceCurrency() {
        return "INR"; // Default currency
    }

    @PrePersist
    protected void onCreate() {
        if (bookingReference == null) {
            bookingReference = generateBookingReference();
        }
        if (serviceNameAtBooking == null && service != null) {
            serviceNameAtBooking = service.getServiceName();
        }
        if (servicePriceAtBooking == null && service != null) {
            servicePriceAtBooking = service.getPrice();
        }
        if (vendor == null && service != null) {
            vendor = service.getVendor();
        }
    }

    private String generateBookingReference() {
        return "BK-" + System.currentTimeMillis();
    }

    /**
     * Booking Status Enum
     */
    public enum BookingStatus {
        PENDING,      // Awaiting vendor confirmation
        CONFIRMED,    // Vendor confirmed
        IN_PROGRESS,  // Service in progress
        COMPLETED,    // Service completed
        CANCELLED,    // Booking cancelled
        NO_SHOW       // Customer did not show up
    }

    /**
     * Payment Status Enum
     */
    public enum PaymentStatus {
        UNPAID,    // Not paid yet
        PAID,      // Fully paid
        PARTIAL,   // Partially paid
        REFUNDED,  // Refunded
        FAILED,    // Payment failed
        N_A        // Not applicable
    }
}

