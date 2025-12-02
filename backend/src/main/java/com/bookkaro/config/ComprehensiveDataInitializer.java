package com.bookkaro.config;

import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import com.bookkaro.model.Vendor;
import com.bookkaro.repository.ServiceRepository;
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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Comprehensive data initializer that generates 150+ services across 50 vendors
 * Each vendor is linked to a User account with VENDOR role for login capability
 * Only runs when app.data.init.enabled=true
 */
@Configuration
public class ComprehensiveDataInitializer {
    private static final Logger logger = LoggerFactory.getLogger(ComprehensiveDataInitializer.class);

    @Value("${app.data.init.enabled:false}")
    private boolean dataInitEnabled;

    @Bean
    @Order(3) // Run after DataInitializer (Order 1)
    CommandLineRunner initComprehensiveData(UserRepository userRepository,
                                           VendorRepository vendorRepository, 
                                           ServiceRepository serviceRepository,
                                           PasswordEncoder passwordEncoder) {
        return args -> {
            if (!dataInitEnabled) {
                logger.info("Comprehensive data initialization disabled - using existing database");
                return;
            }
            // Check if we have CSV data loaded (100 users means CSV is loaded)
            long userCount = userRepository.count();
            long serviceCount = serviceRepository.count();
            
            if (userCount >= 100) {
                logger.info("============================================");
                logger.info("CSV DATA DETECTED - Skipping vendor generation");
                logger.info("User count: " + userCount);
                logger.info("Service count: " + serviceCount);
                logger.info("Using data from CSV files");
                logger.info("============================================");
                return; // Skip all initialization if CSV data is present
            }
            
            // Generate 6 regional vendors (one per city) with multiple services each
            // Only runs if no CSV data is present
            if (serviceRepository.count() < 20) {
                logger.info("============================================");
                logger.info("GENERATING REGIONAL VENDORS WITH SERVICES");
                logger.info("============================================");
                
                List<User> vendorUsers = new ArrayList<>();
                List<Vendor> vendors = new ArrayList<>();
                List<Service> services = new ArrayList<>();
                
                // 6 regions with their configurations
                String[][] regionConfig = {
                    {"Mumbai", "mumbai@bookkaro.com", "MUM001", "5"},      // 5 services
                    {"Pune", "pune@bookkaro.com", "PUN001", "4"},          // 4 services
                    {"Delhi", "delhi@bookkaro.com", "DEL001", "5"},        // 5 services
                    {"Bangalore", "bangalore@bookkaro.com", "BLR001", "4"}, // 4 services
                    {"Thane", "thane@bookkaro.com", "THA001", "2"},        // 2 services
                    {"Navi Mumbai", "navimumbai@bookkaro.com", "NMB001", "5"} // 5 services
                };
                
                String[] categories = {"Plumbing", "Electrical", "Cleaning", "Painting", "Carpentry", 
                                      "Appliance Repair", "Pest Control", "Beauty", "Fitness", "IT Services",
                                      "Car Services", "Gardening", "Laundry", "Photography", "Education"};
                
                // Generate 1 vendor per region
                for (int i = 0; i < regionConfig.length; i++) {
                    String city = regionConfig[i][0];
                    String email = regionConfig[i][1];
                    String vendorCode = regionConfig[i][2];
                    String category = categories[i % categories.length];
                    
                    // Create User account for vendor (for login)
                    User vendorUser = new User();
                    vendorUser.setEmail(email);
                    vendorUser.setPassword(passwordEncoder.encode("vendor123"));
                    vendorUser.setFirstName(city);
                    vendorUser.setLastName("Services");
                    vendorUser.setFullName(city + " Services");
                    vendorUser.setPhone(String.format("98765432%02d", 10 + i));
                    vendorUser.setAddress(generateLocation(city, i));
                    vendorUser.setCity(city);
                    vendorUser.setState(getState(city));
                    vendorUser.setPostalCode(String.format("%d", 400001 + i * 100));
                    vendorUser.setRole(User.UserRole.VENDOR);
                    vendorUser.setIsActive(true);
                    vendorUsers.add(vendorUser);
                    
                    // Create Vendor entity
                    Vendor vendor = Vendor.builder()
                            .vendorCode(vendorCode)
                            .businessName(city + " Services Co.")
                            .primaryCategory(category)
                            .phone(String.format("98765432%02d", 10 + i))
                            .email(email)
                            .address(generateLocation(city, i))
                            .city(city)
                            .state(getState(city))
                            .postalCode(String.format("%d", 400001 + i * 100))
                            .availability(generateAvailability(i))
                            .yearsOfExperience(5 + i)
                            .averageRating(new BigDecimal(String.format("%.1f", 4.2 + (i * 0.1))))
                            .totalReviews(50 + (i * 20))
                            .isActive(true)
                            .isVerified(true)
                            .description(city + "'s trusted service provider for all your needs")
                            .build();
                    vendors.add(vendor);
                }
                
                // Save all vendor users first
                userRepository.saveAll(vendorUsers);
                logger.info("Created {} regional vendor user accounts", vendorUsers.size());
                
                // Link vendors to their user accounts
                for (int i = 0; i < vendors.size(); i++) {
                    vendors.get(i).setUser(vendorUsers.get(i));
                }
                
                // Save all vendors
                vendorRepository.saveAll(vendors);
                logger.info("Created {} regional vendors linked to user accounts", vendors.size());
                
                // Generate services for each vendor
                int globalServiceIndex = 1;
                for (int i = 0; i < vendors.size(); i++) {
                    Vendor vendor = vendors.get(i);
                    int vendorServiceCount = Integer.parseInt(regionConfig[i][3]);
                    
                    for (int j = 0; j < vendorServiceCount; j++) {
                        Service service = generateService(vendor, j, globalServiceIndex);
                        services.add(service);
                        globalServiceIndex++;
                    }
                }
                
                // Save all services
                serviceRepository.saveAll(services);
                logger.info("Created {} services across {} vendors", services.size(), vendors.size());
                
                logger.info("============================================");
                logger.info("REGIONAL DATA GENERATION COMPLETE");
                logger.info("============================================");
                logger.info("REGIONAL VENDOR LOGIN CREDENTIALS:");
                logger.info("Mumbai: mumbai@bookkaro.com (5 services)");
                logger.info("Pune: pune@bookkaro.com (4 services)");
                logger.info("Delhi: delhi@bookkaro.com (5 services)");
                logger.info("Bangalore: bangalore@bookkaro.com (4 services)");
                logger.info("Thane: thane@bookkaro.com (2 services)");
                logger.info("Navi Mumbai: navimumbai@bookkaro.com (5 services)");
                logger.info("Password: vendor123 (all vendors)");
                logger.info("Total Services: {}", services.size());
                logger.info("============================================");
            } else {
                logger.info("Regional data already exists ({} vendors, {} services)", 
                        vendorRepository.count(), serviceRepository.count());
            }
        };
    }
    
