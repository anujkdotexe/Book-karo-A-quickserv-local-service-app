package com.bookkaro.service;

import com.bookkaro.dto.RefundRequestDto;
import com.bookkaro.dto.RefundResponseDto;
import com.bookkaro.exception.ResourceNotFoundException;
import com.bookkaro.model.Booking;
import com.bookkaro.model.Refund;
import com.bookkaro.repository.BookingRepository;
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

    public BigDecimal calculateRefundAmount(Booking booking) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime bookingDateTime = booking.getBookingDate().atTime(booking.getBookingTime());
        Duration timeUntilBooking = Duration.between(now, bookingDateTime);
        
        long hoursUntilBooking = timeUntilBooking.toHours();
        BigDecimal totalAmount = booking.getTotalAmount();
        
        if (hoursUntilBooking >= 24) {
            return totalAmount;
        } else if (hoursUntilBooking >= 12) {
            return totalAmount.multiply(BigDecimal.valueOf(0.5));
        } else {
            return BigDecimal.ZERO;
        }
    }

    public RefundResponseDto requestRefund(String userEmail, RefundRequestDto request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You can only request refunds for your own bookings");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot refund completed bookings");
        }
        
        refundRepository.findByBookingId(booking.getId()).ifPresent(refund -> {
            throw new RuntimeException("Refund request already exists for this booking");
        });
        
        BigDecimal refundAmount = calculateRefundAmount(booking);
        
        if (refundAmount.compareTo(BigDecimal.ZERO) == 0) {
            throw new RuntimeException("No refund available. Cancellations must be made at least 12 hours before booking time.");
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
            throw new RuntimeException("Only pending refunds can be approved");
        }
        
        refund.setStatus(Refund.RefundStatus.PROCESSING);
        refund.setUpdatedAt(LocalDateTime.now());
        refundRepository.save(refund);
        
        try {
            Thread.sleep(1000);
            
            refund.setStatus(Refund.RefundStatus.COMPLETED);
            refund.setProcessedAt(LocalDateTime.now());
            refund.setUpdatedAt(LocalDateTime.now());
            
            Booking booking = refund.getBooking();
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            
            Refund savedRefund = refundRepository.save(refund);
            log.info("Refund {} approved by admin {}", refundId, adminEmail);
            
            return mapToDto(savedRefund);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Refund processing interrupted", e);
        }
    }

    public RefundResponseDto rejectRefund(Long refundId, String adminEmail, String reason) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund not found"));
        
        if (refund.getStatus() != Refund.RefundStatus.PENDING) {
            throw new RuntimeException("Only pending refunds can be rejected");
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
        dto.setBookingDate(booking.getBookingDate());
        dto.setCustomerName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName());
        dto.setCustomerEmail(booking.getUser().getEmail());
        
        return dto;
    }
}
