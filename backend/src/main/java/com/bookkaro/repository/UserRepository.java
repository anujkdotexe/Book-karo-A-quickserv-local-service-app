package com.bookkaro.repository;

import com.bookkaro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<User> findByEmailAndIsActiveTrue(String email);
    Optional<User> findByResetToken(String resetToken);
    
    // Analytics methods
    Long countByRole(User.UserRole role);
    Long countByRoleAndIsActiveTrue(User.UserRole role);
}
