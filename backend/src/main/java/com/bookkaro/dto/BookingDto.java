package com.bookkaro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DTO for booking information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDto {

    private Long id;
    private String bookingReference;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long serviceId;
    private String serviceName;
    private Long vendorId;
    private String vendorName;
    private LocalDateTime scheduledAt;
    
    // Legacy fields for backward compatibility
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    
    private String status;
    private String paymentStatus;
    private BigDecimal totalAmount;
    private BigDecimal priceTotal;
    private String priceCurrency;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

