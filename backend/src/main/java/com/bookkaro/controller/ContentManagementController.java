package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.model.Announcement;
import com.bookkaro.model.Banner;
import com.bookkaro.model.FAQ;
import com.bookkaro.repository.AnnouncementRepository;
import com.bookkaro.repository.BannerRepository;
import com.bookkaro.repository.FAQRepository;
import com.bookkaro.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Content Management Controller - For managing FAQs, Announcements, Banners
 * Admin access only
 */
@RestController
@RequestMapping("/admin/content")
@RequiredArgsConstructor
public class ContentManagementController {

    private final FAQRepository faqRepository;
    private final AnnouncementRepository announcementRepository;
    private final BannerRepository bannerRepository;
    private final NotificationService notificationService;

    // ==================== FAQ MANAGEMENT ====================

    /**
     * Get all FAQs
     * GET /api/v1/admin/content/faqs
     */
    @GetMapping("/faqs")
    public ResponseEntity<ApiResponse<List<FAQ>>> getAllFAQs() {
        List<FAQ> faqs = faqRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("FAQs retrieved successfully", faqs));
    }

    /**
     * Get active FAQs by category
     * GET /api/v1/admin/content/faqs/active?category=Booking
     */
    @GetMapping("/faqs/active")
    public ResponseEntity<ApiResponse<List<FAQ>>> getActiveFAQs(
            @RequestParam(required = false) String category) {
        List<FAQ> faqs;
        if (category != null && !category.isEmpty()) {
            faqs = faqRepository.findByCategoryAndIsActiveTrueOrderByDisplayOrderAsc(category);
        } else {
            faqs = faqRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        }
        return ResponseEntity.ok(ApiResponse.success("Active FAQs retrieved successfully", faqs));
    }

    /**
     * Search FAQs
     * GET /api/v1/admin/content/faqs/search?q=payment
     */
    @GetMapping("/faqs/search")
    public ResponseEntity<ApiResponse<List<FAQ>>> searchFAQs(@RequestParam String q) {
        List<FAQ> faqs = faqRepository.findByQuestionContainingIgnoreCaseOrAnswerContainingIgnoreCase(q, q);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", faqs));
    }

    /**
     * Create FAQ
     * POST /api/v1/admin/content/faqs
     */
    @PostMapping("/faqs")
    public ResponseEntity<ApiResponse<FAQ>> createFAQ(@Valid @RequestBody FAQ faq) {
        if (faq.getDisplayOrder() == null) {
            // Auto-assign display order
            long count = faqRepository.count();
            faq.setDisplayOrder((int) (count + 1));
        }
        FAQ savedFAQ = faqRepository.save(faq);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("FAQ created successfully", savedFAQ));
    }

    /**
     * Update FAQ
     * PUT /api/v1/admin/content/faqs/{id}
     */
    @PutMapping("/faqs/{id}")
    public ResponseEntity<ApiResponse<FAQ>> updateFAQ(
            @PathVariable Long id,
            @Valid @RequestBody FAQ faqDetails) {
        FAQ faq = faqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FAQ not found"));
        
        faq.setQuestion(faqDetails.getQuestion());
        faq.setAnswer(faqDetails.getAnswer());
        faq.setCategory(faqDetails.getCategory());
        faq.setDisplayOrder(faqDetails.getDisplayOrder());
        faq.setIsActive(faqDetails.getIsActive());
        
        FAQ updatedFAQ = faqRepository.save(faq);
        return ResponseEntity.ok(ApiResponse.success("FAQ updated successfully", updatedFAQ));
    }

    /**
     * Delete FAQ
     * DELETE /api/v1/admin/content/faqs/{id}
     */
    @DeleteMapping("/faqs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFAQ(@PathVariable Long id) {
        FAQ faq = faqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FAQ not found"));
        faqRepository.delete(faq);
        return ResponseEntity.ok(ApiResponse.success("FAQ deleted successfully", null));
    }

    /**
     * Toggle FAQ status
     * PUT /api/v1/admin/content/faqs/{id}/toggle
     */
    @PutMapping("/faqs/{id}/toggle")
    public ResponseEntity<ApiResponse<FAQ>> toggleFAQStatus(@PathVariable Long id) {
        FAQ faq = faqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FAQ not found"));
        faq.setIsActive(!faq.getIsActive());
        FAQ updatedFAQ = faqRepository.save(faq);
        return ResponseEntity.ok(ApiResponse.success("FAQ status toggled successfully", updatedFAQ));
    }

    // ==================== ANNOUNCEMENT MANAGEMENT ====================

    /**
     * Get all announcements
     * GET /api/v1/admin/content/announcements
     */
    @GetMapping("/announcements")
    public ResponseEntity<ApiResponse<List<Announcement>>> getAllAnnouncements() {
        List<Announcement> announcements = announcementRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Announcements retrieved successfully", announcements));
    }

    /**
     * Get active announcements
     * GET /api/v1/admin/content/announcements/active
     */
    @GetMapping("/announcements/active")
    public ResponseEntity<ApiResponse<List<Announcement>>> getActiveAnnouncements() {
        List<Announcement> announcements = announcementRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success("Active announcements retrieved successfully", announcements));
    }

    /**
     * Get active announcements for specific audience
     * GET /api/v1/admin/content/announcements/audience?audience=USERS
     */
    @GetMapping("/announcements/audience")
    public ResponseEntity<ApiResponse<List<Announcement>>> getAnnouncementsForAudience(
            @RequestParam String audience) {
        List<Announcement> announcements = announcementRepository
                .findActiveAnnouncementsForAudience(LocalDateTime.now(), audience);
        return ResponseEntity.ok(ApiResponse.success("Announcements retrieved successfully", announcements));
    }

    /**
     * Create announcement
     * POST /api/v1/admin/content/announcements
     */
    @PostMapping("/announcements")
    public ResponseEntity<ApiResponse<Announcement>> createAnnouncement(
            @Valid @RequestBody Announcement announcement,
            Authentication authentication) {
        // Set created by from authentication if needed
        Announcement savedAnnouncement = announcementRepository.save(announcement);
        
        // Create notifications for target audience if announcement is active
        if (savedAnnouncement.getIsActive()) {
            try {
                notificationService.createAnnouncementNotifications(savedAnnouncement);
            } catch (Exception e) {
                // Log error but don't fail announcement creation
                System.err.println("Failed to create announcement notifications: " + e.getMessage());
            }
        }
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Announcement created successfully", savedAnnouncement));
    }

    /**
     * Update announcement
     * PUT /api/v1/admin/content/announcements/{id}
     */
    @PutMapping("/announcements/{id}")
    public ResponseEntity<ApiResponse<Announcement>> updateAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody Announcement announcementDetails) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        
        announcement.setTitle(announcementDetails.getTitle());
        announcement.setContent(announcementDetails.getContent());
        announcement.setAnnouncementType(announcementDetails.getAnnouncementType());
        announcement.setAudience(announcementDetails.getAudience());
        announcement.setPriority(announcementDetails.getPriority());
        announcement.setStartsAt(announcementDetails.getStartsAt());
        announcement.setEndsAt(announcementDetails.getEndsAt());
        announcement.setIsActive(announcementDetails.getIsActive());
        
        Announcement updatedAnnouncement = announcementRepository.save(announcement);
        return ResponseEntity.ok(ApiResponse.success("Announcement updated successfully", updatedAnnouncement));
    }

    /**
     * Delete announcement
     * DELETE /api/v1/admin/content/announcements/{id}
     */
    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        announcementRepository.delete(announcement);
        return ResponseEntity.ok(ApiResponse.success("Announcement deleted successfully", null));
    }

    /**
     * Toggle announcement status
     * PUT /api/v1/admin/content/announcements/{id}/toggle
     */
    @PutMapping("/announcements/{id}/toggle")
    public ResponseEntity<ApiResponse<Announcement>> toggleAnnouncementStatus(@PathVariable Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        announcement.setIsActive(!announcement.getIsActive());
        Announcement updatedAnnouncement = announcementRepository.save(announcement);
        return ResponseEntity.ok(ApiResponse.success("Announcement status toggled successfully", updatedAnnouncement));
    }

    // ==================== BANNER MANAGEMENT ====================

    /**
     * Get all banners
     * GET /api/v1/admin/content/banners
     */
    @GetMapping("/banners")
    public ResponseEntity<ApiResponse<List<Banner>>> getAllBanners() {
        List<Banner> banners = bannerRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Banners retrieved successfully", banners));
    }

    /**
     * Get active banners
     * GET /api/v1/admin/content/banners/active?position=HOME_TOP
     */
    @GetMapping("/banners/active")
    public ResponseEntity<ApiResponse<List<Banner>>> getActiveBanners(
            @RequestParam(required = false) String position) {
        List<Banner> banners;
        if (position != null && !position.isEmpty()) {
            // repository now exposes findActiveBannersByTarget which uses the same
            // logical parameter (position in API maps to target in entity)
            banners = bannerRepository.findActiveBannersByTarget(LocalDateTime.now(), position);
        } else {
            banners = bannerRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        }
        return ResponseEntity.ok(ApiResponse.success("Active banners retrieved successfully", banners));
    }

    /**
     * Create banner
     * POST /api/v1/admin/content/banners
     */
    @PostMapping("/banners")
    public ResponseEntity<ApiResponse<Banner>> createBanner(@Valid @RequestBody Banner banner) {
        if (banner.getDisplayOrder() == null) {
            long count = bannerRepository.count();
            banner.setDisplayOrder((int) (count + 1));
        }
        Banner savedBanner = bannerRepository.save(banner);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Banner created successfully", savedBanner));
    }

    /**
     * Update banner
     * PUT /api/v1/admin/content/banners/{id}
     */
    @PutMapping("/banners/{id}")
    public ResponseEntity<ApiResponse<Banner>> updateBanner(
            @PathVariable Long id,
            @Valid @RequestBody Banner bannerDetails) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        
        banner.setTitle(bannerDetails.getTitle());
        banner.setImageUrl(bannerDetails.getImageUrl());
        banner.setLinkUrl(bannerDetails.getLinkUrl());
        banner.setTarget(bannerDetails.getTarget());
        banner.setDisplayOrder(bannerDetails.getDisplayOrder());
        banner.setStartsAt(bannerDetails.getStartsAt());
        banner.setEndsAt(bannerDetails.getEndsAt());
        banner.setIsActive(bannerDetails.getIsActive());
        
        Banner updatedBanner = bannerRepository.save(banner);
        return ResponseEntity.ok(ApiResponse.success("Banner updated successfully", updatedBanner));
    }

    /**
     * Delete banner
     * DELETE /api/v1/admin/content/banners/{id}
     */
    @DeleteMapping("/banners/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        bannerRepository.delete(banner);
        return ResponseEntity.ok(ApiResponse.success("Banner deleted successfully", null));
    }

    /**
     * Toggle banner status
     * PUT /api/v1/admin/content/banners/{id}/toggle
     */
    @PutMapping("/banners/{id}/toggle")
    public ResponseEntity<ApiResponse<Banner>> toggleBannerStatus(@PathVariable Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        banner.setIsActive(!banner.getIsActive());
        Banner updatedBanner = bannerRepository.save(banner);
        return ResponseEntity.ok(ApiResponse.success("Banner status toggled successfully", updatedBanner));
    }

    /**
     * Increment banner click count (tracking removed - column doesn't exist in DB)
     * POST /api/v1/admin/content/banners/{id}/click
     */
    @PostMapping("/banners/{id}/click")
    public ResponseEntity<ApiResponse<Void>> incrementBannerClick(@PathVariable Long id) {
        // Verify banner exists
        bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        // Click tracking removed - column doesn't exist in database
        return ResponseEntity.ok(ApiResponse.success("Banner click recorded", null));
    }
}
