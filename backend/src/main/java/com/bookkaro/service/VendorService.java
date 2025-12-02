package com.bookkaro.service;
import com.bookkaro.dto.BookingDto;
import com.bookkaro.dto.CreateServiceRequest;
import com.bookkaro.dto.ServiceDto;
import com.bookkaro.dto.UpdateServiceRequest;
import com.bookkaro.dto.VendorDashboardStats;
import com.bookkaro.exception.BadRequestException;
import com.bookkaro.exception.ConflictException;
import com.bookkaro.exception.UnauthorizedException;
import com.bookkaro.model.Booking;
import com.bookkaro.model.CartItem;
import com.bookkaro.model.Category;
import com.bookkaro.model.Vendor;
import com.bookkaro.model.Review;
import com.bookkaro.repository.BookingRepository;
import com.bookkaro.repository.CartItemRepository;
import com.bookkaro.repository.CategoryRepository;
import com.bookkaro.repository.ServiceRepository;
import com.bookkaro.repository.VendorRepository;
import com.bookkaro.repository.VendorAvailabilityRepository;
import com.bookkaro.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VendorService {

    private final VendorRepository vendorRepository;
    private final BookingRepository bookingRepository;
    private final CartItemRepository cartItemRepository;
    private final ServiceRepository serviceRepository;
    private final CategoryRepository categoryRepository;
    private final VendorAvailabilityRepository availabilityRepository;
    private final ReviewRepository reviewRepository;
    private final AuditLogService auditLogService;

    /**
     * Get vendor dashboard statistics
     */
    public VendorDashboardStats getDashboardStats(Long userId) {
        Vendor vendor = getVendorByUserId(userId);
        
        List<com.bookkaro.model.Service> vendorServices = serviceRepository.findByVendorId(vendor.getId());
        List<Long> serviceIds = vendorServices.stream().map(com.bookkaro.model.Service::getId).collect(Collectors.toList());
        
        // Get all bookings for vendor's services
        List<Booking> allBookings = serviceIds.isEmpty() ? new ArrayList<>() : 
            bookingRepository.findByServiceIdIn(serviceIds);
        
        // Calculate statistics
        long totalBookings = allBookings.size();
        long pendingBookings = allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.PENDING).count();
        long confirmedBookings = allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED).count();
        long completedBookings = allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED).count();
        
        long totalServices = vendorServices.size();
        long activeServices = vendorServices.stream().filter(com.bookkaro.model.Service::getIsAvailable).count();
        
        // Calculate revenue
        BigDecimal totalRevenue = allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
            .map(b -> b.getService().getPrice())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        BigDecimal monthlyRevenue = allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
            .filter(b -> b.getCreatedAt().isAfter(monthStart))
            .map(b -> b.getService().getPrice())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate average rating
        double averageRating = vendor.getAverageRating() != null ? 
            vendor.getAverageRating().doubleValue() : 0.0;
        
        // Count availability slots
        int availabilitySlots = availabilityRepository.findByVendorId(vendor.getId()).size();
        
        // Calculate average response time (time from PENDING to CONFIRMED)
        String avgResponseTime = calculateAvgResponseTime(allBookings);
        
        // Get recent bookings (last 5)
        List<VendorDashboardStats.RecentBooking> recentBookings = allBookings.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(5)
            .map(booking -> VendorDashboardStats.RecentBooking.builder()
                .id(booking.getId())
                .customerName(booking.getUser().getFullName())
                .serviceName(booking.getService().getServiceName())
                .status(booking.getStatus().toString())
                .bookingDate(booking.getScheduledAt() != null 
                    ? booking.getScheduledAt().toLocalDate().toString() 
                    : booking.getCreatedAt().toLocalDate().toString())
                .price(booking.getService().getPrice())
                .build())
            .collect(Collectors.toList());
        
        // Get top performing services
        List<VendorDashboardStats.ServicePerformance> topServices = vendorServices.stream()
            .map(service -> {
                long bookingCount = allBookings.stream()
                    .filter(b -> b.getService().getId().equals(service.getId()))
                    .count();
                BigDecimal revenue = allBookings.stream()
                    .filter(b -> b.getService().getId().equals(service.getId()))
                    .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                    .map(b -> b.getService().getPrice())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                return VendorDashboardStats.ServicePerformance.builder()
                    .serviceId(service.getId())
                    .serviceName(service.getServiceName())
                    .bookingCount(bookingCount)
                    .revenue(revenue)
                    .averageRating(service.getAverageRating() != null ? 
                        service.getAverageRating().doubleValue() : 0.0)
                    .build();
            })
            .sorted((a, b) -> Long.compare(b.getBookingCount(), a.getBookingCount()))
            .limit(5)
            .collect(Collectors.toList());
        
        // Get weekly revenue data (last 7 days)
        List<VendorDashboardStats.RevenueData> weeklyRevenue = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            BigDecimal dayRevenue = allBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED)
                .filter(b -> b.getCreatedAt().isAfter(startOfDay) && b.getCreatedAt().isBefore(endOfDay))
                .map(b -> b.getService().getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long dayBookings = allBookings.stream()
                .filter(b -> b.getCreatedAt().isAfter(startOfDay) && b.getCreatedAt().isBefore(endOfDay))
                .count();
            
            weeklyRevenue.add(VendorDashboardStats.RevenueData.builder()
                .date(date.format(formatter))
                .amount(dayRevenue)
                .bookings(dayBookings)
                .build());
        }
        
        return VendorDashboardStats.builder()
            .totalBookings(totalBookings)
            .pendingBookings(pendingBookings)
            .confirmedBookings(confirmedBookings)
            .completedBookings(completedBookings)
            .totalServices(totalServices)
            .activeServices(activeServices)
            .totalRevenue(totalRevenue)
            .monthlyRevenue(monthlyRevenue)
            .averageRating(averageRating)
            .totalReviews(vendor.getTotalReviews().longValue())
            .availabilitySlots(availabilitySlots)
            .avgResponseTime(avgResponseTime)
            .recentBookings(recentBookings)
            .topServices(topServices)
            .weeklyRevenue(weeklyRevenue)
            .build();
    }

    /**
     * Calculate average response time from PENDING to CONFIRMED
     * Note: Using updatedAt as approximation since we don't track status change timestamps
     */
    private String calculateAvgResponseTime(List<Booking> bookings) {
        List<Booking> confirmedBookings = bookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED || 
                         b.getStatus() == Booking.BookingStatus.COMPLETED)
            .collect(Collectors.toList());
        
        if (confirmedBookings.isEmpty()) {
            return "N/A";
        }
        
        // Calculate average time difference between createdAt and updatedAt
        // This is an approximation - ideally we'd track status change timestamps
        long totalMinutes = confirmedBookings.stream()
            .filter(b -> b.getUpdatedAt() != null)
            .mapToLong(b -> java.time.Duration.between(b.getCreatedAt(), b.getUpdatedAt()).toMinutes())
            .sum();
        
        long avgMinutes = totalMinutes / Math.max(confirmedBookings.size(), 1);
        
        // Format as hours, minutes, or days
        if (avgMinutes < 60) {
            return avgMinutes + "m";
        } else if (avgMinutes < 1440) { // Less than 24 hours
            double hours = avgMinutes / 60.0;
            return String.format("%.1fh", hours);
        } else {
            double days = avgMinutes / 1440.0;
            return String.format("%.1fd", days);
        }
    }

    /**
     * Get vendor by user ID
     */
    public Vendor getVendorByUserId(Long userId) {
        return vendorRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Vendor profile not found for user"));
    }

    /**
     * Get vendor bookings
     */
    public List<BookingDto> getVendorBookings(Long userId, String status) {
        Vendor vendor = getVendorByUserId(userId);
        List<com.bookkaro.model.Service> vendorServices = serviceRepository.findByVendorId(vendor.getId());
        List<Long> serviceIds = vendorServices.stream().map(com.bookkaro.model.Service::getId).collect(Collectors.toList());
        
        if (serviceIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<Booking> bookings = bookingRepository.findByServiceIdIn(serviceIds);
        
        if (status != null && !status.equals("ALL")) {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status);
            bookings = bookings.stream()
                .filter(b -> b.getStatus() == bookingStatus)
                .collect(Collectors.toList());
        }
        
        return bookings.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * Get vendor bookings with pagination
     */
    public Map<String, Object> getVendorBookingsPaginated(Long userId, String statusStr, int page, int size) {
        Vendor vendor = getVendorByUserId(userId);
        
        List<com.bookkaro.model.Service> vendorServices = serviceRepository.findByVendorId(vendor.getId());
        List<Long> serviceIds = vendorServices.stream().map(com.bookkaro.model.Service::getId).collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        
        if (serviceIds.isEmpty()) {
            response.put("content", new ArrayList<>());
            response.put("currentPage", 0);
            response.put("totalPages", 0);
            response.put("totalElements", 0L);
            response.put("size", size);
            return response;
        }
        
        List<Booking> allBookings = bookingRepository.findByServiceIdIn(serviceIds);
        
        // Filter by status if provided
        if (statusStr != null && !statusStr.isEmpty() && !statusStr.equals("ALL")) {
            try {
                Booking.BookingStatus status = Booking.BookingStatus.valueOf(statusStr.toUpperCase());
                allBookings = allBookings.stream()
                    .filter(b -> b.getStatus() == status)
                    .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid status, return all bookings
            }
        }
        
        // Sort by most recent first
        allBookings.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        
        // Manual pagination
        int totalElements = allBookings.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, totalElements);
        
        List<Booking> pageBookings = startIndex < totalElements ? 
            allBookings.subList(startIndex, endIndex) : new ArrayList<>();
        
        List<BookingDto> bookingDtos = pageBookings.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        
        response.put("content", bookingDtos);
        response.put("currentPage", page);
        response.put("totalPages", totalPages);
        response.put("totalElements", (long) totalElements);
        response.put("size", size);
        
        return response;
    }
    
    /**
     * Convert Booking entity to BookingDto
     */
    private BookingDto convertToDto(Booking booking) {
        LocalDateTime scheduledTime = booking.getScheduledAt() != null 
            ? booking.getScheduledAt() 
            : booking.getCreatedAt();
            
        return BookingDto.builder()
            .id(booking.getId())
            .userId(booking.getUser().getId())
            .userName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName())
            .userEmail(booking.getUser().getEmail())
            .serviceId(booking.getService().getId())
            .serviceName(booking.getService().getServiceName())
            .vendorId(booking.getService().getVendor().getId())
            .vendorName(booking.getService().getVendor().getBusinessName())
            .bookingDate(scheduledTime.toLocalDate())
            .bookingTime(scheduledTime.toLocalTime())
            .status(booking.getStatus().name())
            .totalAmount(booking.getPriceTotal())
            .notes(booking.getNotes())
            .createdAt(booking.getCreatedAt())
            .updatedAt(booking.getUpdatedAt())
            .build();
    }

    /**
     * Update booking status (accept/reject/complete)
     */
    @Transactional
    public BookingDto updateBookingStatus(Long userId, Long bookingId, String newStatus) {
        Vendor vendor = getVendorByUserId(userId);
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify booking belongs to vendor's services
        if (!booking.getService().getVendor().getId().equals(vendor.getId())) {
            throw new UnauthorizedException("Unauthorized: Booking does not belong to your services");
        }
        
        Booking.BookingStatus currentStatus = booking.getStatus();
        Booking.BookingStatus newBookingStatus;
        
        try {
            newBookingStatus = Booking.BookingStatus.valueOf(newStatus);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid booking status: " + newStatus);
        }
        
        // Validate status transitions
        if (currentStatus == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot update a cancelled booking");
        }
        
        if (currentStatus == Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot update a completed booking");
        }
        
        // Vendors can only set: CONFIRMED, COMPLETED, CANCELLED
        if (newBookingStatus != Booking.BookingStatus.CONFIRMED && 
            newBookingStatus != Booking.BookingStatus.COMPLETED && 
            newBookingStatus != Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("Invalid status transition. Vendors can only set: CONFIRMED, COMPLETED, or CANCELLED");
        }
        
        // PENDING -> CONFIRMED/CANCELLED
        // CONFIRMED -> COMPLETED
        if (currentStatus == Booking.BookingStatus.PENDING) {
            if (newBookingStatus != Booking.BookingStatus.CONFIRMED && 
                newBookingStatus != Booking.BookingStatus.CANCELLED) {
                throw new BadRequestException("Pending bookings can only be confirmed or cancelled");
            }
        } else if (currentStatus == Booking.BookingStatus.CONFIRMED) {
            if (newBookingStatus != Booking.BookingStatus.COMPLETED) {
                throw new BadRequestException("Confirmed bookings can only be marked as completed");
            }
        }
        
        booking.setStatus(newBookingStatus);
        Booking savedBooking = bookingRepository.save(booking);
        return convertToDto(savedBooking);
    }

    /**
     * Get vendor services
     */
    public List<ServiceDto> getVendorServices(Long userId) {
        Vendor vendor = getVendorByUserId(userId);
        List<com.bookkaro.model.Service> services = serviceRepository.findByVendorId(vendor.getId());
        return services.stream()
                .map(ServiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Create new service
     * Validates service city matches vendor city
     */
    @Transactional
    public com.bookkaro.model.Service createService(Long userId, CreateServiceRequest request) {
        Vendor vendor = getVendorByUserId(userId);
        
        // Validate price is positive
        if (request.getPrice() == null || request.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Price must be greater than 0");
        }
        
        // Get category
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        // Validate service city matches vendor city
        if (request.getCity() != null && vendor.getCity() != null) {
            if (!request.getCity().equalsIgnoreCase(vendor.getCity())) {
                throw new BadRequestException(String.format(
                    "Service city '%s' must match vendor city '%s'. Vendors can only create services in their own city.",
                    request.getCity(), vendor.getCity()
                ));
            }
        }
        
        // Create service entity
        com.bookkaro.model.Service service = com.bookkaro.model.Service.builder()
            .vendor(vendor)
            .category(category)
            .serviceName(request.getServiceName())
            .description(request.getDescription())
            .price(request.getPrice())
            .city(request.getCity() != null ? request.getCity() : vendor.getCity())
            .address(request.getLocation()) // location maps to address field
            .durationMinutes(request.getEstimatedDuration())
            .isAvailable(false) // New services are not available until approved
            .approvalStatus(com.bookkaro.model.Service.ApprovalStatus.PENDING)
            .build();
        
        service = serviceRepository.save(service);
        
        // Audit log for service creation
        Map<String, Object> auditData = new HashMap<>();
        auditData.put("serviceName", service.getServiceName());
        auditData.put("categoryId", category.getId());
        auditData.put("categoryName", category.getName());
        auditData.put("price", service.getPrice());
        auditData.put("city", service.getCity());
        auditData.put("status", "PENDING_APPROVAL");
        auditLogService.log("SERVICE", service.getId(), "CREATE", userId, auditData);
        
        return service;
    }

    /**
     * Update service
     * Validates service city matches vendor city (also applies to updates)
     */
    @Transactional
    public com.bookkaro.model.Service updateService(Long userId, Long serviceId, UpdateServiceRequest request) {
        Vendor vendor = getVendorByUserId(userId);
        com.bookkaro.model.Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        
        // Verify service has vendor assigned
        if (service.getVendor() == null) {
            throw new RuntimeException("Service has no vendor assigned");
        }
        
        // Verify service belongs to vendor
        if (!service.getVendor().getId().equals(vendor.getId())) {
            throw new UnauthorizedException("Unauthorized: Service does not belong to you");
        }
        
        // Validate if city is being changed, it matches vendor city
        if (request.getCity() != null && vendor.getCity() != null) {
            if (!request.getCity().equalsIgnoreCase(vendor.getCity())) {
                throw new RuntimeException(String.format(
                    "Service city '%s' must match vendor city '%s'. Vendors can only create services in their own city.",
                    request.getCity(), vendor.getCity()
                ));
            }
        }
        
        // Update category if provided
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
            service.setCategory(category);
        }
        
        // Update fields if provided
        if (request.getServiceName() != null) {
            service.setServiceName(request.getServiceName());
        }
        if (request.getDescription() != null) {
            service.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            service.setPrice(request.getPrice());
        }
        if (request.getCity() != null) {
            service.setCity(request.getCity());
        }
        if (request.getLocation() != null) {
            service.setAddress(request.getLocation()); // location maps to address field
        }
        if (request.getEstimatedDuration() != null) {
            service.setDurationMinutes(request.getEstimatedDuration());
        }
        if (request.getIsAvailable() != null) {
            // SECURITY: Only allow toggling availability if service is APPROVED
            if (service.getApprovalStatus() != com.bookkaro.model.Service.ApprovalStatus.APPROVED) {
                throw new BadRequestException("Cannot change availability: Service must be approved by admin first");
            }
            service.setIsAvailable(request.getIsAvailable());
        }
        
        service = serviceRepository.save(service);
        
        // Audit log for service update
        Map<String, Object> auditData = new HashMap<>();
        auditData.put("serviceId", serviceId);
        auditData.put("serviceName", service.getServiceName());
        if (request.getServiceName() != null) auditData.put("updatedName", request.getServiceName());
        if (request.getPrice() != null) auditData.put("updatedPrice", request.getPrice());
        if (request.getIsAvailable() != null) auditData.put("updatedAvailability", request.getIsAvailable());
        auditLogService.log("SERVICE", serviceId, "UPDATE", userId, auditData);
        
        return service;
    }

    /**
     * Delete service
     */
    @Transactional
    public void deleteService(Long userId, Long serviceId) {
        Vendor vendor = getVendorByUserId(userId);
        com.bookkaro.model.Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        
        // Verify service has vendor assigned
        if (service.getVendor() == null) {
            throw new RuntimeException("Service has no vendor assigned");
        }
        
        // Verify service belongs to vendor
        if (!service.getVendor().getId().equals(vendor.getId())) {
            throw new UnauthorizedException("Unauthorized: Service does not belong to you");
        }
        
        // Check for active bookings using service ID
        List<Booking> allBookings = bookingRepository.findByServiceIdIn(List.of(service.getId()));
        List<Booking> activeBookings = allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED || 
                        b.getStatus() == Booking.BookingStatus.PENDING)
            .collect(Collectors.toList());
        
        if (!activeBookings.isEmpty()) {
            throw new ConflictException("Cannot delete service with " + activeBookings.size() + " active booking(s). Cancel bookings first.");
        }
        
        // CASCADE: Remove service from all user carts before deletion
        List<CartItem> cartItems = cartItemRepository.findAll().stream()
            .filter(item -> item.getService().getId().equals(serviceId))
            .collect(Collectors.toList());
        if (!cartItems.isEmpty()) {
            cartItemRepository.deleteAll(cartItems);
        }
        
        // Audit log before deletion
        Map<String, Object> auditData = new HashMap<>();
        auditData.put("serviceName", service.getServiceName());
        auditData.put("price", service.getPrice());
        auditData.put("city", service.getCity());
        auditData.put("removedFromCarts", cartItems.size());
        auditLogService.log("SERVICE", serviceId, "DELETE", userId, auditData);
        
        serviceRepository.delete(service);
    }

    /**
     * Toggle service availability
     */
    @Transactional
    public com.bookkaro.model.Service toggleServiceAvailability(Long userId, Long serviceId) {
        Vendor vendor = getVendorByUserId(userId);
        com.bookkaro.model.Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        
        // Verify service belongs to vendor
        if (!service.getVendor().getId().equals(vendor.getId())) {
            throw new UnauthorizedException("Unauthorized: Service does not belong to you");
        }
        
        service.setIsAvailable(!service.getIsAvailable());
        return serviceRepository.save(service);
    }

    /**
     * Get all reviews for vendor's services
     * Supports Total Reviews page for vendors
     */
    public List<Map<String, Object>> getVendorReviews(Long userId) {
        Vendor vendor = getVendorByUserId(userId);
        
        // Get all services for this vendor
        List<com.bookkaro.model.Service> vendorServices = serviceRepository.findByVendorId(vendor.getId());
        
        // Get all reviews for these services
        List<Review> allReviews = new ArrayList<>();
        for (com.bookkaro.model.Service service : vendorServices) {
            List<Review> serviceReviews = reviewRepository.findByServiceOrderByCreatedAtDesc(service);
            allReviews.addAll(serviceReviews);
        }
        
        // Sort all reviews by created date (newest first)
        allReviews.sort((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()));
        
        // Convert to DTOs
        return allReviews.stream().map(review -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", review.getId());
            dto.put("rating", review.getRating());
            dto.put("comment", review.getComment());
            dto.put("createdAt", review.getCreatedAt());
            dto.put("userName", review.getUser().getFirstName() + " " + review.getUser().getLastName());
            dto.put("serviceName", review.getService().getServiceName());
            dto.put("serviceId", review.getService().getId());
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Get vendor availabilities
     * Returns actual availability slots from database
     */
    public List<Object> getVendorAvailabilities(Long userId) {
        Vendor vendor = getVendorByUserId(userId);
        return availabilityRepository.findByVendorId(vendor.getId())
                .stream()
                .map(availability -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", availability.getId());
                    dto.put("dayOfWeek", availability.getDayOfWeek());
                    dto.put("startTime", availability.getStartTime());
                    dto.put("endTime", availability.getEndTime());
                    dto.put("isRecurring", availability.getIsRecurring());
                    dto.put("startTs", availability.getStartTs());
                    dto.put("endTs", availability.getEndTs());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}