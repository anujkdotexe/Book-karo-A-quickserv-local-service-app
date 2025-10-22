package com.bookkaro.service;

import com.bookkaro.dto.AddressDto;
import com.bookkaro.dto.AddressRequest;
import com.bookkaro.exception.ResourceNotFoundException;
import com.bookkaro.model.Address;
import com.bookkaro.model.User;
import com.bookkaro.repository.AddressRepository;
import com.bookkaro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressDto> getUserAddresses(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user)
                .stream()
                .map(AddressDto::fromEntity)
                .collect(Collectors.toList());
    }

    public AddressDto createAddress(String userEmail, AddressRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // If this is the first address or marked as default, set as default
        boolean shouldBeDefault = request.getIsDefault() != null && request.getIsDefault();
        if (shouldBeDefault || addressRepository.countByUser(user) == 0) {
            // Remove default from other addresses
            addressRepository.findByUserAndIsDefaultTrue(user)
                    .ifPresent(existingDefault -> {
                        existingDefault.setIsDefault(false);
                        addressRepository.save(existingDefault);
                    });
            shouldBeDefault = true;
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
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(shouldBeDefault)
                .build();

        address = addressRepository.save(address);
        return AddressDto.fromEntity(address);
    }

    public AddressDto updateAddress(String userEmail, Long addressId, AddressRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        // Handle default address change
        if (request.getIsDefault() != null && request.getIsDefault() && !address.getIsDefault()) {
            addressRepository.findByUserAndIsDefaultTrue(user)
                    .ifPresent(existingDefault -> {
                        existingDefault.setIsDefault(false);
                        addressRepository.save(existingDefault);
                    });
        }

        address.setAddressType(request.getAddressType());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setLandmark(request.getLandmark());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
        if (request.getIsDefault() != null) {
            address.setIsDefault(request.getIsDefault());
        }

        address = addressRepository.save(address);
        return AddressDto.fromEntity(address);
    }

    public void deleteAddress(String userEmail, Long addressId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        boolean wasDefault = address.getIsDefault();
        addressRepository.delete(address);

        // If deleted address was default, set another address as default
        if (wasDefault) {
            List<Address> remainingAddresses = addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user);
            if (!remainingAddresses.isEmpty()) {
                Address newDefault = remainingAddresses.get(0);
                newDefault.setIsDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    public AddressDto setDefaultAddress(String userEmail, Long addressId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        // Remove default from other addresses
        addressRepository.findByUserAndIsDefaultTrue(user)
                .ifPresent(existingDefault -> {
                    existingDefault.setIsDefault(false);
                    addressRepository.save(existingDefault);
                });

        address.setIsDefault(true);
        address = addressRepository.save(address);
        return AddressDto.fromEntity(address);
    }
}
