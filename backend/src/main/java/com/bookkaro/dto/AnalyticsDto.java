package com.bookkaro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDto {
    
    // Overall Statistics
    private Long totalBookings;
    private Long completedBookings;
    private Long cancelledBookings;
    private Long pendingBookings;
    private BigDecimal totalRevenue;
    private BigDecimal averageOrderValue;
    private Double completionRate;
    private Double cancellationRate;
    
    // Service Statistics
    private Long totalServices;
    private Long activeServices;
    private Double averageServiceRating;
    private Long totalReviews;
    
    // User Statistics (for Admin)
    private Long totalUsers;
    private Long activeUsers;
    private Long totalVendors;
    private Long verifiedVendors;
    
    // Time-based metrics
    private List<RevenueDataPoint> revenueOverTime;
    private List<BookingDataPoint> bookingsOverTime;
    
    // Top Performers
    private List<TopService> topServices;
    private List<TopVendor> topVendors;
    private List<CategoryStats> categoryStats;
    
    // Recent activity
    private List<RecentActivity> recentActivities;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueDataPoint {
        private String date;
        private BigDecimal revenue;
        private Long bookingCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingDataPoint {
        private String date;
        private Long completed;
        private Long cancelled;
        private Long pending;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopService {
        private Long serviceId;
        private String serviceName;
        private Long bookingCount;
        private BigDecimal revenue;
        private Double averageRating;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopVendor {
        private Long vendorId;
        private String businessName;
        private String city;
        private String state;
        private Long bookingCount;
        private BigDecimal revenue;
        private Double averageRating;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryStats {
        private String category;
        private Long serviceCount;
        private Long bookingCount;
        private BigDecimal revenue;
        private Double averageRating;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String type; // BOOKING_CREATED, BOOKING_COMPLETED, SERVICE_ADDED, REVIEW_POSTED
        private String description;
        private String timestamp;
        private String status;
    }
}
