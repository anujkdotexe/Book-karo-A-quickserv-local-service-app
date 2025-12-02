package com.bookkaro.service;

import com.bookkaro.model.AuditLog;
import com.bookkaro.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Extract IP address from HTTP request
     * Handles X-Forwarded-For header for proxied requests
     */
    private String extractIpAddress(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1"; // Fallback for non-HTTP contexts
        }
        
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        
        // X-Forwarded-For can contain multiple IPs, take the first one
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        
        return ipAddress;
    }

    /**
     * Get current HTTP request from RequestContextHolder
     */
    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Log an action with IP address tracking
     */
    @Transactional
    public AuditLog log(String entityType, Long entityId, String action, Long performedBy, Map<String, Object> newValues) {
        // Normalize entityType and action to uppercase to keep stored values consistent
        String normalizedEntityType = entityType != null ? entityType.toUpperCase() : null;
        String normalizedAction = action != null ? action.toUpperCase() : null;
        
        // Get current HTTP request and extract IP address
        HttpServletRequest request = getCurrentRequest();
        String ipAddress = extractIpAddress(request);
        String userAgent = request != null ? request.getHeader("User-Agent") : null;

        AuditLog auditLog = AuditLog.builder()
            .entityType(normalizedEntityType)
            .entityId(entityId)
            .action(normalizedAction)
            .performedBy(performedBy)
            .newValues(newValues)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .build();
            
        AuditLog saved = auditLogRepository.save(auditLog);
        log.info("Audit log created: {} {} by user {} from IP {}", action, entityType, performedBy, ipAddress);
        return saved;
    }

    /**
     * Log vendor approval action
     */
    public void logVendorApproval(Long vendorId, Long adminId, String newStatus, String previousStatus, String reason) {
        log("vendor", vendorId, "approval_status_change", adminId, Map.of(
            "newStatus", newStatus,
            "previousStatus", previousStatus,
            "reason", reason != null ? reason : ""
        ));
    }

    /**
     * Log vendor suspension
     */
    public void logVendorSuspension(Long vendorId, Long adminId, String reason) {
        log("vendor", vendorId, "suspended", adminId, Map.of(
            "reason", reason
        ));
    }

    /**
     * Log vendor reactivation
     */
    public void logVendorReactivation(Long vendorId, Long adminId) {
        log("vendor", vendorId, "reactivated", adminId, Map.of(
            "action", "reactivated"
        ));
    }

    /**
     * Log booking cancellation
     */
    public void logBookingCancellation(Long bookingId, Long userId, String reason, String previousStatus) {
        log("booking", bookingId, "cancelled", userId, Map.of(
            "reason", reason,
            "previousStatus", previousStatus
        ));
    }

    /**
     * Log user deactivation/reactivation
     */
    public void logUserStatusChange(Long userId, Long adminId, boolean isActive, String previousStatus) {
        String action = isActive ? "activated" : "deactivated";
        log("user", userId, action, adminId, Map.of(
            "newStatus", isActive ? "active" : "inactive",
            "previousStatus", previousStatus
        ));
    }

    /**
     * Get audit logs for specific entity
     */
    public List<AuditLog> getEntityAuditLogs(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }

    /**
     * Get paginated audit logs for entity type
     */
    public Page<AuditLog> getAuditLogsByEntityType(String entityType, Pageable pageable) {
        // Use case-insensitive lookup so frontend filters (which send uppercase values)
        // match existing records regardless of stored case.
        try {
            return auditLogRepository.findByEntityTypeIgnoreCase(entityType, pageable);
        } catch (Exception e) {
            // Fallback to exact match if ignore-case query unavailable for some reason
            return auditLogRepository.findByEntityType(entityType, pageable);
        }
    }

    /**
     * Get recent audit logs
     */
    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc();
    }

    /**
     * Get all audit logs
     */
    public Page<AuditLog> getAllAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    /**
     * Get audit logs by date range
     */
    public Page<AuditLog> getAuditLogsByDateRange(LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return auditLogRepository.findByCreatedAtBetween(from, to, pageable);
    }

    /**
     * Get audit logs by user
     */
    public List<AuditLog> getAuditLogsByUser(Long userId) {
        return auditLogRepository.findByPerformedBy(userId);
    }
}
