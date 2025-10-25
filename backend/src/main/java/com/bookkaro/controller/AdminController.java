package com.bookkaro.controller;

import com.bookkaro.dto.AdminDashboardStats;
import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.BookingDto;
import com.bookkaro.dto.PagedResponse;
import com.bookkaro.dto.ServiceDto;
import com.bookkaro.dto.UserDto;
import com.bookkaro.dto.VendorDto;
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
    public ResponseEntity<ApiResponse<PagedResponse<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = adminService.getAllUsers(pageable);
        Page<UserDto> userDtos = users.map(user -> {
            UserDto dto = new UserDto();
            dto.setId(user.getId());
            dto.setEmail(user.getEmail());
            dto.setFullName(user.getFirstName() + " " + user.getLastName());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setPhone(user.getPhone());
            dto.setAddress(user.getAddress());
            dto.setCity(user.getCity());
            dto.setState(user.getState());
            dto.setPostalCode(user.getPostalCode());
            dto.setLatitude(user.getLatitude());
            dto.setLongitude(user.getLongitude());
            dto.setRole(user.getRole() != null ? user.getRole().name() : null);
            dto.setIsActive(user.getIsActive());
            dto.setCreatedAt(user.getCreatedAt());
            dto.setUpdatedAt(user.getUpdatedAt());
            return dto;
        });
        PagedResponse<UserDto> pagedResponse = PagedResponse.from(userDtos);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", pagedResponse));
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
    public ResponseEntity<ApiResponse<PagedResponse<VendorDto>>> getAllVendors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Vendor> vendors = adminService.getAllVendors(pageable);
        Page<VendorDto> vendorDtos = vendors.map(VendorDto::fromEntity);
        PagedResponse<VendorDto> pagedResponse = PagedResponse.from(vendorDtos);
        return ResponseEntity.ok(ApiResponse.success("Vendors retrieved successfully", pagedResponse));
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
     * Approve vendor (with optional reason/note)
     * PUT /api/v1/admin/vendors/{id}/approve
     * Request body (optional): { "reason": "All documents verified and complete" }
     */
    @PutMapping("/vendors/{id}/approve")
    public ResponseEntity<ApiResponse<VendorDto>> approveVendor(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        String reason = request != null ? request.get("reason") : null;
        Vendor vendor = adminService.approveVendor(id, reason);
        VendorDto vendorDto = VendorDto.fromEntity(vendor);
        return ResponseEntity.ok(ApiResponse.success("Vendor approved successfully", vendorDto));
    }

    /**
     * Reject vendor
     * PUT /api/v1/admin/vendors/{id}/reject
     */
    @PutMapping("/vendors/{id}/reject")
    public ResponseEntity<ApiResponse<VendorDto>> rejectVendor(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        Vendor vendor = adminService.rejectVendor(id, reason);
        VendorDto vendorDto = VendorDto.fromEntity(vendor);
        return ResponseEntity.ok(ApiResponse.success("Vendor rejected successfully", vendorDto));
    }

    /**
     * Suspend vendor
     * PUT /api/v1/admin/vendors/{id}/suspend
     */
    @PutMapping("/vendors/{id}/suspend")
    public ResponseEntity<ApiResponse<VendorDto>> suspendVendor(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        Vendor vendor = adminService.suspendVendor(id, reason);
        VendorDto vendorDto = VendorDto.fromEntity(vendor);
        return ResponseEntity.ok(ApiResponse.success("Vendor suspended successfully", vendorDto));
    }

    // ==================== SERVICE MANAGEMENT ====================

    /**
     * Get all services
     * GET /api/v1/admin/services?page=0&size=20
     */
    @GetMapping("/services")
    public ResponseEntity<ApiResponse<PagedResponse<ServiceDto>>> getAllServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Service> services = adminService.getAllServices(pageable);
        Page<ServiceDto> serviceDtos = services.map(ServiceDto::fromEntity);
        PagedResponse<ServiceDto> pagedResponse = PagedResponse.from(serviceDtos);
        return ResponseEntity.ok(ApiResponse.success("Services retrieved successfully", pagedResponse));
    }

    /**
     * Get pending service approvals
     * GET /api/v1/admin/services/pending
     */
    @GetMapping("/services/pending")
    public ResponseEntity<ApiResponse<List<ServiceDto>>> getPendingServices() {
        List<Service> services = adminService.getPendingServices();
        List<ServiceDto> serviceDtos = services.stream()
                .map(ServiceDto::fromEntity)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Pending services retrieved successfully", serviceDtos));
    }

    /**
     * Approve service (with optional reason/note)
     * PUT /api/v1/admin/services/{id}/approve
     * Request body (optional): { "reason": "Quality service with proper documentation" }
     */
    @PutMapping("/services/{id}/approve")
    public ResponseEntity<ApiResponse<ServiceDto>> approveService(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        String reason = request != null ? request.get("reason") : null;
        Service service = adminService.approveService(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Service approved successfully", ServiceDto.fromEntity(service)));
    }

    /**
     * Reject service
     * PUT /api/v1/admin/services/{id}/reject
     */
    @PutMapping("/services/{id}/reject")
    public ResponseEntity<ApiResponse<ServiceDto>> rejectService(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        Service service = adminService.rejectService(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Service rejected successfully", ServiceDto.fromEntity(service)));
    }

    /**
     * Toggle service featured status
     * PUT /api/v1/admin/services/{id}/toggle-featured
     */
    @PutMapping("/services/{id}/toggle-featured")
    public ResponseEntity<ApiResponse<ServiceDto>> toggleServiceFeatured(@PathVariable Long id) {
        Service service = adminService.toggleServiceFeatured(id);
        return ResponseEntity.ok(ApiResponse.success("Service featured status updated successfully", ServiceDto.fromEntity(service)));
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
    public ResponseEntity<ApiResponse<PagedResponse<BookingDto>>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<com.bookkaro.model.Booking> bookings = adminService.getAllBookings(status, pageable);
        Page<BookingDto> bookingDtos = bookings.map(this::convertToDto);
        PagedResponse<BookingDto> pagedResponse = PagedResponse.from(bookingDtos);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", pagedResponse));
    }

    /**
     * Cancel booking (admin override)
     * POST /api/v1/admin/bookings/{id}/cancel
     */
    @PostMapping("/bookings/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingDto>> cancelBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        com.bookkaro.model.Booking booking = adminService.cancelBooking(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", convertToDto(booking)));
    }

    /**
     * Update booking status (admin override)
     * PATCH /api/v1/admin/bookings/{id}/status?status=CONFIRMED
     */
    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<BookingDto>> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam(required = true) String status) {
        com.bookkaro.model.Booking booking = adminService.updateBookingStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", convertToDto(booking)));
    }

    // Helper method to convert Booking entity to DTO
    private BookingDto convertToDto(com.bookkaro.model.Booking booking) {
        BookingDto dto = new BookingDto();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUser().getId());
        dto.setUserName(booking.getUser().getFullName());
        dto.setUserEmail(booking.getUser().getEmail());
        dto.setServiceId(booking.getService().getId());
        dto.setServiceName(booking.getService().getServiceName());
        dto.setVendorName(booking.getService().getVendor().getBusinessName());
        dto.setBookingDate(booking.getBookingDate());
        dto.setBookingTime(booking.getBookingTime());
        dto.setStatus(booking.getStatus().toString());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setNotes(booking.getNotes());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}
