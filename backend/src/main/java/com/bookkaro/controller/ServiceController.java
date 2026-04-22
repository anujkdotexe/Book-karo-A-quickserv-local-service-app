package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.ServiceDto;
import com.bookkaro.model.Service;
import com.bookkaro.repository.ServiceRepository;
import com.bookkaro.service.SearchAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceRepository serviceRepository;
    private final SearchAnalyticsService searchAnalyticsService;
    private final com.bookkaro.service.EnhancedSearchService enhancedSearchService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getAllServices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) java.math.BigDecimal minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "averageRating") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        // Validate pagination parameters
        if (page < 0) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Page number must be non-negative")
            );
        }
        if (size <= 0) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Page size must be at least 1")
            );
        }
        
        // Validate price parameters
        if (minPrice != null && minPrice.compareTo(java.math.BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Minimum price cannot be negative")
            );
        }
        if (maxPrice != null && maxPrice.compareTo(java.math.BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Maximum price cannot be negative")
            );
        }
        
        // Validate price range logic
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Invalid price range: minimum price cannot be greater than maximum price")
            );
        }
        
        // Validate rating range
        if (minRating != null && minRating.compareTo(java.math.BigDecimal.valueOf(5)) > 0) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Minimum rating cannot exceed 5")
            );
        }
        
        Page<Service> servicesPage;
        
        // Use enhanced search with fuzzy matching if search keyword is provided
        if (search != null && !search.trim().isEmpty()) {
            Pageable pageable = PageRequest.of(page, size, 
                sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending());
            servicesPage = enhancedSearchService.fuzzySearch(
                search, category, city, location, minPrice, maxPrice, minRating, pageable);
        } 
        // Use advanced search if any filter is provided
        else if (minPrice != null || maxPrice != null || minRating != null || 
            (category != null && !category.isEmpty()) || 
            (city != null && !city.isEmpty()) || 
            (location != null && !location.isEmpty())) {
            // For native query, map property names to column names
            String dbSortBy = mapPropertyToColumn(sortBy);
            Pageable pageable = PageRequest.of(page, size, 
                sortDir.equalsIgnoreCase("desc") ? Sort.by(dbSortBy).descending() : Sort.by(dbSortBy).ascending());
            servicesPage = serviceRepository.advancedSearch(
                category, city, location, minPrice, maxPrice, minRating, pageable);
        } else {
            // For JPQL query, use property names as-is
            Pageable pageable = PageRequest.of(page, size, 
                sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending());
            servicesPage = serviceRepository.findByIsAvailableTrue(pageable);
        }
        
        List<ServiceDto> serviceDtos = servicesPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        // Create a map with pagination info
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("content", serviceDtos);
        response.put("totalPages", servicesPage.getTotalPages());
        response.put("totalElements", servicesPage.getTotalElements());
        response.put("currentPage", servicesPage.getNumber());
        response.put("size", servicesPage.getSize());
        
        return ResponseEntity.ok(ApiResponse.success(
            "Services retrieved successfully. Total: " + servicesPage.getTotalElements(), 
            response
        ));
    }

    /**
     * Get vendor information for a specific service
     * GET /services/{id}/vendor
     */
    @GetMapping("/{id}/vendor")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getServiceVendor(@PathVariable Long id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        
        if (service.getVendor() == null) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Vendor information not available for this service")
            );
        }
        
        var vendor = service.getVendor();
        java.util.Map<String, Object> vendorInfo = new java.util.HashMap<>();
        vendorInfo.put("id", vendor.getId());
        vendorInfo.put("businessName", vendor.getBusinessName());
        vendorInfo.put("phone", vendor.getPhone());
        vendorInfo.put("email", vendor.getEmail());
        vendorInfo.put("city", vendor.getCity());
        vendorInfo.put("state", vendor.getState());
        vendorInfo.put("averageRating", vendor.getAverageRating());
        vendorInfo.put("totalReviews", vendor.getTotalReviews());
        vendorInfo.put("isVerified", vendor.getIsVerified());
        
        return ResponseEntity.ok(ApiResponse.success("Vendor information retrieved successfully", vendorInfo));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<ServiceDto>> getServiceById(@PathVariable Long id) {
        Service service = serviceRepository.findByIdWithVendorAndCategory(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
        
        return ResponseEntity.ok(ApiResponse.success("Service retrieved successfully", convertToDto(service)));
    }

    @GetMapping("/search")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ServiceDto>>> searchServices(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication,
            HttpServletRequest request
    ) {
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Service> servicesPage;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            servicesPage = serviceRepository.searchByKeywordWithRelevance(
                keyword.trim(), pageable);
            
            // Track search analytics
            Long userId = authentication != null ? getUserIdFromAuth(authentication) : null;
            searchAnalyticsService.trackSearch(
                keyword.trim(), 
                (int) servicesPage.getTotalElements(), 
                userId, 
                request
            );
        } else {
            pageable = PageRequest.of(page, size, Sort.by("averageRating").descending());
            servicesPage = serviceRepository.searchServices(category, city, pageable);
        }
        
        List<ServiceDto> serviceDtos = servicesPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(
            "Search completed. Found: " + servicesPage.getTotalElements() + " services", 
            serviceDtos
        ));
    }

    /**
     * Get all unique categories for filtering
     */
    @GetMapping("/categories")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = serviceRepository.findDistinctCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }
    
    @GetMapping("/trending")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<String>>> getTrendingSearches() {
        List<String> trending = searchAnalyticsService.getTrendingSearches(5);
        if (trending.isEmpty()) {
            trending = List.of("Plumbing", "Cleaning", "Electrician", "Painting", "Carpentry");
        }
        return ResponseEntity.ok(ApiResponse.success("Trending searches retrieved", trending));
    }

    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<String>>> getLocations() {
        List<String> locations = serviceRepository.findDistinctLocations();
        return ResponseEntity.ok(ApiResponse.success("Locations retrieved successfully", locations));
    }
    
    @GetMapping("/cities")
    public ResponseEntity<ApiResponse<List<String>>> getCities() {
        List<String> cities = serviceRepository.findDistinctCities();
        return ResponseEntity.ok(ApiResponse.success("Cities retrieved successfully", cities));
    }

    /**
     * Enhanced autocomplete/suggestions for search box with rich data
     * GET /services/autocomplete?q=plumb
     */
    @GetMapping("/autocomplete")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<java.util.Map<String, Object>>>> autocomplete(
            @RequestParam(value = "q", required = true) String query,
            @RequestParam(defaultValue = "10") int limit
    ) {
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.ok(ApiResponse.success("Query too short", List.of()));
        }
        
        String searchTerm = query.trim();
        Pageable pageable = PageRequest.of(0, limit);
        
        // Use enhanced search with relevance scoring
        Page<Service> services = serviceRepository.searchByKeywordWithRelevance(
                searchTerm, pageable
        );
        
        // Return rich suggestion data: id, name, category, price, rating
        List<java.util.Map<String, Object>> suggestions = services.stream()
                .map(service -> {
                    java.util.Map<String, Object> suggestion = new java.util.HashMap<>();
                    suggestion.put("id", service.getId());
                    suggestion.put("name", service.getServiceName());
                    suggestion.put("category", service.getCategoryLegacy());
                    suggestion.put("price", service.getPrice());
                    suggestion.put("rating", service.getAverageRating());
                    suggestion.put("city", service.getCity());
                    return suggestion;
                })
                .limit(limit)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Autocomplete suggestions retrieved", suggestions));
    }

    private ServiceDto convertToDto(Service service) {
        return ServiceDto.fromEntity(service);
    }
    
    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            String username = ((org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal()).getUsername();
            return Long.parseLong(username);
        }
        return null;
    }
    
    /**
     * Map Java property names to database column names for native SQL queries
     * Validates against whitelist to prevent SQL injection
     */
    private String mapPropertyToColumn(String propertyName) {
        // Whitelist of allowed sort fields
        return switch (propertyName) {
            case "averageRating" -> "average_rating";
            case "serviceName" -> "service_name";
            case "durationMinutes" -> "duration_minutes";
            case "postalCode" -> "postal_code";
            case "isAvailable" -> "is_available";
            case "isFeatured" -> "is_featured";
            case "approvalStatus" -> "approval_status";
            case "rejectionReason" -> "rejection_reason";
            case "totalReviews" -> "total_reviews";
            case "createdAt" -> "created_at";
            case "updatedAt" -> "updated_at";
            case "category", "city", "state", "price" -> propertyName; // Same in DB
            default -> "created_at"; // Safe default instead of passing through untrusted input
        };
    }

    /**
     * Search services by location with radius
     */
    @GetMapping("/nearby")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> searchNearbyServices(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "10.0") double radiusKm,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) java.math.BigDecimal minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        try {
            // Validate coordinates
            if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Invalid coordinates")
                );
            }
            
            // Validate radius
            if (radiusKm <= 0 || radiusKm > 100) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Radius must be between 0 and 100 km")
                );
            }
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("averageRating").descending());
            Page<Service> servicesPage = enhancedSearchService.searchNearby(
                latitude, longitude, radiusKm, category, minPrice, maxPrice, minRating, pageable);
            
            List<ServiceDto> serviceDtos = servicesPage.getContent().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("services", serviceDtos);
            response.put("currentPage", servicesPage.getNumber());
            response.put("totalPages", servicesPage.getTotalPages());
            response.put("totalElements", servicesPage.getTotalElements());
            response.put("pageSize", servicesPage.getSize());
            response.put("hasNext", servicesPage.hasNext());
            response.put("hasPrevious", servicesPage.hasPrevious());
            
            return ResponseEntity.ok(ApiResponse.success("Nearby services found", response));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                ApiResponse.error("Failed to search nearby services: " + e.getMessage())
            );
        }
    }
}
