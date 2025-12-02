package com.bookkaro.dto;

import com.bookkaro.validation.NoHtml;
import com.bookkaro.validation.NoSqlInjection;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateBookingRequest {
    
    @NotNull(message = "Service ID is required")
    private Long serviceId;
    
    @NotNull(message = "Address ID is required")
    private Long addressId;
    
    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    private LocalDate bookingDate;
    
    @NotBlank(message = "Booking time is required")
    @Pattern(
        regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
        message = "Booking time must be in HH:mm format (e.g., 09:00, 14:30)"
    )
    private String bookingTime;
    
    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    @NoHtml(message = "Notes contains invalid HTML/script tags")
    @NoSqlInjection(message = "Notes contains potentially dangerous characters")
    private String notes;
    
    // Optional coupon code for discount
    @Size(max = 50, message = "Coupon code cannot exceed 50 characters")
    private String couponCode;
}
