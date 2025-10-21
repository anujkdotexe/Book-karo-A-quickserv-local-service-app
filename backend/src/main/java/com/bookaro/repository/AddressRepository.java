package com.bookaro.repository;

import com.bookaro.model.Address;
import com.bookaro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    
    List<Address> findByUserOrderByIsDefaultDescCreatedAtDesc(User user);
    
    List<Address> findByUserId(Long userId);
    
    Optional<Address> findByUserAndIsDefaultTrue(User user);
    
    Optional<Address> findByIdAndUser(Long id, User user);
    
    long countByUser(User user);
}
