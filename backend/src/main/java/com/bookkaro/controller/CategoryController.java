package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.model.Category;
import com.bookkaro.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Category Controller - Public endpoints for browsing categories
 */
@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Get all active categories
     * GET /api/v1/categories
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    /**
     * Get top-level categories
     * GET /api/v1/categories/top
     */
    @GetMapping("/top")
    public ResponseEntity<ApiResponse<List<Category>>> getTopLevelCategories() {
        List<Category> categories = categoryService.getTopLevelCategories();
        return ResponseEntity.ok(ApiResponse.success("Top-level categories retrieved successfully", categories));
    }

    /**
     * Get subcategories by parent ID
     * GET /api/v1/categories/{parentId}/subcategories
     */
    @GetMapping("/{parentId}/subcategories")
    public ResponseEntity<ApiResponse<List<Category>>> getSubcategories(@PathVariable Long parentId) {
        List<Category> subcategories = categoryService.getSubcategories(parentId);
        return ResponseEntity.ok(ApiResponse.success("Subcategories retrieved successfully", subcategories));
    }

    /**
     * Get category by ID
     * GET /api/v1/categories/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", category));
    }

    /**
     * Get category by slug
     * GET /api/v1/categories/slug/{slug}
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<Category>> getCategoryBySlug(@PathVariable String slug) {
        Category category = categoryService.getCategoryBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", category));
    }
}
