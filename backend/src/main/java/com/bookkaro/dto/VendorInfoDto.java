package com.bookkaro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for vendor information in service listings
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorInfoDto {

    private Long id;
    private String vendorCode;
    private String businessName;
    private String primaryCategory;
    private String phone;
    private String email;
    private String location;
    private String availability;
    private Integer yearsOfExperience;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private Boolean isVerified;
}
