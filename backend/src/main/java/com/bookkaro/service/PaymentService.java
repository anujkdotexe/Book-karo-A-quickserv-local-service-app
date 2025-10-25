package com.bookkaro.service;

import com.bookkaro.dto.PaymentRequest;
import com.bookkaro.dto.PaymentResponse;
import com.bookkaro.model.Booking;
import com.bookkaro.model.Payment;
import com.bookkaro.model.User;
import com.bookkaro.repository.BookingRepository;
import com.bookkaro.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final MockPaymentGateway mockPaymentGateway;

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request, User user) {
        // Validate payment method-specific requirements
        validatePaymentMethodRequirements(request);
        
        // Validate booking
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify user owns this booking
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to pay for this booking");
        }
        
        // Validate booking status - only pending/confirmed bookings can be paid
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot pay for a cancelled booking");
        }
        
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("Booking already completed");
        }
        
        // Check if payment already exists
        if (paymentRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new RuntimeException("Payment already processed for this booking");
        }
        
        // Validate amount matches booking total
        if (request.getAmount().compareTo(booking.getTotalAmount()) != 0) {
            throw new RuntimeException("Payment amount does not match booking total");
        }
        
        // Validate amount is positive
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }

        // Create payment record
        Payment payment = Payment.builder()
                .booking(booking)
                .user(user)
                .method(request.getMethod())
                .amount(request.getAmount())
                .status(Payment.PaymentStatus.PROCESSING)
                .build();
        
        payment = paymentRepository.save(payment);

        // Process payment based on method - all simulated
        Map<String, Object> gatewayResponse;
        
        if (request.getMethod() == Payment.PaymentMethod.CASH_ON_DELIVERY) {
            gatewayResponse = processCODPayment();
        } else {
            // Process through simulated payment gateway (UPI, Card, Net Banking)
            Map<String, String> paymentDetails = buildPaymentDetails(request);
            gatewayResponse = mockPaymentGateway.processPayment(request.getMethod(), paymentDetails);
        }

        // Update payment based on gateway response
        boolean success = (boolean) gatewayResponse.get("success");
        
        if (success) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setTransactionId((String) gatewayResponse.get("transactionId"));
            payment.setPaymentDate(LocalDateTime.now());
            
            // Update booking status
            if (request.getMethod() == Payment.PaymentMethod.CASH_ON_DELIVERY) {
                booking.setStatus(Booking.BookingStatus.CONFIRMED);
            } else {
                booking.setStatus(Booking.BookingStatus.CONFIRMED);
            }
            bookingRepository.save(booking);
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
        }
        
        payment.setGatewayResponse((String) gatewayResponse.get("gatewayResponse"));
        payment = paymentRepository.save(payment);

        return convertToResponse(payment, (String) gatewayResponse.get("message"));
    }

    public List<PaymentResponse> getUserPayments(User user) {
        List<Payment> payments = paymentRepository.findByUserOrderByCreatedAtDesc(user);
        return payments.stream()
                .map(p -> convertToResponse(p, null))
                .collect(Collectors.toList());
    }

    public PaymentResponse getPaymentByBookingId(Long bookingId, User requestingUser) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found for booking"));
        
        // Verify user owns this payment/booking
        if (!payment.getUser().getId().equals(requestingUser.getId())) {
            throw new RuntimeException("Access denied: You can only view your own payments");
        }
        
        return convertToResponse(payment, null);
    }

    // Private helper methods

    private Map<String, Object> processCODPayment() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("transactionId", "COD" + System.currentTimeMillis());
        response.put("status", "SUCCESS");
        response.put("message", "Booking confirmed. Payment will be collected on delivery");
        response.put("gatewayResponse", "Cash on Delivery selected");
        return response;
    }

    private Map<String, String> buildPaymentDetails(PaymentRequest request) {
        Map<String, String> details = new HashMap<>();
        
        switch (request.getMethod()) {
            case UPI:
                details.put("upiId", request.getUpiId());
                break;
            case CREDIT_CARD:
            case DEBIT_CARD:
                details.put("cardNumber", request.getCardNumber());
                details.put("cardHolder", request.getCardHolderName());
                details.put("expiry", request.getExpiryMonth() + "/" + request.getExpiryYear());
                details.put("cvv", request.getCvv());
                break;
            case NET_BANKING:
                details.put("bankCode", request.getBankCode());
                break;
            case CASH_ON_DELIVERY:
                // No additional details needed
                break;
        }
        
        return details;
    }

    private void validatePaymentMethodRequirements(PaymentRequest request) {
        switch (request.getMethod()) {
            case UPI:
                if (request.getUpiId() == null || request.getUpiId().trim().isEmpty()) {
                    throw new RuntimeException("UPI ID is required for UPI payment");
                }
                break;
            case CREDIT_CARD:
            case DEBIT_CARD:
                if (request.getCardNumber() == null || request.getCardNumber().trim().isEmpty()) {
                    throw new RuntimeException("Card number is required for card payment");
                }
                if (request.getCardHolderName() == null || request.getCardHolderName().trim().isEmpty()) {
                    throw new RuntimeException("Card holder name is required for card payment");
                }
                if (request.getExpiryMonth() == null || request.getExpiryMonth().trim().isEmpty()) {
                    throw new RuntimeException("Expiry month is required for card payment");
                }
                if (request.getExpiryYear() == null || request.getExpiryYear().trim().isEmpty()) {
                    throw new RuntimeException("Expiry year is required for card payment");
                }
                if (request.getCvv() == null || request.getCvv().trim().isEmpty()) {
                    throw new RuntimeException("CVV is required for card payment");
                }
                // Validate card expiry date
                try {
                    int month = Integer.parseInt(request.getExpiryMonth());
                    int year = Integer.parseInt(request.getExpiryYear());
                    int currentYear = java.time.Year.now().getValue();
                    int currentMonth = java.time.LocalDate.now().getMonthValue();
                    
                    if (year < currentYear || (year == currentYear && month < currentMonth)) {
                        throw new RuntimeException("Card has expired");
                    }
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Invalid expiry date format");
                }
                break;
            case NET_BANKING:
                if (request.getBankCode() == null || request.getBankCode().trim().isEmpty()) {
                    throw new RuntimeException("Bank code is required for net banking payment");
                }
                break;
            case CASH_ON_DELIVERY:
                // No additional validation needed
                break;
        }
    }

    private PaymentResponse convertToResponse(Payment payment, String customMessage) {
        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .bookingId(payment.getBooking().getId())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .method(payment.getMethod().toString())
                .status(payment.getStatus().toString())
                .message(customMessage != null ? customMessage : "Payment " + payment.getStatus().toString().toLowerCase())
                .paymentDate(payment.getPaymentDate())
                .gatewayResponse(payment.getGatewayResponse())
                .build();
    }
}
