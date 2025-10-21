package com.bookaro.security;

import com.bookaro.model.User;
import com.bookaro.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Custom UserDetailsService implementation for Spring Security
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private Map<String, UserDetails> hardcodedUsers;

    public CustomUserDetailsService(UserRepository userRepository, @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private void initializeHardcodedUsers() {
        if (this.hardcodedUsers != null) {
            return; // Already initialized
        }
        
        logger.info("==============================================");
        logger.info("Initializing CustomUserDetailsService with hardcoded credentials");
        logger.info("==============================================");

        this.hardcodedUsers = new HashMap<>();

        // PRE-ENCODE passwords once to avoid different hashes on each call
        String encodedUserPassword = passwordEncoder.encode("password123");
        String encodedVendorPassword = passwordEncoder.encode("password123");
        String encodedAdminPassword = passwordEncoder.encode("admin123");

        // Hardcoded USER
        hardcodedUsers.put("user@bookaro.com",
                org.springframework.security.core.userdetails.User.builder()
                        .username("user@bookaro.com")
                        .password(encodedUserPassword)
                        .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                        .build()
        );

        // Hardcoded VENDOR
        hardcodedUsers.put("vendor@bookaro.com",
                org.springframework.security.core.userdetails.User.builder()
                        .username("vendor@bookaro.com")
                        .password(encodedVendorPassword)
                        .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_VENDOR")))
                        .build()
        );

        // Hardcoded ADMIN
        hardcodedUsers.put("admin@bookaro.com",
                org.springframework.security.core.userdetails.User.builder()
                        .username("admin@bookaro.com")
                        .password(encodedAdminPassword)
                        .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .build()
        );

        logger.info("Hardcoded users initialized successfully:");
        logger.info("  - user@bookaro.com (ROLE_USER)");
        logger.info("  - vendor@bookaro.com (ROLE_VENDOR)");
        logger.info("  - admin@bookaro.com (ROLE_ADMIN)");
        logger.info("==============================================");
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
