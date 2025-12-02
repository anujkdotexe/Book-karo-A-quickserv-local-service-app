package com.bookkaro.dto;

import com.bookkaro.model.Vendor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorDto {
    private Long id;
    private String vendorCode;
    private String businessName;
    private String primaryCategory;
    private String contactPerson;
    private String phone;
    private String email;
    private String location;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private Double latitude;
    private Double longitude;
    private Integer yearsOfExperience;
    private String availability;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private Boolean isActive;
    private Boolean isVerified;
    private String approvalStatus;
    private String approvalReason; // Admin feedback for approval/rejection/suspension
    private String description;
    private Long userId; // Reference to associated User
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Convert Vendor entity to VendorDto
     */
    public static VendorDto fromEntity(Vendor vendor) {
        if (vendor == null) {
            return null;
        }
        return VendorDto.builder()
                .id(vendor.getId())
                .vendorCode(vendor.getVendorCode())
                .businessName(vendor.getBusinessName())
                .primaryCategory(vendor.getPrimaryCategory())
                .contactPerson(vendor.getContactPerson())
                .phone(vendor.getPhone())
                .email(vendor.getEmail())
                .location(vendor.getCity()) // Using city as location
                .address(vendor.getAddress())
                .city(vendor.getCity())
                .state(vendor.getState())
                .postalCode(vendor.getPostalCode())
                .latitude(vendor.getLatitude() != null ? vendor.getLatitude().doubleValue() : null)
                .longitude(vendor.getLongitude() != null ? vendor.getLongitude().doubleValue() : null)
                .yearsOfExperience(vendor.getYearsOfExperience())
                .availability(vendor.getAvailability())
                .averageRating(vendor.getAverageRating())
                .totalReviews(vendor.getTotalReviews())
                .isActive(vendor.getIsActive())
                .isVerified(vendor.getIsVerified())
                .approvalStatus(vendor.getApprovalStatus() != null ? vendor.getApprovalStatus().name() : null)
                .approvalReason(vendor.getApprovalReason())
                .description(vendor.getDescription())
                .userId(vendor.getUser() != null ? vendor.getUser().getId() : null)
                .createdAt(vendor.getCreatedAt())
                .updatedAt(vendor.getUpdatedAt())
                .build();
    }
}
