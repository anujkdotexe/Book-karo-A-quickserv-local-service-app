package com.bookkaro.repository;

import com.bookkaro.model.Address;
import com.bookkaro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId AND a.id != :excludeId")
    void unsetDefaultForUser(@Param("userId") Long userId, @Param("excludeId") Long excludeId);
    
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId")
    void unsetAllDefaultForUser(@Param("userId") Long userId);
}

