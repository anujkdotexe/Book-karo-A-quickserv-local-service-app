package com.bookkaro.service;

import com.bookkaro.model.Payment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

/**
 * Mock Payment Gateway for testing
 * Simulates payment processing for different payment methods
 * In production, replace with real payment gateway integration (Razorpay, Stripe, PayPal, etc.)
 */
@Service
@Slf4j
public class MockPaymentGateway {

    private final Random random = new Random();

    /**
     * Process payment through mock gateway
     * @return Map with transaction details (success/failure, transactionId, message)
     */
    public Map<String, Object> processPayment(Payment.PaymentMethod method, Map<String, String> paymentDetails) {
        log.info("Processing {} payment...", method);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Simulate processing delay
            Thread.sleep(1000 + random.nextInt(2000)); // 1-3 seconds
            
            // 90% success rate for simulation
            boolean success = random.nextInt(10) < 9;
            
            if (success) {
                String transactionId = generateTransactionId(method);
                response.put("success", true);
                response.put("transactionId", transactionId);
                response.put("status", "SUCCESS");
                response.put("message", "Payment processed successfully");
                response.put("gatewayResponse", buildSuccessResponse(method, transactionId));
                
                log.info("Payment successful. Transaction ID: {}", transactionId);
            } else {
                response.put("success", false);
                response.put("status", "FAILED");
                response.put("message", getRandomFailureReason(method));
                response.put("gatewayResponse", "Payment declined by gateway");
                
                log.warn("Payment failed: {}", response.get("message"));
            }
            
        } catch (Exception e) {
            log.error("Payment processing error: {}", e.getMessage());
            response.put("success", false);
            response.put("status", "FAILED");
            response.put("message", "Technical error occurred during payment processing");
            response.put("gatewayResponse", e.getMessage());
        }
        
        return response;
    }

    /**
     * Verify payment status (for webhook simulation)
     */
    public Map<String, Object> verifyPayment(String transactionId) {
        Map<String, Object> response = new HashMap<>();
        response.put("transactionId", transactionId);
        response.put("status", "SUCCESS");
        response.put("verified", true);
        return response;
    }

    private String generateTransactionId(Payment.PaymentMethod method) {
        String prefix = switch (method) {
            case UPI -> "UPI";
            case CREDIT_CARD -> "CC";
            case DEBIT_CARD -> "DC";
            case NET_BANKING -> "NB";
            case CASH_ON_DELIVERY -> "COD";
        };
        
        return prefix + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String buildSuccessResponse(Payment.PaymentMethod method, String transactionId) {
        return String.format(
            "{\"gateway\":\"MockPaymentGateway\",\"method\":\"%s\",\"transactionId\":\"%s\",\"status\":\"SUCCESS\",\"timestamp\":\"%s\"}",
            method, transactionId, java.time.LocalDateTime.now()
        );
    }

    private String getRandomFailureReason(Payment.PaymentMethod method) {
        String[] reasons = switch (method) {
            case UPI -> new String[]{
                "Invalid UPI ID",
                "Transaction declined by UPI app",
                "Insufficient balance in UPI account",
                "UPI service temporarily unavailable"
            };
            case CREDIT_CARD, DEBIT_CARD -> new String[]{
                "Card declined by issuing bank",
                "Insufficient funds",
                "Invalid CVV",
                "Card has expired",
                "3D Secure authentication failed"
            };
            case NET_BANKING -> new String[]{
                "Bank server timeout",
                "Invalid bank credentials",
                "Insufficient funds",
                "Bank service unavailable"
            };
            case CASH_ON_DELIVERY -> new String[]{
                "COD not available for this location"
            };
        };
        
        return reasons[random.nextInt(reasons.length)];
    }
}
