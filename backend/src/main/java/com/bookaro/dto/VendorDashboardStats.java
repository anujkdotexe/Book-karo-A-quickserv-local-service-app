package com.bookaro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for Vendor Dashboard Statistics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorDashboardStats {
    
    private Long totalBookings;
    private Long pendingBookings;
    private Long confirmedBookings;
    private Long completedBookings;
    private Long totalServices;
    private Long activeServices;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private Double averageRating;
    private Long totalReviews;
    
    private List<RecentBooking> recentBookings;
    private List<ServicePerformance> topServices;
    private List<RevenueData> weeklyRevenue;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentBooking {
        private Long id;
        private String customerName;
        private String serviceName;
        private String status;
        private String bookingDate;
        private BigDecimal price;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServicePerformance {
        private Long serviceId;
        private String serviceName;
        private Long bookingCount;
        private BigDecimal revenue;
        private Double averageRating;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueData {
        private String date;
        private BigDecimal amount;
        private Long bookings;
    }
}
