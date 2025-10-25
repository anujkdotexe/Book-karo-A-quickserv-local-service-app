package com.bookkaro.controller;

import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.ServiceDto;
import com.bookkaro.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceDto>>> getFavoriteServices(Authentication authentication) {
        List<ServiceDto> favorites = favoriteService.getFavoriteServices(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Favorite services retrieved successfully", favorites));
    }

    @PostMapping("/{serviceId}")
    public ResponseEntity<ApiResponse<ServiceDto>> addToFavorites(
            @PathVariable Long serviceId,
            Authentication authentication) {
        ServiceDto service = favoriteService.addToFavorites(authentication.getName(), serviceId);
        return ResponseEntity.ok(ApiResponse.success("Service added to favorites", service));
    }

    @DeleteMapping("/{serviceId}")
    public ResponseEntity<ApiResponse<Void>> removeFromFavorites(
            @PathVariable Long serviceId,
            Authentication authentication) {
        favoriteService.removeFromFavorites(authentication.getName(), serviceId);
        return ResponseEntity.ok(ApiResponse.success("Service removed from favorites", null));
    }

    @GetMapping("/{serviceId}/check")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkFavorite(
            @PathVariable Long serviceId,
            Authentication authentication) {
        boolean isFavorite = favoriteService.isFavorite(authentication.getName(), serviceId);
        return ResponseEntity.ok(ApiResponse.success("Favorite status retrieved", 
            Map.of("isFavorite", isFavorite)));
    }
}
