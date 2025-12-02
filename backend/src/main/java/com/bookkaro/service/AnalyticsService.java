package com.bookkaro.service;

import com.bookkaro.dto.AnalyticsDto;
import com.bookkaro.model.*;
import com.bookkaro.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ReviewRepository reviewRepository;

    /**
     * Get analytics for admin - platform-wide statistics
     */
    public AnalyticsDto getAdminAnalytics(int days) {
        // Overall Booking Statistics
        Long totalBookings = bookingRepository.count();
        Long completedBookings = bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED);
        Long cancelledBookings = bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED);
        Long pendingBookings = bookingRepository.countByStatus(Booking.BookingStatus.PENDING);
        
        // Revenue Calculations
        BigDecimal totalRevenue = calculateTotalRevenue();
        BigDecimal averageOrderValue = totalBookings > 0 
            ? totalRevenue.divide(BigDecimal.valueOf(totalBookings), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        
        // Rates
        Double completionRate = totalBookings > 0 
            ? (completedBookings.doubleValue() / totalBookings.doubleValue()) * 100.0
            : 0.0;
        Double cancellationRate = totalBookings > 0 
            ? (cancelledBookings.doubleValue() / totalBookings.doubleValue()) * 100.0
            : 0.0;
        
        // Service Statistics
        Long totalServices = serviceRepository.count();
        Long activeServices = serviceRepository.countByIsAvailableTrue();
        List<Review> allReviews = reviewRepository.findAll();
        Double averageServiceRating = allReviews.isEmpty() ? 0.0 
            : allReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        
        // User Statistics
        Long totalUsers = userRepository.countByRole(User.UserRole.USER);
        Long activeUsers = userRepository.countByRoleAndIsActiveTrue(User.UserRole.USER);
        Long totalVendors = vendorRepository.count();
        Long verifiedVendors = vendorRepository.countByIsVerifiedTrue();
        
        return AnalyticsDto.builder()
                .totalBookings(totalBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .pendingBookings(pendingBookings)
                .totalRevenue(totalRevenue)
                .averageOrderValue(averageOrderValue)
                .completionRate(Math.round(completionRate * 10.0) / 10.0)
                .cancellationRate(Math.round(cancellationRate * 10.0) / 10.0)
                .totalServices(totalServices)
                .activeServices(activeServices)
                .averageServiceRating(Math.round(averageServiceRating * 10.0) / 10.0)
                .totalReviews((long) allReviews.size())
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalVendors(totalVendors)
                .verifiedVendors(verifiedVendors)
                .revenueOverTime(getRevenueOverTime(days))
                .bookingsOverTime(getBookingsOverTime(days))
                .topServices(getTopServices(10))
                .topVendors(getTopVendors(10))
                .categoryStats(getCategoryStats())
                .recentActivities(getRecentActivities(20))
                .build();
    }

    /**
     * Get analytics for a specific vendor
     */
    public AnalyticsDto getVendorAnalytics(Long vendorId, int days) {
        // Get vendor's services
        List<com.bookkaro.model.Service> vendorServices = serviceRepository.findByVendorId(vendorId);
        List<Long> serviceIds = vendorServices.stream()
                .map(com.bookkaro.model.Service::getId)
                .collect(Collectors.toList());
        
        if (serviceIds.isEmpty()) {
            return getEmptyAnalytics();
        }
        
        // Booking Statistics for vendor's services
        Long totalBookings = bookingRepository.countByServiceIdIn(serviceIds);
        Long completedBookings = bookingRepository.countByServiceIdInAndStatus(serviceIds, Booking.BookingStatus.COMPLETED);
        Long cancelledBookings = bookingRepository.countByServiceIdInAndStatus(serviceIds, Booking.BookingStatus.CANCELLED);
        Long pendingBookings = bookingRepository.countByServiceIdInAndStatus(serviceIds, Booking.BookingStatus.PENDING);
        
        // Revenue Calculations
        BigDecimal totalRevenue = calculateVendorRevenue(serviceIds);
        BigDecimal averageOrderValue = totalBookings > 0 
            ? totalRevenue.divide(BigDecimal.valueOf(totalBookings), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        
        // Rates
        Double completionRate = totalBookings > 0 
            ? (completedBookings.doubleValue() / totalBookings.doubleValue()) * 100.0
            : 0.0;
        Double cancellationRate = totalBookings > 0 
            ? (cancelledBookings.doubleValue() / totalBookings.doubleValue()) * 100.0
            : 0.0;
        
        // Service Statistics
        Long totalServices = (long) vendorServices.size();
        Long activeServices = vendorServices.stream().filter(com.bookkaro.model.Service::getIsAvailable).count();
        
        // Average rating for vendor's services
        List<Review> vendorReviews = reviewRepository.findByServiceIdIn(serviceIds);
        Double averageServiceRating = vendorReviews.isEmpty() ? 0.0 
            : vendorReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        
        return AnalyticsDto.builder()
                .totalBookings(totalBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .pendingBookings(pendingBookings)
                .totalRevenue(totalRevenue)
                .averageOrderValue(averageOrderValue)
                .completionRate(Math.round(completionRate * 10.0) / 10.0)
                .cancellationRate(Math.round(cancellationRate * 10.0) / 10.0)
                .totalServices(totalServices)
                .activeServices(activeServices)
                .averageServiceRating(Math.round(averageServiceRating * 10.0) / 10.0)
                .totalReviews((long) vendorReviews.size())
                .revenueOverTime(getVendorRevenueOverTime(serviceIds, days))
                .bookingsOverTime(getVendorBookingsOverTime(serviceIds, days))
                .topServices(getVendorTopServices(serviceIds, 5))
                .categoryStats(getVendorCategoryStats(vendorServices))
                .recentActivities(getVendorRecentActivities(serviceIds, 10))
                .build();
    }

    private BigDecimal calculateTotalRevenue() {
        List<Booking> completedBookings = bookingRepository.findByStatus(Booking.BookingStatus.COMPLETED);
        return completedBookings.stream()
                .map(Booking::getPriceTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateVendorRevenue(List<Long> serviceIds) {
        List<Booking> completedBookings = bookingRepository.findByServiceIdInAndStatus(serviceIds, Booking.BookingStatus.COMPLETED);
        return completedBookings.stream()
                .map(Booking::getPriceTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<AnalyticsDto.RevenueDataPoint> getRevenueOverTime(int days) {
        List<AnalyticsDto.RevenueDataPoint> dataPoints = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            List<Booking> dayBookings = bookingRepository.findByStatusAndCreatedAtBetween(
                    Booking.BookingStatus.COMPLETED, startOfDay, endOfDay);
            
            BigDecimal dayRevenue = dayBookings.stream()
                    .map(Booking::getPriceTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            dataPoints.add(AnalyticsDto.RevenueDataPoint.builder()
                    .date(date.format(formatter))
                    .revenue(dayRevenue)
                    .bookingCount((long) dayBookings.size())
                    .build());
        }
        
        return dataPoints;
    }

    private List<AnalyticsDto.RevenueDataPoint> getVendorRevenueOverTime(List<Long> serviceIds, int days) {
        List<AnalyticsDto.RevenueDataPoint> dataPoints = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            List<Booking> dayBookings = bookingRepository.findByServiceIdInAndStatusAndCreatedAtBetween(
                    serviceIds, Booking.BookingStatus.COMPLETED, startOfDay, endOfDay);
            
            BigDecimal dayRevenue = dayBookings.stream()
                    .map(Booking::getPriceTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            dataPoints.add(AnalyticsDto.RevenueDataPoint.builder()
                    .date(date.format(formatter))
                    .revenue(dayRevenue)
                    .bookingCount((long) dayBookings.size())
                    .build());
        }
        
        return dataPoints;
    }

    private List<AnalyticsDto.BookingDataPoint> getBookingsOverTime(int days) {
        List<AnalyticsDto.BookingDataPoint> dataPoints = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            Long completed = bookingRepository.countByStatusAndCreatedAtBetween(
                    Booking.BookingStatus.COMPLETED, startOfDay, endOfDay);
            Long cancelled = bookingRepository.countByStatusAndCreatedAtBetween(
                    Booking.BookingStatus.CANCELLED, startOfDay, endOfDay);
            Long pending = bookingRepository.countByStatusAndCreatedAtBetween(
                    Booking.BookingStatus.PENDING, startOfDay, endOfDay);
            
            dataPoints.add(AnalyticsDto.BookingDataPoint.builder()
                    .date(date.format(formatter))
                    .completed(completed)
                    .cancelled(cancelled)
                    .pending(pending)
                    .build());
        }
        
        return dataPoints;
    }

    private List<AnalyticsDto.BookingDataPoint> getVendorBookingsOverTime(List<Long> serviceIds, int days) {
        List<AnalyticsDto.BookingDataPoint> dataPoints = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            Long completed = bookingRepository.countByServiceIdInAndStatusAndCreatedAtBetween(
                    serviceIds, Booking.BookingStatus.COMPLETED, startOfDay, endOfDay);
            Long cancelled = bookingRepository.countByServiceIdInAndStatusAndCreatedAtBetween(
                    serviceIds, Booking.BookingStatus.CANCELLED, startOfDay, endOfDay);
            Long pending = bookingRepository.countByServiceIdInAndStatusAndCreatedAtBetween(
                    serviceIds, Booking.BookingStatus.PENDING, startOfDay, endOfDay);
            
            dataPoints.add(AnalyticsDto.BookingDataPoint.builder()
                    .date(date.format(formatter))
                    .completed(completed)
                    .cancelled(cancelled)
                    .pending(pending)
                    .build());
        }
        
        return dataPoints;
    }

    private List<AnalyticsDto.TopService> getTopServices(int limit) {
        List<com.bookkaro.model.Service> allServices = serviceRepository.findAll();
        
        return allServices.stream()
                .map(service -> {
                    Long bookingCount = bookingRepository.countByServiceIdAndStatus(
                            service.getId(), Booking.BookingStatus.COMPLETED);
                    BigDecimal revenue = bookingRepository.findByServiceIdAndStatus(
                                    service.getId(), Booking.BookingStatus.COMPLETED).stream()
                            .map(Booking::getPriceTotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    BigDecimal avgRating = service.getAverageRating();
                    Double avgRatingDouble = (avgRating != null) ? avgRating.doubleValue() : 0.0;
                    
                    return AnalyticsDto.TopService.builder()
                            .serviceId(service.getId())
                            .serviceName(service.getServiceName())
                            .bookingCount(bookingCount)
                            .revenue(revenue)
                            .averageRating(avgRatingDouble)
                            .build();
                })
                .filter(topService -> topService.getBookingCount() > 0)
                .sorted(Comparator.comparing(AnalyticsDto.TopService::getRevenue).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<AnalyticsDto.TopService> getVendorTopServices(List<Long> serviceIds, int limit) {
        List<com.bookkaro.model.Service> vendorServices = serviceRepository.findAllById(serviceIds);
        
        return vendorServices.stream()
                .map(service -> {
                    Long bookingCount = bookingRepository.countByServiceIdAndStatus(
                            service.getId(), Booking.BookingStatus.COMPLETED);
                    BigDecimal revenue = bookingRepository.findByServiceIdAndStatus(
                                    service.getId(), Booking.BookingStatus.COMPLETED).stream()
                            .map(Booking::getPriceTotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    BigDecimal avgRating = service.getAverageRating();
                    Double avgRatingDouble = (avgRating != null) ? avgRating.doubleValue() : 0.0;
                    
                    return AnalyticsDto.TopService.builder()
                            .serviceId(service.getId())
                            .serviceName(service.getServiceName())
                            .bookingCount(bookingCount)
                            .revenue(revenue)
                            .averageRating(avgRatingDouble)
                            .build();
                })
                .filter(topService -> topService.getBookingCount() > 0)
                .sorted(Comparator.comparing(AnalyticsDto.TopService::getRevenue).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<AnalyticsDto.TopVendor> getTopVendors(int limit) {
        List<Vendor> allVendors = vendorRepository.findAll();
        
        return allVendors.stream()
                .map(vendor -> {
                    List<com.bookkaro.model.Service> vendorServices = serviceRepository.findByVendorId(vendor.getId());
                    List<Long> serviceIds = vendorServices.stream()
                            .map(com.bookkaro.model.Service::getId)
                            .collect(Collectors.toList());
                    
                    if (serviceIds.isEmpty()) {
                        return null;
                    }
                    
                    Long bookingCount = bookingRepository.countByServiceIdInAndStatus(
                            serviceIds, Booking.BookingStatus.COMPLETED);
                    BigDecimal revenue = calculateVendorRevenue(serviceIds);
                    
                    BigDecimal avgRating = vendor.getAverageRating();
                    Double avgRatingDouble = (avgRating != null) ? avgRating.doubleValue() : 0.0;
                    
                    return AnalyticsDto.TopVendor.builder()
                            .vendorId(vendor.getId())
                            .businessName(vendor.getBusinessName())
                            .city(vendor.getCity())
                            .state(vendor.getState())
                            .bookingCount(bookingCount)
                            .revenue(revenue)
                            .averageRating(avgRatingDouble)
                            .build();
                })
                .filter(Objects::nonNull)
                .filter(topVendor -> topVendor.getBookingCount() > 0)
                .sorted(Comparator.comparing(AnalyticsDto.TopVendor::getRevenue).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<AnalyticsDto.CategoryStats> getCategoryStats() {
        List<com.bookkaro.model.Service> allServices = serviceRepository.findAll();
        Map<String, List<com.bookkaro.model.Service>> servicesByCategory = allServices.stream()
                .collect(Collectors.groupingBy(s -> s.getCategory() != null ? s.getCategory().getName() : "Uncategorized"));
        
        return servicesByCategory.entrySet().stream()
                .map(entry -> {
                    String category = entry.getKey();
                    List<com.bookkaro.model.Service> services = entry.getValue();
                    List<Long> serviceIds = services.stream()
                            .map(com.bookkaro.model.Service::getId)
                            .collect(Collectors.toList());
                    
                    Long bookingCount = bookingRepository.countByServiceIdInAndStatus(
                            serviceIds, Booking.BookingStatus.COMPLETED);
                    BigDecimal revenue = calculateVendorRevenue(serviceIds);
                    Double avgRating = services.stream()
                            .map(com.bookkaro.model.Service::getAverageRating)
                            .filter(rating -> rating != null && rating.compareTo(BigDecimal.ZERO) > 0)
                            .mapToDouble(BigDecimal::doubleValue)
                            .average()
                            .orElse(0.0);
                    
                    return AnalyticsDto.CategoryStats.builder()
                            .category(category)
                            .serviceCount((long) services.size())
                            .bookingCount(bookingCount)
                            .revenue(revenue)
                            .averageRating(Math.round(avgRating * 10.0) / 10.0)
                            .build();
                })
                .sorted(Comparator.comparing(AnalyticsDto.CategoryStats::getRevenue).reversed())
                .collect(Collectors.toList());
    }

    private List<AnalyticsDto.CategoryStats> getVendorCategoryStats(List<com.bookkaro.model.Service> vendorServices) {
        Map<String, List<com.bookkaro.model.Service>> servicesByCategory = vendorServices.stream()
                .collect(Collectors.groupingBy(s -> s.getCategory() != null ? s.getCategory().getName() : "Uncategorized"));
        
        return servicesByCategory.entrySet().stream()
                .map(entry -> {
                    String category = entry.getKey();
                    List<com.bookkaro.model.Service> services = entry.getValue();
                    List<Long> serviceIds = services.stream()
                            .map(com.bookkaro.model.Service::getId)
                            .collect(Collectors.toList());
                    
                    Long bookingCount = bookingRepository.countByServiceIdInAndStatus(
                            serviceIds, Booking.BookingStatus.COMPLETED);
                    BigDecimal revenue = calculateVendorRevenue(serviceIds);
                    Double avgRating = services.stream()
                            .map(com.bookkaro.model.Service::getAverageRating)
                            .filter(rating -> rating != null && rating.compareTo(BigDecimal.ZERO) > 0)
                            .mapToDouble(BigDecimal::doubleValue)
                            .average()
                            .orElse(0.0);
                    
                    return AnalyticsDto.CategoryStats.builder()
                            .category(category)
                            .serviceCount((long) services.size())
                            .bookingCount(bookingCount)
                            .revenue(revenue)
                            .averageRating(Math.round(avgRating * 10.0) / 10.0)
                            .build();
                })
                .sorted(Comparator.comparing(AnalyticsDto.CategoryStats::getRevenue).reversed())
                .collect(Collectors.toList());
    }

    private List<AnalyticsDto.RecentActivity> getRecentActivities(int limit) {
        List<AnalyticsDto.RecentActivity> activities = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, HH:mm");
        
        // Recent bookings
        List<Booking> recentBookings = bookingRepository.findTop10ByOrderByCreatedAtDesc();
        for (Booking booking : recentBookings) {
            activities.add(AnalyticsDto.RecentActivity.builder()
                    .type("BOOKING")
                    .description("New booking for " + booking.getService().getServiceName())
                    .timestamp(booking.getCreatedAt().format(formatter))
                    .status(booking.getStatus().toString())
                    .build());
        }
        
        return activities.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    private List<AnalyticsDto.RecentActivity> getVendorRecentActivities(List<Long> serviceIds, int limit) {
        List<AnalyticsDto.RecentActivity> activities = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, HH:mm");
        
        // Recent bookings for vendor's services
        List<Booking> recentBookings = bookingRepository.findTop10ByServiceIdInOrderByCreatedAtDesc(serviceIds);
        for (Booking booking : recentBookings) {
            activities.add(AnalyticsDto.RecentActivity.builder()
                    .type("BOOKING")
                    .description("Booking for " + booking.getService().getServiceName())
                    .timestamp(booking.getCreatedAt().format(formatter))
                    .status(booking.getStatus().toString())
                    .build());
        }
        
        return activities.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    private AnalyticsDto getEmptyAnalytics() {
        return AnalyticsDto.builder()
                .totalBookings(0L)
                .completedBookings(0L)
                .cancelledBookings(0L)
                .pendingBookings(0L)
                .totalRevenue(BigDecimal.ZERO)
                .averageOrderValue(BigDecimal.ZERO)
                .completionRate(0.0)
                .cancellationRate(0.0)
                .totalServices(0L)
                .activeServices(0L)
                .averageServiceRating(0.0)
                .totalReviews(0L)
                .revenueOverTime(Collections.emptyList())
                .bookingsOverTime(Collections.emptyList())
                .topServices(Collections.emptyList())
                .categoryStats(Collections.emptyList())
                .recentActivities(Collections.emptyList())
                .build();
    }
}
