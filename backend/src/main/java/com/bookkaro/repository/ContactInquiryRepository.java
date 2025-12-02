package com.bookkaro.repository;

import com.bookkaro.model.ContactInquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactInquiryRepository extends JpaRepository<ContactInquiry, Long> {
    
    Page<ContactInquiry> findByStatus(ContactInquiry.InquiryStatus status, Pageable pageable);
    
    List<ContactInquiry> findByEmailOrderByCreatedAtDesc(String email);
    
    long countByStatus(ContactInquiry.InquiryStatus status);
}
