package com.bookkaro.repository;

import com.bookkaro.model.Booking;
import com.bookkaro.model.Booking.BookingStatus;
import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import com.bookkaro.model.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Booking Repository - Data access layer for Booking entity
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    Page<Booking> findByServiceVendorId(Long vendorId, Pageable pageable);

    Page<Booking> findByUserIdAndStatus(Long userId, BookingStatus status, Pageable pageable);
    
    // Custom queries with JOIN FETCH to avoid lazy loading issues
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.service s " +
           "JOIN FETCH s.vendor " +
           "WHERE b.user = :user AND b.status = :status")
    List<Booking> findByUserAndStatus(@Param("user") User user, @Param("status") BookingStatus status);
    
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.service s " +
           "JOIN FETCH s.vendor " +
           "WHERE b.user = :user " +
           "ORDER BY b.scheduledAt DESC")
    List<Booking> findByUserOrderByBookingDateDesc(@Param("user") User user);
    
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.service s " +
           "JOIN FETCH s.vendor " +
           "WHERE s.vendor = :vendor AND b.status = :status")
    List<Booking> findByServiceVendorAndStatus(@Param("vendor") User vendor, @Param("status") BookingStatus status);
    
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.service s " +
           "JOIN FETCH s.vendor " +
           "WHERE s.vendor = :vendor " +
           "ORDER BY b.scheduledAt DESC")
    List<Booking> findByServiceVendorOrderByBookingDateDesc(@Param("vendor") User vendor);
    
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.service s " +
           "JOIN FETCH s.vendor " +
           "WHERE b.id = :id")
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT DISTINCT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.service s " +
           "JOIN FETCH s.vendor")
    List<Booking> findAllWithDetails();

    /**
     * Find all bookings for multiple service IDs
     */
    List<Booking> findByServiceIdIn(List<Long> serviceIds);
    
    /**
     * Find bookings by vendor (new methods for Vendor entity)
     */
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.service s " +
           "JOIN FETCH s.vendor v " +
           "WHERE v = :vendor " +
           "ORDER BY b.scheduledAt DESC")
    List<Booking> findByServiceVendorEntityOrderByBookingDateDesc(@Param("vendor") Vendor vendor);
    
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.service s " +
           "JOIN FETCH s.vendor v " +
           "WHERE v = :vendor AND b.status = :status")
    List<Booking> findByServiceVendorEntityAndStatus(@Param("vendor") Vendor vendor, @Param("status") BookingStatus status);
    
    // Admin query - get bookings by status with pagination
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);
    
    // Duplicate booking prevention methods
    List<Booking> findByUserAndServiceAndScheduledAt(User user, Service service, LocalDateTime scheduledAt);
    
    List<Booking> findByVendorAndScheduledAt(Vendor vendor, LocalDateTime scheduledAt);
    
    // Analytics methods
    Long countByStatus(BookingStatus status);
    
    List<Booking> findByStatus(BookingStatus status);
    
    Long countByServiceIdIn(List<Long> serviceIds);
    
    Long countByServiceIdInAndStatus(List<Long> serviceIds, BookingStatus status);
    
    List<Booking> findByServiceIdInAndStatus(List<Long> serviceIds, BookingStatus status);
    
    Long countByServiceIdAndStatus(Long serviceId, BookingStatus status);
    
    List<Booking> findByServiceIdAndStatus(Long serviceId, BookingStatus status);
    
    // Time-based queries for analytics
    Long countByStatusAndCreatedAtBetween(BookingStatus status, java.time.LocalDateTime start, java.time.LocalDateTime end);
    
    List<Booking> findByStatusAndCreatedAtBetween(BookingStatus status, java.time.LocalDateTime start, java.time.LocalDateTime end);
    
    Long countByServiceIdInAndStatusAndCreatedAtBetween(List<Long> serviceIds, BookingStatus status, java.time.LocalDateTime start, java.time.LocalDateTime end);
    
    List<Booking> findByServiceIdInAndStatusAndCreatedAtBetween(List<Long> serviceIds, BookingStatus status, java.time.LocalDateTime start, java.time.LocalDateTime end);
    
    // Recent activities
    List<Booking> findTop10ByOrderByCreatedAtDesc();
    
    List<Booking> findTop10ByServiceIdInOrderByCreatedAtDesc(List<Long> serviceIds);
    
    // Revenue calculation
    @Query("SELECT SUM(b.priceTotal) FROM Booking b WHERE b.status = :status")
    java.math.BigDecimal sumTotalAmountByStatus(@Param("status") BookingStatus status);
    
    @Query("SELECT SUM(b.priceTotal) FROM Booking b WHERE b.status = :status AND b.createdAt >= :startDate")
    java.math.BigDecimal sumTotalAmountByStatusAndCreatedAtAfter(@Param("status") BookingStatus status, @Param("startDate") java.time.LocalDateTime startDate);
    
    @Query("SELECT SUM(b.priceTotal) FROM Booking b WHERE b.status = :status AND b.createdAt >= :startDate AND b.createdAt < :endDate")
    java.math.BigDecimal sumTotalAmountByStatusAndCreatedAtBetween(@Param("status") BookingStatus status, @Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);
    
    @Query("SELECT SUM(b.priceTotal) FROM Booking b WHERE b.status = :status AND b.updatedAt >= :startDate AND b.updatedAt < :endDate")
    java.math.BigDecimal sumTotalAmountByStatusAndUpdatedAtBetween(@Param("status") BookingStatus status, @Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);
    
    // Daily revenue for last 7 days (optimized query)
    @Query("SELECT SUM(b.priceTotal) FROM Booking b WHERE b.status = :status AND b.createdAt >= :startOfDay AND b.createdAt < :endOfDay")
    java.math.BigDecimal sumTotalAmountByStatusAndCreatedAtBetweenDates(@Param("status") BookingStatus status, @Param("startOfDay") java.time.LocalDateTime startOfDay, @Param("endOfDay") java.time.LocalDateTime endOfDay);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt >= :startOfDay AND b.createdAt < :endOfDay")
    Long countByCreatedAtBetweenDates(@Param("startOfDay") java.time.LocalDateTime startOfDay, @Param("endOfDay") java.time.LocalDateTime endOfDay);
    
    // Top vendors by revenue (optimized query)
    @Query("SELECT v.id as vendorId, v.businessName as businessName, " +
           "v.city as city, v.state as state, " +
           "COUNT(b.id) as totalBookings, " +
           "SUM(CASE WHEN b.status = 'COMPLETED' THEN b.priceTotal ELSE 0 END) as totalRevenue, " +
           "v.averageRating as averageRating " +
           "FROM Booking b " +
           "JOIN b.service s " +
           "JOIN s.vendor v " +
           "GROUP BY v.id, v.businessName, v.city, v.state, v.averageRating " +
           "HAVING COUNT(b.id) > 0 " +
           "ORDER BY totalRevenue DESC")
    List<Object[]> findTopVendorsByRevenue(Pageable pageable);
    
    // Top services by revenue (optimized query)
    @Query("SELECT s.id as serviceId, s.serviceName as serviceName, " +
           "v.businessName as vendorName, " +
           "COUNT(b.id) as bookingCount, " +
           "SUM(CASE WHEN b.status = 'COMPLETED' THEN b.priceTotal ELSE 0 END) as revenue, " +
           "s.averageRating as averageRating " +
           "FROM Booking b " +
           "JOIN b.service s " +
           "JOIN s.vendor v " +
           "GROUP BY s.id, s.serviceName, v.businessName, s.averageRating " +
           "HAVING COUNT(b.id) > 0 " +
           "ORDER BY revenue DESC")
    List<Object[]> findTopServicesByRevenue(Pageable pageable);
    
    // Platform Analytics methods
    Long countByServiceId(Long serviceId);
    
    @Query("SELECT SUM(b.priceTotal) FROM Booking b WHERE b.service.vendor.id = :vendorId AND b.status = :status")
    java.math.BigDecimal sumTotalAmountByVendorAndStatus(@Param("vendorId") Long vendorId, @Param("status") BookingStatus status);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.service.vendor.id = :vendorId AND b.status = :status")
    Long countByVendorIdAndStatus(@Param("vendorId") Long vendorId, @Param("status") BookingStatus status);
    
    @Query("SELECT SUM(b.priceTotal) FROM Booking b WHERE b.service.id = :serviceId AND b.status = :status")
    java.math.BigDecimal sumTotalAmountByServiceAndStatus(@Param("serviceId") Long serviceId, @Param("status") BookingStatus status);
}
