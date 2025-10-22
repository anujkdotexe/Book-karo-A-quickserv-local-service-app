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
import java.util.ArrayList;
import java.util.List;

/**
 * Vendor Entity - Represents service providers/businesses
 * Separate from User entity - one vendor can provide multiple services
 */
@Entity
@Table(name = "vendors", indexes = {
    @Index(name = "idx_vendor_name", columnList = "business_name"),
    @Index(name = "idx_vendor_location", columnList = "location"),
    @Index(name = "idx_vendor_category", columnList = "primary_category"),
    @Index(name = "idx_vendor_active", columnList = "is_active")
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

    @Column(name = "vendor_code", unique = true, length = 20)
    private String vendorCode; // e.g., M001, M002

    @Column(name = "business_name", nullable = false, length = 200)
    private String businessName;

    @Column(name = "primary_category", nullable = false, length = 100)
    private String primaryCategory; // e.g., Car Services, Home Services

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "location", nullable = false, length = 100)
    private String location; // e.g., Bandra East, Andheri West

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(name = "postal_code", length = 10)
    private String postalCode;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "availability", length = 100)
    private String availability; // e.g., "24/7", "Mon-Sat 9AM-6PM"

    @Column(name = "average_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "approval_status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Link to User (for VENDOR role users)
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Service> services = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
