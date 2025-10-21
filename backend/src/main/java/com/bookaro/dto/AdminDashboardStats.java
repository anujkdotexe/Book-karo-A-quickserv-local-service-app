package com.bookaro.dto;

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
    private Long pendingVendorApprovals;
    private Long pendingServiceApprovals;
    private BigDecimal platformRevenue;
    private BigDecimal monthlyRevenue;
    
    private List<UserStats> userGrowth;
    private List<VendorStats> topVendors;
    private List<ServiceStats> topServices;
    private List<RevenueStats> revenueData;
    
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
