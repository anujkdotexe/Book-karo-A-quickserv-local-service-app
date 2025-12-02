package com.bookkaro.service;

import com.bookkaro.model.SearchAnalytics;
import com.bookkaro.model.User;
import com.bookkaro.repository.SearchAnalyticsRepository;
import com.bookkaro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchAnalyticsService {

    private final SearchAnalyticsRepository searchAnalyticsRepository;
    private final UserRepository userRepository;

    @Transactional
    public void trackSearch(String searchTerm, int resultsCount, Long userId, HttpServletRequest request) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                // Log warning if user ID provided but not found
                System.out.println("Warning: User ID " + userId + " not found for search analytics");
            }
        }

        SearchAnalytics analytics = SearchAnalytics.builder()
                .searchTerm(searchTerm)
                .resultsCount(resultsCount)
                .user(user)
                .ipAddress(getClientIp(request))
                .userAgent(request.getHeader("User-Agent"))
                .build();

        searchAnalyticsRepository.save(analytics);
    }

    public List<String> getTrendingSearches(int limit) {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        List<Object[]> results = searchAnalyticsRepository.findTrendingSearches(
                since, PageRequest.of(0, limit));
        
        return results.stream()
                .map(row -> (String) row[0])
                .collect(Collectors.toList());
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip != null && ip.length() > 45 ? ip.substring(0, 45) : ip;
    }
}
