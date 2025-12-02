package com.bookkaro.service;

import com.bookkaro.dto.NotificationDto;
import com.bookkaro.exception.ResourceNotFoundException;
import com.bookkaro.model.Announcement;
import com.bookkaro.model.Booking;
import com.bookkaro.model.Notification;
import com.bookkaro.model.User;
import com.bookkaro.repository.NotificationRepository;
import com.bookkaro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Convert Notification entity to DTO
     */
    private NotificationDto toDto(Notification notification) {
        return NotificationDto.builder()
            .id(notification.getId())
            .type(notification.getType())
            .title(notification.getTitle())
            .message(notification.getMessage())
            .isRead(notification.getIsRead())
            .createdAt(notification.getCreatedAt())
            .readAt(notification.getReadAt())
            .userId(notification.getUser() != null ? notification.getUser().getId() : null)
            .announcementId(notification.getAnnouncement() != null ? notification.getAnnouncement().getId() : null)
            .bookingId(notification.getBooking() != null ? notification.getBooking().getId() : null)
            .build();
    }

    /**
     * Get all notifications for a user
     */
    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(user, pageable);
    }

    /**
     * Get all notifications for a user as DTOs
     */
    public List<NotificationDto> getUserNotificationsAsDto(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Page<Notification> notificationsPage = notificationRepository.findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(user, pageable);
        return notificationsPage.getContent().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get unread notification count
     */
    public Long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByUserAndIsReadFalseAndDeletedAtIsNull(user);
    }

    /**
     * Get recent notifications (both read and unread for dropdown)
     */
    public List<NotificationDto> getRecentNotifications(Long userId, int limit) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> allNotifications = notificationRepository
            .findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(user);
        return allNotifications.stream().limit(limit).map(this::toDto).collect(java.util.stream.Collectors.toList());
    }

    /**
     * Get recent unread notifications (for dropdown)
     */
    public List<NotificationDto> getRecentUnread(Long userId, int limit) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> allUnread = notificationRepository
            .findByUserAndIsReadFalseAndDeletedAtIsNullOrderByCreatedAtDesc(user);
        return allUnread.stream().limit(limit).map(this::toDto).collect(java.util.stream.Collectors.toList());
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        int updated = notificationRepository.markAsRead(notificationId, userId);
        if (updated == 0) {
            throw new ResourceNotFoundException("Notification not found or access denied");
        }
    }

    /**
     * Mark all notifications as read
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    /**
     * Delete (soft delete) notification
     */
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        int deleted = notificationRepository.softDelete(notificationId, userId);
        if (deleted == 0) {
            throw new ResourceNotFoundException("Notification not found or access denied");
        }
    }

    /**
     * Clear all notifications (soft delete)
     */
    @Transactional
    public void clearAllNotifications(Long userId) {
        notificationRepository.softDeleteAll(userId);
    }

    /**
     * Create notification for user
     */
    @Transactional
    public Notification createNotification(Long userId, String type, String title, String message, 
                                          Long bookingId, Long announcementId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = Notification.builder()
            .user(user)
            .type(type)
            .title(title)
            .message(message)
            .isRead(false)
            .build();

        return notificationRepository.save(notification);
    }

    /**
     * Create announcement notification for all users
     */
    @Transactional
    public void createAnnouncementNotifications(Announcement announcement) {
        List<User> targetUsers;
        
        // Determine target audience
        if ("ALL".equals(announcement.getAudience())) {
            targetUsers = userRepository.findAll();
        } else if ("USERS".equals(announcement.getAudience())) {
            targetUsers = userRepository.findByRole(User.UserRole.USER);
        } else if ("VENDORS".equals(announcement.getAudience())) {
            targetUsers = userRepository.findByRole(User.UserRole.VENDOR);
        } else if ("ADMINS".equals(announcement.getAudience())) {
            targetUsers = userRepository.findByRole(User.UserRole.ADMIN);
        } else {
            return; // Unknown audience
        }

        // Create notification for each user
        for (User user : targetUsers) {
            Notification notification = Notification.builder()
                .user(user)
                .type(Notification.NotificationType.ANNOUNCEMENT)
                .title(announcement.getTitle())
                .message(announcement.getContent())
                .announcement(announcement)
                .isRead(false)
                .build();
            notificationRepository.save(notification);
        }
    }

    /**
     * Create booking status notification
     */
    @Transactional
    public void createBookingNotification(Booking booking, String type, String title, String message) {
        Notification notification = Notification.builder()
            .user(booking.getUser())
            .type(type)
            .title(title)
            .message(message)
            .booking(booking)
            .isRead(false)
            .build();
        notificationRepository.save(notification);
    }
}
