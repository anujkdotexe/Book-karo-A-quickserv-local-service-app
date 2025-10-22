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
        // Count totals
        long totalUsers = userRepository.count();
        long totalVendors = vendorRepository.count();
        long totalServices = serviceRepository.count();
        long totalBookings = bookingRepository.count();
        
        // Count pending approvals
        long pendingVendors = vendorRepository.findAll().stream()
            .filter(v -> v.getApprovalStatus() == Vendor.ApprovalStatus.PENDING)
            .count();
        
        long pendingServices = serviceRepository.findAll().stream()
            .filter(s -> s.getApprovalStatus() == Service.ApprovalStatus.PENDING)
            .count();
        
        // Calculate revenue
        BigDecimal platformRevenue = bookingRepository.findAll().stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
            .map(b -> b.getService().getPrice())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        BigDecimal monthlyRevenue = bookingRepository.findAll().stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
            .filter(b -> b.getCreatedAt().isAfter(monthStart))
            .map(b -> b.getService().getPrice())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // User growth (last 7 days)
        List<AdminDashboardStats.UserStats> userGrowth = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            long userCount = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt().isBefore(endOfDay))
                .filter(u -> u.getRole() == User.UserRole.USER)
                .count();
            
            long vendorCount = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt().isBefore(endOfDay))
                .filter(u -> u.getRole() == User.UserRole.VENDOR)
                .count();
            
            userGrowth.add(AdminDashboardStats.UserStats.builder()
                .date(date.format(formatter))
                .userCount(userCount)
                .vendorCount(vendorCount)
                .build());
        }
        
        // Top vendors by revenue
        List<AdminDashboardStats.VendorStats> topVendors = vendorRepository.findAll().stream()
            .map(vendor -> {
                List<Service> vendorServices = serviceRepository.findByVendorId(vendor.getId());
                List<Long> serviceIds = vendorServices.stream().map(Service::getId).collect(Collectors.toList());
                
                List<Booking> bookings = serviceIds.isEmpty() ? new ArrayList<>() :
                    bookingRepository.findByServiceIdIn(serviceIds);
                
                long bookingCount = bookings.stream()
                    .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                    .count();
                
                BigDecimal revenue = bookings.stream()
                    .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                    .map(b -> b.getService().getPrice())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                return AdminDashboardStats.VendorStats.builder()
                    .vendorId(vendor.getId())
                    .businessName(vendor.getBusinessName())
                    .totalBookings(bookingCount)
                    .totalRevenue(revenue)
                    .averageRating(vendor.getAverageRating() != null ? 
                        vendor.getAverageRating().doubleValue() : 0.0)
                    .build();
            })
            .sorted((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()))
            .limit(5)
            .collect(Collectors.toList());
        
        // Top services
        List<AdminDashboardStats.ServiceStats> topServices = serviceRepository.findAll().stream()
            .map(service -> {
                long bookingCount = bookingRepository.findAll().stream()
                    .filter(b -> b.getService().getId().equals(service.getId()))
                    .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                    .count();
                
                BigDecimal revenue = bookingRepository.findAll().stream()
                    .filter(b -> b.getService().getId().equals(service.getId()))
                    .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                    .map(b -> b.getService().getPrice())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                return AdminDashboardStats.ServiceStats.builder()
                    .serviceId(service.getId())
                    .serviceName(service.getServiceName())
                    .vendorName(service.getVendor().getBusinessName())
                    .bookingCount(bookingCount)
                    .revenue(revenue)
                    .averageRating(service.getAverageRating() != null ? 
                        service.getAverageRating().doubleValue() : 0.0)
                    .build();
            })
            .sorted((a, b) -> Long.compare(b.getBookingCount(), a.getBookingCount()))
            .limit(5)
            .collect(Collectors.toList());
        
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
        userRepository.deleteById(userId);
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
     * Approve vendor
     */
    @Transactional
    public Vendor approveVendor(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setApprovalStatus(Vendor.ApprovalStatus.APPROVED);
        vendor.setIsVerified(true);
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
        vendor.setRejectionReason(reason);
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
        vendor.setRejectionReason(reason);
        vendor.setIsActive(false);
        return vendorRepository.save(vendor);
    }

    /**
     * Get all services
     */
    public Page<Service> getAllServices(Pageable pageable) {
        return serviceRepository.findAll(pageable);
    }

    /**
     * Get pending service approvals
     */
    public List<Service> getPendingServices() {
        return serviceRepository.findAll().stream()
            .filter(s -> s.getApprovalStatus() == Service.ApprovalStatus.PENDING)
            .collect(Collectors.toList());
    }

    /**
     * Approve service
     */
    @Transactional
    public Service approveService(Long serviceId) {
        Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setApprovalStatus(Service.ApprovalStatus.APPROVED);
        return serviceRepository.save(service);
    }

    /**
     * Reject service
     */
    @Transactional
    public Service rejectService(Long serviceId, String reason) {
        Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setApprovalStatus(Service.ApprovalStatus.REJECTED);
        service.setRejectionReason(reason);
        service.setIsAvailable(false);
        return serviceRepository.save(service);
    }

    /**
     * Toggle service featured status
     */
    @Transactional
    public Service toggleServiceFeatured(Long serviceId) {
        Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setIsFeatured(!service.getIsFeatured());
        return serviceRepository.save(service);
    }

    /**
     * Delete service
     */
    @Transactional
    public void deleteService(Long serviceId) {
        serviceRepository.deleteById(serviceId);
    }

    // ==================== BOOKING MANAGEMENT ====================

    /**
     * Get all bookings with optional status filter
     */
    public Page<Booking> getAllBookings(String status, Pageable pageable) {
        if (status != null && !status.isEmpty()) {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status);
            return bookingRepository.findByStatus(bookingStatus, pageable);
        }
        return bookingRepository.findAll(pageable);
    }

    /**
     * Cancel booking (admin override)
     */
    @Transactional
    public Booking cancelBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        if (reason != null && !reason.isEmpty()) {
            booking.setNotes(booking.getNotes() + "\nCancellation Reason (Admin): " + reason);
        }
        return bookingRepository.save(booking);
    }

    /**
     * Update booking status (admin override)
     */
    @Transactional
    public Booking updateBookingStatus(Long bookingId, String newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        Booking.BookingStatus status = Booking.BookingStatus.valueOf(newStatus);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
}
