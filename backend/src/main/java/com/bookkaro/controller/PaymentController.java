package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.PaymentRequest;
import com.bookkaro.dto.PaymentResponse;
import com.bookkaro.model.User;
import com.bookkaro.repository.UserRepository;
import com.bookkaro.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    /**
     * Process payment for a booking
     * POST /payments
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @Valid @RequestBody PaymentRequest request,
            Authentication authentication) {
        
        User user = getUserFromAuth(authentication);
        
        try {
            PaymentResponse response = paymentService.processPayment(request, user);
            
            if ("SUCCESS".equals(response.getStatus())) {
                return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", response));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(response.getMessage()));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get payment history for logged-in user
     * GET /payments or /payments/history
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getUserPayments(
            Authentication authentication) {
        
        User user = getUserFromAuth(authentication);
        List<PaymentResponse> payments = paymentService.getUserPayments(user);
        
        return ResponseEntity.ok(ApiResponse.success("Payment history retrieved successfully", payments));
    }

    /**
     * Get payment details for a specific booking
     * GET /payments/booking/{bookingId}
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        
        User user = getUserFromAuth(authentication);
        
        try {
            PaymentResponse payment = paymentService.getPaymentByBookingId(bookingId, user);
            return ResponseEntity.ok(ApiResponse.success("Payment details retrieved successfully", payment));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Alias endpoint for payment history (backward compatibility)
     * GET /payments/history
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentHistory(
            Authentication authentication) {
        return getUserPayments(authentication);
    }

    private User getUserFromAuth(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
