package com.bookkaro.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for updating an existing service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateServiceRequest {

    @Size(max = 255, message = "Service name must not exceed 255 characters")
    private String serviceName;

    private String description;

    private Long categoryId;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    private Boolean isAvailable;

    private Integer estimatedDuration; // in minutes
}
