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

    // Case-insensitive city search
    @Query("SELECT s FROM Service s WHERE s.isAvailable = true AND LOWER(s.city) = LOWER(:city)")
    Page<Service> findByCityIgnoreCaseAndIsAvailableTrue(@Param("city") String city, Pageable pageable);

    @Query("SELECT s FROM Service s WHERE s.isAvailable = true AND s.categoryLegacy = :category AND s.city = :city")
    Page<Service> findByCategoryAndCityAndIsAvailableTrue(@Param("category") String category, @Param("city") String city, Pageable pageable);

    // Case-insensitive category and city search
    @Query("SELECT s FROM Service s WHERE s.isAvailable = true AND s.categoryLegacy = :category AND LOWER(s.city) = LOWER(:city)")
    Page<Service> findByCategoryAndCityIgnoreCaseAndIsAvailableTrue(@Param("category") String category, @Param("city") String city, Pageable pageable);

    Page<Service> findByAddressContainingIgnoreCaseAndIsAvailableTrue(String location, Pageable pageable);

    Page<Service> findByServiceNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseAndIsAvailableTrue(
            String serviceName, String description, Pageable pageable);
    
    // Enhanced search with relevance scoring
    @Query("SELECT s FROM Service s WHERE s.isAvailable = true AND " +
           "(LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.categoryLegacy) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY CASE " +
           "WHEN LOWER(s.serviceName) = LOWER(:keyword) THEN 1 " +
           "WHEN LOWER(s.serviceName) LIKE LOWER(CONCAT(:keyword, '%')) THEN 2 " +
           "WHEN LOWER(s.serviceName) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 3 " +
           "WHEN LOWER(s.categoryLegacy) = LOWER(:keyword) THEN 4 " +
           "WHEN LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 5 " +
           "ELSE 6 END, s.averageRating DESC")
    Page<Service> searchByKeywordWithRelevance(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT s FROM Service s WHERE s.isAvailable = true AND " +
           "(:category IS NULL OR s.category = :category) AND " +
           "(:city IS NULL OR s.city = :city)")
    Page<Service> searchServices(@Param("category") String category,
                                  @Param("city") String city,
                                  Pageable pageable);

    // Fixed: Using category.name from Category entity relationship
    @Query("SELECT c.name FROM Service s JOIN s.category c WHERE s.isAvailable = true AND c.name IS NOT NULL GROUP BY c.name ORDER BY c.name")
    List<String> findDistinctCategories();

    @Query("SELECT s.address FROM Service s WHERE s.isAvailable = true GROUP BY s.address ORDER BY s.address")
    List<String> findDistinctLocations();

    @Query("SELECT s FROM Service s WHERE s.vendor.id = :vendorId AND s.isAvailable = true")
    Page<Service> findByVendorId(@Param("vendorId") Long vendorId, Pageable pageable);
    
    @Query("SELECT s FROM Service s WHERE s.vendor.id = :vendorId")
    List<Service> findAllByVendorId(@Param("vendorId") Long vendorId);

    /**
     * Find all services by vendor ID (without pagination), excluding soft-deleted services
     */
    @Query("SELECT s FROM Service s WHERE s.vendor.id = :vendorId AND s.deletedAt IS NULL")
    List<Service> findByVendorId(@Param("vendorId") Long vendorId);
    
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
    
    // Fixed: Removed DISTINCT to avoid PostgreSQL ORDER BY issue
    @Query("SELECT s.city FROM Service s WHERE s.isAvailable = true GROUP BY s.city ORDER BY s.city")
    List<String> findDistinctCities();
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.vendor WHERE s.id = :id")
    java.util.Optional<Service> findByIdWithVendor(@Param("id") Long id);
    
    @Query("SELECT s FROM Service s LEFT JOIN FETCH s.vendor LEFT JOIN FETCH s.category WHERE s.id = :id")
    java.util.Optional<Service> findByIdWithVendorAndCategory(@Param("id") Long id);
    
    @Query("SELECT DISTINCT s FROM Service s LEFT JOIN FETCH s.vendor")
    List<Service> findAllWithVendor();
    
    @Query("SELECT DISTINCT s FROM Service s LEFT JOIN FETCH s.vendor LEFT JOIN FETCH s.category")
    List<Service> findAllWithVendorAndCategory();
    
    // Analytics methods
    Long countByIsAvailableTrue();
    
    
    long countByApprovalStatus(Service.ApprovalStatus status);
    
    // Platform Analytics methods
    Long countByIsAvailable(boolean isAvailable);
    
    // Top services queries - use BookingRepository for actual booking data instead
    @Query("SELECT AVG(s.averageRating) FROM Service s WHERE s.averageRating IS NOT NULL")
    Double findAverageRating();
    
    @Query("SELECT s FROM Service s WHERE s.averageRating IS NOT NULL AND s.totalReviews > 0 ORDER BY s.averageRating DESC, s.totalReviews DESC")
    List<Service> findTopRatedServices();
    
    @Query("SELECT COALESCE(c.name, s.categoryLegacy) as category, " +
           "SUM(b.priceTotal) as revenue, " +
           "COUNT(b.id) as bookings " +
           "FROM Service s " +
           "LEFT JOIN s.category c " +
           "JOIN Booking b ON b.service.id = s.id " +
           "WHERE b.status = 'COMPLETED' " +
           "GROUP BY c.name, s.categoryLegacy " +
           "ORDER BY revenue DESC")
    List<Object[]> findRevenueByCategoryFromCompletedBookings();
}
