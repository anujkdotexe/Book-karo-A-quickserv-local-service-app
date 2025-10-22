package com.bookkaro.repository;

import com.bookkaro.model.Booking;
import com.bookkaro.model.Review;
import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Review Repository - Data access layer for Review entity
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user LEFT JOIN FETCH r.service LEFT JOIN FETCH r.booking WHERE r.service.id = :serviceId")
    Page<Review> findByServiceId(@Param("serviceId") Long serviceId, Pageable pageable);

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user LEFT JOIN FETCH r.service LEFT JOIN FETCH r.booking WHERE r.user.id = :userId")
    Page<Review> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user LEFT JOIN FETCH r.service LEFT JOIN FETCH r.booking WHERE r.booking.id = :bookingId")
    Optional<Review> findByBookingId(@Param("bookingId") Long bookingId);

    Boolean existsByBookingId(Long bookingId);
    
    // New methods for ReviewController
    Boolean existsByUserAndBooking(User user, Booking booking);
    
    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user LEFT JOIN FETCH r.service LEFT JOIN FETCH r.booking WHERE r.service = :service ORDER BY r.createdAt DESC")
    List<Review> findByServiceOrderByCreatedAtDesc(@Param("service") Service service);
    
    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user LEFT JOIN FETCH r.service LEFT JOIN FETCH r.booking WHERE r.service = :service")
    List<Review> findByService(@Param("service") Service service);
    
    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user LEFT JOIN FETCH r.service LEFT JOIN FETCH r.booking WHERE r.user = :user ORDER BY r.createdAt DESC")
    List<Review> findByUserOrderByCreatedAtDesc(@Param("user") User user);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.service.id = :serviceId")
    Double findAverageRatingByServiceId(@Param("serviceId") Long serviceId);
    
    Long countByServiceId(Long serviceId);
    
    // Analytics methods
    @Query("SELECT r FROM Review r WHERE r.service.id IN :serviceIds")
    List<Review> findByServiceIdIn(@Param("serviceIds") List<Long> serviceIds);
}
