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
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    @PostMapping
    @Transactional
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
                .vendor(booking.getService().getVendor())
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .isVerified(true) // Mark as verified since booking is completed
                .build();

        review = reviewRepository.save(review);

        // Update service average rating
        updateServiceAverageRating(booking.getService().getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review created successfully", convertToDto(review)));
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getServiceReviews(
            @PathVariable Long serviceId,
            @RequestParam(required = false) Integer rating) {
        
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        List<Review> reviews;
        if (rating != null && rating >= 1 && rating <= 5) {
            reviews = reviewRepository.findByServiceAndRatingOrderByCreatedAtDesc(service, rating);
        } else {
            reviews = reviewRepository.findByServiceOrderByCreatedAtDesc(service);
        }

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
        
        // Don't allow changing the booking - only rating and comment can be updated
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

    @PostMapping("/{id}/helpful")
    @Transactional
    public ResponseEntity<ApiResponse<Integer>> markHelpful(
            @PathVariable Long id,
            Authentication authentication) {
        
        // Verify user is authenticated
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Log the helpful vote for audit trail
        log.info("User {} (ID: {}) marked review {} as helpful for service {}", 
                user.getFullName(), user.getId(), review.getId(), review.getService().getId());
        
        review.setHelpfulCount(review.getHelpfulCount() + 1);
        reviewRepository.save(review);
        
        return ResponseEntity.ok(ApiResponse.success("Marked as helpful", review.getHelpfulCount()));
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
        dto.setVendorId(review.getVendor().getId());
        dto.setVendorName(review.getVendor().getBusinessName());
        dto.setBookingId(review.getBooking().getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setHelpfulCount(review.getHelpfulCount());
        dto.setIsVerified(review.getIsVerified());
        dto.setVendorResponse(review.getVendorResponse());
        dto.setResponseAt(review.getResponseAt());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());
        return dto;
    }
}
