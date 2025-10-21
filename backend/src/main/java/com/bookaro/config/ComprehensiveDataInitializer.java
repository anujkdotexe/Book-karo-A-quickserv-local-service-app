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
import java.util.ArrayList;
import java.util.List;

/**
 * Comprehensive data initializer that generates 150+ services across 50 vendors
 * Each vendor is linked to a User account with VENDOR role for login capability
 */
@Configuration
public class ComprehensiveDataInitializer {
    private static final Logger logger = LoggerFactory.getLogger(ComprehensiveDataInitializer.class);

    @Bean
    @Order(3) // Run after DataInitializer (Order 1)
    CommandLineRunner initComprehensiveData(UserRepository userRepository,
                                           VendorRepository vendorRepository, 
                                           ServiceRepository serviceRepository,
                                           PasswordEncoder passwordEncoder) {
        return args -> {
            // DISABLED: Only use DataInitializer for test data
            // User requested to remove all generated vendors and keep only TEST001
            if (false) { // Changed from: if (serviceRepository.count() < 100)
                logger.info("============================================");
                logger.info("GENERATING 150+ SERVICES WITH 50 VENDORS");
                logger.info("============================================");
                
                List<User> vendorUsers = new ArrayList<>();
                List<Vendor> vendors = new ArrayList<>();
                List<Service> services = new ArrayList<>();
                
                // Define categories and cities for variety
                String[] categories = {"Plumbing", "Electrical", "Cleaning", "Painting", "Carpentry", 
                                      "Appliance Repair", "Pest Control", "Beauty", "Fitness", "IT Services",
                                      "Car Services", "Gardening", "Laundry", "Photography", "Education"};
                String[] cities = {"Mumbai", "Thane", "Navi Mumbai", "Pune", "Delhi", "Bangalore"};
                
                // Generate 50 vendors (each with a User account for login)
                for (int i = 1; i <= 50; i++) {
                    String category = categories[(i - 1) % categories.length];
                    String city = cities[(i - 1) % cities.length];
                    String vendorCode = String.format("VEN%03d", i);
                    String email = String.format("vendor%d@bookaro.com", i);
                    
                    // Create User account for vendor (for login)
                    User vendorUser = new User();
                    vendorUser.setEmail(email);
                    vendorUser.setPassword(passwordEncoder.encode("vendor123")); // All vendors same password for testing
                    vendorUser.setFirstName("Vendor");
                    vendorUser.setLastName(String.format("#%d", i));
                    vendorUser.setFullName(String.format("Vendor #%d", i));
                    vendorUser.setPhone(String.format("98765%05d", 43200 + i));
                    vendorUser.setAddress(generateLocation(city, i));
                    vendorUser.setCity(city);
                    vendorUser.setState(getState(city));
                    vendorUser.setZipCode(String.format("%d", 400000 + i));
                    vendorUser.setRole(User.UserRole.VENDOR);
                    vendorUser.setIsActive(true);
                    vendorUsers.add(vendorUser);
                    
                    // Create Vendor entity
                    Vendor vendor = Vendor.builder()
                            .vendorCode(vendorCode)
                            .businessName(generateBusinessName(category, i))
                            .primaryCategory(category)
                            .phone(String.format("98765%05d", 43200 + i))
                            .email(email)
                            .location(generateLocation(city, i))
                            .city(city)
                            .state(getState(city))
                            .postalCode(String.format("%d", 400000 + i))
                            .availability(generateAvailability(i))
                            .yearsOfExperience(5 + (i % 15))
                            .averageRating(new BigDecimal(String.format("%.1f", 4.0 + (i % 10) / 10.0)))
                            .totalReviews(50 + (i * 3))
                            .isActive(true)
                            .isVerified(true)
                            .description(generateDescription(category))
                            .build();
                    vendors.add(vendor);
                }
                
                // Save all vendor users first
                userRepository.saveAll(vendorUsers);
                logger.info("Created {} vendor user accounts (login: vendorX@bookaro.com / vendor123)", vendorUsers.size());
                
                // Save all vendors
                vendorRepository.saveAll(vendors);
                logger.info("Created {} vendors", vendors.size());
                
                // Generate 3-4 services per vendor (150-200 services total)
                int serviceCount = 1;
                for (Vendor vendor : vendors) {
                    int servicesPerVendor = 3 + (serviceCount % 2); // 3 or 4 services per vendor
                    
                    for (int j = 0; j < servicesPerVendor; j++) {
                        Service service = generateService(vendor, j, serviceCount);
                        services.add(service);
                        serviceCount++;
                    }
                }
                
                // Save all services
                serviceRepository.saveAll(services);
                logger.info("Created {} services", services.size());
                
                logger.info("============================================");
                logger.info("COMPREHENSIVE DATA GENERATION COMPLETE");
                logger.info("Total Vendors: {}", vendorRepository.count());
                logger.info("Total Services: {}", serviceRepository.count());
                logger.info("============================================");
                logger.info("VENDOR LOGIN CREDENTIALS:");
                logger.info("Email: vendor1@bookaro.com to vendor50@bookaro.com");
                logger.info("Password: vendor123 (all vendors)");
                logger.info("============================================");
            } else {
                logger.info("Comprehensive data already exists ({} vendors, {} services)", 
                        vendorRepository.count(), serviceRepository.count());
            }
        };
    }
    
    private String generateBusinessName(String category, int index) {
        String[] prefixes = {"Pro", "Expert", "Premium", "Elite", "Quick", "Smart", "Perfect", "Golden", "Royal", "Star"};
        String[] suffixes = {"Services", "Solutions", "Experts", "Professionals", "Care", "Hub", "Point", "Zone", "Plus", "Masters"};
        String prefix = prefixes[index % prefixes.length];
        String suffix = suffixes[(index / 2) % suffixes.length];
        return prefix + " " + category + " " + suffix;
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
    
    private String generateDescription(String category) {
        switch (category) {
            case "Plumbing": return "Professional plumbing services for residential and commercial properties with 24/7 emergency support";
            case "Electrical": return "Licensed electricians providing safe and reliable electrical services for all your needs";
            case "Cleaning": return "Professional cleaning services using eco-friendly products and trained staff";
            case "Painting": return "Quality painting services with premium paints and experienced painters";
            case "Carpentry": return "Custom furniture design, repair, and installation by skilled carpenters";
            case "Appliance Repair": return "Expert repair services for all home appliances with genuine parts";
            case "Pest Control": return "Safe and effective pest control using government-approved chemicals";
            case "Beauty": return "Professional beauty services at your doorstep by certified beauticians";
            case "Fitness": return "Personalized fitness training by certified trainers for all fitness levels";
            case "IT Services": return "Computer and laptop repair, software solutions, and tech support";
            case "Car Services": return "Complete car care services including washing, detailing, and maintenance";
            case "Gardening": return "Professional gardening and landscaping services for beautiful outdoor spaces";
            case "Laundry": return "Premium laundry and dry cleaning services with pickup and delivery";
            case "Photography": return "Professional photography services for all occasions and events";
            case "Education": return "Expert tutoring services for all subjects and competitive exams";
            default: return "Professional services delivered with quality and reliability";
        }
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
                .category(category)
                .price(new BigDecimal(prices[globalIndex % prices.length]))
                .durationMinutes(durations[serviceIndex % durations.length])
                .address(vendor.getLocation())
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
