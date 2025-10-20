package com.bookaro.controller;

import com.bookaro.dto.ApiResponse;
import com.bookaro.dto.ChangePasswordRequest;
import com.bookaro.dto.UserDto;
import com.bookaro.dto.UserUpdateRequest;
import com.bookaro.model.User;
import com.bookaro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", convertToDto(user)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @Valid @RequestBody UserUpdateRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update user details - handle both fullName and firstName/lastName
        if (request.getFirstName() != null && request.getLastName() != null) {
            user.setFullName(request.getFirstName() + " " + request.getLastName());
        } else if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }
        if (request.getState() != null) {
            user.setState(request.getState());
        }
        
        // Handle both zipCode and postalCode for frontend compatibility
        if (request.getPostalCode() != null) {
            user.setZipCode(request.getPostalCode());
        } else if (request.getZipCode() != null) {
            user.setZipCode(request.getZipCode());
        }
        
        if (request.getLatitude() != null) {
            user.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            user.setLongitude(request.getLongitude());
        }

        user = userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", convertToDto(user)));
    }

    @PutMapping("/change-password")
    @Transactional
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Current password is incorrect"));
        }
        
        // Check if new password is same as current password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("New password must be different from current password"));
        }

        // Update password with BCrypt encoding
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.saveAndFlush(user);

        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<ApiResponse<String>> deleteAccount(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(false);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Account deactivated successfully", null));
    }

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        
        // Split fullName into firstName and lastName for frontend compatibility
        if (user.getFullName() != null) {
            String[] nameParts = user.getFullName().trim().split("\\s+", 2);
            dto.setFirstName(nameParts[0]);
            dto.setLastName(nameParts.length > 1 ? nameParts[1] : "");
        }
        
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setState(user.getState());
        dto.setZipCode(user.getZipCode());
        dto.setPostalCode(user.getZipCode()); // Frontend expects postalCode
        dto.setLatitude(user.getLatitude());
        dto.setLongitude(user.getLongitude());
        dto.setRole(user.getRole().toString());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
