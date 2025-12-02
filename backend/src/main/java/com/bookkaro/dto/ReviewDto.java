package com.bookkaro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for review information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDto {

    private Long id;
    private Long userId;
    private String userName;
    private Long bookingId;
    private Long serviceId;
    private String serviceName;
    private Long vendorId;
    private String vendorName;
    private Integer rating;
    private String comment;
    private Integer helpfulCount;
    private Boolean isVerified;
    private String vendorResponse;
    private LocalDateTime responseAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

