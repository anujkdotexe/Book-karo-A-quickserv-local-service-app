package com.bookkaro.dto;

import com.bookkaro.model.Coupon;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Coupon
 * Prevents JSON serialization issues with entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponDto {
    
    private Long id;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountAmount;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private Integer usageLimit;
    private Integer perUserLimit;
    private Boolean isActive;
    private Integer usageCount; // Number of times this coupon has been used
    private LocalDateTime createdAt;
    private Long createdBy;
    private LocalDateTime updatedAt;
    private Long updatedBy;
    
    /**
     * Convert Coupon entity to DTO
     */
    public static CouponDto fromEntity(Coupon coupon) {
        if (coupon == null) return null;
        
        return CouponDto.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType() != null ? coupon.getDiscountType().name() : null)
                .discountValue(coupon.getDiscountValue())
                .minOrderValue(coupon.getMinOrderValue())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .startsAt(coupon.getStartsAt())
                .endsAt(coupon.getEndsAt())
                .usageLimit(coupon.getUsageLimit())
                .perUserLimit(coupon.getPerUserLimit())
                .isActive(coupon.getIsActive())
                .createdAt(coupon.getCreatedAt())
                .createdBy(coupon.getCreatedBy())
                .updatedAt(coupon.getUpdatedAt())
                .updatedBy(coupon.getUpdatedBy())
                .build();
    }
    
    /**
     * Convert DTO to Coupon entity (for create/update)
     */
    public Coupon toEntity() {
        return Coupon.builder()
                .id(this.id)
                .code(this.code)
                .description(this.description)
                .discountType(this.discountType != null ? Coupon.DiscountType.valueOf(this.discountType) : null)
                .discountValue(this.discountValue)
                .minOrderValue(this.minOrderValue)
                .maxDiscountAmount(this.maxDiscountAmount)
                .startsAt(this.startsAt)
                .endsAt(this.endsAt)
                .usageLimit(this.usageLimit)
                .perUserLimit(this.perUserLimit)
                .isActive(this.isActive)
                .createdAt(this.createdAt)
                .createdBy(this.createdBy)
                .updatedAt(this.updatedAt)
                .updatedBy(this.updatedBy)
                .build();
    }
}
