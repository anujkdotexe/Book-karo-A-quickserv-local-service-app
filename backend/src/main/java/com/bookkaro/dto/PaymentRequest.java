package com.bookkaro.dto;

import com.bookkaro.model.Payment;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
    
    @NotNull(message = "Payment method is required")
    private Payment.PaymentMethod method;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    // For UPI
    @Pattern(regexp = "^[a-zA-Z0-9.\\-_]{2,}@[a-zA-Z]{2,}$", 
             message = "Invalid UPI ID format. Expected format: username@bank")
    private String upiId;
    
    // For Card payments
    @Pattern(regexp = "^[0-9]{13,19}$", 
             message = "Card number must be 13-19 digits")
    private String cardNumber;
    
    @Size(min = 2, max = 100, message = "Card holder name must be between 2 and 100 characters")
    private String cardHolderName;
    
    @Pattern(regexp = "^(0[1-9]|1[0-2])$", 
             message = "Expiry month must be between 01 and 12")
    private String expiryMonth;
    
    @Pattern(regexp = "^20[2-9][0-9]$", 
             message = "Expiry year must be a valid year (2020-2099)")
    private String expiryYear;
    
    @Pattern(regexp = "^[0-9]{3,4}$", 
             message = "CVV must be 3 or 4 digits")
    private String cvv;
    
    // For Net Banking
    @Size(min = 2, max = 50, message = "Bank code must be between 2 and 50 characters")
    private String bankCode;
}
