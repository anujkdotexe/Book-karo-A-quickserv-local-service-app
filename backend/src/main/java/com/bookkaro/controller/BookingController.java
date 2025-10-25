package com.bookkaro.controller;

import com.bookkaro.dto.*;
import com.bookkaro.model.Booking;
import com.bookkaro.model.Booking.BookingStatus;
import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import com.bookkaro.repository.BookingRepository;
import com.bookkaro.repository.ServiceRepository;
import com.bookkaro.repository.UserRepository;
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

    @PostMapping
    public ResponseEntity<ApiResponse<BookingDto>> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Service service = serviceRepository.findByIdWithVendor(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // Validate service is available and approved
        if (!service.getIsAvailable()) {
            throw new RuntimeException("Service is not available for booking");
        }
        
        if (service.getApprovalStatus() != Service.ApprovalStatus.APPROVED) {
            throw new RuntimeException("Service is not approved for booking");
        }

        // Parse booking time (supports formats like "10:00 AM", "14:30", "2:30 PM")
        LocalTime bookingTime = parseBookingTime(request.getBookingTime());

        // Validate booking date and time are in the future
        LocalDateTime bookingDateTime = LocalDateTime.of(request.getBookingDate(), bookingTime);
        if (bookingDateTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book in the past. Please select a future date and time");
        }

        // Validate booking time against service availability
        if (service.getAvailableFromTime() != null && service.getAvailableToTime() != null) {
            if (bookingTime.isBefore(service.getAvailableFromTime())) {
                throw new RuntimeException(String.format(
                    "Booking time %s is before service start time %s", 
                    bookingTime, service.getAvailableFromTime()
                ));
            }
            if (bookingTime.isAfter(service.getAvailableToTime())) {
                throw new RuntimeException(String.format(
                    "Booking time %s is after service end time %s. Service available from %s to %s", 
                    bookingTime, service.getAvailableToTime(), 
                    service.getAvailableFromTime(), service.getAvailableToTime()
                ));
            }
        }

        // Create booking with total amount from service price
        Booking booking = Booking.builder()
                .user(user)
                .service(service)
                .bookingDate(request.getBookingDate())
                .bookingTime(bookingTime)
                .notes(request.getNotes())
                .totalAmount(service.getPrice())
                .status(BookingStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", convertToDto(booking)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingDto>>> getUserBookings(
            @RequestParam(required = false) BookingStatus status,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> bookings;
        if (status != null) {
            bookings = bookingRepository.findByUserAndStatus(user, status);
        } else {
            bookings = bookingRepository.findByUserOrderByBookingDateDesc(user);
        }

        List<BookingDto> bookingDtos = bookings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookingDtos));
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
                .filter(booking -> startDate == null || !booking.getBookingDate().isBefore(startDate))
                .filter(booking -> endDate == null || !booking.getBookingDate().isAfter(endDate))
                .filter(booking -> category == null || booking.getService().getCategory().equalsIgnoreCase(category))
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
            booking.setStatus(newStatus);
        } else {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid status transition"));
        }

        booking = bookingRepository.save(booking);

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

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

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
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

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
        boolean isSlotAvailable = bookingRepository.findByServiceVendorEntityOrderByBookingDateDesc(booking.getService().getVendor())
                .stream()
                .noneMatch(b -> b.getBookingDate().equals(request.getBookingDate()) 
                        && b.getBookingTime().equals(request.getBookingTime())
                        && !b.getId().equals(bookingId)
                        && (b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.CONFIRMED));
        
        if (!isSlotAvailable) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Selected time slot is not available"));
        }

        // Update booking
        booking.setBookingDate(request.getBookingDate());
        booking.setBookingTime(request.getBookingTime());
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
                .filter(b -> b.getBookingDate().equals(date))
                .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.CONFIRMED)
                .collect(Collectors.toList());

        // Generate time slots (9 AM to 6 PM, 1-hour slots)
        List<AvailableSlot> slots = new ArrayList<>();
        for (int hour = 9; hour < 18; hour++) {
            LocalTime slotTime = LocalTime.of(hour, 0);
            LocalTime nextSlot = slotTime.plusHours(1);
            
            boolean isBooked = existingBookings.stream()
                    .anyMatch(b -> b.getBookingTime().equals(slotTime));
            
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
        Booking newBooking = Booking.builder()
                .user(user)
                .service(service)
                .bookingDate(request.getBookingDate())
                .bookingTime(bookingTime)
                .notes(request.getNotes() != null ? request.getNotes() : originalBooking.getNotes())
                .totalAmount(service.getPrice()) // Use current price
                .status(BookingStatus.PENDING)
                .build();

        newBooking = bookingRepository.save(newBooking);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking repeated successfully. Please proceed to payment.", convertToDto(newBooking)));
    }

    private BookingDto convertToDto(Booking booking) {
        BookingDto dto = new BookingDto();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUser().getId());
        dto.setUserName(booking.getUser().getFullName());
        dto.setUserEmail(booking.getUser().getEmail());
        dto.setServiceId(booking.getService().getId());
        dto.setServiceName(booking.getService().getServiceName());
        dto.setVendorName(booking.getService().getVendor().getBusinessName());
        dto.setBookingDate(booking.getBookingDate());
        dto.setBookingTime(booking.getBookingTime());
        dto.setStatus(booking.getStatus().toString());
        dto.setTotalAmount(booking.getTotalAmount());
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
