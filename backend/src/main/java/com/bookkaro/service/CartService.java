package com.bookkaro.service;

import com.bookkaro.dto.AddToCartRequest;
import com.bookkaro.dto.CartItemDto;
import com.bookkaro.dto.VendorInfoDto;
import com.bookkaro.exception.BadRequestException;
import com.bookkaro.exception.ResourceNotFoundException;
import com.bookkaro.exception.UnauthorizedException;
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
            throw new BadRequestException("Service is not available");
        }
        
        if (service.getApprovalStatus() != Service.ApprovalStatus.APPROVED) {
            throw new BadRequestException("Service is not approved for booking");
        }
        
        // Validate quantity (both DTO validation and runtime check)
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
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
            throw new UnauthorizedException("Unauthorized access to cart item");
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
        Service service = cartItem.getService();
        
        dto.setId(cartItem.getId());
        dto.setServiceId(service.getId());
        dto.setServiceName(service.getServiceName());
        dto.setName(service.getServiceName()); // For frontend compatibility
        dto.setDescription(service.getDescription());
        dto.setCategory(service.getCategory() != null ? 
            service.getCategory().getName() : 
            service.getCategoryLegacy());
        dto.setCity(service.getCity());
        dto.setState(service.getState());
        dto.setPrice(service.getPrice().doubleValue());
        dto.setQuantity(cartItem.getQuantity());
        dto.setSubtotal(service.getPrice().doubleValue() * cartItem.getQuantity());
        
        // Add vendor information
        if (service.getVendor() != null && service.getVendor().getUser() != null) {
            VendorInfoDto vendorInfo = new VendorInfoDto();
            vendorInfo.setId(service.getVendor().getId());
            vendorInfo.setBusinessName(service.getVendor().getBusinessName());
            vendorInfo.setFirstName(service.getVendor().getUser().getFirstName());
            vendorInfo.setLastName(service.getVendor().getUser().getLastName());
            dto.setVendor(vendorInfo);
        }
        
        return dto;
    }
}
