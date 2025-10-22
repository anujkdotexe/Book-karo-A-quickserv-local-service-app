package com.bookkaro.controller;

import com.bookkaro.dto.AddressDto;
import com.bookkaro.dto.AddressRequest;
import com.bookkaro.dto.ApiResponse;
import com.bookkaro.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressDto>>> getUserAddresses(Authentication authentication) {
        List<AddressDto> addresses = addressService.getUserAddresses(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Addresses retrieved successfully", addresses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressDto>> createAddress(
            @Valid @RequestBody AddressRequest request,
            Authentication authentication) {
        AddressDto address = addressService.createAddress(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Address created successfully", address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request,
            Authentication authentication) {
        AddressDto address = addressService.updateAddress(authentication.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable Long id,
            Authentication authentication) {
        addressService.deleteAddress(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }

    @PutMapping("/{id}/set-default")
    public ResponseEntity<ApiResponse<AddressDto>> setDefaultAddress(
            @PathVariable Long id,
            Authentication authentication) {
        AddressDto address = addressService.setDefaultAddress(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Default address updated successfully", address));
    }
}
