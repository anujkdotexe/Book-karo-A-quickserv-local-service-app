package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.ServiceDto;
import com.bookkaro.model.Service;
import com.bookkaro.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.DecimalMin;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
@Validated
public class ServiceController {

    private final ServiceRepository serviceRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getAllServices(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DecimalMin(value = "0.0", message = "Minimum price cannot be negative") java.math.BigDecimal minPrice,
            @RequestParam(required = false) @DecimalMin(value = "0.0", message = "Maximum price cannot be negative") java.math.BigDecimal maxPrice,
            @RequestParam(required = false) @DecimalMin(value = "0.0", message = "Minimum rating must be between 0 and 5") java.math.BigDecimal minRating,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page number must be non-negative") int page,
            @RequestParam(defaultValue = "20") @Min(value = 1, message = "Page size must be at least 1") int size,
            @RequestParam(defaultValue = "averageRating") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
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
        
        // Use advanced search if any filter is provided
        if (minPrice != null || maxPrice != null || minRating != null || 
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

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<ServiceDto>> getServiceById(@PathVariable Long id) {
        Service service = serviceRepository.findById(id)
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
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("averageRating").descending());
        
        Page<Service> servicesPage;
        
        if (keyword != null && !keyword.isEmpty()) {
            servicesPage = serviceRepository.findByServiceNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseAndIsAvailableTrue(
                keyword, keyword, pageable);
        } else {
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

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = serviceRepository.findDistinctCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
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

    private ServiceDto convertToDto(Service service) {
        return ServiceDto.fromEntity(service);
    }
    
    /**
     * Map Java property names to database column names for native SQL queries
     */
    private String mapPropertyToColumn(String propertyName) {
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
            default -> propertyName; // category, city, state, price, etc. are same
        };
    }
}
