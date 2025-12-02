package com.bookkaro.repository;

import com.bookkaro.model.VendorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VendorAvailabilityRepository extends JpaRepository<VendorAvailability, Long> {
    
    List<VendorAvailability> findByVendorId(Long vendorId);
    
    List<VendorAvailability> findByVendorIdAndIsRecurringTrue(Long vendorId);
    
    @Query("SELECT va FROM VendorAvailability va WHERE va.vendor.id = :vendorId AND va.isRecurring = false AND va.startTs >= :from AND va.endTs <= :to")
    List<VendorAvailability> findOneOffAvailabilities(Long vendorId, LocalDateTime from, LocalDateTime to);
    
    @Query("SELECT va FROM VendorAvailability va WHERE va.vendor.id = :vendorId AND va.dayOfWeek = :dayOfWeek AND va.isRecurring = true")
    List<VendorAvailability> findRecurringAvailabilitiesByDay(Long vendorId, Short dayOfWeek);
}
