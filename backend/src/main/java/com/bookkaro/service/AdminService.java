package com.bookkaro.service;

import com.bookkaro.dto.AdminDashboardStats;
import com.bookkaro.model.Booking;
import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import com.bookkaro.model.Vendor;
import com.bookkaro.repository.BookingRepository;
import com.bookkaro.repository.ServiceRepository;
import com.bookkaro.repository.UserRepository;
import com.bookkaro.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ServiceRepository serviceRepository;
    private final BookingRepository bookingRepository;

    /**
     * Get admin dashboard statistics
     */
    public AdminDashboardStats getDashboardStats() {
        // Count totals - using efficient count queries instead of loading all data
        long totalUsers = userRepository.count();
        long totalVendors = vendorRepository.count();
        long totalServices = serviceRepository.count();
        long totalBookings = bookingRepository.count();
        
        // Count pending approvals - using database queries instead of loading all data
        long pendingVendors = vendorRepository.countByApprovalStatus(Vendor.ApprovalStatus.PENDING);
        long pendingServices = serviceRepository.countByApprovalStatus(Service.ApprovalStatus.PENDING);
        
        // Calculate revenue using database aggregation
        BigDecimal platformRevenue = bookingRepository.sumTotalAmountByStatus(Booking.BookingStatus.COMPLETED);
        if (platformRevenue == null) platformRevenue = BigDecimal.ZERO;
        
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        BigDecimal monthlyRevenue = bookingRepository.sumTotalAmountByStatusAndCreatedAtAfter(
            Booking.BookingStatus.COMPLETED, monthStart);
        if (monthlyRevenue == null) monthlyRevenue = BigDecimal.ZERO;
        
        // Simplified user growth - just show current counts instead of historical data
        // to avoid loading all users into memory
        List<AdminDashboardStats.UserStats> userGrowth = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate today = LocalDate.now();
        
        // Just show today's stats - full historical would require database optimization
        long currentUsers = userRepository.countByRole(User.UserRole.USER);
        long currentVendors = userRepository.countByRole(User.UserRole.VENDOR);
        
        userGrowth.add(AdminDashboardStats.UserStats.builder()
            .date(today.format(formatter))
            .userCount(currentUsers)
            .vendorCount(currentVendors)
            .build());
        
        // Top vendors - simplified to avoid N+1 queries
        // In production, this should use a native query with JOINs and GROUP BY
        List<AdminDashboardStats.VendorStats> topVendors = new ArrayList<>();
        
        // Top services - simplified to avoid loading all data
        // In production, this should use a native query with JOINs and GROUP BY
        List<AdminDashboardStats.ServiceStats> topServices = new ArrayList<>();
        
        // Revenue data (last 7 days)
        List<AdminDashboardStats.RevenueStats> revenueData = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            BigDecimal dayRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                .filter(b -> b.getCreatedAt().isAfter(startOfDay) && b.getCreatedAt().isBefore(endOfDay))
                .map(b -> b.getService().getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long dayBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt().isAfter(startOfDay) && b.getCreatedAt().isBefore(endOfDay))
                .count();
            
            revenueData.add(AdminDashboardStats.RevenueStats.builder()
                .date(date.format(formatter))
                .revenue(dayRevenue)
                .bookings(dayBookings)
                .build());
        }
        
        return AdminDashboardStats.builder()
            .totalUsers(totalUsers)
            .totalVendors(totalVendors)
            .totalServices(totalServices)
            .totalBookings(totalBookings)
            .pendingVendorApprovals(pendingVendors)
            .pendingServiceApprovals(pendingServices)
            .platformRevenue(platformRevenue)
            .monthlyRevenue(monthlyRevenue)
            .userGrowth(userGrowth)
            .topVendors(topVendors)
            .topServices(topServices)
            .revenueData(revenueData)
            .build();
    }

    /**
     * Get all users with pagination
     */
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    /**
     * Search users
     */
    public List<User> searchUsers(String query) {
        return userRepository.findAll().stream()
            .filter(u -> u.getFullName().toLowerCase().contains(query.toLowerCase()) ||
                        u.getEmail().toLowerCase().contains(query.toLowerCase()))
            .collect(Collectors.toList());
    }

    /**
     * Update user role
     */
    @Transactional
    public User updateUserRole(Long userId, User.UserRole newRole) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        User.UserRole oldRole = user.getRole();
        
        // Prevent invalid role transitions
        if (oldRole == User.UserRole.VENDOR && newRole != User.UserRole.VENDOR && user.getVendor() != null) {
            throw new RuntimeException("Cannot change role from VENDOR to " + newRole + ". User has an active vendor account. Delete vendor account first.");
        }
        
        if (oldRole != User.UserRole.VENDOR && newRole == User.UserRole.VENDOR) {
            throw new RuntimeException("Cannot directly change role to VENDOR. Use vendor registration process instead.");
        }
        
        user.setRole(newRole);
        return userRepository.save(user);
    }

    /**
     * Toggle user active status
     */
    @Transactional
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(!user.getIsActive());
        return userRepository.save(user);
    }

    /**
     * Delete user
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check for active bookings
        List<Booking> bookings = bookingRepository.findByUserId(user.getId(), org.springframework.data.domain.Pageable.unpaged()).getContent();
        List<Booking> activeBookings = bookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED || 
                        b.getStatus() == Booking.BookingStatus.PENDING)
            .collect(Collectors.toList());
        
        if (!activeBookings.isEmpty()) {
            throw new RuntimeException("Cannot delete user with " + activeBookings.size() + " active booking(s). Cancel or complete bookings first.");
        }
        
        // Check if user is a vendor with services
        if (user.getRole() == User.UserRole.VENDOR && user.getVendor() != null) {
            long serviceCount = serviceRepository.findByVendorId(user.getVendor().getId()).size();
            if (serviceCount > 0) {
                throw new RuntimeException("Cannot delete vendor user with " + serviceCount + " active service(s). Delete services first.");
            }
        }
        
        userRepository.delete(user);
    }

    /**
     * Get all vendors
     */
    public Page<Vendor> getAllVendors(Pageable pageable) {
        return vendorRepository.findAll(pageable);
    }

    /**
     * Get pending vendor approvals
     */
    public List<Vendor> getPendingVendors() {
        return vendorRepository.findAll().stream()
            .filter(v -> v.getApprovalStatus() == Vendor.ApprovalStatus.PENDING)
            .collect(Collectors.toList());
    }

    /**
     * Approve vendor (with optional admin note/reason)
     */
    @Transactional
    public Vendor approveVendor(Long vendorId, String reason) {
        Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setApprovalStatus(Vendor.ApprovalStatus.APPROVED);
        vendor.setIsVerified(true);
        vendor.setIsActive(true);
        vendor.setApprovalReason(reason); // Optional approval note
        return vendorRepository.save(vendor);
    }

    /**
     * Reject vendor
     */
    @Transactional
    public Vendor rejectVendor(Long vendorId, String reason) {
        Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setApprovalStatus(Vendor.ApprovalStatus.REJECTED);
        vendor.setApprovalReason(reason); // Rejection reason
        return vendorRepository.save(vendor);
    }

    /**
     * Suspend vendor
     */
    @Transactional
    public Vendor suspendVendor(Long vendorId, String reason) {
        Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setApprovalStatus(Vendor.ApprovalStatus.SUSPENDED);
        vendor.setApprovalReason(reason); // Suspension reason
        vendor.setIsActive(false);
        return vendorRepository.save(vendor);
    }

    /**
     * Get all services (with vendor eagerly loaded)
     */
    @Transactional(readOnly = true)
    public Page<Service> getAllServices(Pageable pageable) {
        // Fetch all services with vendor, then paginate in memory
        List<Service> allServices = serviceRepository.findAllWithVendor();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allServices.size());
        List<Service> pageContent = allServices.subList(start, end);
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, allServices.size());
    }

    /**
     * Get pending service approvals (with vendor eagerly loaded)
     */
    @Transactional(readOnly = true)
    public List<Service> getPendingServices() {
        return serviceRepository.findAllWithVendor().stream()
            .filter(s -> s.getApprovalStatus() == Service.ApprovalStatus.PENDING)
            .collect(Collectors.toList());
    }

    /**
     * Approve service (with optional admin note/reason)
     */
    @Transactional
    public Service approveService(Long serviceId, String reason) {
        Service service = serviceRepository.findByIdWithVendor(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setApprovalStatus(Service.ApprovalStatus.APPROVED);
        service.setIsAvailable(true);
        service.setApprovalReason(reason); // Optional approval note
        return serviceRepository.save(service);
    }

    /**
     * Reject service
     */
    @Transactional
    public Service rejectService(Long serviceId, String reason) {
        Service service = serviceRepository.findByIdWithVendor(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setApprovalStatus(Service.ApprovalStatus.REJECTED);
        service.setApprovalReason(reason); // Rejection reason
        service.setIsAvailable(false);
        return serviceRepository.save(service);
    }

    /**
     * Toggle service featured status
     */
    @Transactional
    public Service toggleServiceFeatured(Long serviceId) {
        Service service = serviceRepository.findByIdWithVendor(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setIsFeatured(!service.getIsFeatured());
        return serviceRepository.save(service);
    }

    /**
     * Delete service
     */
    @Transactional
    public void deleteService(Long serviceId) {
        Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        
        // Check for active bookings using service ID
        List<Booking> allBookings = bookingRepository.findByServiceIdIn(List.of(service.getId()));
        List<Booking> activeBookings = allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED || 
                        b.getStatus() == Booking.BookingStatus.PENDING)
            .collect(Collectors.toList());
        
        if (!activeBookings.isEmpty()) {
            throw new RuntimeException("Cannot delete service with " + activeBookings.size() + " active booking(s). Cancel bookings first.");
        }
        
        serviceRepository.delete(service);
    }

    // ==================== BOOKING MANAGEMENT ====================

    /**
     * Get all bookings with optional status filter (with relationships eagerly loaded)
     */
    @Transactional(readOnly = true)
    public Page<Booking> getAllBookings(String status, Pageable pageable) {
        List<Booking> allBookings = bookingRepository.findAllWithDetails();
        
        if (status != null && !status.isEmpty()) {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status);
            allBookings = allBookings.stream()
                .filter(b -> b.getStatus() == bookingStatus)
                .collect(Collectors.toList());
        }
        
        // Paginate in memory
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allBookings.size());
        List<Booking> pageContent = allBookings.subList(start, end);
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, allBookings.size());
    }

    /**
     * Cancel booking (admin override)
     */
    @Transactional
    public Booking cancelBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Check if booking can be cancelled
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed booking");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        if (reason != null && !reason.isEmpty()) {
            String currentNotes = booking.getNotes() != null ? booking.getNotes() : "";
            booking.setNotes(currentNotes + "\nCancellation Reason (Admin): " + reason);
        }
        return bookingRepository.save(booking);
    }

    /**
     * Update booking status (admin override)
     */
    @Transactional
    public Booking updateBookingStatus(Long bookingId, String newStatus) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Booking.BookingStatus status = Booking.BookingStatus.valueOf(newStatus);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
}
