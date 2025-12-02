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
import java.time.LocalDateTime;

/**
 * Service Entity - Represents services offered by vendors
 */
@Entity
@Table(name = "services", indexes = {
    @Index(name = "idx_services_vendor", columnList = "vendor_id"),
    @Index(name = "idx_services_category", columnList = "category_id"),
    @Index(name = "idx_services_city", columnList = "city"),
    @Index(name = "idx_services_price", columnList = "price"),
    @Index(name = "idx_services_approval_status", columnList = "approval_status"),
    @Index(name = "idx_services_available", columnList = "is_available")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "service_name", nullable = false, length = 200)
    private String serviceName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String categoryLegacy; // Legacy string category field for backward compatibility

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Transient  // Not stored in database, always returns "INR"
    @Builder.Default
    private String priceCurrency = "INR";

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "address", length = 255)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "approval_status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "approval_reason", columnDefinition = "TEXT")
    private String approvalReason; // Legacy field

    @Column(name = "average_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "available_from_time")
    private java.time.LocalTime availableFromTime;

    @Column(name = "available_to_time")
    private java.time.LocalTime availableToTime;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /**
     * Service Approval Status Enum
     */
    public enum ApprovalStatus {
        PENDING,    // Waiting for admin approval
        APPROVED,   // Approved by admin
        REJECTED    // Rejected by admin
    }
}

