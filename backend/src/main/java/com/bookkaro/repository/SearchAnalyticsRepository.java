package com.bookkaro.repository;

import com.bookkaro.model.SearchAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchAnalyticsRepository extends JpaRepository<SearchAnalytics, Long> {
    
    @Query("SELECT s.searchTerm, COUNT(s) as count FROM SearchAnalytics s " +
           "WHERE s.createdAt > :since " +
           "GROUP BY s.searchTerm " +
           "ORDER BY count DESC")
    List<Object[]> findTrendingSearches(LocalDateTime since, org.springframework.data.domain.Pageable pageable);
}
