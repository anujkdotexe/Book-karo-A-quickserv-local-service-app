package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.ContactInquiryRequest;
import com.bookkaro.model.ContactInquiry;
import com.bookkaro.repository.ContactInquiryRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/contact")
@RequiredArgsConstructor
@Slf4j
public class ContactController {

    private final ContactInquiryRepository contactInquiryRepository;

    /**
     * Public endpoint - Submit contact inquiry
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitContactInquiry(
            @Valid @RequestBody ContactInquiryRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            log.info("Received contact inquiry from: {} ({})", request.getName(), request.getEmail());
            
            // Get client IP address
            String ipAddress = getClientIpAddress(httpRequest);
            
            // Create and save inquiry
            ContactInquiry inquiry = ContactInquiry.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .subject(request.getSubject())
                    .message(request.getMessage())
                    .status(ContactInquiry.InquiryStatus.NEW)
                    .ipAddress(ipAddress)
                    .build();
            
            ContactInquiry savedInquiry = contactInquiryRepository.save(inquiry);
            
            log.info("Contact inquiry saved with ID: {}", savedInquiry.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("inquiryId", savedInquiry.getId());
            response.put("message", "Thank you for contacting us! We'll get back to you within 24 hours.");
            response.put("createdAt", savedInquiry.getCreatedAt());
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Contact inquiry submitted successfully", response));
        } catch (Exception e) {
            log.error("Error submitting contact inquiry: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to submit contact inquiry. Please try again."));
        }
    }

    /**
     * Admin endpoint - Get all contact inquiries
     */
    @GetMapping("/admin/contact-inquiries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ContactInquiry>>> getAllInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<ContactInquiry> inquiries;
            
            if (status != null && !status.isEmpty()) {
                ContactInquiry.InquiryStatus inquiryStatus = ContactInquiry.InquiryStatus.valueOf(status);
                inquiries = contactInquiryRepository.findByStatus(inquiryStatus, pageable);
            } else {
                inquiries = contactInquiryRepository.findAll(pageable);
            }
            
            return ResponseEntity.ok(ApiResponse.success("Contact inquiries retrieved", inquiries));
        } catch (Exception e) {
            log.error("Error fetching contact inquiries: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch contact inquiries"));
        }
    }

    /**
     * Admin endpoint - Get inquiry statistics
     */
    @GetMapping("/admin/contact-inquiries/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getInquiryStats() {
        try {
            Map<String, Long> stats = new HashMap<>();
            stats.put("new", contactInquiryRepository.countByStatus(ContactInquiry.InquiryStatus.NEW));
            stats.put("inProgress", contactInquiryRepository.countByStatus(ContactInquiry.InquiryStatus.IN_PROGRESS));
            stats.put("resolved", contactInquiryRepository.countByStatus(ContactInquiry.InquiryStatus.RESOLVED));
            stats.put("closed", contactInquiryRepository.countByStatus(ContactInquiry.InquiryStatus.CLOSED));
            stats.put("total", contactInquiryRepository.count());
            
            return ResponseEntity.ok(ApiResponse.success("Statistics retrieved", stats));
        } catch (Exception e) {
            log.error("Error fetching inquiry stats: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch statistics"));
        }
    }

    /**
     * Admin endpoint - Update inquiry status
     */
    @PutMapping("/admin/contact-inquiries/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ContactInquiry>> updateInquiry(
            @PathVariable Long id,
            @RequestBody Map<String, String> updates) {
        
        try {
            ContactInquiry inquiry = contactInquiryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Inquiry not found"));
            
            if (updates.containsKey("status")) {
                inquiry.setStatus(ContactInquiry.InquiryStatus.valueOf(updates.get("status")));
                
                if (inquiry.getStatus() == ContactInquiry.InquiryStatus.RESOLVED) {
                    inquiry.setResolvedAt(LocalDateTime.now());
                }
            }
            
            if (updates.containsKey("adminNotes")) {
                inquiry.setAdminNotes(updates.get("adminNotes"));
            }
            
            ContactInquiry updated = contactInquiryRepository.save(inquiry);
            
            return ResponseEntity.ok(ApiResponse.success("Inquiry updated successfully", updated));
        } catch (Exception e) {
            log.error("Error updating inquiry: ", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to update inquiry"));
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
