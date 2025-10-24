package com.bookkaro.dto;

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
    
    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    private LocalDate bookingDate;
    
    @NotBlank(message = "Booking time is required")
    @Pattern(
        regexp = "^(09|10|11|12|13|14|15|16|17|18):(00|15|30|45)$",
        message = "Booking time must be between 09:00 and 18:00 in 15-minute intervals"
    )
    private String bookingTime;
    
    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;
}
