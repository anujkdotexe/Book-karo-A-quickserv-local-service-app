package com.bookkaro.dto;

import com.bookkaro.model.Service;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for service information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceDto {

    private Long id;
    private String serviceName;
    private String description;
    private String category;
    private BigDecimal price;
    private Integer durationMinutes;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private Double latitude;
    private Double longitude;
    private Boolean isAvailable;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private VendorInfoDto vendor;

    public static ServiceDto fromEntity(Service service) {
        ServiceDto dto = ServiceDto.builder()
                .id(service.getId())
                .serviceName(service.getServiceName())
                .description(service.getDescription())
                .category(service.getCategory())
                .price(service.getPrice())
                .durationMinutes(service.getDurationMinutes())
                .address(service.getAddress())
                .city(service.getCity())
                .state(service.getState())
                .postalCode(service.getPostalCode())
                .latitude(service.getLatitude())
                .longitude(service.getLongitude())
                .isAvailable(service.getIsAvailable())
                .averageRating(service.getAverageRating())
                .totalReviews(service.getTotalReviews())
                .build();

        if (service.getVendor() != null) {
            dto.setVendor(VendorInfoDto.builder()
                    .id(service.getVendor().getId())
                    .vendorCode(service.getVendor().getVendorCode())
                    .businessName(service.getVendor().getBusinessName())
                    .primaryCategory(service.getVendor().getPrimaryCategory())
                    .phone(service.getVendor().getPhone())
                    .email(service.getVendor().getEmail())
                    .location(service.getVendor().getLocation())
                    .availability(service.getVendor().getAvailability())
                    .yearsOfExperience(service.getVendor().getYearsOfExperience())
                    .averageRating(service.getVendor().getAverageRating())
                    .totalReviews(service.getVendor().getTotalReviews())
                    .isVerified(service.getVendor().getIsVerified())
                    .build());
        }

        return dto;
    }
}


