package com.bookkaro.service;

import com.bookkaro.model.Service;
import com.bookkaro.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Enhanced search service with fuzzy matching and geospatial capabilities
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EnhancedSearchService {

    private final ServiceRepository serviceRepository;
    private final EntityManager entityManager;

    /**
     * Perform fuzzy search with typo tolerance
     * Uses PostgreSQL similarity functions for fuzzy matching
     */
    public Page<Service> fuzzySearch(String keyword, String category, String city, String location,
                                   BigDecimal minPrice, BigDecimal maxPrice, BigDecimal minRating,
                                   Pageable pageable) {
        
        if (keyword == null || keyword.trim().isEmpty()) {
            return serviceRepository.advancedSearch(category, city, location, minPrice, maxPrice, minRating, pageable);
        }

        StringBuilder queryBuilder = new StringBuilder();
        StringBuilder countQueryBuilder = new StringBuilder();
        
        // Base query with fuzzy search using PostgreSQL similarity
        String baseCondition = buildFuzzySearchCondition();
        
        queryBuilder.append("SELECT s.* FROM services s WHERE s.is_available = true AND (")
                   .append(baseCondition)
                   .append(")");
        
        countQueryBuilder.append("SELECT COUNT(*) FROM services s WHERE s.is_available = true AND (")
                        .append(baseCondition)
                        .append(")");

        // Add additional filters
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("keyword", keyword.toLowerCase());
        
        if (category != null && !category.trim().isEmpty()) {
            queryBuilder.append(" AND s.category = :category");
            countQueryBuilder.append(" AND s.category = :category");
            parameters.put("category", category);
        }
        
        if (city != null && !city.trim().isEmpty()) {
            queryBuilder.append(" AND LOWER(CAST(s.city AS TEXT)) LIKE LOWER(CONCAT('%', :city, '%'))");
            countQueryBuilder.append(" AND LOWER(CAST(s.city AS TEXT)) LIKE LOWER(CONCAT('%', :city, '%'))");
            parameters.put("city", city);
        }
        
        if (location != null && !location.trim().isEmpty()) {
            queryBuilder.append(" AND LOWER(CAST(s.address AS TEXT)) LIKE LOWER(CONCAT('%', :location, '%'))");
            countQueryBuilder.append(" AND LOWER(CAST(s.address AS TEXT)) LIKE LOWER(CONCAT('%', :location, '%'))");
            parameters.put("location", location);
        }
        
        if (minPrice != null) {
            queryBuilder.append(" AND s.price >= :minPrice");
            countQueryBuilder.append(" AND s.price >= :minPrice");
            parameters.put("minPrice", minPrice);
        }
        
        if (maxPrice != null) {
            queryBuilder.append(" AND s.price <= :maxPrice");
            countQueryBuilder.append(" AND s.price <= :maxPrice");
            parameters.put("maxPrice", maxPrice);
        }
        
        if (minRating != null) {
            queryBuilder.append(" AND s.average_rating >= :minRating");
            countQueryBuilder.append(" AND s.average_rating >= :minRating");
            parameters.put("minRating", minRating);
        }
        
        // Add relevance-based ordering
        queryBuilder.append(" ORDER BY ")
                   .append(buildRelevanceOrdering())
                   .append(", s.average_rating DESC");

        try {
            // Execute main query
            Query query = entityManager.createNativeQuery(queryBuilder.toString(), Service.class);
            parameters.forEach(query::setParameter);
            
            query.setFirstResult((int) pageable.getOffset());
            query.setMaxResults(pageable.getPageSize());
            
            @SuppressWarnings("unchecked")
            List<Service> services = query.getResultList();
            
            // Execute count query
            Query countQuery = entityManager.createNativeQuery(countQueryBuilder.toString());
            parameters.forEach(countQuery::setParameter);
            
            Long totalElements = ((Number) countQuery.getSingleResult()).longValue();
            
            return new PageImpl<>(services, pageable, totalElements);
            
        } catch (Exception e) {
            log.error("Error in fuzzy search: {}", e.getMessage(), e);
            // Fallback to regular search
            return serviceRepository.searchByKeywordWithRelevance(keyword, pageable);
        }
    }

    /**
     * Build fuzzy search condition using PostgreSQL similarity
     */
    private String buildFuzzySearchCondition() {
        return """
            (
                -- Exact matches (highest priority)
                LOWER(s.service_name) = LOWER(:keyword) OR
                LOWER(s.category) = LOWER(:keyword) OR
                
                -- Starts with matches
                LOWER(s.service_name) LIKE LOWER(CONCAT(:keyword, '%')) OR
                LOWER(s.category) LIKE LOWER(CONCAT(:keyword, '%')) OR
                
                -- Contains matches
                LOWER(s.service_name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                LOWER(s.category) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                
                -- Fuzzy matches (PostgreSQL similarity - requires pg_trgm extension)
                -- Uncomment the following lines if pg_trgm extension is available
                -- similarity(LOWER(s.service_name), LOWER(:keyword)) > 0.3 OR
                -- similarity(LOWER(s.category), LOWER(:keyword)) > 0.3 OR
                -- similarity(LOWER(s.description), LOWER(:keyword)) > 0.2
                
                -- Simple typo tolerance (Levenshtein distance approximation)
                (LENGTH(:keyword) > 3 AND (
                    LOWER(s.service_name) LIKE LOWER(CONCAT(SUBSTRING(:keyword, 1, LENGTH(:keyword)-1), '%')) OR
                    LOWER(s.service_name) LIKE LOWER(CONCAT('%', SUBSTRING(:keyword, 2), '%'))
                ))
            )
            """;
    }

    /**
     * Build relevance ordering for fuzzy search results
     */
    private String buildRelevanceOrdering() {
        return """
            CASE
                WHEN LOWER(s.service_name) = LOWER(:keyword) THEN 1
                WHEN LOWER(s.category) = LOWER(:keyword) THEN 2
                WHEN LOWER(s.service_name) LIKE LOWER(CONCAT(:keyword, '%')) THEN 3
                WHEN LOWER(s.category) LIKE LOWER(CONCAT(:keyword, '%')) THEN 4
                WHEN LOWER(s.service_name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 5
                WHEN LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 6
                WHEN LOWER(s.category) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 7
                ELSE 8
            END
            """;
    }

    /**
     * Search services within a radius using geospatial coordinates
     * This is a basic implementation - can be enhanced with PostGIS
     */
    public Page<Service> searchNearby(double latitude, double longitude, double radiusKm,
                                    String category, BigDecimal minPrice, BigDecimal maxPrice,
                                    BigDecimal minRating, Pageable pageable) {
        
        StringBuilder queryBuilder = new StringBuilder();
        StringBuilder countQueryBuilder = new StringBuilder();
        
        // Haversine formula for distance calculation
        String distanceCalculation = """
            (6371 * acos(
                cos(radians(:latitude)) * cos(radians(COALESCE(s.latitude, 0))) *
                cos(radians(COALESCE(s.longitude, 0)) - radians(:longitude)) +
                sin(radians(:latitude)) * sin(radians(COALESCE(s.latitude, 0)))
            ))
            """;
        
        queryBuilder.append("SELECT s.* FROM services s WHERE s.is_available = true");
        countQueryBuilder.append("SELECT COUNT(*) FROM services s WHERE s.is_available = true");
        
        // Add distance filter if coordinates are available
        queryBuilder.append(" AND s.latitude IS NOT NULL AND s.longitude IS NOT NULL");
        countQueryBuilder.append(" AND s.latitude IS NOT NULL AND s.longitude IS NOT NULL");
        
        queryBuilder.append(" AND ").append(distanceCalculation).append(" <= :radiusKm");
        countQueryBuilder.append(" AND ").append(distanceCalculation).append(" <= :radiusKm");
        
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("latitude", latitude);
        parameters.put("longitude", longitude);
        parameters.put("radiusKm", radiusKm);
        
        // Add other filters
        if (category != null && !category.trim().isEmpty()) {
            queryBuilder.append(" AND s.category = :category");
            countQueryBuilder.append(" AND s.category = :category");
            parameters.put("category", category);
        }
        
        if (minPrice != null) {
            queryBuilder.append(" AND s.price >= :minPrice");
            countQueryBuilder.append(" AND s.price >= :minPrice");
            parameters.put("minPrice", minPrice);
        }
        
        if (maxPrice != null) {
            queryBuilder.append(" AND s.price <= :maxPrice");
            countQueryBuilder.append(" AND s.price <= :maxPrice");
            parameters.put("maxPrice", maxPrice);
        }
        
        if (minRating != null) {
            queryBuilder.append(" AND s.average_rating >= :minRating");
            countQueryBuilder.append(" AND s.average_rating >= :minRating");
            parameters.put("minRating", minRating);
        }
        
        // Order by distance and rating
        queryBuilder.append(" ORDER BY ")
                   .append(distanceCalculation)
                   .append(", s.average_rating DESC");

        try {
            // Execute main query
            Query query = entityManager.createNativeQuery(queryBuilder.toString(), Service.class);
            parameters.forEach(query::setParameter);
            
            query.setFirstResult((int) pageable.getOffset());
            query.setMaxResults(pageable.getPageSize());
            
            @SuppressWarnings("unchecked")
            List<Service> services = query.getResultList();
            
            // Execute count query
            Query countQuery = entityManager.createNativeQuery(countQueryBuilder.toString());
            parameters.forEach(countQuery::setParameter);
            
            Long totalElements = ((Number) countQuery.getSingleResult()).longValue();
            
            return new PageImpl<>(services, pageable, totalElements);
            
        } catch (Exception e) {
            log.error("Error in nearby search: {}", e.getMessage(), e);
            // Fallback to regular search
            return serviceRepository.advancedSearch(category, null, null, minPrice, maxPrice, minRating, pageable);
        }
    }

    /**
     * Get search suggestions for autocomplete with typo tolerance
     */
    public List<String> getSearchSuggestions(String query, int limit) {
        if (query == null || query.trim().length() < 2) {
            return new ArrayList<>();
        }
        
        try {
            String sql = """
                SELECT DISTINCT suggestion FROM (
                    SELECT s.service_name as suggestion, 1 as priority FROM services s 
                    WHERE s.is_available = true AND LOWER(s.service_name) LIKE LOWER(CONCAT(:query, '%'))
                    UNION
                    SELECT s.category as suggestion, 2 as priority FROM services s 
                    WHERE s.is_available = true AND LOWER(s.category) LIKE LOWER(CONCAT(:query, '%'))
                    UNION
                    SELECT s.service_name as suggestion, 3 as priority FROM services s 
                    WHERE s.is_available = true AND LOWER(s.service_name) LIKE LOWER(CONCAT('%', :query, '%'))
                ) combined 
                ORDER BY priority, suggestion
                LIMIT :limit
                """;
            
            Query nativeQuery = entityManager.createNativeQuery(sql);
            nativeQuery.setParameter("query", query.trim());
            nativeQuery.setParameter("limit", limit);
            
            @SuppressWarnings("unchecked")
            List<String> results = nativeQuery.getResultList();
            return results;
            
        } catch (Exception e) {
            log.error("Error getting search suggestions: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
}