    private String generateLocation(String city, int index) {
        String[] areas = {"Central", "East", "West", "North", "South", "Downtown", "Uptown", "Mall Road", 
                         "Station Road", "Market Area", "Business District", "Residential Zone"};
        return city + " " + areas[index % areas.length];
    }
    
    private String getState(String city) {
        if (city.equals("Mumbai") || city.equals("Thane") || city.equals("Navi Mumbai") || city.equals("Pune")) {
            return "Maharashtra";
        } else if (city.equals("Delhi")) {
            return "Delhi";
        } else {
            return "Karnataka";
        }
    }
    
    private String generateAvailability(int index) {
        String[] availabilities = {
            "Mon-Sat 9AM-7PM",
            "Mon-Sun 8AM-8PM",
            "24/7 Emergency Service",
            "Mon-Fri 10AM-6PM",
            "Weekends Only",
            "Mon-Sun 9AM-9PM"
        };
        return availabilities[index % availabilities.length];
    }
    
    private Service generateService(Vendor vendor, int serviceIndex, int globalIndex) {
        String category = vendor.getPrimaryCategory();
        String[] serviceTypes = getServiceTypesForCategory(category);
        String serviceType = serviceTypes[serviceIndex % serviceTypes.length];
        
        String[] prices = {"800", "1200", "1500", "1800", "2000", "2500", "3000", "3500", "4000", "5000", "8000", "10000", "15000"};
        int[] durations = {60, 90, 120, 180, 240, 300, 360, 480};
        
        return Service.builder()
                .serviceName(serviceType)
                .description(generateServiceDescription(serviceType, category))
                .categoryLegacy(category)
                .price(new BigDecimal(prices[globalIndex % prices.length]))
                .durationMinutes(durations[serviceIndex % durations.length])
                .address(vendor.getCity())
                .city(vendor.getCity())
                .state(vendor.getState())
                .postalCode(vendor.getPostalCode())
                .vendor(vendor)
                .isAvailable(true)
                .averageRating(new BigDecimal(String.format("%.1f", 4.0 + (globalIndex % 10) / 10.0)))
                .totalReviews(10 + (globalIndex % 40))
                .build();
    }
    
