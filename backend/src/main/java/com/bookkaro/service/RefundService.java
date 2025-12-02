package com.bookkaro.service;

import com.bookkaro.dto.RefundRequestDto;
import com.bookkaro.dto.RefundResponseDto;
import com.bookkaro.exception.BadRequestException;
import com.bookkaro.exception.ConflictException;
import com.bookkaro.exception.ResourceNotFoundException;
import com.bookkaro.exception.UnauthorizedException;
import com.bookkaro.model.Booking;
import com.bookkaro.model.Payment;
import com.bookkaro.model.Refund;
import com.bookkaro.repository.BookingRepository;
import com.bookkaro.repository.PaymentRepository;
import com.bookkaro.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RefundService {

    private final RefundRepository refundRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Calculate refund amount based on payment time
     * Uses payment completion time instead of request time for fairer refund calculation
     * - >= 24 hours: 100% refund
     * - >= 12 hours: 50% refund
     * - < 12 hours: No refund
     */
    public BigDecimal calculateRefundAmount(Booking booking) {
        LocalDateTime bookingDateTime = booking.getScheduledAt();
        
        // Use payment creation time (when payment was made) for calculation
        // This is fairer to vendors - 24 hours from payment, not from cancellation request
        LocalDateTime paymentTime = booking.getPayment() != null && booking.getPayment().getCreatedAt() != null
                ? booking.getPayment().getCreatedAt()
                : LocalDateTime.now();
        
        Duration timeFromPaymentToBooking = Duration.between(paymentTime, bookingDateTime);
        long hoursFromPaymentToBooking = timeFromPaymentToBooking.toHours();
        
        BigDecimal totalAmount = booking.getPriceTotal();
        
        // Calculate refund based on time between payment and scheduled booking
        if (hoursFromPaymentToBooking >= 24) {
            return totalAmount; // Full refund if >= 24 hours
        } else if (hoursFromPaymentToBooking >= 12) {
            return totalAmount.multiply(BigDecimal.valueOf(0.5)); // 50% refund if >= 12 hours
        } else {
            return BigDecimal.ZERO; // No refund if < 12 hours
        }
    }

    public RefundResponseDto requestRefund(String userEmail, RefundRequestDto request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("You can only request refunds for your own bookings");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new ConflictException("Booking is already cancelled");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot refund completed bookings");
        }
        
        refundRepository.findByBookingId(booking.getId()).ifPresent(refund -> {
            throw new ConflictException("Refund request already exists for this booking");
        });
        
        BigDecimal refundAmount = calculateRefundAmount(booking);
        
        if (refundAmount.compareTo(BigDecimal.ZERO) == 0) {
            throw new BadRequestException("No refund available. Cancellations must be made at least 12 hours before booking time.");
        }
        
        Refund refund = new Refund();
        refund.setBooking(booking);
        refund.setAmount(refundAmount);
        refund.setReason(request.getReason());
        refund.setStatus(Refund.RefundStatus.PENDING);
        refund.setCreatedAt(LocalDateTime.now());
        refund.setUpdatedAt(LocalDateTime.now());
        
        Refund savedRefund = refundRepository.save(refund);
        log.info("Refund request created for booking {} by user {}", booking.getId(), userEmail);
        
        return mapToDto(savedRefund);
    }

    public List<RefundResponseDto> getUserRefunds(String userEmail) {
        List<Refund> refunds = refundRepository.findByBooking_User_Email(userEmail);
        return refunds.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public RefundResponseDto getRefundByBooking(Long bookingId) {
        Refund refund = refundRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("No refund found for this booking"));
        return mapToDto(refund);
    }

    public Page<RefundResponseDto> getAllRefunds(Refund.RefundStatus status, Pageable pageable) {
        Page<Refund> refunds;
        if (status != null) {
            refunds = refundRepository.findByStatus(status, pageable);
        } else {
            refunds = refundRepository.findAll(pageable);
        }
        return refunds.map(this::mapToDto);
    }

    public RefundResponseDto approveRefund(Long refundId, String adminEmail) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund not found"));
        
        if (refund.getStatus() != Refund.RefundStatus.PENDING) {
            throw new BadRequestException("Only pending refunds can be approved");
        }
        
        // Make refund approval atomic - update both refund and booking in single transaction
        // Get the booking before processing
        Booking booking = refund.getBooking();
        
        try {
            // Update refund status to PROCESSING
            refund.setStatus(Refund.RefundStatus.PROCESSING);
            refund.setUpdatedAt(LocalDateTime.now());
            refundRepository.save(refund);
            
            // Simulate processing delay
            Thread.sleep(1000);
            
            // Update both entities atomically within the transaction
            refund.setStatus(Refund.RefundStatus.COMPLETED);
            refund.setProcessedAt(LocalDateTime.now());
            refund.setUpdatedAt(LocalDateTime.now());
            
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            
            // CRITICAL FIX #169: Update payment status to REFUNDED
            Payment payment = refund.getPayment();
            if (payment != null && "SUCCESS".equals(payment.getPaymentStatus())) {
                payment.setPaymentStatus("REFUNDED");
                paymentRepository.save(payment);
            }
            
            // Save both - if either fails, transaction will rollback both
            bookingRepository.save(booking);
            Refund savedRefund = refundRepository.save(refund);
            
            log.info("Refund {} approved by admin {} - booking {} cancelled", refundId, adminEmail, booking.getId());
            
            return mapToDto(savedRefund);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            // Transaction will rollback automatically on exception
            throw new RuntimeException("Refund processing interrupted - no changes made", e);
        } catch (Exception e) {
            // Any other exception will also rollback the transaction
            log.error("Failed to approve refund {} - transaction rolled back", refundId, e);
            throw new RuntimeException("Failed to process refund - please try again", e);
        }
    }

    public RefundResponseDto rejectRefund(Long refundId, String adminEmail, String reason) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund not found"));
        
        if (refund.getStatus() != Refund.RefundStatus.PENDING) {
            throw new BadRequestException("Only pending refunds can be rejected");
        }
        
        refund.setStatus(Refund.RefundStatus.REJECTED);
        refund.setProcessedAt(LocalDateTime.now());
        refund.setUpdatedAt(LocalDateTime.now());
        
        if (reason != null && !reason.isBlank()) {
            refund.setReason(refund.getReason() + " [Admin: " + reason + "]");
        }
        
        Refund savedRefund = refundRepository.save(refund);
        log.info("Refund {} rejected by admin {}", refundId, adminEmail);
        
        return mapToDto(savedRefund);
    }

    private RefundResponseDto mapToDto(Refund refund) {
        Booking booking = refund.getBooking();
        
        RefundResponseDto dto = new RefundResponseDto();
        dto.setId(refund.getId());
        dto.setBookingId(booking.getId());
        dto.setAmount(refund.getAmount().doubleValue());
        dto.setReason(refund.getReason());
        dto.setStatus(refund.getStatus().name());
        dto.setProcessedAt(refund.getProcessedAt());
        dto.setCreatedAt(refund.getCreatedAt());
        dto.setUpdatedAt(refund.getUpdatedAt());
        dto.setServiceName(booking.getService().getServiceName());
        dto.setBookingDate(booking.getScheduledAt().toLocalDate());
        dto.setCustomerName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName());
        dto.setCustomerEmail(booking.getUser().getEmail());
        
        return dto;
    }
}
