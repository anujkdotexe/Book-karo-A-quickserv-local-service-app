package com.bookaro.repository;

import com.bookaro.model.User;
import com.bookaro.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    
    Optional<Wallet> findByUser(User user);
    
    Optional<Wallet> findByUserId(Long userId);
}
