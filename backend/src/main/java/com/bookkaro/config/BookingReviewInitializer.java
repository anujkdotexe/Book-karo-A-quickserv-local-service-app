package com.bookkaro.config;

import com.bookkaro.model.Booking;
import com.bookkaro.model.Review;
import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import com.bookkaro.repository.BookingRepository;
import com.bookkaro.repository.ReviewRepository;
import com.bookkaro.repository.ServiceRepository;
import com.bookkaro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@Order(3)
@RequiredArgsConstructor
public class BookingReviewInitializer implements CommandLineRunner {

    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        if (bookingRepository.count() > 0) {
            log.info("Bookings already exist. Skipping booking/review initialization. Count: {}", bookingRepository.count());
            return;
        }

        User testUser = userRepository.findByEmail("user@bookkaro.com").orElse(null);
        if (testUser == null) {
            log.warn("Test user not found. Skipping booking/review initialization.");
            return;
        }

        List<Service> services = serviceRepository.findAll();
        if (services.isEmpty()) {
            log.warn("No services found. Skipping booking/review initialization.");
            return;
        }

        Random random = new Random();
        int bookingsCreated = 0;
        int reviewsCreated = 0;

        // Create sample bookings with different statuses
        String[] statuses = {"PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"};
        String[] reviewComments = {
            "Excellent service! Very professional and punctual.",
            "Great experience. Highly recommend this service provider.",
            "Good service but could be better. Overall satisfied.",
            "Outstanding work! Will definitely book again.",
            "Professional and efficient. Five stars!",
            "Decent service. Met my expectations.",
            "Amazing quality of work. Very happy with the results.",
            "Quick and reliable service. Good value for money.",
            "Very satisfied with the service. Prompt and courteous.",
            "Exceptional service quality. Exceeded expectations!"
        };

        // Create 30 sample bookings
        for (int i = 0; i < 30 && i < services.size(); i++) {
            Service service = services.get(i);
            String status = statuses[i % statuses.length];
            
            LocalDate bookingDate;
            if ("COMPLETED".equals(status)) {
                bookingDate = LocalDate.now().minusDays(random.nextInt(30) + 5);
            } else if ("CANCELLED".equals(status)) {
                bookingDate = LocalDate.now().minusDays(random.nextInt(15) + 1);
            } else if ("CONFIRMED".equals(status)) {
                bookingDate = LocalDate.now().plusDays(random.nextInt(10) + 1);
            } else {
                bookingDate = LocalDate.now().plusDays(random.nextInt(15) + 1);
            }

            LocalTime bookingTime = LocalTime.of(9 + random.nextInt(9), random.nextBoolean() ? 0 : 30);

            Booking booking = Booking.builder()
                    .user(testUser)
                    .service(service)
                    .bookingDate(bookingDate)
                    .bookingTime(bookingTime)
                    .totalAmount(service.getPrice())
                    .notes("Sample booking note for " + service.getServiceName())
                    .status(Booking.BookingStatus.valueOf(status))
                    .build();

            booking = bookingRepository.save(booking);
            bookingsCreated++;

            // Create reviews for completed bookings
            if ("COMPLETED".equals(status)) {
                int rating = 3 + random.nextInt(3);
                String comment = reviewComments[random.nextInt(reviewComments.length)];

                Review review = Review.builder()
                        .user(testUser)
                        .service(service)
                        .booking(booking)
                        .rating(rating)
                        .comment(comment)
                        .build();

                reviewRepository.save(review);
                reviewsCreated++;

                // Update service ratings
                updateServiceRating(service);
            }
        }

        log.info("==============================================");
        log.info("SAMPLE BOOKINGS & REVIEWS INITIALIZED");
        log.info("==============================================");
        log.info("Bookings created: {}", bookingsCreated);
        log.info("Reviews created: {}", reviewsCreated);
        log.info("==============================================");
    }

    private void updateServiceRating(Service service) {
        List<Review> reviews = reviewRepository.findByService(service);
        if (!reviews.isEmpty()) {
            double avgRating = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            
            service.setAverageRating(BigDecimal.valueOf(avgRating));
            service.setTotalReviews(reviews.size());
            serviceRepository.save(service);
        }
    }
}
