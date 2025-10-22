package com.bookkaro.controller;

import com.bookkaro.dto.AnalyticsDto;
import com.bookkaro.dto.ApiResponse;
import com.bookkaro.model.User;
import com.bookkaro.model.Vendor;
import com.bookkaro.repository.UserRepository;
import com.bookkaro.repository.VendorRepository;
import com.bookkaro.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Analytics Controller - REST endpoints for analytics data
 * Provides platform-wide and vendor-specific analytics
 */
@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    /**
     * Get admin analytics (platform-wide statistics)
     * Requires ADMIN role
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnalyticsDto>> getAdminAnalytics(
            @RequestParam(defaultValue = "30") int days) {
        
        if (days < 1 || days > 365) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Days parameter must be between 1 and 365"));
        }
        
        AnalyticsDto analytics = analyticsService.getAdminAnalytics(days);
        return ResponseEntity.ok(
                ApiResponse.success("Admin analytics retrieved successfully", analytics));
    }

    /**
     * Get vendor analytics (vendor-specific statistics)
     * Requires VENDOR role
     */
    @GetMapping("/vendor")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<AnalyticsDto>> getVendorAnalytics(
            Authentication authentication,
            @RequestParam(defaultValue = "30") int days) {
        
        if (days < 1 || days > 365) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Days parameter must be between 1 and 365"));
        }
        
        // Find vendor by authenticated user's email
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        Vendor vendor = vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Vendor not found for user: " + email));
        
        AnalyticsDto analytics = analyticsService.getVendorAnalytics(vendor.getId(), days);
        return ResponseEntity.ok(
                ApiResponse.success("Vendor analytics retrieved successfully", analytics));
    }

    /**
     * Get specific vendor analytics by vendor ID
     * Requires ADMIN role (for viewing any vendor's analytics)
     */
    @GetMapping("/vendor/{vendorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnalyticsDto>> getVendorAnalyticsById(
            @PathVariable Long vendorId,
            @RequestParam(defaultValue = "30") int days) {
        
        if (days < 1 || days > 365) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Days parameter must be between 1 and 365"));
        }
        
        // Verify vendor exists
        if (!vendorRepository.existsById(vendorId)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Vendor not found with ID: " + vendorId));
        }
        
        AnalyticsDto analytics = analyticsService.getVendorAnalytics(vendorId, days);
        return ResponseEntity.ok(
                ApiResponse.success("Vendor analytics retrieved successfully", analytics));
    }
}
