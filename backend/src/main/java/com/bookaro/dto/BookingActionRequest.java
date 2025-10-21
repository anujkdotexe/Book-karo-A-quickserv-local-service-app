package com.bookaro.dto;

import lombok.Data;

@Data
public class BookingActionRequest {
    
    private String action; // ACCEPT, REJECT, COMPLETE
    private String reason; // For rejection
    private String notes; // Additional notes
}
