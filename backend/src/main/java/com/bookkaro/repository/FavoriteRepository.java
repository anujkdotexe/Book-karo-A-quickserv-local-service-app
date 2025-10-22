package com.bookkaro.repository;

import com.bookkaro.model.Favorite;
import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    
    @Query("SELECT s FROM Favorite f " +
           "JOIN f.service s " +
           "JOIN FETCH s.vendor " +
           "WHERE f.user = :user " +
           "ORDER BY f.createdAt DESC")
    List<Service> findFavoriteServicesByUser(@Param("user") User user);
    
    Optional<Favorite> findByUserAndService(User user, Service service);
    
    boolean existsByUserAndService(User user, Service service);
    
    void deleteByUserAndService(User user, Service service);
}
