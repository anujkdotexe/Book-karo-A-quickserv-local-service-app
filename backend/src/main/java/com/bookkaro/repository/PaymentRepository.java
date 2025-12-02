package com.bookkaro.repository;

import com.bookkaro.model.Payment;
import com.bookkaro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByUserOrderByCreatedAtDesc(User user);
    
    Optional<Payment> findByBookingId(Long bookingId);
    
    Optional<Payment> findByTransactionId(String transactionId);
    
    // Analytics methods
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'SUCCESS' AND p.createdAt >= :startDate")
    Double findTotalRevenueAfterDate(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT p FROM Payment p WHERE p.paymentStatus = 'SUCCESS' AND p.createdAt >= :startDate ORDER BY p.createdAt DESC")
    List<Payment> findCompletedPaymentsAfterDate(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT p FROM Payment p WHERE p.booking.service.vendor.id = :vendorId AND p.paymentStatus = 'SUCCESS' AND p.createdAt >= :startDate")
    List<Payment> findVendorPaymentsAfterDate(@Param("vendorId") Long vendorId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentStatus = :status AND p.createdAt >= :startDate")
    Long countByStatusAfterDate(@Param("status") String status, @Param("startDate") LocalDateTime startDate);
    
    // Count by payment status
    Long countByPaymentStatus(String paymentStatus);
    
    // Sum amount by payment status
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = :status")
    BigDecimal sumAmountByPaymentStatus(@Param("status") String status);
}
