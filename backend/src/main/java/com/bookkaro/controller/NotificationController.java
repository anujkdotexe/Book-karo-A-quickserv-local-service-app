package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.NotificationDto;
import com.bookkaro.model.User;
import com.bookkaro.repository.UserRepository;
import com.bookkaro.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get all notifications for current user
     * GET /api/v1/notifications
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        List<NotificationDto> notifications = notificationService.getUserNotificationsAsDto(
            user.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", notifications));
    }

    /**
     * Get unread notification count
     * GET /api/v1/notifications/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        User user = getCurrentUser(authentication);
        Long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", count));
    }

    /**
     * Get recent notifications (both read and unread for dropdown)
     * GET /api/v1/notifications/recent
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getRecentNotifications(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        List<NotificationDto> notifications = notificationService.getRecentNotifications(user.getId(), limit);
        return ResponseEntity.ok(ApiResponse.success("Recent notifications retrieved", notifications));
    }

    /**
     * Get all notifications (paginated)
     * GET /api/v1/notifications/all
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getAllNotifications(
            @RequestParam(defaultValue = "1000") int limit,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        List<NotificationDto> notifications = notificationService.getAllNotifications(user.getId(), limit);
        return ResponseEntity.ok(ApiResponse.success("All notifications retrieved", notifications));
    }

    /**
     * Get notification by ID
     * GET /api/v1/notifications/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationDto>> getNotificationById(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        NotificationDto notification = notificationService.getNotificationById(id, user.getId());
        if (notification == null) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error("Notification not found"));
        }
        return ResponseEntity.ok(ApiResponse.success("Notification retrieved", notification));
    }

    /**
     * Mark notification as read
     * PUT /api/v1/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    /**
     * Mark all notifications as read
     * PUT /api/v1/notifications/read-all
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        User user = getCurrentUser(authentication);
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    /**
     * Delete notification
     * DELETE /api/v1/notifications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        notificationService.deleteNotification(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }

    /**
     * Clear all notifications
     * DELETE /api/v1/notifications/clear-all
     */
    @DeleteMapping("/clear-all")
    public ResponseEntity<ApiResponse<Void>> clearAllNotifications(Authentication authentication) {
        User user = getCurrentUser(authentication);
        notificationService.clearAllNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications cleared", null));
    }
}
