package com.bookkaro.controller;

import com.bookkaro.dto.AddToCartRequest;
import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.CartItemDto;
import com.bookkaro.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    
    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CartItemDto>>> getCartItems(Authentication authentication) {
        String userEmail = authentication.getName();
        List<CartItemDto> items = cartService.getCartItems(userEmail);
        return ResponseEntity.ok(ApiResponse.success("Cart items retrieved", items));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartItemDto>> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        CartItemDto item = cartService.addToCart(userEmail, request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", item));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<Void>> removeFromCart(
            @PathVariable Long cartItemId,
            Authentication authentication) {
        String userEmail = authentication.getName();
        cartService.removeFromCart(userEmail, cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", null));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication authentication) {
        String userEmail = authentication.getName();
        cartService.clearCart(userEmail);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getCartItemCount(Authentication authentication) {
        String userEmail = authentication.getName();
        long count = cartService.getCartItemCount(userEmail);
        return ResponseEntity.ok(ApiResponse.success("Cart item count", count));
    }
}
