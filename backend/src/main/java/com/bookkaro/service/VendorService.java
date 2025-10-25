package com.bookkaro.service;

import com.bookkaro.dto.BookingDto;
import com.bookkaro.dto.ServiceDto;
import com.bookkaro.dto.VendorDashboardStats;
import com.bookkaro.model.Booking;
import com.bookkaro.model.Vendor;
import com.bookkaro.repository.BookingRepository;
import com.bookkaro.repository.ServiceRepository;
import com.bookkaro.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VendorService {

    private final VendorRepository vendorRepository;
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;

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
        
        // Get recent bookings (last 5)
        List<VendorDashboardStats.RecentBooking> recentBookings = allBookings.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(5)
            .map(booking -> VendorDashboardStats.RecentBooking.builder()
                .id(booking.getId())
                .customerName(booking.getUser().getFullName())
                .serviceName(booking.getService().getServiceName())
                .status(booking.getStatus().toString())
                .bookingDate(booking.getBookingDate().toString())
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
            .recentBookings(recentBookings)
            .topServices(topServices)
            .weeklyRevenue(weeklyRevenue)
            .build();
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
     * Convert Booking entity to BookingDto
     */
    private BookingDto convertToDto(Booking booking) {
        return BookingDto.builder()
            .id(booking.getId())
            .userId(booking.getUser().getId())
            .userName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName())
            .userEmail(booking.getUser().getEmail())
            .serviceId(booking.getService().getId())
            .serviceName(booking.getService().getServiceName())
            .vendorId(booking.getService().getVendor().getId())
            .vendorName(booking.getService().getVendor().getBusinessName())
            .bookingDate(booking.getBookingDate())
            .bookingTime(booking.getBookingTime())
            .status(booking.getStatus().name())
            .totalAmount(booking.getTotalAmount())
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
            throw new RuntimeException("Unauthorized: Booking does not belong to your services");
        }
        
        Booking.BookingStatus currentStatus = booking.getStatus();
        Booking.BookingStatus newBookingStatus;
        
        try {
            newBookingStatus = Booking.BookingStatus.valueOf(newStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid booking status: " + newStatus);
        }
        
        // Validate status transitions
        if (currentStatus == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Cannot update a cancelled booking");
        }
        
        if (currentStatus == Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot update a completed booking");
        }
        
        // Vendors can only set: CONFIRMED, COMPLETED, CANCELLED
        if (newBookingStatus != Booking.BookingStatus.CONFIRMED && 
            newBookingStatus != Booking.BookingStatus.COMPLETED && 
            newBookingStatus != Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Invalid status transition. Vendors can only set: CONFIRMED, COMPLETED, or CANCELLED");
        }
        
        // PENDING -> CONFIRMED/CANCELLED
        // CONFIRMED -> COMPLETED
        if (currentStatus == Booking.BookingStatus.PENDING) {
            if (newBookingStatus != Booking.BookingStatus.CONFIRMED && 
                newBookingStatus != Booking.BookingStatus.CANCELLED) {
                throw new RuntimeException("Pending bookings can only be confirmed or cancelled");
            }
        } else if (currentStatus == Booking.BookingStatus.CONFIRMED) {
            if (newBookingStatus != Booking.BookingStatus.COMPLETED) {
                throw new RuntimeException("Confirmed bookings can only be marked as completed");
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
        return serviceRepository.findByVendorId(vendor.getId()).stream()
                .map(ServiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Create new service
     */
    @Transactional
    public com.bookkaro.model.Service createService(Long userId, com.bookkaro.model.Service service) {
        Vendor vendor = getVendorByUserId(userId);
        service.setVendor(vendor);
        service.setApprovalStatus(com.bookkaro.model.Service.ApprovalStatus.PENDING);
        service.setIsAvailable(false);
        return serviceRepository.save(service);
    }

    /**
     * Update service
     */
    @Transactional
    public com.bookkaro.model.Service updateService(Long userId, Long serviceId, com.bookkaro.model.Service updatedService) {
        Vendor vendor = getVendorByUserId(userId);
        com.bookkaro.model.Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        
        // Verify service belongs to vendor
        if (!service.getVendor().getId().equals(vendor.getId())) {
            throw new RuntimeException("Unauthorized: Service does not belong to you");
        }
        
        // Update fields
        service.setServiceName(updatedService.getServiceName());
        service.setDescription(updatedService.getDescription());
        service.setCategory(updatedService.getCategory());
        service.setPrice(updatedService.getPrice());
        service.setDurationMinutes(updatedService.getDurationMinutes());
        service.setIsAvailable(updatedService.getIsAvailable());
        
        return serviceRepository.save(service);
    }

    /**
     * Delete service
     */
    @Transactional
    public void deleteService(Long userId, Long serviceId) {
        Vendor vendor = getVendorByUserId(userId);
        com.bookkaro.model.Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        
        // Verify service belongs to vendor
        if (!service.getVendor().getId().equals(vendor.getId())) {
            throw new RuntimeException("Unauthorized: Service does not belong to you");
        }
        
        // Check for active bookings using service ID
        List<Booking> allBookings = bookingRepository.findByServiceIdIn(List.of(service.getId()));
        List<Booking> activeBookings = allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED || 
                        b.getStatus() == Booking.BookingStatus.PENDING)
            .collect(Collectors.toList());
        
        if (!activeBookings.isEmpty()) {
            throw new RuntimeException("Cannot delete service with " + activeBookings.size() + " active booking(s). Cancel bookings first.");
        }
        
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
            throw new RuntimeException("Unauthorized: Service does not belong to you");
        }
        
        service.setIsAvailable(!service.getIsAvailable());
        return serviceRepository.save(service);
    }
}
