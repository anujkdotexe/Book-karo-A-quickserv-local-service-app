package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.CouponDto;
import com.bookkaro.model.Coupon;
import com.bookkaro.repository.CouponUsageRepository;
import com.bookkaro.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin Coupon Controller - Admin endpoints for coupon management
 */
@RestController
@RequestMapping("/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {

    private final CouponService couponService;
    private final CouponUsageRepository couponUsageRepository;

    /**
     * Get all coupons
     * GET /api/v1/admin/coupons
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponDto>>> getAllCoupons() {
        List<Coupon> coupons = couponService.getAllCoupons();
        List<CouponDto> couponDtos = coupons.stream()
                .map(coupon -> {
                    CouponDto dto = CouponDto.fromEntity(coupon);
                    // Get usage count from coupon_usages table
                    long usageCount = couponUsageRepository.countByCouponId(coupon.getId());
                    dto.setUsageCount((int) usageCount);
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("All coupons retrieved successfully", couponDtos));
    }

    /**
     * Create new coupon
     * POST /api/v1/admin/coupons
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CouponDto>> createCoupon(@Valid @RequestBody CouponDto couponDto) {
        Coupon coupon = couponDto.toEntity();
        Coupon created = couponService.createCoupon(coupon);
        return ResponseEntity.ok(ApiResponse.success("Coupon created successfully", CouponDto.fromEntity(created)));
    }

    /**
     * Update coupon
     * PUT /api/v1/admin/coupons/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponDto>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponDto couponDto) {
        Coupon coupon = couponDto.toEntity();
        coupon.setId(id);
        Coupon updated = couponService.updateCoupon(id, coupon);
        return ResponseEntity.ok(ApiResponse.success("Coupon updated successfully", CouponDto.fromEntity(updated)));
    }

    /**
     * Toggle coupon status (active/inactive)
     * PATCH /api/v1/admin/coupons/{id}/toggle-status
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<CouponDto>> toggleCouponStatus(@PathVariable Long id) {
        Coupon updated = couponService.toggleCouponStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon status updated", CouponDto.fromEntity(updated)));
    }

    /**
     * Delete coupon (soft delete)
     * DELETE /api/v1/admin/coupons/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully", null));
    }

    /**
     * Get coupon by ID
     * GET /api/v1/admin/coupons/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CouponDto>> getCouponById(@PathVariable Long id) {
        Coupon coupon = couponService.getCouponById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        return ResponseEntity.ok(ApiResponse.success("Coupon retrieved successfully", CouponDto.fromEntity(coupon)));
    }
}
