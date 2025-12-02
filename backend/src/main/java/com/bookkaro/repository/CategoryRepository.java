package com.bookkaro.repository;

import com.bookkaro.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findBySlug(String slug);
    
    List<Category> findByParentIsNull();
    
    List<Category> findByParentId(Long parentId);
    
    List<Category> findByIsActiveTrue();
    
    @Query("SELECT c FROM Category c WHERE c.parent IS NULL AND c.isActive = true")
    List<Category> findActiveTopLevelCategories();
    
    @Query("SELECT c FROM Category c WHERE c.parent.id = :parentId AND c.isActive = true")
    List<Category> findActiveSubcategoriesByParentId(Long parentId);
    
    boolean existsBySlug(String slug);
}
