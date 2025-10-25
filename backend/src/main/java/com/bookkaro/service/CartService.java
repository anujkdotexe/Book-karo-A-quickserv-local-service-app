package com.bookkaro.service;

import com.bookkaro.dto.AddToCartRequest;
import com.bookkaro.dto.CartItemDto;
import com.bookkaro.exception.ResourceNotFoundException;
import com.bookkaro.model.CartItem;
import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import com.bookkaro.repository.CartItemRepository;
import com.bookkaro.repository.ServiceRepository;
import com.bookkaro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    public List<CartItemDto> getCartItems(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());
        
        return cartItems.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemDto addToCart(String userEmail, AddToCartRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        
        // Validate service is available and approved
        if (!service.getIsAvailable()) {
            throw new RuntimeException("Service is not available");
        }
        
        if (service.getApprovalStatus() != Service.ApprovalStatus.APPROVED) {
            throw new RuntimeException("Service is not approved for booking");
        }
        
        // Validate quantity
        if (request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }
        
        // Check if item already exists in cart
        CartItem cartItem = cartItemRepository.findByUserAndService_Id(user, service.getId())
                .orElse(null);
        
        if (cartItem != null) {
            // Update quantity
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            // Create new cart item
            cartItem = CartItem.builder()
                    .user(user)
                    .service(service)
                    .quantity(request.getQuantity())
                    .build();
        }
        
        CartItem saved = cartItemRepository.save(cartItem);
        return mapToDto(saved);
    }

    @Transactional
    public void removeFromCart(String userEmail, Long cartItemId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        
        // Verify the cart item belongs to the user
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to cart item");
        }
        
        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        cartItemRepository.deleteByUserId(user.getId());
    }

    public long getCartItemCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return cartItemRepository.countByUserId(user.getId());
    }

    private CartItemDto mapToDto(CartItem cartItem) {
        CartItemDto dto = new CartItemDto();
        dto.setId(cartItem.getId());
        dto.setServiceId(cartItem.getService().getId());
        dto.setServiceName(cartItem.getService().getServiceName());
        dto.setCategory(cartItem.getService().getCategory());
        dto.setPrice(cartItem.getService().getPrice().doubleValue());
        dto.setQuantity(cartItem.getQuantity());
        dto.setSubtotal(cartItem.getService().getPrice().doubleValue() * cartItem.getQuantity());
        return dto;
    }
}
