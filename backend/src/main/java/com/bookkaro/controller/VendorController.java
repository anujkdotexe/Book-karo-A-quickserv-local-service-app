package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.BookingDto;
import com.bookkaro.dto.CreateServiceRequest;
import com.bookkaro.dto.ServiceDto;
import com.bookkaro.dto.UpdateServiceRequest;
import com.bookkaro.dto.VendorDashboardStats;
import com.bookkaro.model.Service;
import com.bookkaro.security.CustomUserDetails;
import com.bookkaro.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Vendor Controller - Vendor-specific operations
 * Accessible only by users with VENDOR role
 */
@RestController
@RequestMapping("/vendor")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    /**
     * Get vendor dashboard statistics
     * GET /api/v1/vendor/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<VendorDashboardStats>> getDashboardStats(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        VendorDashboardStats stats = vendorService.getDashboardStats(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved successfully", stats));
    }

    /**
     * Get vendor dashboard statistics (alternative endpoint)
     * GET /api/v1/vendor/dashboard/stats
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<VendorDashboardStats>> getDashboardStatsAlternate(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        VendorDashboardStats stats = vendorService.getDashboardStats(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved successfully", stats));
    }

    /**
     * Get vendor bookings
     * GET /api/v1/vendor/bookings?status=PENDING&page=0&size=10
     */
    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBookings(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Map<String, Object> bookings = vendorService.getVendorBookingsPaginated(userDetails.getId(), status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));
    }

    /**
     * Update booking status (accept/reject/complete)
     * PUT /api/v1/vendor/bookings/{id}/status
     */
    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<BookingDto>> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String status = request.get("status");
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Status is required"));
        }
        BookingDto booking = vendorService.updateBookingStatus(userDetails.getId(), id, status);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", booking));
    }

    /**
     * Get vendor services
     * GET /api/v1/vendor/services
     */
    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ServiceDto>>> getServices(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<ServiceDto> services = vendorService.getVendorServices(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Services retrieved successfully", services));
    }

    /**
     * Create new service
     * POST /api/v1/vendor/services
     */
    @PostMapping("/services")
    public ResponseEntity<ApiResponse<Service>> createService(
            @Valid @RequestBody CreateServiceRequest request,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Service createdService = vendorService.createService(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Service created successfully (pending approval)", createdService));
    }

    /**
     * Update service
     * PUT /api/v1/vendor/services/{id}
     */
    @PutMapping("/services/{id}")
    public ResponseEntity<ApiResponse<Service>> updateService(
            @PathVariable Long id,
            @Valid @RequestBody UpdateServiceRequest request,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Service updatedService = vendorService.updateService(userDetails.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Service updated successfully", updatedService));
    }

    /**
     * Delete service
     * DELETE /api/v1/vendor/services/{id}
     */
    @DeleteMapping("/services/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(
            @PathVariable Long id,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        vendorService.deleteService(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Service deleted successfully", null));
    }

    /**
     * Toggle service availability
     * PUT /api/v1/vendor/services/{id}/toggle
     */
    @PutMapping("/services/{id}/toggle")
    public ResponseEntity<ApiResponse<Service>> toggleServiceAvailability(
            @PathVariable Long id,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Service service = vendorService.toggleServiceAvailability(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Service availability toggled successfully", service));
    }

    /**
     * Get vendor availabilities
     * GET /api/v1/vendor/availabilities
     * Returns actual availabilities from database instead of empty list
     */
    @GetMapping("/availabilities")
    public ResponseEntity<ApiResponse<List<Object>>> getAvailabilities(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<Object> availabilities = vendorService.getVendorAvailabilities(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Availabilities retrieved successfully", availabilities));
    }

    /**
     * Create vendor availability (placeholder - feature not yet implemented)
     * POST /api/v1/vendor/availabilities
     */
    @PostMapping("/availabilities")
    public ResponseEntity<ApiResponse<Object>> createAvailability(
            @RequestBody Map<String, Object> availabilityData,
            Authentication authentication) {
        // Placeholder implementation
        return ResponseEntity.ok(ApiResponse.success("Availability created successfully", availabilityData));
    }

    /**
     * Update vendor availability (placeholder - feature not yet implemented)
     * PUT /api/v1/vendor/availabilities/{id}
     */
    @PutMapping("/availabilities/{id}")
    public ResponseEntity<ApiResponse<Object>> updateAvailability(
            @PathVariable Long id,
            @RequestBody Map<String, Object> availabilityData,
            Authentication authentication) {
        // Placeholder implementation
        return ResponseEntity.ok(ApiResponse.success("Availability updated successfully", availabilityData));
    }

    /**
     * Delete vendor availability (placeholder - feature not yet implemented)
     * DELETE /api/v1/vendor/availabilities/{id}
     */
    @DeleteMapping("/availabilities/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAvailability(
            @PathVariable Long id,
            Authentication authentication) {
        // Placeholder implementation
        return ResponseEntity.ok(ApiResponse.success("Availability deleted successfully", null));
    }

    /**
     * Get all reviews for vendor's services
     * GET /api/v1/vendor/reviews
     */
    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getVendorReviews(
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<Map<String, Object>> reviews = vendorService.getVendorReviews(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully", reviews));
    }
}
