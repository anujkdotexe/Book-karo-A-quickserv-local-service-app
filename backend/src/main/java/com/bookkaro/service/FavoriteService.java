package com.bookkaro.service;

import com.bookkaro.dto.ServiceDto;
import com.bookkaro.exception.ResourceNotFoundException;
import com.bookkaro.model.Favorite;
import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import com.bookkaro.repository.FavoriteRepository;
import com.bookkaro.repository.ServiceRepository;
import com.bookkaro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    public List<ServiceDto> getFavoriteServices(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return favoriteRepository.findFavoriteServicesByUser(user)
                .stream()
                .map(ServiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ServiceDto addToFavorites(String userEmail, Long serviceId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        // Check if already in favorites - return success idempotently
        if (favoriteRepository.existsByUserAndService(user, service)) {
            return ServiceDto.fromEntity(service);
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .service(service)
                .build();

        favoriteRepository.save(favorite);
        return ServiceDto.fromEntity(service);
    }

    public void removeFromFavorites(String userEmail, Long serviceId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        favoriteRepository.deleteByUserAndService(user, service);
    }

    public boolean isFavorite(String userEmail, Long serviceId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        return favoriteRepository.existsByUserAndService(user, service);
    }
}
