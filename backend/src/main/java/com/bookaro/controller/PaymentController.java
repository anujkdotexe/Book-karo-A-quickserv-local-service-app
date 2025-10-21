package com.bookaro.controller;

import com.bookaro.dto.ApiResponse;
import com.bookaro.dto.PaymentRequest;
import com.bookaro.dto.PaymentResponse;
import com.bookaro.model.User;
import com.bookaro.repository.UserRepository;
import com.bookaro.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

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
     * GET /payments
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
        
        try {
            PaymentResponse payment = paymentService.getPaymentByBookingId(bookingId);
            return ResponseEntity.ok(ApiResponse.success("Payment details retrieved successfully", payment));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get wallet balance
     * GET /payments/wallet/balance
     */
    @GetMapping("/wallet/balance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getWalletBalance(
            Authentication authentication) {
        
        User user = getUserFromAuth(authentication);
        Map<String, Object> wallet = paymentService.getWalletBalance(user);
        
        return ResponseEntity.ok(ApiResponse.success("Wallet balance retrieved successfully", wallet));
    }

    /**
     * Add money to wallet
     * POST /payments/wallet/add?amount=1000
     */
    @PostMapping("/wallet/add")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addMoneyToWallet(
            @RequestParam BigDecimal amount,
            Authentication authentication) {
        
        User user = getUserFromAuth(authentication);
        
        try {
            Map<String, Object> result = paymentService.addMoneyToWallet(user, amount);
            return ResponseEntity.ok(ApiResponse.success("Money added to wallet successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    private User getUserFromAuth(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
