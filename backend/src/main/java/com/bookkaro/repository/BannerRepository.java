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
    
    List<Banner> findByPositionAndIsActiveTrueOrderByDisplayOrderAsc(String position);
    
    @Query("SELECT b FROM Banner b WHERE b.isActive = true " +
           "AND (b.startDate IS NULL OR b.startDate <= :now) " +
           "AND (b.endDate IS NULL OR b.endDate >= :now) " +
           "AND b.position = :position " +
           "ORDER BY b.displayOrder ASC")
    List<Banner> findActiveBannersByPosition(
        @Param("now") LocalDateTime now, 
        @Param("position") String position
    );
}
