package com.bookkaro.service;

import com.bookkaro.model.Booking;
import com.bookkaro.model.Booking.BookingStatus;
import com.bookkaro.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingReminderService {

    private final BookingRepository bookingRepository;

    /**
     * Send reminders for bookings scheduled tomorrow
     * Runs every day at 9 AM
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void sendDailyBookingReminders() {
        log.info("Starting daily booking reminder task...");
        
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        
        // Get all bookings for tomorrow
        List<Booking> allBookings = bookingRepository.findAll();
        
        List<Booking> tomorrowBookings = allBookings.stream()
                .filter(b -> b.getScheduledAt().toLocalDate().equals(tomorrow))
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.PENDING)
                .toList();
        
        log.info("Found {} bookings scheduled for tomorrow ({})", tomorrowBookings.size(), tomorrow);
        
        for (Booking booking : tomorrowBookings) {
            sendReminderNotification(booking);
        }
        
        log.info("Booking reminder task completed");
    }

    /**
     * Send reminder notification to user
     * In production, this would integrate with:
     * - Email service (SendGrid, AWS SES)
     * - SMS service (Twilio)
     * - Push notification service (Firebase Cloud Messaging)
     */
    private void sendReminderNotification(Booking booking) {
        try {
            String userName = booking.getUser().getFullName();
            String serviceName = booking.getService().getServiceName();
            String vendorName = booking.getService().getVendor().getBusinessName();
            LocalDateTime bookingDateTime = booking.getScheduledAt();
            
            String message = String.format(
                "Reminder: You have a booking tomorrow!\n" +
                "Service: %s\n" +
                "Provider: %s\n" +
                "Time: %s\n" +
                "Booking ID: %d",
                serviceName, vendorName, bookingDateTime, booking.getId()
            );
            
            log.info("Reminder sent to {} ({}): {}", userName, booking.getUser().getEmail(), message);
            
            // emailService.sendEmail(booking.getUser().getEmail(), "Booking Reminder", message);
            // smsService.sendSMS(booking.getUser().getPhone(), message);
            // pushNotificationService.send(booking.getUser().getId(), "Booking Reminder", message);
            
        } catch (Exception e) {
            log.error("Failed to send reminder for booking {}: {}", booking.getId(), e.getMessage());
        }
    }

    /**
     * Send reminder 2 hours before booking (for same-day bookings)
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *")
    public void sendImmediateBookingReminders() {
        LocalDateTime twoHoursLater = LocalDateTime.now().plusHours(2);
        LocalDate today = twoHoursLater.toLocalDate();
        
        List<Booking> allBookings = bookingRepository.findAll();
        
        List<Booking> upcomingBookings = allBookings.stream()
                .filter(b -> b.getScheduledAt().toLocalDate().equals(today))
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.PENDING)
                .filter(b -> {
                    LocalDateTime bookingDateTime = b.getScheduledAt();
                    long minutesDiff = java.time.Duration.between(LocalDateTime.now(), bookingDateTime).toMinutes();
                    return minutesDiff >= 110 && minutesDiff <= 130; // Between 1h50m and 2h10m (10-minute window)
                })
                .toList();
        
        if (!upcomingBookings.isEmpty()) {
            log.info("Found {} bookings starting in ~2 hours", upcomingBookings.size());
            upcomingBookings.forEach(this::sendReminderNotification);
        }
    }
}
