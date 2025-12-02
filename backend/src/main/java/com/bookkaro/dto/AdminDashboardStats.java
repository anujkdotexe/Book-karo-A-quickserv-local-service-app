package com.bookkaro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for Admin Dashboard Statistics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardStats {
    
    private Long totalUsers;
    private Long totalVendors;
    private Long totalServices;
    private Long totalBookings;
    private Long totalCoupons;
    private Long pendingVendorApprovals;
    private Long pendingServiceApprovals;
    private BigDecimal platformRevenue;
    private BigDecimal monthlyRevenue;
    
    // Payment statistics
    private Long totalPayments;
    private Long successfulPayments;
    private Long failedPayments;
    private Long refundedPayments;
    private Long pendingRefunds;
    private BigDecimal totalRefundAmount;
    
    private List<UserStats> userGrowth;
    private List<VendorStats> topVendors;
    private List<ServiceStats> topServices;
    private List<RevenueStats> revenueData;
    
    // Analytics data
    private List<UserSignupStats> userSignups;  // User signups over time
    private List<ServiceApprovalStats> rejectedServices;  // Rejected services trend
    private ReviewDistribution reviewDistribution;  // Review ratings distribution
    private BookingFunnel bookingFunnel;  // Booking status funnel
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSignupStats {
        private String date;
        private Long signups;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceApprovalStats {
        private String date;
        private Long rejectedCount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewDistribution {
        private Long oneStar;
        private Long twoStars;
        private Long threeStars;
        private Long fourStars;
        private Long fiveStars;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookingFunnel {
        private Long pending;
        private Long confirmed;
        private Long completed;
        private Long cancelled;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserStats {
        private String date;
        private Long userCount;
        private Long vendorCount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VendorStats {
        private Long vendorId;
        private String businessName;
        private String city;
        private String state;
        private Long totalBookings;
        private BigDecimal totalRevenue;
        private Double averageRating;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceStats {
        private Long serviceId;
        private String serviceName;
        private String vendorName;
        private Long bookingCount;
        private BigDecimal revenue;
        private Double averageRating;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueStats {
        private String date;
        private BigDecimal revenue;
        private Long bookings;
    }
}
