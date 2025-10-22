package com.bookkaro.repository;

import com.bookkaro.model.CartItem;
import com.bookkaro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findByUserId(Long userId);
    
    Optional<CartItem> findByUserAndServiceId(User user, Long serviceId);
    
    void deleteByUserId(Long userId);
    
    long countByUserId(Long userId);
}
