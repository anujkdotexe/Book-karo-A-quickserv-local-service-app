package com.bookkaro.repository;

import com.bookkaro.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    
    List<Banner> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    // Updated to use current Banner entity fields: target, startsAt, endsAt
    List<Banner> findByTargetAndIsActiveTrueOrderByDisplayOrderAsc(String target);

    @Query("SELECT b FROM Banner b WHERE b.isActive = true " +
           "AND (b.startsAt IS NULL OR b.startsAt <= :now) " +
           "AND (b.endsAt IS NULL OR b.endsAt >= :now) " +
           "AND b.target = :target " +
           "ORDER BY b.displayOrder ASC")
    List<Banner> findActiveBannersByTarget(
        @Param("now") LocalDateTime now, 
        @Param("target") String target
    );
}
