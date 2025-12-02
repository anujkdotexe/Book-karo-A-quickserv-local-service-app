package com.bookkaro.repository;

import com.bookkaro.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    
    Optional<Coupon> findByCode(String code);
    
    List<Coupon> findByIsActiveTrue();
    
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND (c.startsAt IS NULL OR c.startsAt <= :now) AND (c.endsAt IS NULL OR c.endsAt >= :now)")
    List<Coupon> findActiveCoupons(LocalDateTime now);
    
    boolean existsByCode(String code);
}
