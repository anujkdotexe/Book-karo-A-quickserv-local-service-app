package com.bookkaro.repository;

import com.bookkaro.model.Booking;
import com.bookkaro.model.Booking.BookingStatus;
import com.bookkaro.model.User;
import com.bookkaro.model.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
           "LEFT JOIN FETCH b.address " +
           "WHERE b.user = :user AND b.status = :status")
    List<Booking> findByUserAndStatus(@Param("user") User user, @Param("status") BookingStatus status);
    
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.service s " +
           "JOIN FETCH s.vendor " +
           "LEFT JOIN FETCH b.address " +
           "WHERE b.user = :user " +
           "ORDER BY b.bookingDate DESC")
    List<Booking> findByUserOrderByBookingDateDesc(@Param("user") User user);
    
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.service s " +
           "JOIN FETCH s.vendor " +
           "LEFT JOIN FETCH b.address " +
           "WHERE s.vendor = :vendor AND b.status = :status")
    List<Booking> findByServiceVendorAndStatus(@Param("vendor") User vendor, @Param("status") BookingStatus status);
    
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.service s " +
           "JOIN FETCH s.vendor " +
           "LEFT JOIN FETCH b.address " +
           "WHERE s.vendor = :vendor " +
           "ORDER BY b.bookingDate DESC")
    List<Booking> findByServiceVendorOrderByBookingDateDesc(@Param("vendor") User vendor);
    
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.service s " +
           "JOIN FETCH s.vendor " +
           "LEFT JOIN FETCH b.address " +
           "WHERE b.id = :id")
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);

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
           "LEFT JOIN FETCH b.address " +
           "WHERE v = :vendor " +
           "ORDER BY b.bookingDate DESC")
    List<Booking> findByServiceVendorEntityOrderByBookingDateDesc(@Param("vendor") Vendor vendor);
    
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.user " +
           "JOIN FETCH b.service s " +
           "JOIN FETCH s.vendor v " +
           "LEFT JOIN FETCH b.address " +
           "WHERE v = :vendor AND b.status = :status")
    List<Booking> findByServiceVendorEntityAndStatus(@Param("vendor") Vendor vendor, @Param("status") BookingStatus status);
    
    // Admin query - get bookings by status with pagination
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);
    
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
}
