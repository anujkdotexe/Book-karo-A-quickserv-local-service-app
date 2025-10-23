package com.bookkaro.config;

import com.bookkaro.model.User;
import com.bookkaro.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    @Order(1)
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            logger.info("======================================");
            logger.info("RESETTING TEST ACCOUNT PASSWORDS");
            logger.info("======================================");
            
            // Force reset passwords for test accounts
            userRepository.findByEmail("user@bookkaro.com").ifPresent(user -> {
                user.setPassword(passwordEncoder.encode("password123"));
                userRepository.save(user);
                logger.info("Reset password: user@bookkaro.com → password123");
            });
            
            userRepository.findByEmail("vendor@bookkaro.com").ifPresent(user -> {
                user.setPassword(passwordEncoder.encode("password123"));
                userRepository.save(user);
                logger.info("Reset password: vendor@bookkaro.com → password123");
            });
            
            userRepository.findByEmail("admin@bookkaro.com").ifPresent(user -> {
                user.setPassword(passwordEncoder.encode("admin123"));
                userRepository.save(user);
                logger.info("Reset password: admin@bookkaro.com → admin123");
            });
            
            boolean needsInitialization = false;
            
            if (userRepository.findByEmail("user@bookkaro.com").isEmpty()) {
                logger.warn("Test USER account missing - reinitializing database");
                needsInitialization = true;
            }
            if (userRepository.findByEmail("vendor@bookkaro.com").isEmpty()) {
                logger.warn("Test VENDOR account missing - reinitializing database");
                needsInitialization = true;
            }
            if (userRepository.findByEmail("admin@bookkaro.com").isEmpty()) {
                logger.warn("Test ADMIN account missing - reinitializing database");
                needsInitialization = true;
            }
            
            if (needsInitialization || userRepository.count() == 0) {
                logger.info("======================================");
                logger.info("INITIALIZING DATABASE WITH TEST DATA");
                logger.info("======================================");
                
                if (userRepository.findByEmail("user@bookkaro.com").isEmpty()) {
                    User testUser = new User();
                    testUser.setEmail("user@bookkaro.com");
                    testUser.setPassword(passwordEncoder.encode("password123"));
                    testUser.setFirstName("Test");
                    testUser.setLastName("User");
                    testUser.setFullName("Test User");
                    testUser.setPhone("1234567890");
                    testUser.setAddress("123 Test Street");
                    testUser.setCity("Mumbai");
                    testUser.setState("Maharashtra");
                    testUser.setPostalCode("400001");
                    testUser.setRole(User.UserRole.USER);
                    testUser.setIsActive(true);
                    userRepository.save(testUser);
                    logger.info("Created USER account: user@bookkaro.com");
                }

                if (userRepository.findByEmail("vendor@bookkaro.com").isEmpty()) {
                    User testVendor = new User();
                    testVendor.setEmail("vendor@bookkaro.com");
                    testVendor.setPassword(passwordEncoder.encode("password123"));
                    testVendor.setFirstName("Test");
                    testVendor.setLastName("Vendor");
                    testVendor.setFullName("Test Vendor");
                    testVendor.setPhone("0987654321");
                    testVendor.setAddress("456 Vendor Avenue");
                    testVendor.setCity("Mumbai");
                    testVendor.setState("Maharashtra");
                    testVendor.setPostalCode("400050");
                    testVendor.setRole(User.UserRole.VENDOR);
                    testVendor.setIsActive(true);
                    userRepository.save(testVendor);
                    logger.info("Created VENDOR account: vendor@bookkaro.com");
                }

                if (userRepository.findByEmail("admin@bookkaro.com").isEmpty()) {
                    User testAdmin = new User();
                    testAdmin.setEmail("admin@bookkaro.com");
                    testAdmin.setPassword(passwordEncoder.encode("admin123"));
                    testAdmin.setFirstName("Test");
                    testAdmin.setLastName("Admin");
                    testAdmin.setFullName("Test Admin");
                    testAdmin.setPhone("1112223333");
                    testAdmin.setAddress("789 Admin Plaza");
                    testAdmin.setCity("Mumbai");
                    testAdmin.setState("Maharashtra");
                    testAdmin.setPostalCode("400001");
                    testAdmin.setRole(User.UserRole.ADMIN);
                    testAdmin.setIsActive(true);
                    userRepository.save(testAdmin);
                    logger.info("Created ADMIN account: admin@bookkaro.com");
                }

                logger.info("======================================");
                logger.info("DATABASE INITIALIZED WITH TEST USERS");
                logger.info("======================================");
                logger.info("USER: user@bookkaro.com / password123");
                logger.info("VENDOR: vendor@bookkaro.com / password123");
                logger.info("ADMIN: admin@bookkaro.com / admin123");
                logger.info("Regional vendors created by ComprehensiveDataInitializer");
                logger.info("======================================");
            } else {
                logger.info("Test users already exist in database");
            }
        };
    }
}
