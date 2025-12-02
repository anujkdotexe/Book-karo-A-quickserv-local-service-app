package com.bookkaro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

/**
 * Comprehensive Platform Analytics DTO
 * Contains all metrics for admin platform overview
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformAnalyticsDto {
    
    private UserAnalytics userAnalytics;
    private VendorAnalytics vendorAnalytics;
    private ServiceAnalytics serviceAnalytics;
    private BookingAnalytics bookingAnalytics;
    private RevenueAnalytics revenueAnalytics;
    private CustomerExperienceAnalytics customerExperienceAnalytics;
    
    // User Analytics
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserAnalytics {
        private Long totalUsers;
        private Long newUsersToday;
        private Long newUsersThisWeek;
        private Long newUsersThisMonth;
        private Long activeUsers; // Active in last 30 days
        private UserSegmentation segmentation;
        private Double retentionRate; // Percentage
        private Double churnRate; // Percentage
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSegmentation {
        private Long customers;
        private Long vendors;
        private Long admins;
    }
    
    // Vendor Analytics
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VendorAnalytics {
        private Long totalVendors;
        private Long newVendorsToday;
        private Long newVendorsThisWeek;
        private Long newVendorsThisMonth;
        private VendorApprovalStatus approvalStatus;
        private Long activeVendors;
        private Long inactiveVendors;
        private List<TopVendor> topVendorsByRevenue;
        private List<TopVendor> topVendorsByBookings;
        private Double averageVendorRating;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VendorApprovalStatus {
        private Long pending;
        private Long approved;
        private Long rejected;
        private Long suspended;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopVendor {
        private Long id;
        private String businessName;
        private String vendorCode;
        private BigDecimal totalRevenue;
        private Long totalBookings;
        private Double averageRating;
    }
    
    // Service Analytics
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceAnalytics {
        private Long totalServices;
        private Long activeServices;
        private Long inactiveServices;
        private Long pendingApprovals;
        private Long rejectedServices;
        private Long bookingsThisMonth;
        private BigDecimal revenueThisMonth;
        private List<TopService> topServicesByBookings;
        private List<TopService> topServicesByRevenue;
        private Double averageServiceRating;
        private Double completionRate; // Percentage of completed bookings
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopService {
        private Long id;
        private String serviceName;
        private String category;
        private Long totalBookings;
        private BigDecimal totalRevenue;
        private Double averageRating;
        private String vendorName;
    }
    
    // Booking Analytics
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookingAnalytics {
        private Long totalBookings;
        private BookingStatusBreakdown statusBreakdown;
        private List<TrendData> bookingTrends; // Last 30 days
        private Long abandonedBookings;
        private Double cancellationRate; // Percentage
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookingStatusBreakdown {
        private Long pending;
        private Long confirmed;
        private Long completed;
        private Long cancelled;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrendData {
        private String date;
        private Long count;
        private BigDecimal value;
    }
    
    // Revenue Analytics
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueAnalytics {
        private BigDecimal totalRevenue;
        private BigDecimal revenueToday;
        private BigDecimal revenueThisWeek;
        private BigDecimal revenueThisMonth;
        private List<TrendData> monthlyRevenue; // Last 12 months
        private List<CategoryRevenue> revenueByCategory;
        private BigDecimal platformCommission;
        private BigDecimal vendorPayout;
        private Double commissionPercentage;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryRevenue {
        private String category;
        private BigDecimal revenue;
        private Long bookings;
    }
    
    // Customer Experience Analytics
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerExperienceAnalytics {
        private Double averageRating;
        private RatingDistribution ratingDistribution;
        private List<TopRated> topRatedVendors;
        private List<TopRated> topRatedServices;
        private Long totalComplaints;
        private Long resolvedComplaints;
        private Long pendingComplaints;
        private Double averageResponseTimeHours;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RatingDistribution {
        private Long fiveStar;
        private Long fourStar;
        private Long threeStar;
        private Long twoStar;
        private Long oneStar;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopRated {
        private Long id;
        private String name;
        private Double rating;
        private Integer totalReviews;
    }
}
