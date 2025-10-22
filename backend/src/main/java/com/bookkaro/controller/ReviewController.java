package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.CreateReviewRequest;
import com.bookkaro.dto.ReviewDto;
import com.bookkaro.model.Booking;
import com.bookkaro.model.Booking.BookingStatus;
import com.bookkaro.model.Review;
import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import com.bookkaro.repository.BookingRepository;
import com.bookkaro.repository.ReviewRepository;
import com.bookkaro.repository.ServiceRepository;
import com.bookkaro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify booking exists and is completed
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only review your own bookings"));
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("You can only review completed bookings"));
        }

        // Check if review already exists
        if (reviewRepository.existsByUserAndBooking(user, booking)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("You have already reviewed this booking"));
        }

        // Create review
        Review review = Review.builder()
                .user(user)
                .service(booking.getService())
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);

        // Update service average rating
        updateServiceAverageRating(booking.getService().getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review created successfully", convertToDto(review)));
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getServiceReviews(
            @PathVariable Long serviceId) {
        
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        List<Review> reviews = reviewRepository.findByServiceOrderByCreatedAtDesc(service);

        List<ReviewDto> reviewDtos = reviews.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully", reviewDtos));
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getUserReviews(
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Review> reviews = reviewRepository.findByUserOrderByCreatedAtDesc(user);

        List<ReviewDto> reviewDtos = reviews.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("User reviews retrieved successfully", reviewDtos));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewDto>> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only update your own reviews"));
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        review = reviewRepository.save(review);

        // Update service average rating
        updateServiceAverageRating(review.getService().getId());

        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", convertToDto(review)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteReview(
            @PathVariable Long id,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only delete your own reviews"));
        }

        Long serviceId = review.getService().getId();
        reviewRepository.delete(review);

        // Update service average rating
        updateServiceAverageRating(serviceId);

        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }

    private void updateServiceAverageRating(Long serviceId) {
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        Double averageRating = reviewRepository.findAverageRatingByServiceId(serviceId);
        service.setAverageRating(averageRating != null ? 
                java.math.BigDecimal.valueOf(averageRating) : java.math.BigDecimal.ZERO);
        
        long reviewCount = reviewRepository.countByServiceId(serviceId);
        service.setTotalReviews((int) reviewCount);
        
        serviceRepository.save(service);
    }

    private ReviewDto convertToDto(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setUserId(review.getUser().getId());
        dto.setUserName(review.getUser().getFullName());
        dto.setServiceId(review.getService().getId());
        dto.setServiceName(review.getService().getServiceName());
        dto.setBookingId(review.getBooking().getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());
        return dto;
    }
}
