package com.bookaro.config;

import com.bookaro.model.Service;
import com.bookaro.model.User;
import com.bookaro.model.Vendor;
import com.bookaro.repository.ServiceRepository;
import com.bookaro.repository.UserRepository;
import com.bookaro.repository.VendorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
public class DataInitializer {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    @Order(1)
    CommandLineRunner initDatabase(UserRepository userRepository, 
                                   ServiceRepository serviceRepository, 
                                   VendorRepository vendorRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if test users exist, if not initialize
            boolean needsInitialization = false;
            
            if (userRepository.findByEmail("user@bookaro.com").isEmpty()) {
                logger.warn("Test USER account missing - reinitializing database");
                needsInitialization = true;
            }
            if (userRepository.findByEmail("vendor@bookaro.com").isEmpty()) {
                logger.warn("Test VENDOR account missing - reinitializing database");
                needsInitialization = true;
            }
            if (userRepository.findByEmail("admin@bookaro.com").isEmpty()) {
                logger.warn("Test ADMIN account missing - reinitializing database");
                needsInitialization = true;
            }
            
            // Declare vendor entity variable at outer scope
            Vendor testVendorEntity = null;
            
            if (needsInitialization || userRepository.count() == 0) {
                logger.info("======================================");
                logger.info("INITIALIZING DATABASE WITH TEST DATA");
                logger.info("======================================");
                
                // Create USER account
                if (userRepository.findByEmail("user@bookaro.com").isEmpty()) {
                    User testUser = new User();
                    testUser.setEmail("user@bookaro.com");
                    testUser.setPassword(passwordEncoder.encode("password123"));
                    testUser.setFirstName("Test");
                    testUser.setLastName("User");
                    testUser.setFullName("Test User");
                    testUser.setPhone("1234567890");
                    testUser.setAddress("123 Test Street");
                    testUser.setCity("Mumbai");
                    testUser.setState("Maharashtra");
                    testUser.setZipCode("400001");
                    testUser.setRole(User.UserRole.USER);
                    testUser.setIsActive(true);
                    userRepository.save(testUser);
                    logger.info("Created USER account: user@bookaro.com");
                }

                // Create VENDOR account
                if (userRepository.findByEmail("vendor@bookaro.com").isEmpty()) {
                    User testVendor = new User();
                    testVendor.setEmail("vendor@bookaro.com");
                    testVendor.setPassword(passwordEncoder.encode("password123"));
                    testVendor.setFirstName("Test");
                    testVendor.setLastName("Vendor");
                    testVendor.setFullName("Test Vendor");
                    testVendor.setPhone("0987654321");
                    testVendor.setAddress("456 Vendor Avenue");
                    testVendor.setCity("Mumbai");
                    testVendor.setState("Maharashtra");
                    testVendor.setZipCode("400050");
                    testVendor.setRole(User.UserRole.VENDOR);
                    testVendor.setIsActive(true);
                    userRepository.save(testVendor);
                    logger.info("Created VENDOR account: vendor@bookaro.com");
                }

                // Create REGION-WISE VENDOR ACCOUNTS
                // 1. Mumbai Vendor
                if (userRepository.findByEmail("mumbai@bookaro.com").isEmpty()) {
                    User mumbaiVendor = new User();
                    mumbaiVendor.setEmail("mumbai@bookaro.com");
                    mumbaiVendor.setPassword(passwordEncoder.encode("vendor123"));
                    mumbaiVendor.setFirstName("Mumbai");
                    mumbaiVendor.setLastName("Services");
                    mumbaiVendor.setFullName("Mumbai Services");
                    mumbaiVendor.setPhone("9876543210");
                    mumbaiVendor.setAddress("Mumbai Service Center");
                    mumbaiVendor.setCity("Mumbai");
                    mumbaiVendor.setState("Maharashtra");
                    mumbaiVendor.setZipCode("400001");
                    mumbaiVendor.setRole(User.UserRole.VENDOR);
                    mumbaiVendor.setIsActive(true);
                    userRepository.save(mumbaiVendor);
                    logger.info("Created VENDOR account: mumbai@bookaro.com / vendor123");
                }

                // 2. Pune Vendor
                if (userRepository.findByEmail("pune@bookaro.com").isEmpty()) {
                    User puneVendor = new User();
                    puneVendor.setEmail("pune@bookaro.com");
                    puneVendor.setPassword(passwordEncoder.encode("vendor123"));
                    puneVendor.setFirstName("Pune");
                    puneVendor.setLastName("Services");
                    puneVendor.setFullName("Pune Services");
                    puneVendor.setPhone("9876543211");
                    puneVendor.setAddress("Pune Service Center");
                    puneVendor.setCity("Pune");
                    puneVendor.setState("Maharashtra");
                    puneVendor.setZipCode("411001");
                    puneVendor.setRole(User.UserRole.VENDOR);
                    puneVendor.setIsActive(true);
                    userRepository.save(puneVendor);
                    logger.info("Created VENDOR account: pune@bookaro.com / vendor123");
                }

                // 3. Delhi Vendor
                if (userRepository.findByEmail("delhi@bookaro.com").isEmpty()) {
                    User delhiVendor = new User();
                    delhiVendor.setEmail("delhi@bookaro.com");
                    delhiVendor.setPassword(passwordEncoder.encode("vendor123"));
                    delhiVendor.setFirstName("Delhi");
                    delhiVendor.setLastName("Services");
                    delhiVendor.setFullName("Delhi Services");
                    delhiVendor.setPhone("9876543212");
                    delhiVendor.setAddress("Delhi Service Center");
                    delhiVendor.setCity("Delhi");
                    delhiVendor.setState("Delhi");
                    delhiVendor.setZipCode("110001");
                    delhiVendor.setRole(User.UserRole.VENDOR);
                    delhiVendor.setIsActive(true);
                    userRepository.save(delhiVendor);
                    logger.info("Created VENDOR account: delhi@bookaro.com / vendor123");
                }

                // 4. Bangalore Vendor
                if (userRepository.findByEmail("bangalore@bookaro.com").isEmpty()) {
                    User bangaloreVendor = new User();
                    bangaloreVendor.setEmail("bangalore@bookaro.com");
                    bangaloreVendor.setPassword(passwordEncoder.encode("vendor123"));
                    bangaloreVendor.setFirstName("Bangalore");
                    bangaloreVendor.setLastName("Services");
                    bangaloreVendor.setFullName("Bangalore Services");
                    bangaloreVendor.setPhone("9876543213");
                    bangaloreVendor.setAddress("Bangalore Service Center");
                    bangaloreVendor.setCity("Bangalore");
                    bangaloreVendor.setState("Karnataka");
                    bangaloreVendor.setZipCode("560001");
                    bangaloreVendor.setRole(User.UserRole.VENDOR);
                    bangaloreVendor.setIsActive(true);
                    userRepository.save(bangaloreVendor);
                    logger.info("Created VENDOR account: bangalore@bookaro.com / vendor123");
                }

                // 5. Thane Vendor
                if (userRepository.findByEmail("thane@bookaro.com").isEmpty()) {
                    User thaneVendor = new User();
                    thaneVendor.setEmail("thane@bookaro.com");
                    thaneVendor.setPassword(passwordEncoder.encode("vendor123"));
                    thaneVendor.setFirstName("Thane");
                    thaneVendor.setLastName("Services");
                    thaneVendor.setFullName("Thane Services");
                    thaneVendor.setPhone("9876543214");
                    thaneVendor.setAddress("Thane Service Center");
                    thaneVendor.setCity("Thane");
                    thaneVendor.setState("Maharashtra");
                    thaneVendor.setZipCode("400601");
                    thaneVendor.setRole(User.UserRole.VENDOR);
                    thaneVendor.setIsActive(true);
                    userRepository.save(thaneVendor);
                    logger.info("Created VENDOR account: thane@bookaro.com / vendor123");
                }

                // 6. Navi Mumbai Vendor
                if (userRepository.findByEmail("navimumbai@bookaro.com").isEmpty()) {
                    User naviMumbaiVendor = new User();
                    naviMumbaiVendor.setEmail("navimumbai@bookaro.com");
                    naviMumbaiVendor.setPassword(passwordEncoder.encode("vendor123"));
                    naviMumbaiVendor.setFirstName("Navi Mumbai");
                    naviMumbaiVendor.setLastName("Services");
                    naviMumbaiVendor.setFullName("Navi Mumbai Services");
                    naviMumbaiVendor.setPhone("9876543215");
                    naviMumbaiVendor.setAddress("Navi Mumbai Service Center");
                    naviMumbaiVendor.setCity("Navi Mumbai");
                    naviMumbaiVendor.setState("Maharashtra");
                    naviMumbaiVendor.setZipCode("400701");
                    naviMumbaiVendor.setRole(User.UserRole.VENDOR);
                    naviMumbaiVendor.setIsActive(true);
                    userRepository.save(naviMumbaiVendor);
                    logger.info("Created VENDOR account: navimumbai@bookaro.com / vendor123");
                }

                // Create VENDOR ENTITIES for each region
                Vendor mumbaiVendor = vendorRepository.findByVendorCode("MUM001").orElse(null);
                if (mumbaiVendor == null) {
                    mumbaiVendor = Vendor.builder()
                            .vendorCode("MUM001")
                            .businessName("Mumbai Services Co.")
                            .primaryCategory("Home Services")
                            .phone("9876543210")
                            .email("mumbai@bookaro.com")
                            .location("Mumbai Central")
                            .city("Mumbai")
                            .state("Maharashtra")
                            .postalCode("400001")
                            .availability("Mon-Sat 9AM-7PM")
                            .yearsOfExperience(8)
                            .averageRating(new BigDecimal("4.6"))
                            .totalReviews(120)
                            .isActive(true)
                            .isVerified(true)
                            .description("Mumbai's trusted home service provider")
                            .build();
                    vendorRepository.save(mumbaiVendor);
                    logger.info("Created vendor entity: MUM001");
                }

                Vendor puneVendor = vendorRepository.findByVendorCode("PUN001").orElse(null);
                if (puneVendor == null) {
                    puneVendor = Vendor.builder()
                            .vendorCode("PUN001")
                            .businessName("Pune Services Co.")
                            .primaryCategory("Home Services")
                            .phone("9876543211")
                            .email("pune@bookaro.com")
                            .location("Pune Station")
                            .city("Pune")
                            .state("Maharashtra")
                            .postalCode("411001")
                            .availability("Mon-Sat 9AM-7PM")
                            .yearsOfExperience(7)
                            .averageRating(new BigDecimal("4.5"))
                            .totalReviews(95)
                            .isActive(true)
                            .isVerified(true)
                            .description("Pune's reliable home service provider")
                            .build();
                    vendorRepository.save(puneVendor);
                    logger.info("Created vendor entity: PUN001");
                }

                Vendor delhiVendor = vendorRepository.findByVendorCode("DEL001").orElse(null);
                if (delhiVendor == null) {
                    delhiVendor = Vendor.builder()
                            .vendorCode("DEL001")
                            .businessName("Delhi Services Co.")
                            .primaryCategory("Home Services")
                            .phone("9876543212")
                            .email("delhi@bookaro.com")
                            .location("Connaught Place")
                            .city("Delhi")
                            .state("Delhi")
                            .postalCode("110001")
                            .availability("Mon-Sat 9AM-7PM")
                            .yearsOfExperience(10)
                            .averageRating(new BigDecimal("4.7"))
                            .totalReviews(150)
                            .isActive(true)
                            .isVerified(true)
                            .description("Delhi's premier home service provider")
                            .build();
                    vendorRepository.save(delhiVendor);
                    logger.info("Created vendor entity: DEL001");
                }

                Vendor bangaloreVendor = vendorRepository.findByVendorCode("BLR001").orElse(null);
                if (bangaloreVendor == null) {
                    bangaloreVendor = Vendor.builder()
                            .vendorCode("BLR001")
                            .businessName("Bangalore Services Co.")
                            .primaryCategory("Home Services")
                            .phone("9876543213")
                            .email("bangalore@bookaro.com")
                            .location("MG Road")
                            .city("Bangalore")
                            .state("Karnataka")
                            .postalCode("560001")
                            .availability("Mon-Sat 9AM-7PM")
                            .yearsOfExperience(9)
                            .averageRating(new BigDecimal("4.8"))
                            .totalReviews(180)
                            .isActive(true)
                            .isVerified(true)
                            .description("Bangalore's top home service provider")
                            .build();
                    vendorRepository.save(bangaloreVendor);
                    logger.info("Created vendor entity: BLR001");
                }

                Vendor thaneVendor = vendorRepository.findByVendorCode("THA001").orElse(null);
                if (thaneVendor == null) {
                    thaneVendor = Vendor.builder()
                            .vendorCode("THA001")
                            .businessName("Thane Services Co.")
                            .primaryCategory("Home Services")
                            .phone("9876543214")
                            .email("thane@bookaro.com")
                            .location("Thane West")
                            .city("Thane")
                            .state("Maharashtra")
                            .postalCode("400601")
                            .availability("Mon-Sat 9AM-7PM")
                            .yearsOfExperience(6)
                            .averageRating(new BigDecimal("4.4"))
                            .totalReviews(80)
                            .isActive(true)
                            .isVerified(true)
                            .description("Thane's trusted home service provider")
                            .build();
                    vendorRepository.save(thaneVendor);
                    logger.info("Created vendor entity: THA001");
                }

                Vendor naviMumbaiVendor = vendorRepository.findByVendorCode("NMB001").orElse(null);
                if (naviMumbaiVendor == null) {
                    naviMumbaiVendor = Vendor.builder()
                            .vendorCode("NMB001")
                            .businessName("Navi Mumbai Services Co.")
                            .primaryCategory("Home Services")
                            .phone("9876543215")
                            .email("navimumbai@bookaro.com")
                            .location("Vashi")
                            .city("Navi Mumbai")
                            .state("Maharashtra")
                            .postalCode("400701")
                            .availability("Mon-Sat 9AM-7PM")
                            .yearsOfExperience(5)
                            .averageRating(new BigDecimal("4.3"))
                            .totalReviews(70)
                            .isActive(true)
                            .isVerified(true)
                            .description("Navi Mumbai's reliable home service provider")
                            .build();
                    vendorRepository.save(naviMumbaiVendor);
                    logger.info("Created vendor entity: NMB001");
                }

                logger.info("======================================");
                logger.info("DATABASE INITIALIZED WITH USERS");
                logger.info("======================================");
                logger.info("USER: user@bookaro.com / password123");
                logger.info("ADMIN: admin@bookaro.com / admin123");
                logger.info("REGION VENDORS (All password: vendor123):");
                logger.info("  Mumbai: mumbai@bookaro.com");
                logger.info("  Pune: pune@bookaro.com");
                logger.info("  Delhi: delhi@bookaro.com");
                logger.info("  Bangalore: bangalore@bookaro.com");
                logger.info("  Thane: thane@bookaro.com");
                logger.info("  Navi Mumbai: navimumbai@bookaro.com");
                logger.info("======================================");
            } else {
                logger.info("Test users already exist in database");
            }
            
            // Get all regional vendors for service assignment
            Vendor mumbaiVendor = vendorRepository.findByVendorCode("MUM001").orElse(null);
            Vendor puneVendor = vendorRepository.findByVendorCode("PUN001").orElse(null);
            Vendor delhiVendor = vendorRepository.findByVendorCode("DEL001").orElse(null);
            Vendor bangaloreVendor = vendorRepository.findByVendorCode("BLR001").orElse(null);
            Vendor thaneVendor = vendorRepository.findByVendorCode("THA001").orElse(null);
            Vendor naviMumbaiVendor = vendorRepository.findByVendorCode("NMB001").orElse(null);
            
            // Only create services if we have vendors and services don't already exist
            if (mumbaiVendor != null && serviceRepository.count() < 15) {
                logger.info("Creating region-wise services...");

                // MUMBAI SERVICES
                Service service1 = Service.builder()
                        .serviceName("Mumbai Plumbing Repair")
                        .description("Expert plumbing repair services in Mumbai")
                        .category("Plumbing")
                        .price(new BigDecimal("1500.00"))
                        .durationMinutes(120)
                        .address("123 Main Street, Andheri")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400001")
                        .vendor(mumbaiVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.50"))
                        .totalReviews(10)
                        .build();

                Service service2 = Service.builder()
                        .serviceName("Mumbai Home Cleaning")
                        .description("Professional home cleaning in Mumbai with eco-friendly products")
                        .category("Cleaning")
                        .price(new BigDecimal("2500.00"))
                        .durationMinutes(180)
                        .address("456 Oak Avenue, Bandra")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400050")
                        .vendor(mumbaiVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.80"))
                        .totalReviews(25)
                        .build();

                Service service3 = Service.builder()
                        .serviceName("Mumbai Electrical Services")
                        .description("Licensed electrician for all electrical work in Mumbai")
                        .category("Electrical")
                        .price(new BigDecimal("2000.00"))
                        .durationMinutes(90)
                        .address("789 Electric Blvd, Powai")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400076")
                        .vendor(mumbaiVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.70"))
                        .totalReviews(15)
                        .build();

                Service service4 = Service.builder()
                        .serviceName("Mumbai Painting Service")
                        .description("Interior and exterior painting in Mumbai")
                        .category("Painting")
                        .price(new BigDecimal("3500.00"))
                        .durationMinutes(300)
                        .address("12 Artist Lane, Juhu")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400049")
                        .vendor(mumbaiVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.60"))
                        .totalReviews(18)
                        .build();

                // PUNE SERVICES
                Service service5 = Service.builder()
                        .serviceName("Pune AC Repair")
                        .description("Expert AC servicing and repair in Pune")
                        .category("Appliance Repair")
                        .price(new BigDecimal("1800.00"))
                        .durationMinutes(120)
                        .address("45 Cool Street, Koregaon Park")
                        .city("Pune")
                        .state("Maharashtra")
                        .postalCode("411001")
                        .vendor(puneVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.75"))
                        .totalReviews(22)
                        .build();

                Service service6 = Service.builder()
                        .serviceName("Pune Pest Control")
                        .description("Safe and effective pest control in Pune")
                        .category("Pest Control")
                        .price(new BigDecimal("2200.00"))
                        .durationMinutes(150)
                        .address("78 Green Valley, Pimpri")
                        .city("Pune")
                        .state("Maharashtra")
                        .postalCode("411018")
                        .vendor(puneVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.55"))
                        .totalReviews(12)
                        .build();

                // DELHI SERVICES
                Service service7 = Service.builder()
                        .serviceName("Delhi Carpentry Work")
                        .description("Expert carpentry and furniture services in Delhi")
                        .category("Carpentry")
                        .price(new BigDecimal("2800.00"))
                        .durationMinutes(200)
                        .address("33 Wood Street, Karol Bagh")
                        .city("Delhi")
                        .state("Delhi")
                        .postalCode("110005")
                        .vendor(delhiVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.65"))
                        .totalReviews(20)
                        .build();

                Service service8 = Service.builder()
                        .serviceName("Delhi Salon at Home")
                        .description("Professional beauty services at your doorstep in Delhi")
                        .category("Beauty")
                        .price(new BigDecimal("1500.00"))
                        .durationMinutes(90)
                        .address("22 Beauty Lane, Lajpat Nagar")
                        .city("Delhi")
                        .state("Delhi")
                        .postalCode("110024")
                        .vendor(delhiVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.85"))
                        .totalReviews(30)
                        .build();

                // BANGALORE SERVICES
                Service service9 = Service.builder()
                        .serviceName("Bangalore IT Support")
                        .description("Computer repair and IT support services in Bangalore")
                        .category("IT Services")
                        .price(new BigDecimal("2000.00"))
                        .durationMinutes(120)
                        .address("45 Tech Park, Whitefield")
                        .city("Bangalore")
                        .state("Karnataka")
                        .postalCode("560066")
                        .vendor(bangaloreVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.90"))
                        .totalReviews(40)
                        .build();

                Service service10 = Service.builder()
                        .serviceName("Bangalore Car Wash")
                        .description("Professional car washing and detailing in Bangalore")
                        .category("Car Services")
                        .price(new BigDecimal("800.00"))
                        .durationMinutes(60)
                        .address("12 Auto Street, Indiranagar")
                        .city("Bangalore")
                        .state("Karnataka")
                        .postalCode("560038")
                        .vendor(bangaloreVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.70"))
                        .totalReviews(35)
                        .build();

                // THANE SERVICES
                Service service11 = Service.builder()
                        .serviceName("Thane Gardening Service")
                        .description("Professional gardening and landscaping in Thane")
                        .category("Gardening")
                        .price(new BigDecimal("1200.00"))
                        .durationMinutes(180)
                        .address("56 Garden View, Ghodbunder Road")
                        .city("Thane")
                        .state("Maharashtra")
                        .postalCode("400607")
                        .vendor(thaneVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.45"))
                        .totalReviews(15)
                        .build();

                Service service12 = Service.builder()
                        .serviceName("Thane Laundry Service")
                        .description("Pickup and delivery laundry service in Thane")
                        .category("Laundry")
                        .price(new BigDecimal("600.00"))
                        .durationMinutes(30)
                        .address("89 Wash Street, Thane East")
                        .city("Thane")
                        .state("Maharashtra")
                        .postalCode("400603")
                        .vendor(thaneVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.40"))
                        .totalReviews(18)
                        .build();

                // NAVI MUMBAI SERVICES
                Service service13 = Service.builder()
                        .serviceName("Navi Mumbai Photography")
                        .description("Professional photography services in Navi Mumbai")
                        .category("Photography")
                        .price(new BigDecimal("5000.00"))
                        .durationMinutes(240)
                        .address("23 Camera Street, Nerul")
                        .city("Navi Mumbai")
                        .state("Maharashtra")
                        .postalCode("400706")
                        .vendor(naviMumbaiVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.80"))
                        .totalReviews(25)
                        .build();

                Service service14 = Service.builder()
                        .serviceName("Navi Mumbai Tuitions")
                        .description("Home tuitions for all subjects in Navi Mumbai")
                        .category("Education")
                        .price(new BigDecimal("3000.00"))
                        .durationMinutes(60)
                        .address("67 School Road, Airoli")
                        .city("Navi Mumbai")
                        .state("Maharashtra")
                        .postalCode("400708")
                        .vendor(naviMumbaiVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.75"))
                        .totalReviews(20)
                        .build();

                Service service15 = Service.builder()
                        .serviceName("Navi Mumbai Fitness Trainer")
                        .description("Personal fitness trainer at home in Navi Mumbai")
                        .category("Fitness")
                        .price(new BigDecimal("2500.00"))
                        .durationMinutes(60)
                        .address("45 Gym Avenue, Kharghar")
                        .city("Navi Mumbai")
                        .state("Maharashtra")
                        .postalCode("410210")
                        .vendor(naviMumbaiVendor)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.85"))
                        .totalReviews(28)
                        .build();

                serviceRepository.save(service1);
                serviceRepository.save(service2);
                serviceRepository.save(service3);
                serviceRepository.save(service4);
                serviceRepository.save(service5);
                serviceRepository.save(service6);
                serviceRepository.save(service7);
                serviceRepository.save(service8);
                serviceRepository.save(service9);
                serviceRepository.save(service10);
                serviceRepository.save(service11);
                serviceRepository.save(service12);
                serviceRepository.save(service13);
                serviceRepository.save(service14);
                serviceRepository.save(service15);

                logger.info("Created 15 region-wise services");
                logger.info("  Mumbai: 4 services");
                logger.info("  Pune: 2 services");
                logger.info("  Delhi: 2 services");
                logger.info("  Bangalore: 2 services");
                logger.info("  Thane: 2 services");
                logger.info("  Navi Mumbai: 3 services");
            }
        };
    }
}
                            .city("Mumbai")
                            .state("Maharashtra")
                            .postalCode("400001")
                            .availability("Mon-Sat 9AM-6PM")
                            .yearsOfExperience(5)
                            .averageRating(new BigDecimal("4.5"))
                            .totalReviews(50)
                            .isActive(true)
                            .isVerified(true)
                            .description("Professional home service provider offering plumbing, cleaning, and electrical services")
                            .build();
                    
                    vendorRepository.save(testVendorEntity);
                    logger.info("Created test vendor entity: TEST001");
                }

                logger.info("======================================");
                logger.info("DATABASE INITIALIZED WITH TEST USERS");
                logger.info("======================================");
                logger.info("USER: user@bookaro.com / password123");
                logger.info("VENDOR: vendor@bookaro.com / password123");
                logger.info("ADMIN: admin@bookaro.com / admin123");
                logger.info("======================================");
            } else {
                logger.info("Test users already exist in database");
                // Get existing vendor for service creation
                testVendorEntity = vendorRepository.findByVendorCode("TEST001").orElse(null);
            }
            
            // Only create services if we have a vendor and services don't already exist
            if (testVendorEntity != null && serviceRepository.count() < 15) {
                logger.info("Creating sample services...");

                // Add sample services (Prices in Indian Rupees)
                Service service1 = Service.builder()
                        .serviceName("Professional Plumbing Repair")
                        .description("Expert plumbing repair services for all your needs")
                        .category("Plumbing")
                        .price(new BigDecimal("1500.00"))
                        .durationMinutes(120)
                        .address("123 Main Street, Andheri")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400001")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.50"))
                        .totalReviews(10)
                        .build();

                Service service2 = Service.builder()
                        .serviceName("Home Cleaning Service")
                        .description("Professional home cleaning with eco-friendly products")
                        .category("Cleaning")
                        .price(new BigDecimal("2500.00"))
                        .durationMinutes(180)
                        .address("456 Oak Avenue, Bandra")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400050")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.80"))
                        .totalReviews(25)
                        .build();

                Service service3 = Service.builder()
                        .serviceName("Electrical Wiring and Installation")
                        .description("Licensed electrician for all electrical work")
                        .category("Electrical")
                        .price(new BigDecimal("2000.00"))
                        .durationMinutes(90)
                        .address("789 Electric Blvd, Powai")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400076")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.70"))
                        .totalReviews(15)
                        .build();

                Service service4 = Service.builder()
                        .serviceName("Professional Painting Service")
                        .description("Interior and exterior painting with quality finish and eco-friendly paints")
                        .category("Painting")
                        .price(new BigDecimal("3500.00"))
                        .durationMinutes(300)
                        .address("12 Artist Lane, Juhu")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400049")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.60"))
                        .totalReviews(18)
                        .build();

                Service service5 = Service.builder()
                        .serviceName("AC Repair and Maintenance")
                        .description("Expert AC servicing, repair, and installation for all brands")
                        .category("Appliance Repair")
                        .price(new BigDecimal("1800.00"))
                        .durationMinutes(120)
                        .address("45 Cool Street, Goregaon")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400063")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.75"))
                        .totalReviews(22)
                        .build();

                Service service6 = Service.builder()
                        .serviceName("Pest Control Services")
                        .description("Safe and effective pest control for residential and commercial properties")
                        .category("Pest Control")
                        .price(new BigDecimal("2200.00"))
                        .durationMinutes(150)
                        .address("78 Green Valley, Thane")
                        .city("Thane")
                        .state("Maharashtra")
                        .postalCode("400601")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.55"))
                        .totalReviews(12)
                        .build();

                Service service7 = Service.builder()
                        .serviceName("Carpentry and Furniture Repair")
                        .description("Custom furniture making and professional repair services")
                        .category("Carpentry")
                        .price(new BigDecimal("2800.00"))
                        .durationMinutes(240)
                        .address("23 Wood Street, Malad")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400064")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.85"))
                        .totalReviews(30)
                        .build();

                Service service8 = Service.builder()
                        .serviceName("Home Tutoring - Mathematics")
                        .description("Experienced math tutor for grades 8-12, board exam preparation")
                        .category("Education")
                        .price(new BigDecimal("1200.00"))
                        .durationMinutes(60)
                        .address("56 Scholar Road, Vile Parle")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400056")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.90"))
                        .totalReviews(35)
                        .build();

                Service service9 = Service.builder()
                        .serviceName("Laptop and Computer Repair")
                        .description("Hardware and software troubleshooting, virus removal, data recovery")
                        .category("IT Services")
                        .price(new BigDecimal("1500.00"))
                        .durationMinutes(90)
                        .address("34 Tech Park, Andheri East")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400059")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.65"))
                        .totalReviews(20)
                        .build();

                Service service10 = Service.builder()
                        .serviceName("Salon Services at Home - Women")
                        .description("Professional salon services including haircut, styling, facial, and makeup")
                        .category("Beauty")
                        .price(new BigDecimal("2500.00"))
                        .durationMinutes(120)
                        .address("67 Beauty Lane, Bandra West")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400050")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.80"))
                        .totalReviews(28)
                        .build();

                Service service11 = Service.builder()
                        .serviceName("Gardening and Landscaping")
                        .description("Garden maintenance, lawn care, and landscape design services")
                        .category("Gardening")
                        .price(new BigDecimal("1800.00"))
                        .durationMinutes(180)
                        .address("89 Garden View, Borivali")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400066")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.40"))
                        .totalReviews(14)
                        .build();

                Service service12 = Service.builder()
                        .serviceName("Car Washing and Detailing")
                        .description("Complete car wash, interior cleaning, and professional detailing")
                        .category("Car Services")
                        .price(new BigDecimal("1000.00"))
                        .durationMinutes(90)
                        .address("12 Auto Hub, Kandivali")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400067")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.50"))
                        .totalReviews(16)
                        .build();

                Service service13 = Service.builder()
                        .serviceName("Yoga and Fitness Training")
                        .description("Personal yoga and fitness training sessions at your home")
                        .category("Fitness")
                        .price(new BigDecimal("1500.00"))
                        .durationMinutes(60)
                        .address("45 Wellness Street, Dadar")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400028")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.95"))
                        .totalReviews(40)
                        .build();

                Service service14 = Service.builder()
                        .serviceName("Photography Services")
                        .description("Professional photography for events, portraits, and product shoots")
                        .category("Photography")
                        .price(new BigDecimal("5000.00"))
                        .durationMinutes(180)
                        .address("23 Capture Point, Worli")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400018")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.70"))
                        .totalReviews(25)
                        .build();

                Service service15 = Service.builder()
                        .serviceName("Laundry and Dry Cleaning")
                        .description("Pickup and delivery laundry service with same-day option")
                        .category("Laundry")
                        .price(new BigDecimal("800.00"))
                        .durationMinutes(1440)
                        .address("56 Fresh Lane, Chembur")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .postalCode("400071")
                        .vendor(testVendorEntity)
                        .isAvailable(true)
                        .averageRating(new BigDecimal("4.35"))
                        .totalReviews(19)
                        .build();

                serviceRepository.save(service1);
                serviceRepository.save(service2);
                serviceRepository.save(service3);
                serviceRepository.save(service4);
                serviceRepository.save(service5);
                serviceRepository.save(service6);
                serviceRepository.save(service7);
                serviceRepository.save(service8);
                serviceRepository.save(service9);
                serviceRepository.save(service10);
                serviceRepository.save(service11);
                serviceRepository.save(service12);
                serviceRepository.save(service13);
                serviceRepository.save(service14);
                serviceRepository.save(service15);

                logger.info("======================================");
                logger.info("15 SAMPLE SERVICES ADDED");
                logger.info("======================================");
            } else {
                logger.info("Sample services already exist ({} services found)", serviceRepository.count());
            }
        };
    }
}
