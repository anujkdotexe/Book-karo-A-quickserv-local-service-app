package com.bookkaro.controller;

import com.bookkaro.dto.AdminDashboardStats;
import com.bookkaro.dto.ApiResponse;
import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import com.bookkaro.model.Vendor;
import com.bookkaro.service.AdminService;
import com.bookkaro.service.CSVImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Admin Controller - Endpoints for admin operations
 * Accessible only by users with ADMIN role
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final CSVImportService csvImportService;

    /**
     * Get admin dashboard statistics
     * GET /api/v1/admin/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardStats>> getDashboardStats() {
        AdminDashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved successfully", stats));
    }

    // ==================== USER MANAGEMENT ====================

    /**
     * Get all users
     * GET /api/v1/admin/users?page=0&size=20
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    /**
     * Search users
     * GET /api/v1/admin/users/search?q=john
     */
    @GetMapping("/users/search")
    public ResponseEntity<ApiResponse<List<User>>> searchUsers(@RequestParam String q) {
        List<User> users = adminService.searchUsers(q);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", users));
    }

    /**
     * Update user role
     * PUT /api/v1/admin/users/{id}/role
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        User.UserRole newRole = User.UserRole.valueOf(request.get("role"));
        User user = adminService.updateUserRole(id, newRole);
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", user));
    }

    /**
     * Toggle user active status
     * PUT /api/v1/admin/users/{id}/toggle-status
     */
    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse<User>> toggleUserStatus(@PathVariable Long id) {
        User user = adminService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", user));
    }

    /**
     * Delete user
     * DELETE /api/v1/admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    // ==================== VENDOR MANAGEMENT ====================

    /**
     * Get all vendors
     * GET /api/v1/admin/vendors?page=0&size=20
     */
    @GetMapping("/vendors")
    public ResponseEntity<ApiResponse<Page<Vendor>>> getAllVendors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Vendor> vendors = adminService.getAllVendors(pageable);
        return ResponseEntity.ok(ApiResponse.success("Vendors retrieved successfully", vendors));
    }

    /**
     * Get pending vendor approvals
     * GET /api/v1/admin/vendors/pending
     */
    @GetMapping("/vendors/pending")
    public ResponseEntity<ApiResponse<List<Vendor>>> getPendingVendors() {
        List<Vendor> vendors = adminService.getPendingVendors();
        return ResponseEntity.ok(ApiResponse.success("Pending vendors retrieved successfully", vendors));
    }

    /**
     * Approve vendor
     * PUT /api/v1/admin/vendors/{id}/approve
     */
    @PutMapping("/vendors/{id}/approve")
    public ResponseEntity<ApiResponse<Vendor>> approveVendor(@PathVariable Long id) {
        Vendor vendor = adminService.approveVendor(id);
        return ResponseEntity.ok(ApiResponse.success("Vendor approved successfully", vendor));
    }

    /**
     * Reject vendor
     * PUT /api/v1/admin/vendors/{id}/reject
     */
    @PutMapping("/vendors/{id}/reject")
    public ResponseEntity<ApiResponse<Vendor>> rejectVendor(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        Vendor vendor = adminService.rejectVendor(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Vendor rejected successfully", vendor));
    }

    /**
     * Suspend vendor
     * PUT /api/v1/admin/vendors/{id}/suspend
     */
    @PutMapping("/vendors/{id}/suspend")
    public ResponseEntity<ApiResponse<Vendor>> suspendVendor(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        Vendor vendor = adminService.suspendVendor(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Vendor suspended successfully", vendor));
    }

    // ==================== SERVICE MANAGEMENT ====================

    /**
     * Get all services
     * GET /api/v1/admin/services?page=0&size=20
     */
    @GetMapping("/services")
    public ResponseEntity<ApiResponse<Page<Service>>> getAllServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Service> services = adminService.getAllServices(pageable);
        return ResponseEntity.ok(ApiResponse.success("Services retrieved successfully", services));
    }

    /**
     * Get pending service approvals
     * GET /api/v1/admin/services/pending
     */
    @GetMapping("/services/pending")
    public ResponseEntity<ApiResponse<List<Service>>> getPendingServices() {
        List<Service> services = adminService.getPendingServices();
        return ResponseEntity.ok(ApiResponse.success("Pending services retrieved successfully", services));
    }

    /**
     * Approve service
     * PUT /api/v1/admin/services/{id}/approve
     */
    @PutMapping("/services/{id}/approve")
    public ResponseEntity<ApiResponse<Service>> approveService(@PathVariable Long id) {
        Service service = adminService.approveService(id);
        return ResponseEntity.ok(ApiResponse.success("Service approved successfully", service));
    }

    /**
     * Reject service
     * PUT /api/v1/admin/services/{id}/reject
     */
    @PutMapping("/services/{id}/reject")
    public ResponseEntity<ApiResponse<Service>> rejectService(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        Service service = adminService.rejectService(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Service rejected successfully", service));
    }

    /**
     * Toggle service featured status
     * PUT /api/v1/admin/services/{id}/toggle-featured
     */
    @PutMapping("/services/{id}/toggle-featured")
    public ResponseEntity<ApiResponse<Service>> toggleServiceFeatured(@PathVariable Long id) {
        Service service = adminService.toggleServiceFeatured(id);
        return ResponseEntity.ok(ApiResponse.success("Service featured status updated successfully", service));
    }

    /**
     * Delete service
     * DELETE /api/v1/admin/services/{id}
     */
    @DeleteMapping("/services/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        adminService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.success("Service deleted successfully", null));
    }
    
    // ==================== CSV IMPORT ====================
    
    /**
     * Import users from CSV file
     * POST /api/v1/admin/import/users
     * File format: firstName,lastName,email,password,phone,address,city,state,postalCode,role
     */
    @PostMapping("/import/users")
    public ResponseEntity<ApiResponse<CSVImportService.ImportResult>> importUsers(
            @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please select a CSV file to upload"));
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.endsWith(".csv")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File must be in CSV format"));
        }
        
        CSVImportService.ImportResult result = csvImportService.importUsers(file);
        
        if (result.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.success(
                    "Users imported successfully: " + result.getSummary(), result));
        } else {
            return ResponseEntity.ok(ApiResponse.success(
                    "Import completed with errors: " + result.getSummary(), result));
        }
    }
    
    /**
     * Import vendors from CSV file
     * POST /api/v1/admin/import/vendors
     * File format: vendorCode,businessName,primaryCategory,phone,email,location,city,state,postalCode,availability,yearsOfExperience,description
     */
    @PostMapping("/import/vendors")
    public ResponseEntity<ApiResponse<CSVImportService.ImportResult>> importVendors(
            @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please select a CSV file to upload"));
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.endsWith(".csv")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File must be in CSV format"));
        }
        
        CSVImportService.ImportResult result = csvImportService.importVendors(file);
        
        if (result.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.success(
                    "Vendors imported successfully: " + result.getSummary(), result));
        } else {
            return ResponseEntity.ok(ApiResponse.success(
                    "Import completed with errors: " + result.getSummary(), result));
        }
    }
    
    /**
     * Import services from CSV file
     * POST /api/v1/admin/import/services
     * File format: serviceName,description,category,price,durationMinutes,address,city,state,postalCode,vendorCode
     */
    @PostMapping("/import/services")
    public ResponseEntity<ApiResponse<CSVImportService.ImportResult>> importServices(
            @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please select a CSV file to upload"));
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.endsWith(".csv")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File must be in CSV format"));
        }
        
        CSVImportService.ImportResult result = csvImportService.importServices(file);
        
        if (result.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.success(
                    "Services imported successfully: " + result.getSummary(), result));
        } else {
            return ResponseEntity.ok(ApiResponse.success(
                    "Import completed with errors: " + result.getSummary(), result));
        }
    }

    // ==================== BOOKING MANAGEMENT ====================

    /**
     * Get all bookings with optional status filter
     * GET /api/v1/admin/bookings?status=PENDING&page=0&size=20
     */
    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<Page<com.bookkaro.model.Booking>>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<com.bookkaro.model.Booking> bookings = adminService.getAllBookings(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));
    }

    /**
     * Cancel booking (admin override)
     * POST /api/v1/admin/bookings/{id}/cancel
     */
    @PostMapping("/bookings/{id}/cancel")
    public ResponseEntity<ApiResponse<com.bookkaro.model.Booking>> cancelBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        com.bookkaro.model.Booking booking = adminService.cancelBooking(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));
    }

    /**
     * Update booking status (admin override)
     * PATCH /api/v1/admin/bookings/{id}/status
     */
    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<com.bookkaro.model.Booking>> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        com.bookkaro.model.Booking booking = adminService.updateBookingStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", booking));
    }
}
