package com.bookkaro.repository;

import com.bookkaro.model.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Service Repository - Data access layer for Service entity
 */
@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    Page<Service> findByIsAvailableTrue(Pageable pageable);

    Page<Service> findByCategoryAndIsAvailableTrue(String category, Pageable pageable);

    Page<Service> findByCityAndIsAvailableTrue(String city, Pageable pageable);

    Page<Service> findByCategoryAndCityAndIsAvailableTrue(String category, String city, Pageable pageable);

    Page<Service> findByAddressContainingIgnoreCaseAndIsAvailableTrue(String location, Pageable pageable);

    Page<Service> findByServiceNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseAndIsAvailableTrue(
            String serviceName, String description, Pageable pageable);

    @Query("SELECT s FROM Service s WHERE s.isAvailable = true AND " +
           "(:category IS NULL OR s.category = :category) AND " +
           "(:city IS NULL OR s.city = :city)")
    Page<Service> searchServices(@Param("category") String category,
                                  @Param("city") String city,
                                  Pageable pageable);

    @Query("SELECT DISTINCT s.category FROM Service s WHERE s.isAvailable = true ORDER BY s.category")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT s.address FROM Service s WHERE s.isAvailable = true ORDER BY s.address")
    List<String> findDistinctLocations();

    @Query("SELECT s FROM Service s WHERE s.vendor.id = :vendorId AND s.isAvailable = true")
    Page<Service> findByVendorId(@Param("vendorId") Long vendorId, Pageable pageable);
    
    @Query("SELECT s FROM Service s WHERE s.vendor.id = :vendorId")
    List<Service> findAllByVendorId(@Param("vendorId") Long vendorId);

    /**
     * Find all services by vendor ID (without pagination)
     */
    List<Service> findByVendorId(Long vendorId);
    
    @Query(value = "SELECT * FROM services s WHERE s.is_available = true AND " +
           "(:category IS NULL OR s.category = :category) AND " +
           "(:city IS NULL OR LOWER(CAST(s.city AS TEXT)) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:location IS NULL OR LOWER(CAST(s.address AS TEXT)) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minPrice IS NULL OR s.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR s.price <= :maxPrice) AND " +
           "(:minRating IS NULL OR s.average_rating >= :minRating)",
           countQuery = "SELECT COUNT(*) FROM services s WHERE s.is_available = true AND " +
           "(:category IS NULL OR s.category = :category) AND " +
           "(:city IS NULL OR LOWER(CAST(s.city AS TEXT)) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:location IS NULL OR LOWER(CAST(s.address AS TEXT)) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minPrice IS NULL OR s.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR s.price <= :maxPrice) AND " +
           "(:minRating IS NULL OR s.average_rating >= :minRating)",
           nativeQuery = true)
    Page<Service> advancedSearch(
            @Param("category") String category,
            @Param("city") String city,
            @Param("location") String location,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            @Param("minRating") java.math.BigDecimal minRating,
            Pageable pageable);
    
    @Query("SELECT DISTINCT s.city FROM Service s WHERE s.isAvailable = true ORDER BY s.city")
    List<String> findDistinctCities();
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.vendor WHERE s.id = :id")
    java.util.Optional<Service> findByIdWithVendor(@Param("id") Long id);
    
    @Query("SELECT DISTINCT s FROM Service s LEFT JOIN FETCH s.vendor")
    List<Service> findAllWithVendor();
    
    // Analytics methods
    Long countByIsAvailableTrue();
    
    long countByApprovalStatus(Service.ApprovalStatus status);
}


