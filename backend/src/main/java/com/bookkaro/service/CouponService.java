package com.bookkaro.service;

import com.bookkaro.model.Coupon;
import com.bookkaro.model.CouponUsage;
import com.bookkaro.repository.CouponRepository;
import com.bookkaro.repository.CouponUsageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public List<Coupon> getActiveCoupons() {
        return couponRepository.findActiveCoupons(LocalDateTime.now());
    }

    public Optional<Coupon> getCouponById(Long id) {
        return couponRepository.findById(id);
    }

    public Optional<Coupon> getCouponByCode(String code) {
        return couponRepository.findByCode(code);
    }

    /**
     * Validate coupon and return validation result
     */
    public CouponValidationResult validateCoupon(String code, BigDecimal orderValue, Long userId) {
        Optional<Coupon> couponOpt = couponRepository.findByCode(code);
        
        if (couponOpt.isEmpty()) {
            return CouponValidationResult.invalid("Coupon code not found");
        }

        Coupon coupon = couponOpt.get();

        if (!coupon.getIsActive()) {
            return CouponValidationResult.invalid("Coupon is no longer active");
        }

        // Validate coupon date range
        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
            return CouponValidationResult.invalid("Coupon is not yet active");
        }
        if (coupon.getEndsAt() != null && now.isAfter(coupon.getEndsAt())) {
            return CouponValidationResult.invalid("Coupon has expired");
        }

        if (!coupon.isValid()) {
            return CouponValidationResult.invalid("Coupon is expired");
        }

        if (coupon.getMinOrderValue() != null && orderValue.compareTo(coupon.getMinOrderValue()) < 0) {
            return CouponValidationResult.invalid(
                String.format("Minimum order value of Rs. %.2f required", coupon.getMinOrderValue())
            );
        }

        // Check usage limits
        if (coupon.getUsageLimit() != null) {
            long usageCount = couponUsageRepository.countByCouponId(coupon.getId());
            if (usageCount >= coupon.getUsageLimit()) {
                return CouponValidationResult.invalid("Coupon usage limit reached");
            }
        }

        // Check per-user limit
        if (userId != null && coupon.getPerUserLimit() != null) {
            long userUsageCount = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), userId);
            if (userUsageCount >= coupon.getPerUserLimit()) {
                return CouponValidationResult.invalid("You have already used this coupon the maximum number of times");
            }
        }

        BigDecimal discount = calculateDiscount(coupon, orderValue);
        return CouponValidationResult.valid(coupon, discount);
    }

    /**
     * Calculate discount amount based on coupon type
     */
    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderValue) {
        BigDecimal discount;

        if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
            discount = orderValue.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = coupon.getDiscountValue();
        }

        // Apply max discount cap if exists
        if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
            discount = coupon.getMaxDiscountAmount();
        }

        // Discount cannot exceed order value
        if (discount.compareTo(orderValue) > 0) {
            discount = orderValue;
        }

        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        if (couponRepository.existsByCode(coupon.getCode())) {
            throw new IllegalArgumentException("Coupon with code " + coupon.getCode() + " already exists");
        }
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(Long id, Coupon couponDetails) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found with id: " + id));

        if (!coupon.getCode().equals(couponDetails.getCode()) && 
            couponRepository.existsByCode(couponDetails.getCode())) {
            throw new IllegalArgumentException("Coupon with code " + couponDetails.getCode() + " already exists");
        }

        coupon.setCode(couponDetails.getCode());
        coupon.setDescription(couponDetails.getDescription());
        coupon.setDiscountType(couponDetails.getDiscountType());
        coupon.setDiscountValue(couponDetails.getDiscountValue());
        coupon.setMinOrderValue(couponDetails.getMinOrderValue());
        coupon.setMaxDiscountAmount(couponDetails.getMaxDiscountAmount());
        coupon.setStartsAt(couponDetails.getStartsAt());
        coupon.setEndsAt(couponDetails.getEndsAt());
        coupon.setUsageLimit(couponDetails.getUsageLimit());
        coupon.setPerUserLimit(couponDetails.getPerUserLimit());
        coupon.setIsActive(couponDetails.getIsActive());

        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found with id: " + id));
        
        // Soft delete
        coupon.setIsActive(false);
        couponRepository.save(coupon);
    }

    @Transactional
    public Coupon toggleCouponStatus(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with id: " + id));
        coupon.setIsActive(!coupon.getIsActive());
        return couponRepository.save(coupon);
    }

    /**
     * Record coupon usage
     */
    @Transactional
    public void recordUsage(Coupon coupon, com.bookkaro.model.User user, com.bookkaro.model.Booking booking, 
                           BigDecimal orderValue, BigDecimal discountApplied) {
        CouponUsage usage = CouponUsage.builder()
                .coupon(coupon)
                .user(user)
                .booking(booking)
                .discountAmount(discountApplied)
                .build();
        
        couponUsageRepository.save(usage);
        log.info("Recorded coupon usage: {} for user: {} with discount: {}", 
                 coupon.getCode(), user.getId(), discountApplied);
    }

    /**
     * Coupon validation result
     */
    public static class CouponValidationResult {
        private final boolean valid;
        private final String message;
        private final Coupon coupon;
        private final BigDecimal discountAmount;

        private CouponValidationResult(boolean valid, String message, Coupon coupon, BigDecimal discountAmount) {
            this.valid = valid;
            this.message = message;
            this.coupon = coupon;
            this.discountAmount = discountAmount;
        }

        public static CouponValidationResult valid(Coupon coupon, BigDecimal discountAmount) {
            return new CouponValidationResult(true, "Coupon is valid", coupon, discountAmount);
        }

        public static CouponValidationResult invalid(String message) {
            return new CouponValidationResult(false, message, null, BigDecimal.ZERO);
        }

        public boolean isValid() {
            return valid;
        }

        public String getMessage() {
            return message;
        }

        public Coupon getCoupon() {
            return coupon;
        }

        public BigDecimal getDiscountAmount() {
            return discountAmount;
        }

        public Map<String, Object> toMap() {
            return Map.of(
                "valid", valid,
                "message", message,
                "discountAmount", discountAmount
            );
        }
    }
}
