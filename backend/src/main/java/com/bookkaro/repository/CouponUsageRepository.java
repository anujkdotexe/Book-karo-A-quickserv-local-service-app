package com.bookkaro.repository;

import com.bookkaro.model.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.coupon.id = :couponId")
    long countByCouponId(@Param("couponId") Long couponId);

    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.coupon.id = :couponId AND cu.user.id = :userId")
    long countByCouponIdAndUserId(@Param("couponId") Long couponId, @Param("userId") Long userId);

    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.coupon.code = :code")
    long countByCode(@Param("code") String code);

    @Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.coupon.code = :code AND cu.user.id = :userId")
    long countByCodeAndUserId(@Param("code") String code, @Param("userId") Long userId);
}
