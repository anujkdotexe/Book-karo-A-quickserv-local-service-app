package com.bookkaro.repository;
import com.bookkaro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<User> findByEmailAndIsActiveTrue(String email);
    
    // Phone number validation
    Optional<User> findByPhone(String phone);
    Boolean existsByPhone(String phone);
    Optional<User> findByResetToken(String resetToken);
    
    // Find users by role
    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r = :role")
    List<User> findByRole(@Param("role") User.UserRole role);
    
    // Analytics methods - Updated for multi-role support
    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r = :role")
    Long countByRole(@Param("role") User.UserRole role);
    
    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE r = :role AND u.isActive = true")
    Long countByRoleAndIsActiveTrue(@Param("role") User.UserRole role);
    
    // Platform Analytics methods
    Long countByCreatedAtAfter(LocalDateTime createdAt);
    Long countByLastLoginAfter(LocalDateTime lastLogin);
}
