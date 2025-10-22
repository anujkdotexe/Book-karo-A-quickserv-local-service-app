package com.bookkaro.repository;

import com.bookkaro.model.Refund;
import com.bookkaro.model.Refund.RefundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {
    
    Optional<Refund> findByBookingId(Long bookingId);
    
    List<Refund> findByBooking_User_Email(String userEmail);
    
    Page<Refund> findByStatus(RefundStatus status, Pageable pageable);
}
