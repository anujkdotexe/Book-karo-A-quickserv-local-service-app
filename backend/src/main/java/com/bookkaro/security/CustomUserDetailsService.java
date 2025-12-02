package com.bookkaro.security;

import com.bookkaro.model.User;
import com.bookkaro.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Custom UserDetailsService implementation for Spring Security
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.debug("Loading user: {}", email);

        // Try to load from database
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> {
                    logger.warn("User not found: {}", email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });

        logger.debug("User found in database: {} with role: {}", user.getEmail(), user.getRole());
        
        // Check if password is empty
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            logger.error("Empty encoded password for database user: {}", email);
            throw new UsernameNotFoundException("User has invalid password configuration");
        }
        
        // Return CustomUserDetails with user ID and role
        return new CustomUserDetails(user);
    }
}