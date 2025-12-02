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
    
    // Updated to use current Announcement entity fields: startsAt, endsAt
    // Removed targetAudience filtering since that field was removed from entity
    @Query("SELECT a FROM Announcement a WHERE a.isActive = true " +
           "AND (a.startsAt IS NULL OR a.startsAt <= :now) " +
           "AND (a.endsAt IS NULL OR a.endsAt >= :now) " +
           "ORDER BY a.createdAt DESC")
    List<Announcement> findActiveAnnouncementsForAudience(
        @Param("now") LocalDateTime now, 
        @Param("audience") String audience
    );
}
