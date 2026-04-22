package com.bookkaro.controller;

import com.bookkaro.dto.*;
import com.bookkaro.model.Booking;
import com.bookkaro.model.Booking.BookingStatus;
import com.bookkaro.model.Booking.PaymentStatus;
import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import com.bookkaro.repository.BookingRepository;
import com.bookkaro.repository.ServiceRepository;
import com.bookkaro.repository.UserRepository;
import com.bookkaro.service.AuditLogService;
import com.bookkaro.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final com.bookkaro.service.BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingDto>> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        
        // Parse booking time (supports formats like "10:00 AM", "14:30", "2:30 PM")
        LocalTime bookingTime = parseBookingTime(request.getBookingTime());
        
        // Delegate business logic to BookingService
        Booking booking = bookingService.createBooking(
            request.getServiceId(),
            request.getAddressId(),
            request.getBookingDate(),
            bookingTime,
            request.getCouponCode(),
            email,
            request.getNotes()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", convertToDto(booking)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        org.springframework.data.domain.Page<Booking> bookingPage;
        if (status != null) {
            bookingPage = bookingRepository.findByUserIdAndStatus(user.getId(), status, 
                org.springframework.data.domain.PageRequest.of(page, size));
        } else {
            bookingPage = bookingRepository.findByUserId(user.getId(), 
                org.springframework.data.domain.PageRequest.of(page, size));
        }

        List<BookingDto> bookingDtos = bookingPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content", bookingDtos);
        response.put("currentPage", bookingPage.getNumber());
        response.put("totalPages", bookingPage.getTotalPages());
        response.put("totalElements", bookingPage.getTotalElements());
        response.put("size", bookingPage.getSize());

        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", response));
    }

    /**
     * Enhanced booking history with filters
     * GET /bookings/history?status=CONFIRMED&startDate=2025-01-01&endDate=2025-12-31&category=Plumbing&page=0&size=10
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBookingHistory(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all bookings first
        List<Booking> allBookings = bookingRepository.findByUserOrderByBookingDateDesc(user);
        
        // Apply filters
        List<Booking> filteredBookings = allBookings.stream()
                .filter(booking -> status == null || booking.getStatus() == status)
                .filter(booking -> startDate == null || !booking.getScheduledAt().toLocalDate().isBefore(startDate))
                .filter(booking -> endDate == null || !booking.getScheduledAt().toLocalDate().isAfter(endDate))
                .filter(booking -> category == null || 
                    (booking.getService().getCategory() != null && 
                     booking.getService().getCategory().getName().equalsIgnoreCase(category)))
                .collect(Collectors.toList());
        
        // Manual pagination
        int start = page * size;
        int end = Math.min(start + size, filteredBookings.size());
        List<Booking> paginatedBookings = filteredBookings.subList(start, end);
        
        List<BookingDto> bookingDtos = paginatedBookings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("bookings", bookingDtos);
        response.put("totalElements", filteredBookings.size());
        response.put("totalPages", (int) Math.ceil((double) filteredBookings.size() / size));
        response.put("currentPage", page);
        response.put("pageSize", size);

        return ResponseEntity.ok(ApiResponse.success("Booking history retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDto>> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check if user owns this booking or is the service provider
        if (!booking.getUser().getId().equals(user.getId()) && 
            !booking.getService().getVendor().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied"));
        }

        return ResponseEntity.ok(ApiResponse.success("Booking retrieved successfully", convertToDto(booking)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingDto>> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBookingStatusRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check authorization
        boolean isCustomer = booking.getUser().getId().equals(user.getId());
        boolean isVendor = booking.getService().getVendor().getId().equals(user.getId());

        if (!isCustomer && !isVendor) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied"));
        }

        // Validate status transitions
        BookingStatus newStatus = request.getStatus();
        BookingStatus currentStatus = booking.getStatus();

        if (isCustomer && newStatus == BookingStatus.CANCELLED && currentStatus == BookingStatus.PENDING) {
            booking.setStatus(newStatus);
        } else if (isVendor && (newStatus == BookingStatus.CONFIRMED || newStatus == BookingStatus.COMPLETED)) {
            // Prevent completing booking without payment
            if (newStatus == BookingStatus.COMPLETED && booking.getPaymentStatus() != PaymentStatus.PAID) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Cannot complete booking - payment not received"));
            }
            booking.setStatus(newStatus);
        } else {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid status transition"));
        }

        booking = bookingRepository.save(booking);
        
        // Create notification for customer about status change
        String notifTitle = "";
        String notifMessage = "";
        if (newStatus == BookingStatus.CONFIRMED) {
            notifTitle = "Booking Confirmed";
            notifMessage = String.format("Your booking for %s has been confirmed by the vendor. Scheduled for %s.",
                booking.getService().getServiceName(), booking.getBookingDate());
        } else if (newStatus == BookingStatus.COMPLETED) {
            notifTitle = "Booking Completed";
            notifMessage = String.format("Your booking for %s has been completed. Thank you for using our service!",
                booking.getService().getServiceName());
        } else if (newStatus == BookingStatus.CANCELLED) {
            notifTitle = "Booking Cancelled";
            notifMessage = String.format("Your booking for %s has been cancelled.",
                booking.getService().getServiceName());
        }
        
        if (!notifTitle.isEmpty()) {
            try {
                notificationService.createBookingNotification(
                    booking, 
                    "BOOKING_STATUS", 
                    notifTitle, 
                    notifMessage
                );
            } catch (Exception e) {
                // Log but don't fail the status update if notification fails
                System.err.println("Failed to create notification: " + e.getMessage());
            }
        }
        
        // Audit log for status update
        Map<String, Object> auditData = new HashMap<>();
        auditData.put("previousStatus", currentStatus.toString());
        auditData.put("newStatus", newStatus.toString());
        auditData.put("updatedBy", isVendor ? "vendor" : "customer");
        auditData.put("serviceId", booking.getService().getId());
        auditData.put("serviceName", booking.getService().getServiceName());
        auditLogService.log("BOOKING", booking.getId(), "UPDATE_STATUS", user.getId(), auditData);

        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", convertToDto(booking)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Only customer can cancel and only if pending
        if (!booking.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied"));
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Only pending bookings can be cancelled"));
        }

        BookingStatus previousStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        
        // Create cancellation notification
        try {
            notificationService.createBookingNotification(
                booking,
                "BOOKING_CANCELLED",
                "Booking Cancelled",
                String.format("Your booking for %s on %s has been cancelled.",
                    booking.getService().getServiceName(), booking.getBookingDate())
            );
        } catch (Exception e) {
            System.err.println("Failed to create cancellation notification: " + e.getMessage());
        }
        
        // Audit log for cancellation
        Map<String, Object> auditData = new HashMap<>();
        auditData.put("previousStatus", previousStatus.toString());
        auditData.put("reason", "Customer cancellation");
        auditData.put("serviceId", booking.getService().getId());
        auditData.put("serviceName", booking.getService().getServiceName());
        auditLogService.log("BOOKING", booking.getId(), "CANCEL", user.getId(), auditData);

        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", null));
    }

    /**
     * Enhanced cancellation with refund logic
     * PUT /bookings/{id}/cancel
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cancelBookingWithRefund(
            @PathVariable Long id,
            @Valid @RequestBody CancelBookingRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Only customer can cancel
        if (!booking.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied"));
        }

        // Only pending or confirmed bookings can be cancelled
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Only pending or confirmed bookings can be cancelled"));
        }

        // Update booking status to cancelled
        String previousStatus = booking.getStatus().toString();
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Log the cancellation
        auditLogService.logBookingCancellation(id, user.getId(), 
            request.getReason() != null ? request.getReason() : "Customer cancelled", 
            previousStatus);

        Map<String, Object> response = new HashMap<>();
        response.put("bookingId", booking.getId());
        response.put("status", "CANCELLED");
        response.put("message", "Booking cancelled successfully. To request a refund, please visit the Refunds section.");

        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", response));
    }

    /**
     * Reschedule booking
     * PUT /bookings/{id}/reschedule
     */
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<BookingDto>> rescheduleBooking(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleBookingRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Only customer can reschedule
        if (!booking.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied"));
        }

        // Only pending or confirmed bookings can be rescheduled
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Only pending or confirmed bookings can be rescheduled"));
        }

        // Validate new date is in the future
        LocalDateTime newBookingDateTime = LocalDateTime.of(request.getBookingDate(), request.getBookingTime());
        if (newBookingDateTime.isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Cannot reschedule to a past date/time"));
        }

        // Check availability (simple check - no double booking on same time)
        final Long bookingId = booking.getId();
        final LocalDate requestDate = request.getBookingDate();
        final LocalTime requestTime = request.getBookingTime();
        boolean isSlotAvailable = bookingRepository.findByServiceVendorEntityOrderByBookingDateDesc(booking.getService().getVendor())
                .stream()
                .noneMatch(b -> b.getScheduledAt().toLocalDate().equals(requestDate) 
                        && b.getScheduledAt().toLocalTime().equals(requestTime)
                        && !b.getId().equals(bookingId)
                        && (b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.CONFIRMED));
        
        if (!isSlotAvailable) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Selected time slot is not available"));
        }

        // Update booking
        booking.setScheduledAt(newBookingDateTime);
        Booking updatedBooking = bookingRepository.save(booking);

        return ResponseEntity.ok(ApiResponse.success("Booking rescheduled successfully", convertToDto(updatedBooking)));
    }

    /**
     * Get available time slots for a service on a specific date
     * GET /bookings/services/{serviceId}/availability?date=2025-01-15
     */
    @GetMapping("/services/{serviceId}/availability")
    public ResponseEntity<ApiResponse<List<AvailableSlot>>> getServiceAvailability(
            @PathVariable Long serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        Service service = serviceRepository.findByIdWithVendor(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // Get all bookings for this vendor on the requested date
        List<Booking> existingBookings = bookingRepository.findByServiceVendorEntityOrderByBookingDateDesc(service.getVendor())
                .stream()
                .filter(b -> b.getScheduledAt().toLocalDate().equals(date))
                .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.CONFIRMED)
                .collect(Collectors.toList());

        // Generate time slots (9 AM to 6 PM, 1-hour slots)
        List<AvailableSlot> slots = new ArrayList<>();
        for (int hour = 9; hour < 18; hour++) {
            LocalTime slotTime = LocalTime.of(hour, 0);
            LocalTime nextSlot = slotTime.plusHours(1);
            
            boolean isBooked = existingBookings.stream()
                    .anyMatch(b -> b.getScheduledAt().toLocalTime().equals(slotTime));
            
            slots.add(AvailableSlot.builder()
                    .startTime(slotTime)
                    .endTime(nextSlot)
                    .available(!isBooked)
                    .build());
        }

        return ResponseEntity.ok(ApiResponse.success("Availability retrieved successfully", slots));
    }

    @GetMapping("/vendor")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getVendorBookings(
            @RequestParam(required = false) BookingStatus status,
            Authentication authentication) {
        
        String email = authentication.getName();
        User vendor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> bookings;
        if (status != null) {
            bookings = bookingRepository.findByServiceVendorAndStatus(vendor, status);
        } else {
            bookings = bookingRepository.findByServiceVendorOrderByBookingDateDesc(vendor);
        }

        List<BookingDto> bookingDtos = bookings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Vendor bookings retrieved successfully", bookingDtos));
    }

    /**
     * Repeat/Clone a previous booking with new date/time
     * POST /bookings/{id}/repeat
     */
    @PostMapping("/{id}/repeat")
    public ResponseEntity<ApiResponse<BookingDto>> repeatBooking(
            @PathVariable Long id,
            @Valid @RequestBody RepeatBookingRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get original booking
        Booking originalBooking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Original booking not found"));

        // Verify user owns the original booking
        if (!originalBooking.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: You can only repeat your own bookings"));
        }

        // Validate the service is still available
        Service service = originalBooking.getService();
        if (!service.getIsAvailable() || service.getApprovalStatus() != Service.ApprovalStatus.APPROVED) {
            throw new RuntimeException("Service is no longer available for booking");
        }

        // Parse and validate new booking time
        LocalTime bookingTime = parseBookingTime(request.getBookingTime());
        LocalDateTime newBookingDateTime = LocalDateTime.of(request.getBookingDate(), bookingTime);
        
        if (newBookingDateTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book in the past. Please select a future date and time");
        }

        // Validate against service availability hours
        if (service.getAvailableFromTime() != null && service.getAvailableToTime() != null) {
            if (bookingTime.isBefore(service.getAvailableFromTime()) || 
                bookingTime.isAfter(service.getAvailableToTime())) {
                throw new RuntimeException(String.format(
                    "Booking time must be between %s and %s", 
                    service.getAvailableFromTime(), service.getAvailableToTime()
                ));
            }
        }

        // Clone the booking with new date/time
        LocalDateTime newScheduledAt = LocalDateTime.of(request.getBookingDate(), bookingTime);
        
        Booking newBooking = Booking.builder()
                .user(user)
                .vendor(service.getVendor())
                .service(service)
                .scheduledAt(newScheduledAt)
                .specialRequests(request.getNotes() != null ? request.getNotes() : originalBooking.getNotes())
                .priceTotal(service.getPrice()) // Use current price
                .status(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();

        newBooking = bookingRepository.save(newBooking);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking repeated successfully. Please proceed to payment.", convertToDto(newBooking)));
    }

    private BookingDto convertToDto(Booking booking) {
        BookingDto dto = new BookingDto();
        dto.setId(booking.getId());
        dto.setBookingReference(booking.getBookingReference());
        
        // Null-safe user handling
        if (booking.getUser() != null) {
            dto.setUserId(booking.getUser().getId());
            dto.setUserName(booking.getUser().getFullName());
            dto.setUserEmail(booking.getUser().getEmail());
        }
        
        // Null-safe service handling
        if (booking.getService() != null) {
            dto.setServiceId(booking.getService().getId());
            dto.setServiceName(booking.getServiceNameAtBooking() != null ? 
                booking.getServiceNameAtBooking() : booking.getService().getServiceName());
        }
        
        // Null-safe vendor handling
        if (booking.getVendor() != null) {
            dto.setVendorId(booking.getVendor().getId());
            dto.setVendorName(booking.getVendor().getBusinessName());
        }
        dto.setScheduledAt(booking.getScheduledAt());
        // Legacy fields for backward compatibility
        if (booking.getScheduledAt() != null) {
            dto.setBookingDate(booking.getScheduledAt().toLocalDate());
            dto.setBookingTime(booking.getScheduledAt().toLocalTime());
        }
        dto.setStatus(booking.getStatus().toString());
        dto.setPaymentStatus(booking.getPaymentStatus() != null ? 
            booking.getPaymentStatus().toString() : "UNPAID");
        dto.setPriceTotal(booking.getPriceTotal());
        dto.setTotalAmount(booking.getPriceTotal()); // Legacy field
        dto.setPriceCurrency(booking.getPriceCurrency());
        dto.setNotes(booking.getNotes());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }

    /**
     * Parse booking time from various formats:
     * - "10:00 AM" or "2:30 PM" (12-hour format with AM/PM)
     * - "14:30" or "09:00" (24-hour format)
     */
    private LocalTime parseBookingTime(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Booking time cannot be empty");
        }

        timeStr = timeStr.trim().toUpperCase();

        try {
            // Check if it contains AM/PM (12-hour format)
            if (timeStr.contains("AM") || timeStr.contains("PM")) {
                boolean isPM = timeStr.contains("PM");
                // Remove AM/PM and trim
                timeStr = timeStr.replace("AM", "").replace("PM", "").trim();

                // Parse hour and minute
                String[] parts = timeStr.split(":");
                int hour = Integer.parseInt(parts[0].trim());
                int minute = parts.length > 1 ? Integer.parseInt(parts[1].trim()) : 0;

                // Convert 12-hour to 24-hour
                if (isPM && hour != 12) {
                    hour += 12;
                } else if (!isPM && hour == 12) {
                    hour = 0;
                }

                return LocalTime.of(hour, minute);
            } else {
                // 24-hour format (e.g., "14:30")
                return LocalTime.parse(timeStr);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid booking time format: " + timeStr + 
                ". Expected format: '10:00 AM', '2:30 PM', or '14:30'");
        }
    }
}
