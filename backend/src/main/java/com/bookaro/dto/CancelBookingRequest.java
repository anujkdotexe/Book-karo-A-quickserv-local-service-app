package com.bookaro.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CancelBookingRequest {
    
    @NotBlank(message = "Cancellation reason is required")
    private String reason;
}