    private String[] getServiceTypesForCategory(String category) {
        switch (category) {
            case "Plumbing":
                return new String[]{"Pipe Leak Repair", "Drain Cleaning", "Water Heater Installation", "Bathroom Fitting"};
            case "Electrical":
                return new String[]{"Wiring Installation", "Switchboard Repair", "Light Fixture Setup", "Fan Installation"};
            case "Cleaning":
                return new String[]{"Deep House Cleaning", "Kitchen Cleaning", "Bathroom Sanitization", "Carpet Cleaning"};
            case "Painting":
                return new String[]{"Interior Painting", "Exterior Painting", "Wall Texturing", "Waterproofing"};
            case "Carpentry":
                return new String[]{"Custom Wardrobe", "Furniture Repair", "Door Installation", "Kitchen Cabinets"};
            case "Appliance Repair":
                return new String[]{"AC Repair", "Refrigerator Repair", "Washing Machine Repair", "Microwave Repair"};
            case "Pest Control":
                return new String[]{"General Pest Control", "Termite Treatment", "Bed Bug Treatment", "Rodent Control"};
            case "Beauty":
                return new String[]{"Haircut & Styling", "Facial Treatment", "Bridal Makeup", "Manicure & Pedicure"};
            case "Fitness":
                return new String[]{"Personal Training", "Yoga Classes", "Weight Loss Program", "Strength Training"};
            case "IT Services":
                return new String[]{"Laptop Repair", "Software Installation", "Data Recovery", "Virus Removal"};
            case "Car Services":
                return new String[]{"Car Washing", "Car Detailing", "AC Service", "Interior Cleaning"};
            case "Gardening":
                return new String[]{"Lawn Maintenance", "Garden Design", "Plant Care", "Tree Trimming"};
            case "Laundry":
                return new String[]{"Dry Cleaning", "Wash & Iron", "Shoe Cleaning", "Curtain Cleaning"};
            case "Photography":
                return new String[]{"Event Photography", "Portrait Session", "Product Photography", "Wedding Photography"};
            case "Education":
                return new String[]{"Math Tutoring", "Science Tutoring", "English Tutoring", "Exam Preparation"};
            default:
                return new String[]{"Standard Service", "Premium Service", "Basic Service", "Advanced Service"};
        }
    }
    
    private String generateServiceDescription(String serviceType, String category) {
        return String.format("Professional %s service by experienced %s specialists with quality guarantee and timely completion", 
                           serviceType.toLowerCase(), category.toLowerCase());
    }
}
