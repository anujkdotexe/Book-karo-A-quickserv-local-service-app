package com.bookkaro.service;

import com.bookkaro.constants.BookingConstants;
import com.bookkaro.exception.AvailabilityException;
import com.bookkaro.exception.BadRequestException;
import com.bookkaro.exception.BookingException;
import com.bookkaro.model.*;
import com.bookkaro.repository.AddressRepository;
import com.bookkaro.repository.BookingRepository;
import com.bookkaro.repository.ServiceRepository;
import com.bookkaro.repository.UserRepository;
import com.bookkaro.repository.VendorAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final VendorAvailabilityRepository vendorAvailabilityRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final CouponService couponService;

    /**
     * Create a booking with full validation and business logic
     * Handles city-based vendor matching, availability checking, and coupon application
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Booking createBooking(Long serviceId, Long addressId, LocalDate date, LocalTime timeSlot, String couponCode, String userEmail, String notes) {
        log.info("Creating booking for user: {}, service: {}", userEmail, serviceId);
        
        // Validate user and address
        User user = validateUser(userEmail);
        Address address = validateAddress(addressId, user);
        
        // Get selected service and find local vendor in user's city
        com.bookkaro.model.Service selectedService = serviceRepository.findByIdWithVendor(serviceId)
                .orElseThrow(() -> new BookingException("Service not found"));
        
        com.bookkaro.model.Service localService = findLocalVendorService(selectedService, address);
        
        // Validate service availability
        com.bookkaro.model.Service service = validateService(localService.getId());
        
        // Validate and parse booking time
        LocalDateTime bookingDateTime = validateBookingTime(date, timeSlot);
        
        // Validate against service hours
        validateServiceHours(service, timeSlot);
        
        // Check vendor availability
        validateVendorAvailability(service, date, timeSlot);
        
        // Prevent duplicate bookings
        validateNoDuplicateBooking(user, service, bookingDateTime);
        
        // Prevent vendor double-booking
        validateNoVendorConflict(service.getVendor(), bookingDateTime);
        
        // Apply coupon if provided
        BigDecimal finalAmount = service.getPrice();
        Coupon usedCoupon = null;
        BigDecimal discountApplied = BigDecimal.ZERO;
        
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            CouponService.CouponValidationResult validationResult = 
                couponService.validateCoupon(couponCode, finalAmount, user.getId());
            
            if (!validationResult.isValid()) {
                throw new BookingException("Coupon validation failed: " + validationResult.getMessage());
            }
            
            usedCoupon = validationResult.getCoupon();
            discountApplied = validationResult.getDiscountAmount();
            finalAmount = finalAmount.subtract(discountApplied);
        }
        
        // Create and save booking
        Booking booking = createBookingEntity(user, service, address, bookingDateTime, finalAmount, discountApplied, notes);
        Booking savedBooking = bookingRepository.save(booking);
        
        // Record coupon usage
        if (usedCoupon != null) {
            couponService.recordUsage(usedCoupon, user, savedBooking, service.getPrice(), discountApplied);
        }
        
        // Send notifications and log audit
        sendBookingNotifications(savedBooking);
        logBookingAudit(savedBooking);
        
        log.info("Booking created successfully with ID: {}", savedBooking.getId());
        return savedBooking;
    }
    
    /**
     * Find a local vendor in user's city offering the same service category
     */
    private com.bookkaro.model.Service findLocalVendorService(com.bookkaro.model.Service selectedService, Address address) {
        String userCity = address.getCity() != null ? address.getCity().trim() : null;
        
        if (userCity == null || selectedService.getCategoryLegacy() == null) {
            return selectedService;
        }
        
        // Find available services in user's city with same category
        List<com.bookkaro.model.Service> localServices = serviceRepository
                .findByCategoryAndCityAndIsAvailableTrue(
                    selectedService.getCategoryLegacy(), 
                    userCity, 
                    PageRequest.of(0, 10)
                ).getContent();
        
        // Filter for approved and available services
        com.bookkaro.model.Service localService = localServices.stream()
                .filter(s -> s.getApprovalStatus() == com.bookkaro.model.Service.ApprovalStatus.APPROVED)
                .filter(com.bookkaro.model.Service::getIsAvailable)
                .findFirst()
                .orElse(null);
        
        // If no local vendor found, reject booking
        if (localService == null) {
            String categoryName = selectedService.getCategoryLegacy() != null ? 
                selectedService.getCategoryLegacy() : "this category";
            throw new BadRequestException(String.format(
                "Sorry, we don't have any vendors offering %s services in %s yet. " +
                "Please check back later or try a different service category.", 
                categoryName, userCity
            ));
        }
        
        return localService;
    }
    private User validateUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new BookingException("User not found: " + email));
    }
    private com.bookkaro.model.Service validateService(Long serviceId) {
        com.bookkaro.model.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new BookingException("Service not found"));
        
        if (!service.getIsAvailable()) {
            throw new BadRequestException(BookingConstants.SERVICE_NOT_AVAILABLE_ERROR);
        }
        
        if (service.getApprovalStatus() != com.bookkaro.model.Service.ApprovalStatus.APPROVED) {
            throw new BadRequestException("Service is not approved for booking");
        }
        
        return service;
    }
    
    private Address validateAddress(Long addressId, User user) {
        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new BookingException("Address not found or does not belong to you"));
        return address;
    }
    
    private LocalDateTime validateBookingTime(LocalDate date, LocalTime timeSlot) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime bookingDateTime = LocalDateTime.of(date, timeSlot);
        
        if (bookingDateTime.isBefore(now)) {
            throw new BadRequestException(BookingConstants.BOOKING_PAST_TIME_ERROR);
        }
        
        if (bookingDateTime.isBefore(now.plusHours(BookingConstants.MIN_ADVANCE_HOURS))) {
            throw new BadRequestException(BookingConstants.BOOKING_ADVANCE_TIME_ERROR);
        }
        
        if (bookingDateTime.isAfter(now.plusDays(BookingConstants.MAX_ADVANCE_DAYS))) {
            throw new BadRequestException(BookingConstants.BOOKING_MAX_ADVANCE_ERROR);
        }
        
        return bookingDateTime;
    }
    
    private void validateServiceHours(com.bookkaro.model.Service service, LocalTime bookingTime) {
        if (service.getAvailableFromTime() != null && service.getAvailableToTime() != null) {
            if (bookingTime.isBefore(service.getAvailableFromTime())) {
                throw new BadRequestException(String.format(
                    "Booking time %s is before service start time %s", 
                    bookingTime, service.getAvailableFromTime()
                ));
            }
            if (bookingTime.isAfter(service.getAvailableToTime())) {
                throw new BadRequestException(String.format(
                    "Booking time %s is after service end time %s. Service available from %s to %s", 
                    bookingTime, service.getAvailableToTime(), 
                    service.getAvailableFromTime(), service.getAvailableToTime()
                ));
            }
        }
    }
    
    private void validateVendorAvailability(com.bookkaro.model.Service service, LocalDate date, LocalTime timeSlot) {
        Long vendorId = service.getVendor().getId();
        
        // Check vendor availability from vendor_availabilities table
        if (!isVendorAvailable(vendorId, date, timeSlot)) {
            throw new AvailabilityException(
                "Vendor is not available at the requested date and time. Please choose a different time slot."
            );
        }
        
        log.info("Vendor {} is available on {} at {}", vendorId, date, timeSlot);
    }
    
    private boolean isVendorAvailable(Long vendorId, LocalDate bookingDate, LocalTime bookingTime) {
        // Get day of week (0=Sunday, 6=Saturday)
        short dayOfWeek = (short) bookingDate.getDayOfWeek().getValue();
        if (dayOfWeek == 7) dayOfWeek = 0; // Convert Sunday from 7 to 0

        // Check recurring weekly availability
        List<VendorAvailability> recurringAvailabilities =
            vendorAvailabilityRepository.findRecurringAvailabilitiesByDay(vendorId, dayOfWeek);

        for (VendorAvailability availability : recurringAvailabilities) {
            if (availability.getIsAvailable() &&
                availability.getStartTime() != null &&
                availability.getEndTime() != null) {
                // Check if booking time falls within available time slot
                if (!bookingTime.isBefore(availability.getStartTime()) &&
                    !bookingTime.isAfter(availability.getEndTime())) {
                    return true;
                }
            }
        }

        // Check one-off availability slots
        LocalDateTime bookingDateTime = LocalDateTime.of(bookingDate, bookingTime);
        LocalDateTime dayStart = bookingDate.atStartOfDay();
        LocalDateTime dayEnd = bookingDate.atTime(23, 59, 59);

        List<VendorAvailability> oneOffAvailabilities =
            vendorAvailabilityRepository.findOneOffAvailabilities(vendorId, dayStart, dayEnd);

        for (VendorAvailability availability : oneOffAvailabilities) {
            if (availability.getIsAvailable() &&
                availability.getStartTs() != null &&
                availability.getEndTs() != null) {
                // Check if booking time falls within available time slot
                if (!bookingDateTime.isBefore(availability.getStartTs()) &&
                    !bookingDateTime.isAfter(availability.getEndTs())) {
                    return true;
                }
            }
        }

        return false;
    }
    
    private void validateNoDuplicateBooking(User user, com.bookkaro.model.Service service, LocalDateTime scheduledAt) {
        List<Booking> existingBookings = bookingRepository.findByUserAndServiceAndScheduledAt(
            user, service, scheduledAt
        );
        
        if (!existingBookings.isEmpty()) {
            throw new BookingException(
                "You already have a booking for this service at this date and time"
            );
        }
    }
    
    private void validateNoVendorConflict(Vendor vendor, LocalDateTime scheduledAt) {
        List<Booking> vendorBookings = bookingRepository.findByVendorAndScheduledAt(vendor, scheduledAt);
        
        // Check if vendor has any active bookings at this time
        boolean hasActiveBooking = vendorBookings.stream()
            .anyMatch(b -> b.getStatus() != Booking.BookingStatus.CANCELLED);
        
        if (hasActiveBooking) {
            throw new BookingException(
                "This vendor is already booked at this date and time. Please choose a different time"
            );
        }
    }
    private Booking createBookingEntity(User user, com.bookkaro.model.Service service, Address address, 
                                       LocalDateTime bookingDateTime, BigDecimal finalAmount, 
                                       BigDecimal discountAmount, String notes) {
        return Booking.builder()
                .user(user)
                .vendor(service.getVendor())
                .service(service)
                .address(address)
                .scheduledAt(bookingDateTime)
                .specialRequests(notes)
                .priceTotal(finalAmount)
                .status(Booking.BookingStatus.PENDING)
                .paymentStatus(Booking.PaymentStatus.UNPAID)
                .build();
    }
    private void sendBookingNotifications(Booking booking) {
        try {
            String message = String.format(BookingConstants.BOOKING_CREATED_NOTIFICATION, booking.getService().getServiceName(), booking.getScheduledAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm")));
            notificationService.createBookingNotification(booking, "BOOKING", "Booking Confirmed", message);
        } catch (Exception e) {
            log.error("Failed to send booking notification for booking ID: {}", booking.getId(), e);
        }
    }
    private void logBookingAudit(Booking booking) {
        try {
            Map<String, Object> auditData = new HashMap<>();
            auditData.put("serviceId", booking.getService().getId());
            auditData.put("serviceName", booking.getService().getServiceName());
            auditData.put("vendorId", booking.getVendor().getId());
            auditData.put("vendorName", booking.getVendor().getBusinessName());
            auditData.put("scheduledAt", booking.getScheduledAt().toString());
            auditData.put("amount", booking.getPriceTotal().toString());
            auditData.put("status", Booking.BookingStatus.PENDING.toString());
            
            auditLogService.log("BOOKING", booking.getId(), "CREATE", booking.getUser().getId(), auditData);
        } catch (Exception e) {
            log.error("Failed to log booking audit for booking ID: {}", booking.getId(), e);
        }
    }
    @Transactional
    public void cancelBooking(Long bookingId, String userEmail, String reason) {
        log.info("Cancelling booking ID: {} by user: {}", bookingId, userEmail);
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new BookingException("Booking not found"));
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BookingException("You can only cancel your own bookings");
        }
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BookingException("Only pending bookings can be cancelled");
        }
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        sendCancellationNotification(booking);
        logCancellationAudit(booking, reason);
        log.info("Booking {} cancelled successfully", bookingId);
    }
    private void sendCancellationNotification(Booking booking) {
        try {
            String message = String.format(BookingConstants.BOOKING_CANCELLED_NOTIFICATION, booking.getService().getServiceName(), booking.getScheduledAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm")));
            notificationService.createBookingNotification(booking, "BOOKING", "Booking Cancelled", message);
        } catch (Exception e) {
            log.error("Failed to send cancellation notification for booking ID: {}", booking.getId(), e);
        }
    }
    private void logCancellationAudit(Booking booking, String reason) {
        try {
            auditLogService.logBookingCancellation(booking.getId(), booking.getUser().getId(), reason, booking.getStatus().toString());
        } catch (Exception e) {
            log.error("Failed to log cancellation audit for booking ID: {}", booking.getId(), e);
        }
    }
}
