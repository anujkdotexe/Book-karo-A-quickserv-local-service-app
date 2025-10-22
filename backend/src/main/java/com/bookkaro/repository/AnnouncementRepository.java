package com.bookkaro.repository;

import com.bookkaro.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    
    List<Announcement> findByIsActiveTrueOrderByCreatedAtDesc();
    
    @Query("SELECT a FROM Announcement a WHERE a.isActive = true " +
           "AND (a.startDate IS NULL OR a.startDate <= :now) " +
           "AND (a.endDate IS NULL OR a.endDate >= :now) " +
           "AND (a.targetAudience = :audience OR a.targetAudience = 'ALL') " +
           "ORDER BY a.createdAt DESC")
    List<Announcement> findActiveAnnouncementsForAudience(
        @Param("now") LocalDateTime now, 
        @Param("audience") String audience
    );
}
