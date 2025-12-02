package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.PagedResponse;
import com.bookkaro.model.AuditLog;
import com.bookkaro.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Admin Audit Log Controller - Admin endpoints for viewing audit logs
 */
@RestController
@RequestMapping("/admin/audit-logs")
@RequiredArgsConstructor
public class AdminAuditLogController {

    private final AuditLogService auditLogService;

    /**
     * Get recent audit logs
     * GET /api/v1/admin/audit-logs/recent
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getRecentAuditLogs() {
        List<AuditLog> logs = auditLogService.getRecentAuditLogs();
        return ResponseEntity.ok(ApiResponse.success("Recent audit logs retrieved successfully", logs));
    }

    /**
     * Get audit logs by entity type
     * GET /api/v1/admin/audit-logs?entityType=vendor&page=0&size=20&sortBy=createdAt&sortDir=DESC
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<AuditLog>>> getAuditLogs(
            @RequestParam(required = false) String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AuditLog> logs;
        
        if (entityType != null && !entityType.isEmpty()) {
            logs = auditLogService.getAuditLogsByEntityType(entityType, pageable);
        } else {
            logs = auditLogService.getAllAuditLogs(pageable);
        }
        
        PagedResponse<AuditLog> pagedResponse = PagedResponse.from(logs);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved successfully", pagedResponse));
    }

    /**
     * Get audit logs for specific entity
     * GET /api/v1/admin/audit-logs/entity/{entityType}/{entityId}
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getEntityAuditLogs(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        List<AuditLog> logs = auditLogService.getEntityAuditLogs(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.success("Entity audit logs retrieved successfully", logs));
    }

    /**
     * Get audit logs by date range
     * GET /api/v1/admin/audit-logs/range?from=2025-01-01T00:00:00&to=2025-01-31T23:59:59
     */
    @GetMapping("/range")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLog>>> getAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuditLog> logs = auditLogService.getAuditLogsByDateRange(from, to, pageable);
        PagedResponse<AuditLog> pagedResponse = PagedResponse.from(logs);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved successfully", pagedResponse));
    }

    /**
     * Get audit logs by user
     * GET /api/v1/admin/audit-logs/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogsByUser(@PathVariable Long userId) {
        List<AuditLog> logs = auditLogService.getAuditLogsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User audit logs retrieved successfully", logs));
    }
}
