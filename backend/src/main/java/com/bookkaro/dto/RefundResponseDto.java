package com.bookkaro.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RefundResponseDto {
    private Long id;
    private Long bookingId;
    private Double amount;
    private String reason;
    private String status;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Booking details
    private String serviceName;
    private LocalDate bookingDate;
    private String customerName;
    private String customerEmail;
}
