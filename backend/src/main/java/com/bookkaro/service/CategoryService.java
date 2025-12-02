package com.bookkaro.service;

import com.bookkaro.model.Category;
import com.bookkaro.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<Category> getActiveCategories() {
        return categoryRepository.findByIsActiveTrue();
    }

    public List<Category> getTopLevelCategories() {
        return categoryRepository.findActiveTopLevelCategories();
    }

    public List<Category> getSubcategories(Long parentId) {
        return categoryRepository.findActiveSubcategoriesByParentId(parentId);
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public Optional<Category> getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug);
    }

    @Transactional
    public Category createCategory(Category category) {
        if (categoryRepository.existsBySlug(category.getSlug())) {
            throw new IllegalArgumentException("Category with slug " + category.getSlug() + " already exists");
        }
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));

        if (!category.getSlug().equals(categoryDetails.getSlug()) && 
            categoryRepository.existsBySlug(categoryDetails.getSlug())) {
            throw new IllegalArgumentException("Category with slug " + categoryDetails.getSlug() + " already exists");
        }

        category.setName(categoryDetails.getName());
        category.setSlug(categoryDetails.getSlug());
        category.setDescription(categoryDetails.getDescription());
        category.setParent(categoryDetails.getParent());
        category.setIsActive(categoryDetails.getIsActive());

        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + id));
        
        // Soft delete
        category.setIsActive(false);
        categoryRepository.save(category);
    }
}
