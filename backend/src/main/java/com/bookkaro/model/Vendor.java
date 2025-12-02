package com.bookkaro.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
import java.util.ArrayList;
import java.util.List;

/**
 * Vendor Entity - Represents service providers/businesses
 * Separate from User entity - one vendor can provide multiple services
 */
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "vendors", indexes = {
    @Index(name = "idx_vendors_user", columnList = "user_id"),
    @Index(name = "idx_vendors_category", columnList = "category_id"),
    @Index(name = "idx_vendors_city", columnList = "city"),
    @Index(name = "idx_vendors_approval_status", columnList = "approval_status"),
    @Index(name = "idx_vendors_active", columnList = "is_active")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vendor_code", unique = true, length = 50)
    private String vendorCode;

    @Column(name = "business_name", nullable = false, length = 255)
    private String businessName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "primary_category", length = 100)
    private String primaryCategory; // Legacy field, kept for compatibility

    @Column(name = "contact_person", length = 200)
    private String contactPerson;

    @Column(name = "phone", nullable = false, length = 32)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(length = 255)
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

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "availability", length = 255)
    private String availability; // Summary only, detailed in vendor_availabilities table

    @Column(name = "average_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "approval_status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "suspension_reason", columnDefinition = "TEXT")
    private String suspensionReason;

    @Column(name = "approval_reason", columnDefinition = "TEXT")
    private String approvalReason; // Legacy field for backward compatibility

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @JsonIgnore
    @OneToMany(mappedBy = "vendor", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @Builder.Default
    private List<Service> services = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VendorAvailability> availabilities = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    private LocalDateTime deletedAt;

    /**
     * Vendor Approval Status Enum
     */
    public enum ApprovalStatus {
        PENDING,    // Waiting for admin approval
        APPROVED,   // Approved by admin
        REJECTED,   // Rejected by admin
        SUSPENDED   // Suspended due to violations
    }

    // Helper method to add service
    public void addService(Service service) {
        services.add(service);
        service.setVendor(this);
    }

    // Helper method to remove service
    public void removeService(Service service) {
        services.remove(service);
        service.setVendor(null);
    }
}
