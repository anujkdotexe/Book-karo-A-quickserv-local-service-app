package com.bookaro.controller;

import com.bookaro.dto.*;
import com.bookaro.model.Address;
import com.bookaro.model.User;
import com.bookaro.model.UserPreference;
import com.bookaro.repository.AddressRepository;
import com.bookaro.repository.UserRepository;
import com.bookaro.repository.UserPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AddressRepository addressRepository;
    private final UserPreferenceRepository userPreferenceRepository;

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
        dto.setProfilePicture(user.getProfilePicture());
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
    
    // ==================== ADDRESS MANAGEMENT ====================
    
    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<AddressDto>>> getUserAddresses(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<Address> addresses = addressRepository.findByUserId(user.getId());
        List<AddressDto> addressDtos = addresses.stream()
                .map(this::convertAddressToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Addresses retrieved successfully", addressDtos));
    }
    
    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressDto>> addAddress(
            @Valid @RequestBody AddressRequest request,
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        
        // If this is default, unset other default addresses
        if (request.getIsDefault()) {
            addressRepository.findByUserId(user.getId()).forEach(addr -> {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            });
        }
        
        Address address = Address.builder()
                .user(user)
                .addressType(request.getAddressType())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .landmark(request.getLandmark())
                .isDefault(request.getIsDefault())
                .build();
        
        address = addressRepository.save(address);
        return ResponseEntity.ok(ApiResponse.success("Address added successfully", convertAddressToDto(address)));
    }
    
    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request,
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (!address.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("You can only update your own addresses"));
        }
        
        // If this is default, unset other default addresses
        if (request.getIsDefault() && !address.getIsDefault()) {
            addressRepository.findByUserId(user.getId()).forEach(addr -> {
                if (!addr.getId().equals(id)) {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                }
            });
        }
        
        address.setAddressType(request.getAddressType());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setLandmark(request.getLandmark());
        address.setIsDefault(request.getIsDefault());
        
        address = addressRepository.save(address);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", convertAddressToDto(address)));
    }
    
    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (!address.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("You can only delete your own addresses"));
        }
        
        addressRepository.delete(address);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }
    
    // ==================== USER PREFERENCES ====================
    
    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferenceDto>> getUserPreferences(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        UserPreference pref = userPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPreferences(user));
        return ResponseEntity.ok(ApiResponse.success("Preferences retrieved successfully", convertPreferenceToDto(pref)));
    }
    
    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferenceDto>> updatePreferences(
            @Valid @RequestBody UserPreferenceDto request,
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        
        UserPreference pref = userPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPreferences(user));
        
        if (request.getEmailNotifications() != null) pref.setEmailNotifications(request.getEmailNotifications());
        if (request.getSmsNotifications() != null) pref.setSmsNotifications(request.getSmsNotifications());
        if (request.getPushNotifications() != null) pref.setPushNotifications(request.getPushNotifications());
        if (request.getBookingReminders() != null) pref.setBookingReminders(request.getBookingReminders());
        if (request.getPromotionalEmails() != null) pref.setPromotionalEmails(request.getPromotionalEmails());
        
        pref = userPreferenceRepository.save(pref);
        return ResponseEntity.ok(ApiResponse.success("Preferences updated successfully", convertPreferenceToDto(pref)));
    }
    
    @PostMapping("/profile-picture")
    public ResponseEntity<ApiResponse<String>> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Please select a file"));
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Only image files are allowed"));
        }
        
        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File size must not exceed 5MB"));
        }
        
        try {
            // Create uploads directory if it doesn't exist
            Path uploadDir = Paths.get("uploads/profile-pictures");
            Files.createDirectories(uploadDir);
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                    ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                    : ".jpg";
            String filename = "profile_" + user.getId() + "_" + UUID.randomUUID() + extension;
            
            // Save file
            Path filePath = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Update user profile picture path
            user.setProfilePicture("/uploads/profile-pictures/" + filename);
            userRepository.save(user);
            
            return ResponseEntity.ok(ApiResponse.success("Profile picture uploaded successfully", 
                    "/uploads/profile-pictures/" + filename));
        } catch (IOException e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to upload file: " + e.getMessage()));
        }
    }
    
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<String>> changePasswordNew(
            @Valid @RequestBody PasswordChangeRequest request,
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Current password is incorrect"));
        }
        
        // Verify new password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("New password and confirmation do not match"));
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
    
    // Helper methods
    
    private User getUserFromAuth(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    private AddressDto convertAddressToDto(Address address) {
        return AddressDto.builder()
                .id(address.getId())
                .addressType(address.getAddressType())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .landmark(address.getLandmark())
                .isDefault(address.getIsDefault())
                .build();
    }
    
    private UserPreferenceDto convertPreferenceToDto(UserPreference pref) {
        return UserPreferenceDto.builder()
                .emailNotifications(pref.getEmailNotifications())
                .smsNotifications(pref.getSmsNotifications())
                .pushNotifications(pref.getPushNotifications())
                .bookingReminders(pref.getBookingReminders())
                .promotionalEmails(pref.getPromotionalEmails())
                .build();
    }
    
    private UserPreference createDefaultPreferences(User user) {
        return UserPreference.builder()
                .user(user)
                .emailNotifications(true)
                .smsNotifications(true)
                .pushNotifications(true)
                .bookingReminders(true)
                .promotionalEmails(false)
                .build();
    }
}
