package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.BookingDto;
import com.bookkaro.dto.VendorDashboardStats;
import com.bookkaro.model.Service;
import com.bookkaro.security.CustomUserDetails;
import com.bookkaro.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
     * Get vendor bookings
     * GET /api/v1/vendor/bookings?status=PENDING
     */
    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getBookings(
            @RequestParam(required = false) String status,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<BookingDto> bookings = vendorService.getVendorBookings(userDetails.getId(), status);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));
    }

    /**
     * Update booking status (accept/reject/complete)
     * PUT /api/v1/vendor/bookings/{id}/status
     */
    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<BookingDto>> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        BookingDto booking = vendorService.updateBookingStatus(userDetails.getId(), id, status);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", booking));
    }

    /**
     * Get vendor services
     * GET /api/v1/vendor/services
     */
    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<Service>>> getServices(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<Service> services = vendorService.getVendorServices(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Services retrieved successfully", services));
    }

    /**
     * Create new service
     * POST /api/v1/vendor/services
     */
    @PostMapping("/services")
    public ResponseEntity<ApiResponse<Service>> createService(
            @RequestBody Service service,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Service createdService = vendorService.createService(userDetails.getId(), service);
        return ResponseEntity.ok(ApiResponse.success("Service created successfully (pending approval)", createdService));
    }

    /**
     * Update service
     * PUT /api/v1/vendor/services/{id}
     */
    @PutMapping("/services/{id}")
    public ResponseEntity<ApiResponse<Service>> updateService(
            @PathVariable Long id,
            @RequestBody Service service,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Service updatedService = vendorService.updateService(userDetails.getId(), id, service);
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
}
