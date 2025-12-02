package com.bookkaro.service;

import com.bookkaro.model.Service;
import com.bookkaro.model.User;
import com.bookkaro.model.Vendor;
import com.bookkaro.repository.ServiceRepository;
import com.bookkaro.repository.UserRepository;
import com.bookkaro.repository.VendorRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
@lombok.RequiredArgsConstructor
public class CSVImportService {
    private static final Logger logger = LoggerFactory.getLogger(CSVImportService.class);
    
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ServiceRepository serviceRepository;
    
    /**
     * Import users from CSV file
     * Expected columns: firstName,lastName,email,password,phone,address,city,state,postalCode,role
     */
    public ImportResult importUsers(MultipartFile file) {
        ImportResult result = new ImportResult();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .build()
                     .parse(reader)) {
            
            for (CSVRecord csvRecord : csvParser) {
                try {
                    String email = csvRecord.get("email");
                    
                    // Skip if user already exists
                    if (userRepository.findByEmail(email).isPresent()) {
                        result.addSkipped(email + " - already exists");
                        continue;
                    }
                    
                    User user = new User();
                    user.setFirstName(csvRecord.get("firstName"));
                    user.setLastName(csvRecord.get("lastName"));
                    user.setFullName(csvRecord.get("firstName") + " " + csvRecord.get("lastName"));
                    user.setEmail(email);
                    user.setPassword(csvRecord.get("password")); // Plain text - no encoding
                    user.setPhone(csvRecord.get("phone"));
                    user.setAddress(csvRecord.get("address"));
                    user.setCity(csvRecord.get("city"));
                    user.setState(csvRecord.get("state"));
                    user.setPostalCode(csvRecord.get("postalCode"));
                    
                    // Parse role (default to USER if not specified)
                    String roleStr = csvRecord.get("role").toUpperCase();
                    User.UserRole role = User.UserRole.valueOf(roleStr);
                    user.setRole(role);
                    user.setIsActive(true);
                    
                    userRepository.save(user);
                    result.addSuccess(email);
                    
                } catch (Exception e) {
                    result.addError("Row " + csvParser.getCurrentLineNumber() + ": " + e.getMessage());
                    logger.error("Error importing user from CSV row {}: {}", 
                            csvParser.getCurrentLineNumber(), e.getMessage());
                }
            }
            
            result.setSuccess(result.getErrorCount() == 0);
            logger.info("CSV user import complete: {} success, {} errors, {} skipped", 
                    result.getSuccessCount(), result.getErrorCount(), result.getSkippedCount());
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.addError("Failed to parse CSV file: " + e.getMessage());
            logger.error("CSV import failed", e);
        }
        
