package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.model.Announcement;
import com.bookkaro.model.Banner;
import com.bookkaro.model.FAQ;
import com.bookkaro.repository.AnnouncementRepository;
import com.bookkaro.repository.BannerRepository;
import com.bookkaro.repository.FAQRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Public Content Controller - For public access to FAQs, Announcements, Banners
 * No authentication required
 */
@RestController
@RequestMapping("/api/v1/public/content")
@RequiredArgsConstructor
public class PublicContentController {

    private final FAQRepository faqRepository;
    private final AnnouncementRepository announcementRepository;
    private final BannerRepository bannerRepository;

    /**
     * Get all active FAQs
     * GET /api/v1/public/content/faqs
     */
    @GetMapping("/faqs")
    public ResponseEntity<ApiResponse<List<FAQ>>> getActiveFAQs(
            @RequestParam(required = false) String category) {
        List<FAQ> faqs;
        if (category != null && !category.isEmpty()) {
            faqs = faqRepository.findByCategoryAndIsActiveTrueOrderByDisplayOrderAsc(category);
        } else {
            faqs = faqRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        }
        return ResponseEntity.ok(ApiResponse.success("FAQs retrieved successfully", faqs));
    }

    /**
     * Search FAQs
     * GET /api/v1/public/content/faqs/search?q=booking
     */
    @GetMapping("/faqs/search")
    public ResponseEntity<ApiResponse<List<FAQ>>> searchFAQs(@RequestParam String q) {
        List<FAQ> faqs = faqRepository.findByQuestionContainingIgnoreCaseOrAnswerContainingIgnoreCase(q, q)
                .stream()
                .filter(FAQ::getIsActive)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", faqs));
    }

    /**
     * Get active announcements for user role
     * GET /api/v1/public/content/announcements?role=USERS
     */
    @GetMapping("/announcements")
    public ResponseEntity<ApiResponse<List<Announcement>>> getActiveAnnouncements(
            @RequestParam(defaultValue = "ALL") String role) {
        List<Announcement> announcements = announcementRepository
                .findActiveAnnouncementsForAudience(LocalDateTime.now(), role);
        return ResponseEntity.ok(ApiResponse.success("Announcements retrieved successfully", announcements));
    }

    /**
     * Get active banners by position
     * GET /api/v1/public/content/banners?position=HOME_TOP
     */
    @GetMapping("/banners")
    public ResponseEntity<ApiResponse<List<Banner>>> getActiveBanners(
            @RequestParam(required = false) String position) {
        List<Banner> banners;
        if (position != null && !position.isEmpty()) {
            banners = bannerRepository.findActiveBannersByPosition(LocalDateTime.now(), position);
        } else {
            banners = bannerRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        }
        return ResponseEntity.ok(ApiResponse.success("Banners retrieved successfully", banners));
    }

    /**
     * Record banner click
     * POST /api/v1/public/content/banners/{id}/click
     */
    @PostMapping("/banners/{id}/click")
    public ResponseEntity<ApiResponse<Void>> recordBannerClick(@PathVariable Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        banner.setClickCount(banner.getClickCount() + 1);
        bannerRepository.save(banner);
        return ResponseEntity.ok(ApiResponse.success("Click recorded", null));
    }
}
