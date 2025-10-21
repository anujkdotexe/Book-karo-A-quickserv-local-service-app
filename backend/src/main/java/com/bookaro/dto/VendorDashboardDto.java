package com.bookaro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorDashboardDto {
    
    // Today's metrics
    private BigDecimal todaysEarnings;
    private Integer pendingRequests;
    private Integer todaysBookings;
    
    // Overall metrics
    private Double averageRating;
    private Integer totalReviews;
    private Integer totalBookings;
    
    // Booking status breakdown
    private Integer completedBookings;
    private Integer cancelledBookings;
    private Integer upcomingBookings;
    
    // Revenue breakdown
    private BigDecimal totalEarnings;
    private BigDecimal thisMonthEarnings;
    private BigDecimal thisWeekEarnings;
    
    // Service statistics
    private Integer activeServices;
    private Integer pausedServices;
    
    // Additional metrics
    private Map<String, Integer> bookingsByStatus;
    private Map<String, BigDecimal> earningsByMonth;
}