        return result;
    }
    
    /**
     * Import vendors from CSV file
     * Expected columns: vendorCode,businessName,primaryCategory,phone,email,location,city,state,postalCode,
     *                   availability,yearsOfExperience,description
     */
    public ImportResult importVendors(MultipartFile file) {
        ImportResult result = new ImportResult();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .build()
                     .parse(reader)) {
            
            for (CSVRecord csvRecord : csvParser) {
                try {
                    String vendorCode = csvRecord.get("vendorCode");
                    
                    // Skip if vendor already exists
                    if (vendorRepository.findByVendorCode(vendorCode).isPresent()) {
                        result.addSkipped(vendorCode + " - already exists");
                        continue;
                    }
                    
                    Vendor vendor = Vendor.builder()
                            .vendorCode(vendorCode)
                            .businessName(csvRecord.get("businessName"))
                            .primaryCategory(csvRecord.get("primaryCategory"))
                            .phone(csvRecord.get("phone"))
                            .email(csvRecord.get("email"))
                            .city(csvRecord.get("city"))
                            .state(csvRecord.get("state"))
                            .postalCode(csvRecord.get("postalCode"))
                            .availability(csvRecord.get("availability"))
                            .yearsOfExperience(Integer.parseInt(csvRecord.get("yearsOfExperience")))
                            .description(csvRecord.get("description"))
                            .averageRating(new BigDecimal("4.0"))
                            .totalReviews(0)
                            .isActive(true)
                            .isVerified(false)
                            .build();
                    
                    vendorRepository.save(vendor);
                    result.addSuccess(vendorCode);
                    
                } catch (Exception e) {
                    result.addError("Row " + csvParser.getCurrentLineNumber() + ": " + e.getMessage());
                    logger.error("Error importing vendor from CSV row {}: {}", 
                            csvParser.getCurrentLineNumber(), e.getMessage());
                }
            }
            
            result.setSuccess(result.getErrorCount() == 0);
            logger.info("CSV vendor import complete: {} success, {} errors, {} skipped", 
                    result.getSuccessCount(), result.getErrorCount(), result.getSkippedCount());
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.addError("Failed to parse CSV file: " + e.getMessage());
            logger.error("CSV import failed", e);
        }
        
        return result;
    }
    
    /**
     * Import services from CSV file
     * Expected columns: serviceName,description,category,price,durationMinutes,address,city,state,postalCode,vendorCode
     */
    public ImportResult importServices(MultipartFile file) {
        ImportResult result = new ImportResult();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .build()
                     .parse(reader)) {
            
            for (CSVRecord csvRecord : csvParser) {
                try {
                    String vendorCode = csvRecord.get("vendorCode");
                    Vendor vendor = vendorRepository.findByVendorCode(vendorCode)
                            .orElseThrow(() -> new IllegalArgumentException("Vendor not found: " + vendorCode));
                    
                    Service service = Service.builder()
                            .serviceName(csvRecord.get("serviceName"))
                            .description(csvRecord.get("description"))
                            .categoryLegacy(csvRecord.get("category"))
                            .price(new BigDecimal(csvRecord.get("price")))
                            .durationMinutes(Integer.parseInt(csvRecord.get("durationMinutes")))
                            .address(csvRecord.get("address"))
                            .city(csvRecord.get("city"))
                            .state(csvRecord.get("state"))
                            .postalCode(csvRecord.get("postalCode"))
                            .vendor(vendor)
                            .isAvailable(true)
                            .averageRating(new BigDecimal("4.0"))
                            .totalReviews(0)
                            .build();
                    
                    serviceRepository.save(service);
                    result.addSuccess(csvRecord.get("serviceName"));
                    
                } catch (Exception e) {
                    result.addError("Row " + csvParser.getCurrentLineNumber() + ": " + e.getMessage());
                    logger.error("Error importing service from CSV row {}: {}", 
                            csvParser.getCurrentLineNumber(), e.getMessage());
                }
            }
            
            result.setSuccess(result.getErrorCount() == 0);
            logger.info("CSV service import complete: {} success, {} errors, {} skipped", 
                    result.getSuccessCount(), result.getErrorCount(), result.getSkippedCount());
            
        } catch (Exception e) {
            result.setSuccess(false);
            result.addError("Failed to parse CSV file: " + e.getMessage());
            logger.error("CSV import failed", e);
        }
        
        return result;
    }
    
    /**
     * Result object for CSV import operations
     */
    @lombok.Data
    public static class ImportResult {
        private boolean success;
        private List<String> successfulImports = new ArrayList<>();
        private List<String> errors = new ArrayList<>();
        private List<String> skipped = new ArrayList<>();
        
        public void addSuccess(String item) {
            successfulImports.add(item);
        }
        
        public void addError(String error) {
            errors.add(error);
        }
        
        public void addSkipped(String item) {
            skipped.add(item);
        }
        
        public int getSuccessCount() {
            return successfulImports.size();
        }
        
        public int getErrorCount() {
            return errors.size();
        }
        
        public int getSkippedCount() {
            return skipped.size();
        }
        
        public String getSummary() {
            return String.format("Imported: %d, Errors: %d, Skipped: %d", 
                    getSuccessCount(), getErrorCount(), getSkippedCount());
        }
    }
}
