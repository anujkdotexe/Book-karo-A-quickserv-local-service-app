package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.RefundRequestDto;
import com.bookkaro.dto.RefundResponseDto;
import com.bookkaro.model.Refund;
import com.bookkaro.service.RefundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Refund Controller - Handles refund requests, approvals, and rejections
 */
@RestController
@RequestMapping("/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    /**
     * Request a refund for a booking
     * POST /refunds/request
     */
    @PostMapping("/request")
    public ResponseEntity<ApiResponse<RefundResponseDto>> requestRefund(
            @Valid @RequestBody RefundRequestDto request,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        RefundResponseDto refund = refundService.requestRefund(userEmail, request);
        
        return ResponseEntity.ok(ApiResponse.success("Refund request submitted successfully", refund));
    }

    /**
     * Get all refunds for current user
     * GET /refunds/user
     */
    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<RefundResponseDto>>> getUserRefunds(
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        List<RefundResponseDto> refunds = refundService.getUserRefunds(userEmail);
        
        return ResponseEntity.ok(ApiResponse.success("User refunds retrieved", refunds));
    }

    /**
     * Get refund for a specific booking
     * GET /refunds/booking/{bookingId}
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<RefundResponseDto>> getRefundByBooking(
            @PathVariable Long bookingId) {
        
        RefundResponseDto refund = refundService.getRefundByBooking(bookingId);
        
        return ResponseEntity.ok(ApiResponse.success("Refund details retrieved", refund));
    }

    /**
     * Admin: Get all refunds with optional status filter
     * GET /refunds/admin?status=PENDING&page=0&size=20
     */
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<Page<RefundResponseDto>>> getAllRefunds(
            @RequestParam(required = false) Refund.RefundStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<RefundResponseDto> refunds = refundService.getAllRefunds(status, pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Refunds retrieved", refunds));
    }

    /**
     * Admin: Approve refund
     * PATCH /refunds/{id}/approve
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<RefundResponseDto>> approveRefund(
            @PathVariable Long id,
            Authentication authentication) {
        
        String adminEmail = authentication.getName();
        RefundResponseDto refund = refundService.approveRefund(id, adminEmail);
        
        return ResponseEntity.ok(ApiResponse.success("Refund approved and processed", refund));
    }

    /**
     * Admin: Reject refund
     * PATCH /refunds/{id}/reject
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<RefundResponseDto>> rejectRefund(
            @PathVariable Long id,
            @RequestParam String reason,
            Authentication authentication) {
        
        String adminEmail = authentication.getName();
        RefundResponseDto refund = refundService.rejectRefund(id, adminEmail, reason);
        
        return ResponseEntity.ok(ApiResponse.success("Refund rejected", refund));
    }
}
