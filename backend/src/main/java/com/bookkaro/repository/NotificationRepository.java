package com.bookkaro.repository;

import com.bookkaro.model.Notification;
import com.bookkaro.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find notifications by user
    Page<Notification> findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(User user, Pageable pageable);
    
    List<Notification> findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(User user);
    
    // Find unread notifications
    List<Notification> findByUserAndIsReadFalseAndDeletedAtIsNullOrderByCreatedAtDesc(User user);
    
    // Count unread notifications
    Long countByUserAndIsReadFalseAndDeletedAtIsNull(User user);
    
    // Mark notification as read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.id = :id AND n.user.id = :userId")
    int markAsRead(@Param("id") Long id, @Param("userId") Long userId);
    
    // Mark all notifications as read for user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsRead(@Param("userId") Long userId);
    
    // Soft delete notification
    @Modifying
    @Query("UPDATE Notification n SET n.deletedAt = CURRENT_TIMESTAMP WHERE n.id = :id AND n.user.id = :userId")
    int softDelete(@Param("id") Long id, @Param("userId") Long userId);
    
    // Soft delete all notifications for user
    @Modifying
    @Query("UPDATE Notification n SET n.deletedAt = CURRENT_TIMESTAMP WHERE n.user.id = :userId")
    int softDeleteAll(@Param("userId") Long userId);
}
