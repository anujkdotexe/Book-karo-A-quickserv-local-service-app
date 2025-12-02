package com.bookkaro.config;

import com.bookkaro.model.User;
import com.bookkaro.repository.UserRepository;
import com.bookkaro.repository.VendorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Value("${app.data.init.enabled:false}")
    private boolean dataInitEnabled;

    @Bean
    @Order(1)
    CommandLineRunner initDatabase(UserRepository userRepository, VendorRepository vendorRepository, 
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            if (!dataInitEnabled) {
                logger.info("======================================");
                logger.info("DATA INITIALIZATION DISABLED");
                logger.info("Using existing database data");
                logger.info("To reset data, run: .\\scripts\\database\\POPULATE_MOCK_DATA.ps1");
                logger.info("======================================");
                return;
            }
            
            logger.info("======================================");
            logger.info("DATA INITIALIZATION ENABLED");
            logger.info("======================================");
            
            logger.info("Checking for CSV-loaded test accounts...");
            
            boolean hasUserAccount = userRepository.findByEmail("user@bookkaro.com").isPresent();
            boolean hasAdminAccount = userRepository.findByEmail("admin@bookkaro.com").isPresent();
            
            if (hasUserAccount) {
                logger.info("✓ Found user@bookkaro.com from CSV");
            }
            if (hasAdminAccount) {
                logger.info("✓ Found admin@bookkaro.com from CSV");
            }
            
            // Check if we have data (from CSV or otherwise)
            long userCount = userRepository.count();
            logger.info("Total users in database: " + userCount);
            
            boolean needsInitialization = (userCount == 0) || (!hasUserAccount && !hasAdminAccount);
            
            // Fix existing users' roles if they're using legacy single-role column
            // This ensures CSV-loaded users have proper multi-role support
            logger.info("Checking and fixing user roles from CSV data...");
            userRepository.findByEmail("user@bookkaro.com").ifPresent(user -> {
                if (user.getRoles() == null || user.getRoles().isEmpty()) {
                    logger.info("Fixing roles for user@bookkaro.com");
                    user.addRole(User.UserRole.USER);
                    userRepository.save(user);
                    logger.info("✓ Fixed USER account roles");
                }
            });

            userRepository.findByEmail("admin@bookkaro.com").ifPresent(admin -> {
                if (admin.getRoles() == null || admin.getRoles().isEmpty()) {
                    logger.info("Fixing roles for admin@bookkaro.com");
                    admin.addRole(User.UserRole.ADMIN);
                    userRepository.save(admin);
                    logger.info("✓ Fixed ADMIN account roles");
                }
            });
            
            // For CSV data: vendor@bookkaro.com doesn't exist
            // Regional vendors (mumbai@bookkaro.com, pune@bookkaro.com, etc.) are used instead
            logger.info("CSV data uses regional vendors - no vendor@bookkaro.com needed");
            
            
            if (needsInitialization) {
                logger.info("======================================");
                logger.info("DATABASE IS EMPTY");
                logger.info("Waiting for CSV data to be loaded...");
                logger.info("======================================");
                // CSV data will be loaded by CSVDataLoader (Order 2)
                // This prevents creating duplicate test users
            } else {
                logger.info("======================================");
                logger.info("DATABASE ALREADY POPULATED (from CSV or previous init)");
                logger.info("User count: " + userCount);
                logger.info("Use CSV data for vendors and services");
                logger.info("======================================");
            }
        };
    }
}