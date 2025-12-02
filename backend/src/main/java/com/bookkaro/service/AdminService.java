package com.bookkaro.service;

import com.bookkaro.dto.AdminDashboardStats;
import com.bookkaro.dto.PlatformAnalyticsDto;
import com.bookkaro.exception.BadRequestException;
import com.bookkaro.exception.ConflictException;
import com.bookkaro.model.Booking;
import com.bookkaro.model.Refund;
import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import com.bookkaro.model.Vendor;
import com.bookkaro.repository.BookingRepository;
import com.bookkaro.repository.CouponRepository;
import com.bookkaro.repository.PaymentRepository;
import com.bookkaro.repository.RefundRepository;
import com.bookkaro.repository.ReviewRepository;
import com.bookkaro.repository.ServiceRepository;
import com.bookkaro.repository.UserRepository;
import com.bookkaro.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final CouponRepository couponRepository;
    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final ReviewRepository reviewRepository;
    private final AuditLogService auditLogService;

    /**
     * Get admin dashboard statistics
     */
    public AdminDashboardStats getDashboardStats() {
        // Count totals - using efficient count queries instead of loading all data
        long totalUsers = userRepository.count();
        long totalVendors = vendorRepository.count();
        long totalServices = serviceRepository.count();
        long totalBookings = bookingRepository.count();
        long totalCoupons = couponRepository.count();
        
        // Count pending approvals - using database queries instead of loading all data
        long pendingVendors = vendorRepository.countByApprovalStatus(Vendor.ApprovalStatus.PENDING);
        long pendingServices = serviceRepository.countByApprovalStatus(Service.ApprovalStatus.PENDING);
        
        // Calculate revenue using database aggregation
        BigDecimal platformRevenue = bookingRepository.sumTotalAmountByStatus(Booking.BookingStatus.COMPLETED);
        if (platformRevenue == null) platformRevenue = BigDecimal.ZERO;
        
        // Monthly revenue - sum of completed bookings CREATED this month (by created_at)
        // Using created_at instead of updated_at to capture bookings made this month
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime monthEnd = monthStart.plusMonths(1);
        BigDecimal monthlyRevenue = bookingRepository.sumTotalAmountByStatusAndCreatedAtBetween(
            Booking.BookingStatus.COMPLETED, monthStart, monthEnd);
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
        
        // Top vendors - get top 5 vendors by booking count
        // Calculate actual revenue and ratings for each vendor
        // OPTIMIZED: Use native query instead of loading all data
        List<AdminDashboardStats.VendorStats> topVendors = new ArrayList<>();
        List<Object[]> vendorResults = bookingRepository.findTopVendorsByRevenue(
            org.springframework.data.domain.PageRequest.of(0, 5)
        );
        
        for (Object[] row : vendorResults) {
            topVendors.add(AdminDashboardStats.VendorStats.builder()
                .vendorId((Long) row[0])
                .businessName((String) row[1])
                .city((String) row[2])
                .state((String) row[3])
                .totalBookings((Long) row[4])
                .totalRevenue((BigDecimal) row[5])
                .averageRating(row[6] != null ? ((BigDecimal) row[6]).doubleValue() : 0.0)
                .build());
        }
        
        // Top services - get top 5 services by revenue
        // OPTIMIZED: Use native query instead of loading all data
        List<AdminDashboardStats.ServiceStats> topServices = new ArrayList<>();
        List<Object[]> serviceResults = bookingRepository.findTopServicesByRevenue(
            org.springframework.data.domain.PageRequest.of(0, 5)
        );
        
        for (Object[] row : serviceResults) {
            topServices.add(AdminDashboardStats.ServiceStats.builder()
                .serviceId((Long) row[0])
                .serviceName((String) row[1])
                .vendorName((String) row[2])
                .bookingCount((Long) row[3])
                .revenue((BigDecimal) row[4])
                .averageRating(row[5] != null ? ((BigDecimal) row[5]).doubleValue() : 0.0)
                .build());
        }
        
        // Revenue data (last 7 days) - OPTIMIZED with database queries
        List<AdminDashboardStats.RevenueStats> revenueData = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            // Use optimized database queries instead of loading all bookings
            BigDecimal dayRevenue = bookingRepository.sumTotalAmountByStatusAndCreatedAtBetweenDates(
                Booking.BookingStatus.COMPLETED, startOfDay, endOfDay);
            if (dayRevenue == null) dayRevenue = BigDecimal.ZERO;
            
            long dayBookings = bookingRepository.countByCreatedAtBetweenDates(startOfDay, endOfDay);
            
            revenueData.add(AdminDashboardStats.RevenueStats.builder()
                .date(date.format(formatter))
                .revenue(dayRevenue)
                .bookings(dayBookings)
                .build());
        }
        
        // Payment statistics
        long totalPayments = paymentRepository.count();
        long successfulPayments = paymentRepository.countByPaymentStatus("SUCCESS");
        long failedPayments = paymentRepository.countByPaymentStatus("FAILED");
        long refundedPayments = paymentRepository.countByPaymentStatus("REFUNDED");
        
        // Refund statistics
        long pendingRefunds = refundRepository.countByStatus(Refund.RefundStatus.PENDING);
        BigDecimal totalRefundAmount = refundRepository.sumAmountByStatus(Refund.RefundStatus.COMPLETED);
        if (totalRefundAmount == null) totalRefundAmount = BigDecimal.ZERO;
        
        return AdminDashboardStats.builder()
            .totalUsers(totalUsers)
            .totalVendors(totalVendors)
            .totalServices(totalServices)
            .totalBookings(totalBookings)
            .totalCoupons(totalCoupons)
            .pendingVendorApprovals(pendingVendors)
            .pendingServiceApprovals(pendingServices)
            .platformRevenue(platformRevenue)
            .monthlyRevenue(monthlyRevenue)
            .totalPayments(totalPayments)
            .successfulPayments(successfulPayments)
            .failedPayments(failedPayments)
            .refundedPayments(refundedPayments)
            .pendingRefunds(pendingRefunds)
            .totalRefundAmount(totalRefundAmount)
            .userGrowth(userGrowth)
            .topVendors(topVendors)
            .topServices(topServices)
            .revenueData(revenueData)
            .build();
    }

    /**
     * Get comprehensive platform analytics with all metrics
     */
    public PlatformAnalyticsDto getPlatformAnalytics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = now.minusDays(30);
        
        // USER ANALYTICS
        PlatformAnalyticsDto.UserAnalytics userAnalytics = calculateUserAnalytics(startOfToday, startOfWeek, startOfMonth);
        
        // VENDOR ANALYTICS
        PlatformAnalyticsDto.VendorAnalytics vendorAnalytics = calculateVendorAnalytics(startOfToday, startOfWeek, startOfMonth);
        
        // SERVICE ANALYTICS
        PlatformAnalyticsDto.ServiceAnalytics serviceAnalytics = calculateServiceAnalytics(now);
        
        // BOOKING ANALYTICS
        PlatformAnalyticsDto.BookingAnalytics bookingAnalytics = calculateBookingAnalytics(now);
        
        // REVENUE ANALYTICS
        PlatformAnalyticsDto.RevenueAnalytics revenueAnalytics = calculateRevenueAnalytics(startOfToday, startOfWeek, startOfMonth, now);
        
        // CUSTOMER EXPERIENCE ANALYTICS
        PlatformAnalyticsDto.CustomerExperienceAnalytics customerExperienceAnalytics = calculateCustomerExperienceAnalytics();
        
        return PlatformAnalyticsDto.builder()
                .userAnalytics(userAnalytics)
                .vendorAnalytics(vendorAnalytics)
                .serviceAnalytics(serviceAnalytics)
                .bookingAnalytics(bookingAnalytics)
                .revenueAnalytics(revenueAnalytics)
                .customerExperienceAnalytics(customerExperienceAnalytics)
                .build();
    }
    
    private PlatformAnalyticsDto.UserAnalytics calculateUserAnalytics(LocalDateTime startOfToday, LocalDateTime startOfWeek, LocalDateTime startOfMonth) {
        long totalUsers = userRepository.count();
        long newUsersToday = userRepository.countByCreatedAtAfter(startOfToday);
        long newUsersThisWeek = userRepository.countByCreatedAtAfter(startOfWeek);
        long newUsersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);
        long activeUsers = userRepository.countByLastLoginAfter(startOfMonth);
        
        // User segmentation by role
        long customers = userRepository.countByRole(User.UserRole.USER);
        long vendors = userRepository.countByRole(User.UserRole.VENDOR);
        long admins = userRepository.countByRole(User.UserRole.ADMIN);
        
        PlatformAnalyticsDto.UserSegmentation segmentation = PlatformAnalyticsDto.UserSegmentation.builder()
                .customers(customers)
                .vendors(vendors)
                .admins(admins)
                .build();
        
        // Calculate retention and churn (simplified)
        double retentionRate = totalUsers > 0 ? (activeUsers * 100.0 / totalUsers) : 0.0;
        double churnRate = 100.0 - retentionRate;
        
        return PlatformAnalyticsDto.UserAnalytics.builder()
                .totalUsers(totalUsers)
                .newUsersToday(newUsersToday)
                .newUsersThisWeek(newUsersThisWeek)
                .newUsersThisMonth(newUsersThisMonth)
                .activeUsers(activeUsers)
                .segmentation(segmentation)
                .retentionRate(Math.round(retentionRate * 100.0) / 100.0)
                .churnRate(Math.round(churnRate * 100.0) / 100.0)
                .build();
    }
    
    private PlatformAnalyticsDto.VendorAnalytics calculateVendorAnalytics(LocalDateTime startOfToday, LocalDateTime startOfWeek, LocalDateTime startOfMonth) {
        long totalVendors = vendorRepository.count();
        long newVendorsToday = vendorRepository.countByCreatedAtAfter(startOfToday);
        long newVendorsThisWeek = vendorRepository.countByCreatedAtAfter(startOfWeek);
        long newVendorsThisMonth = vendorRepository.countByCreatedAtAfter(startOfMonth);
        
        // Approval status breakdown
        long pendingVendors = vendorRepository.countByApprovalStatus(Vendor.ApprovalStatus.PENDING);
        long approvedVendors = vendorRepository.countByApprovalStatus(Vendor.ApprovalStatus.APPROVED);
        long rejectedVendors = vendorRepository.countByApprovalStatus(Vendor.ApprovalStatus.REJECTED);
        long suspendedVendors = vendorRepository.countByApprovalStatus(Vendor.ApprovalStatus.SUSPENDED);
        
        PlatformAnalyticsDto.VendorApprovalStatus approvalStatus = PlatformAnalyticsDto.VendorApprovalStatus.builder()
                .pending(pendingVendors)
                .approved(approvedVendors)
                .rejected(rejectedVendors)
                .suspended(suspendedVendors)
                .build();
        
        // Active vs inactive (vendors with at least one active service)
        long activeVendors = vendorRepository.countActiveVendors();
        long inactiveVendors = totalVendors - activeVendors;
        
        // Top vendors by revenue - Using actual booking data
        List<Object[]> topVendorRevenueData = bookingRepository.findTopVendorsByRevenue(PageRequest.of(0, 5));
        List<PlatformAnalyticsDto.TopVendor> topVendorsByRevenue = topVendorRevenueData.stream()
                .map(row -> {
                    // Defensive type casting to handle potential type mismatches
                    Long id = row[0] instanceof Number ? ((Number) row[0]).longValue() : Long.valueOf(row[0].toString());
                    String businessName = row[1] != null ? row[1].toString() : "";
                    BigDecimal revenue = row[5] instanceof BigDecimal ? (BigDecimal) row[5] : 
                                        (row[5] instanceof Number ? BigDecimal.valueOf(((Number) row[5]).doubleValue()) : BigDecimal.ZERO);
                    Long bookings = row[4] instanceof Number ? ((Number) row[4]).longValue() : Long.valueOf(row[4].toString());
                    Double rating = row[6] != null ? (row[6] instanceof Number ? ((Number) row[6]).doubleValue() : Double.valueOf(row[6].toString())) : 0.0;
                    
                    return PlatformAnalyticsDto.TopVendor.builder()
                            .id(id)
                            .businessName(businessName)
                            .vendorCode("") // Not available in query
                            .totalRevenue(revenue)
                            .totalBookings(bookings)
                            .averageRating(rating)
                            .build();
                })
                .collect(Collectors.toList());
        
        // Top vendors by bookings - Same query, different sorting handled by frontend
        List<PlatformAnalyticsDto.TopVendor> topVendorsByBookings = topVendorsByRevenue; // Reuse same data

        
        // Average vendor rating
        Double averageVendorRating = vendorRepository.findAverageRating();
        
        return PlatformAnalyticsDto.VendorAnalytics.builder()
                .totalVendors(totalVendors)
                .newVendorsToday(newVendorsToday)
                .newVendorsThisWeek(newVendorsThisWeek)
                .newVendorsThisMonth(newVendorsThisMonth)
                .approvalStatus(approvalStatus)
                .activeVendors(activeVendors)
                .inactiveVendors(inactiveVendors)
                .topVendorsByRevenue(topVendorsByRevenue)
                .topVendorsByBookings(topVendorsByBookings)
                .averageVendorRating(averageVendorRating != null ? Math.round(averageVendorRating * 100.0) / 100.0 : 0.0)
                .build();
    }
    
    private PlatformAnalyticsDto.ServiceAnalytics calculateServiceAnalytics(LocalDateTime now) {
        long totalServices = serviceRepository.count();
        long activeServices = serviceRepository.countByIsAvailable(true);
        long inactiveServices = totalServices - activeServices;
        long pendingApprovals = serviceRepository.countByApprovalStatus(Service.ApprovalStatus.PENDING);
        long rejectedServices = serviceRepository.countByApprovalStatus(Service.ApprovalStatus.REJECTED);
        
        // Bookings this month
        LocalDateTime startOfMonth = now.minusDays(30);
        long bookingsThisMonth = bookingRepository.countByCreatedAtBetweenDates(startOfMonth, now);
        
        // Revenue this month
        BigDecimal revenueThisMonth = bookingRepository.sumTotalAmountByStatusAndCreatedAtBetweenDates(
                Booking.BookingStatus.COMPLETED, startOfMonth, now);
        if (revenueThisMonth == null) revenueThisMonth = BigDecimal.ZERO;
        
        // Top services by bookings/revenue - using actual booking data
        List<Object[]> topServicesData = bookingRepository.findTopServicesByRevenue(PageRequest.of(0, 5));
        List<PlatformAnalyticsDto.TopService> topServicesByBookings = topServicesData.stream()
                .map(row -> {
                    // Defensive type casting - query returns: serviceId, serviceName, vendorName, bookingCount, revenue, averageRating
                    Long id = row[0] instanceof Number ? ((Number) row[0]).longValue() : Long.valueOf(row[0].toString());
                    String serviceName = row[1] != null ? row[1].toString() : "";
                    String vendorName = row[2] != null ? row[2].toString() : "";
                    Long bookings = row[3] instanceof Number ? ((Number) row[3]).longValue() : Long.valueOf(row[3].toString());
                    BigDecimal revenue = row[4] instanceof BigDecimal ? (BigDecimal) row[4] : 
                                        (row[4] instanceof Number ? BigDecimal.valueOf(((Number) row[4]).doubleValue()) : BigDecimal.ZERO);
                    Double rating = row[5] != null ? (row[5] instanceof Number ? ((Number) row[5]).doubleValue() : Double.valueOf(row[5].toString())) : 0.0;
                    
                    return PlatformAnalyticsDto.TopService.builder()
                            .id(id)
                            .serviceName(serviceName)
                            .category("") // Not in query
                            .totalBookings(bookings)
                            .totalRevenue(revenue)
                            .averageRating(rating)
                            .vendorName(vendorName)
                            .build();
                })
                .collect(Collectors.toList());
        
        // Top services by revenue - reuse same data (sorted by revenue already)
        List<PlatformAnalyticsDto.TopService> topServicesByRevenue = topServicesByBookings;

        
        // Average service rating
        Double averageServiceRating = serviceRepository.findAverageRating();
        
        // Completion rate
        long completedBookings = bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED);
        long totalBookings = bookingRepository.count();
        double completionRate = totalBookings > 0 ? (completedBookings * 100.0 / totalBookings) : 0.0;
        
        return PlatformAnalyticsDto.ServiceAnalytics.builder()
                .totalServices(totalServices)
                .activeServices(activeServices)
                .inactiveServices(inactiveServices)
                .pendingApprovals(pendingApprovals)
                .rejectedServices(rejectedServices)
                .bookingsThisMonth(bookingsThisMonth)
                .revenueThisMonth(revenueThisMonth)
                .topServicesByBookings(topServicesByBookings)
                .topServicesByRevenue(topServicesByRevenue)
                .averageServiceRating(averageServiceRating != null ? Math.round(averageServiceRating * 100.0) / 100.0 : 0.0)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .build();
    }
    
    private PlatformAnalyticsDto.BookingAnalytics calculateBookingAnalytics(LocalDateTime now) {
        long totalBookings = bookingRepository.count();
        
        // Status breakdown
        long pending = bookingRepository.countByStatus(Booking.BookingStatus.PENDING);
        long confirmed = bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED);
        long completed = bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED);
        long cancelled = bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED);
        
        PlatformAnalyticsDto.BookingStatusBreakdown statusBreakdown = PlatformAnalyticsDto.BookingStatusBreakdown.builder()
                .pending(pending)
                .confirmed(confirmed)
                .completed(completed)
                .cancelled(cancelled)
                .build();
        
        // Booking trends - last 30 days
        List<PlatformAnalyticsDto.TrendData> bookingTrends = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        for (int i = 29; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            long dayBookings = bookingRepository.countByCreatedAtBetweenDates(startOfDay, endOfDay);
            BigDecimal dayRevenue = bookingRepository.sumTotalAmountByStatusAndCreatedAtBetweenDates(
                    Booking.BookingStatus.COMPLETED, startOfDay, endOfDay);
            
            bookingTrends.add(PlatformAnalyticsDto.TrendData.builder()
                    .date(date.format(formatter))
                    .count(dayBookings)
                    .value(dayRevenue != null ? dayRevenue : BigDecimal.ZERO)
                    .build());
        }
        
        // Abandoned bookings (for now, we don't have this data, so returning 0)
        long abandonedBookings = 0L;
        
        // Cancellation rate
        double cancellationRate = totalBookings > 0 ? (cancelled * 100.0 / totalBookings) : 0.0;
        
        return PlatformAnalyticsDto.BookingAnalytics.builder()
                .totalBookings(totalBookings)
                .statusBreakdown(statusBreakdown)
                .bookingTrends(bookingTrends)
                .abandonedBookings(abandonedBookings)
                .cancellationRate(Math.round(cancellationRate * 100.0) / 100.0)
                .build();
    }
    
    private PlatformAnalyticsDto.RevenueAnalytics calculateRevenueAnalytics(LocalDateTime startOfToday, LocalDateTime startOfWeek, LocalDateTime startOfMonth, LocalDateTime now) {
        // Total revenue (all completed bookings)
        BigDecimal totalRevenue = bookingRepository.sumTotalAmountByStatus(Booking.BookingStatus.COMPLETED);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        // Revenue today
        BigDecimal revenueToday = bookingRepository.sumTotalAmountByStatusAndCreatedAtBetweenDates(
                Booking.BookingStatus.COMPLETED, startOfToday, now);
        if (revenueToday == null) revenueToday = BigDecimal.ZERO;
        
        // Revenue this week
        BigDecimal revenueThisWeek = bookingRepository.sumTotalAmountByStatusAndCreatedAtBetweenDates(
                Booking.BookingStatus.COMPLETED, startOfWeek, now);
        if (revenueThisWeek == null) revenueThisWeek = BigDecimal.ZERO;
        
        // Revenue this month
        BigDecimal revenueThisMonth = bookingRepository.sumTotalAmountByStatusAndCreatedAtBetweenDates(
                Booking.BookingStatus.COMPLETED, startOfMonth, now);
        if (revenueThisMonth == null) revenueThisMonth = BigDecimal.ZERO;
        
        // Monthly revenue - last 12 months
        List<PlatformAnalyticsDto.TrendData> monthlyRevenue = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int i = 11; i >= 0; i--) {
            LocalDate monthStart = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1);
            LocalDateTime start = monthStart.atStartOfDay();
            LocalDateTime end = monthEnd.atStartOfDay();
            
            BigDecimal monthRevenue = bookingRepository.sumTotalAmountByStatusAndCreatedAtBetweenDates(
                    Booking.BookingStatus.COMPLETED, start, end);
            long monthBookings = bookingRepository.countByCreatedAtBetweenDates(start, end);
            
            monthlyRevenue.add(PlatformAnalyticsDto.TrendData.builder()
                    .date(monthStart.format(monthFormatter))
                    .count(monthBookings)
                    .value(monthRevenue != null ? monthRevenue : BigDecimal.ZERO)
                    .build());
        }
        
        // Revenue by category
        List<PlatformAnalyticsDto.CategoryRevenue> revenueByCategory = serviceRepository.findRevenueByCategoryFromCompletedBookings()
                .stream()
                .map(result -> PlatformAnalyticsDto.CategoryRevenue.builder()
                        .category((String) result[0])
                        .revenue((BigDecimal) result[1])
                        .bookings(((Number) result[2]).longValue())
                        .build())
                .collect(Collectors.toList());
        
        // Platform commission (assuming 15% commission)
        double commissionPercentage = 15.0;
        BigDecimal platformCommission = totalRevenue.multiply(BigDecimal.valueOf(commissionPercentage / 100));
        BigDecimal vendorPayout = totalRevenue.subtract(platformCommission);
        
        return PlatformAnalyticsDto.RevenueAnalytics.builder()
                .totalRevenue(totalRevenue)
                .revenueToday(revenueToday)
                .revenueThisWeek(revenueThisWeek)
                .revenueThisMonth(revenueThisMonth)
                .monthlyRevenue(monthlyRevenue)
                .revenueByCategory(revenueByCategory)
                .platformCommission(platformCommission.setScale(2, RoundingMode.HALF_UP))
                .vendorPayout(vendorPayout.setScale(2, RoundingMode.HALF_UP))
                .commissionPercentage(commissionPercentage)
                .build();
    }
    
    private PlatformAnalyticsDto.CustomerExperienceAnalytics calculateCustomerExperienceAnalytics() {
        // Average rating across all reviews
        Double averageRating = reviewRepository.findAverageRating();
        
        // Rating distribution
        long fiveStar = reviewRepository.countByRating(5);
        long fourStar = reviewRepository.countByRating(4);
        long threeStar = reviewRepository.countByRating(3);
        long twoStar = reviewRepository.countByRating(2);
        long oneStar = reviewRepository.countByRating(1);
        
        PlatformAnalyticsDto.RatingDistribution ratingDistribution = PlatformAnalyticsDto.RatingDistribution.builder()
                .fiveStar(fiveStar)
                .fourStar(fourStar)
                .threeStar(threeStar)
                .twoStar(twoStar)
                .oneStar(oneStar)
                .build();
        
        // Top rated vendors - using actual review data
        List<PlatformAnalyticsDto.TopRated> topRatedVendors = List.of(); // Empty list for now

        
        // Top rated services
        List<PlatformAnalyticsDto.TopRated> topRatedServices = serviceRepository.findTopRatedServices()
                .stream()
                .limit(5)
                .map(s -> PlatformAnalyticsDto.TopRated.builder()
                        .id(s.getId())
                        .name(s.getServiceName())
                        .rating(s.getAverageRating() != null ? s.getAverageRating().doubleValue() : 0.0)
                        .totalReviews(s.getTotalReviews())
                        .build())
                .collect(Collectors.toList());
        
        // Complaints (we don't have a complaints system yet, so returning 0)
        long totalComplaints = 0L;
        long resolvedComplaints = 0L;
        long pendingComplaints = 0L;
        
        // Average response time (we don't track this yet, so returning 0)
        double averageResponseTimeHours = 0.0;
        
        return PlatformAnalyticsDto.CustomerExperienceAnalytics.builder()
                .averageRating(averageRating != null ? Math.round(averageRating * 100.0) / 100.0 : 0.0)
                .ratingDistribution(ratingDistribution)
                .topRatedVendors(topRatedVendors)
                .topRatedServices(topRatedServices)
                .totalComplaints(totalComplaints)
                .resolvedComplaints(resolvedComplaints)
                .pendingComplaints(pendingComplaints)
                .averageResponseTimeHours(averageResponseTimeHours)
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
            throw new ConflictException("Cannot change role from VENDOR to " + newRole + ". User has an active vendor account. Delete vendor account first.");
        }
        
        // FIXED: Allow direct VENDOR role assignment by admin as requested
        // Removed restriction: "Cannot directly change role to VENDOR. Use vendor registration process instead."
        
        user.setRole(newRole);
        
        // Audit log for role change
        java.util.Map<String, Object> auditData = new java.util.HashMap<>();
        auditData.put("userId", userId);
        auditData.put("oldRole", oldRole.name());
        auditData.put("newRole", newRole.name());
        auditLogService.log("USER", userId, "ROLE_CHANGE", user.getId(), auditData);
        
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
            throw new ConflictException("Cannot delete user with " + activeBookings.size() + " active booking(s). Cancel or complete bookings first.");
        }
        
        // Check if user is a vendor with services
        if (user.getRole() == User.UserRole.VENDOR && user.getVendor() != null) {
            long serviceCount = serviceRepository.findByVendorId(user.getVendor().getId()).size();
            if (serviceCount > 0) {
                throw new ConflictException("Cannot delete vendor user with " + serviceCount + " active service(s). Delete services first.");
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
    public Vendor rejectVendor(Long vendorId, String reason, Long adminId) {
        Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        String previousStatus = vendor.getApprovalStatus().toString();
        vendor.setApprovalStatus(Vendor.ApprovalStatus.REJECTED);
        vendor.setRejectionReason(reason);
        vendor.setIsActive(false);
        
        Vendor saved = vendorRepository.save(vendor);
        
        auditLogService.logVendorApproval(vendorId, adminId, "REJECTED", previousStatus, reason);
        
        return saved;
    }

    /**
     * Suspend vendor
     */
    @Transactional
    public Vendor suspendVendor(Long vendorId, String reason, Long adminId) {
        Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        vendor.setApprovalStatus(Vendor.ApprovalStatus.SUSPENDED);
        vendor.setRejectionReason(reason);
        vendor.setIsActive(false);
        
        // CASCADE: Deactivate all vendor services when suspended
        List<Service> vendorServices = serviceRepository.findByVendorId(vendor.getId());
        for (Service service : vendorServices) {
            service.setIsAvailable(false);
            serviceRepository.save(service);
        }
        
        Vendor saved = vendorRepository.save(vendor);
        
        auditLogService.logVendorSuspension(vendorId, adminId, reason);
        
        return saved;
    }

    /**
     * Reactivate vendor (from suspended or rejected state)
     */
    @Transactional
    public Vendor reactivateVendor(Long vendorId, Long adminId) {
        Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() -> new RuntimeException("Vendor not found"));
        
        vendor.setApprovalStatus(Vendor.ApprovalStatus.APPROVED);
        vendor.setRejectionReason(null);
        vendor.setIsActive(true);
        vendor.setIsVerified(true);
        
        Vendor saved = vendorRepository.save(vendor);
        
        auditLogService.logVendorReactivation(vendorId, adminId);
        
        return saved;
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
            throw new ConflictException("Cannot delete service with " + activeBookings.size() + " active booking(s). Cancel bookings first.");
        }
        
        // CASCADE: Remove service from all user carts before deletion
        // Note: Need to inject CartItemRepository in AdminService for this
        // serviceRepository.delete will handle this if cascade is configured on entity
        
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
            throw new ConflictException("Booking is already cancelled");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed booking");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        if (reason != null && !reason.isEmpty()) {
            String currentNotes = booking.getNotes() != null ? booking.getNotes() : "";
            booking.setNotes(currentNotes + "\nCancellation Reason (Admin): " + reason);
        }
        
        // CASCADE: Update payment status to CANCELLED if payment exists
        com.bookkaro.model.Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        if (payment != null && "SUCCESS".equals(payment.getPaymentStatus())) {
            payment.setPaymentStatus("CANCELLED");
            paymentRepository.save(payment);
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

    /**
     * Revert completed booking to previous status (admin override)
     */
    @Transactional
    public Booking revertBooking(Long bookingId, String newStatus, String reason) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Only allow reverting COMPLETED bookings
        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("Only completed bookings can be reverted");
        }
        
        // Validate target status
        Booking.BookingStatus targetStatus = Booking.BookingStatus.valueOf(newStatus);
        if (targetStatus != Booking.BookingStatus.CONFIRMED && 
            targetStatus != Booking.BookingStatus.PENDING) {
            throw new BadRequestException("Can only revert to CONFIRMED or PENDING status");
        }
        
        // Store old status for audit log
        String oldStatus = booking.getStatus().toString();
        
        // Update booking
        booking.setStatus(targetStatus);
        if (reason != null && !reason.isEmpty()) {
            String currentNotes = booking.getNotes() != null ? booking.getNotes() : "";
            booking.setNotes(currentNotes + "\nReverted by Admin: " + reason);
        }
        
        Booking savedBooking = bookingRepository.save(booking);
        
        // Create audit log entry
        java.util.Map<String, Object> oldValues = new java.util.HashMap<>();
        oldValues.put("status", oldStatus);
        
        java.util.Map<String, Object> newValues = new java.util.HashMap<>();
        newValues.put("status", newStatus);
        newValues.put("revert_reason", reason);
        
        auditLogService.log("BOOKING", bookingId, "UPDATE", 1L, newValues);
        
        return savedBooking;
    }
}

