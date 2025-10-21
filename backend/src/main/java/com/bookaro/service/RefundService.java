package com.bookaro.service;

import com.bookaro.model.Booking;
import com.bookaro.model.Refund;
import com.bookaro.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RefundService {

    private final RefundRepository refundRepository;

    /**
     * Calculate refund amount based on cancellation time
     * - 24+ hours before: 100% refund
     * - 12-24 hours before: 50% refund
     * - Less than 12 hours: No refund
     */
    public BigDecimal calculateRefundAmount(Booking booking) {
        LocalDateTime bookingDateTime = LocalDateTime.of(booking.getBookingDate(), booking.getBookingTime());
        LocalDateTime now = LocalDateTime.now();
        
        long hoursUntilBooking = Duration.between(now, bookingDateTime).toHours();
        
        BigDecimal totalAmount = booking.getTotalAmount();
        
        if (hoursUntilBooking >= 24) {
            return totalAmount; // 100% refund
        } else if (hoursUntilBooking >= 12) {
            return totalAmount.multiply(BigDecimal.valueOf(0.5)); // 50% refund
        } else {
            return BigDecimal.ZERO; // No refund
        }
    }

    @Transactional
    public Refund createRefund(Booking booking, String reason) {
        BigDecimal refundAmount = calculateRefundAmount(booking);
        
        Refund refund = Refund.builder()
                .booking(booking)
                .amount(refundAmount)
                .reason(reason)
                .status(Refund.RefundStatus.PENDING)
                .build();
        
        return refundRepository.save(refund);
    }

    @Transactional
    public Refund processRefund(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found"));
        
        refund.setStatus(Refund.RefundStatus.COMPLETED);
        refund.setProcessedAt(LocalDateTime.now());
        
        return refundRepository.save(refund);
    }

    public Refund getRefundByBookingId(Long bookingId) {
        return refundRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Refund not found for booking"));
    }
}
