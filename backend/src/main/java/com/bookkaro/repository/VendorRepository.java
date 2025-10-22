package com.bookkaro.repository;

import com.bookkaro.model.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {

    /**
     * Find vendor by vendor code
     */
    Optional<Vendor> findByVendorCode(String vendorCode);

    /**
     * Find vendor by user ID
     */
    Optional<Vendor> findByUserId(Long userId);

    /**
     * Find vendors by primary category
     */
    Page<Vendor> findByPrimaryCategoryContainingIgnoreCase(String category, Pageable pageable);

    /**
     * Find vendors by location
     */
    Page<Vendor> findByLocationContainingIgnoreCase(String location, Pageable pageable);

    /**
     * Find active vendors
     */
    Page<Vendor> findByIsActiveTrue(Pageable pageable);

    /**
     * Find verified vendors
     */
    Page<Vendor> findByIsVerifiedTrue(Pageable pageable);

    /**
     * Search vendors by business name, category, or location
     */
    @Query("SELECT v FROM Vendor v WHERE " +
           "LOWER(v.businessName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(v.primaryCategory) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(v.location) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Vendor> searchVendors(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find vendors with rating above threshold
     */
    @Query("SELECT v FROM Vendor v WHERE v.averageRating >= :minRating AND v.isActive = true")
    Page<Vendor> findByMinimumRating(@Param("minRating") Double minRating, Pageable pageable);

    /**
     * Find vendors by city
     */
    Page<Vendor> findByCityIgnoreCase(String city, Pageable pageable);

    /**
     * Count active vendors
     */
    long countByIsActiveTrue();

    /**
     * Count verified vendors
     */
    long countByIsVerifiedTrue();

    /**
     * Check if vendor code exists
     */
    boolean existsByVendorCode(String vendorCode);
}
