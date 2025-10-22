package com.bookkaro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    
    private Long paymentId;
    private Long bookingId;
    private String transactionId;
    private BigDecimal amount;
    private String method;
    private String status;
    private String message;
    private LocalDateTime paymentDate;
    private String gatewayResponse;
}
