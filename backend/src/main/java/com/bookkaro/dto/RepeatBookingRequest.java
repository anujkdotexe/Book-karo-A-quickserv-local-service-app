package com.bookkaro.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * Request DTO for repeating/cloning a previous booking
 */
@Data
public class RepeatBookingRequest {
    
    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;
    
    @NotBlank(message = "Booking time is required")
    private String bookingTime;  // String format like "10:00 AM" or "14:30"
    
    private String notes;  // Optional - if null, will copy from original booking
}
