package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.model.Coupon;
import com.bookkaro.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Coupon Controller - Public endpoints for coupon validation
 */
@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    /**
     * Get all active coupons
     * GET /api/v1/coupons/active
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Coupon>>> getActiveCoupons() {
        List<Coupon> coupons = couponService.getActiveCoupons();
        return ResponseEntity.ok(ApiResponse.success("Active coupons retrieved successfully", coupons));
    }

    /**
     * Validate coupon code
     * POST /api/v1/coupons/validate
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateCoupon(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        String code = (String) request.get("code");
        BigDecimal orderValue = new BigDecimal(request.get("orderValue").toString());
        
        CouponService.CouponValidationResult result = couponService.validateCoupon(
            code, orderValue, userId != null ? userId : 0L
        );
        
        if (result.isValid()) {
            return ResponseEntity.ok(ApiResponse.success("Coupon is valid", result.toMap()));
        } else {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(result.getMessage()));
        }
    }

    /**
     * Get coupon by code
     * GET /api/v1/coupons/{code}
     */
    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<Coupon>> getCouponByCode(@PathVariable String code) {
        return couponService.getCouponByCode(code)
                .map(coupon -> ResponseEntity.ok(ApiResponse.success("Coupon retrieved successfully", coupon)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Coupon not found")));
    }

    /**
     * Get available coupons for user
     * GET /api/v1/coupons/available
     */
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<Coupon>>> getAvailableCoupons() {
        List<Coupon> coupons = couponService.getActiveCoupons();
        return ResponseEntity.ok(ApiResponse.success("Available coupons retrieved successfully", coupons));
    }
}
