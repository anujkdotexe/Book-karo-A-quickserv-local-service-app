package com.bookkaro.controller;

import com.bookkaro.dto.SystemSettingsDTO;
import com.bookkaro.model.SystemSettings;
import com.bookkaro.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class SystemSettingsController {

    private final SystemSettingsRepository settingsRepository;

    /**
     * Get all settings (Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SystemSettingsDTO>> getAllSettings() {
        List<SystemSettings> settings = settingsRepository.findAll();
        List<SystemSettingsDTO> dtos = settings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get settings by category (Admin only)
     */
    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SystemSettingsDTO>> getSettingsByCategory(@PathVariable String category) {
        List<SystemSettings> settings = settingsRepository.findByCategory(category);
        List<SystemSettingsDTO> dtos = settings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get public/shared settings (accessible to all users)
     */
    @GetMapping("/shared-settings")
    public ResponseEntity<Map<String, String>> getPublicSettings() {
        List<SystemSettings> settings = settingsRepository.findByIsPublic(true);
        Map<String, String> publicSettings = new HashMap<>();
        settings.forEach(s -> publicSettings.put(s.getSettingKey(), s.getSettingValue()));
        return ResponseEntity.ok(publicSettings);
    }

    /**
     * Get specific setting by key (Admin only)
     */
    @GetMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemSettingsDTO> getSettingByKey(@PathVariable String key) {
        return settingsRepository.findBySettingKey(key)
                .map(setting -> ResponseEntity.ok(convertToDTO(setting)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new setting (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemSettingsDTO> createSetting(@RequestBody SystemSettingsDTO dto) {
        // Check if setting already exists
        if (settingsRepository.findBySettingKey(dto.getSettingKey()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        SystemSettings setting = SystemSettings.builder()
                .settingKey(dto.getSettingKey())
                .settingValue(dto.getSettingValue())
                .settingType(dto.getSettingType())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .isPublic(dto.getIsPublic() != null ? dto.getIsPublic() : false)
                .build();

        SystemSettings saved = settingsRepository.save(setting);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(saved));
    }

    /**
     * Update setting (Admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemSettingsDTO> updateSetting(
            @PathVariable Long id,
            @RequestBody SystemSettingsDTO dto) {
        
        return settingsRepository.findById(id)
                .map(setting -> {
                    if (dto.getSettingValue() != null) {
                        setting.setSettingValue(dto.getSettingValue());
                    }
                    if (dto.getDescription() != null) {
                        setting.setDescription(dto.getDescription());
                    }
                    if (dto.getIsPublic() != null) {
                        setting.setIsPublic(dto.getIsPublic());
                    }
                    SystemSettings updated = settingsRepository.save(setting);
                    return ResponseEntity.ok(convertToDTO(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Bulk update settings (Admin only)
     */
    @PutMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SystemSettingsDTO>> bulkUpdateSettings(
            @RequestBody Map<String, String> updates) {
        
        List<SystemSettings> updatedSettings = updates.entrySet().stream()
                .map(entry -> {
                    SystemSettings setting = settingsRepository.findBySettingKey(entry.getKey())
                            .orElse(null);
                    if (setting != null) {
                        setting.setSettingValue(entry.getValue());
                        return settingsRepository.save(setting);
                    }
                    return null;
                })
                .filter(s -> s != null)
                .collect(Collectors.toList());

        List<SystemSettingsDTO> dtos = updatedSettings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    /**
     * Delete setting (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSetting(@PathVariable Long id) {
        if (settingsRepository.existsById(id)) {
            settingsRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Initialize default settings (Admin only)
     */
    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> initializeDefaultSettings() {
        Map<String, String> result = new HashMap<>();
        
        // Check if settings already exist
        if (settingsRepository.count() > 0) {
            result.put("message", "Settings already initialized");
            return ResponseEntity.ok(result);
        }

        // Contact Information
        createDefaultSetting("contact.email", "support@bookkaro.com", "EMAIL", 
                "Support email address", "CONTACT", true);
        createDefaultSetting("contact.phone", "+1 (555) 123-4567", "PHONE", 
                "Support phone number", "CONTACT", true);
        
        // Pricing
        createDefaultSetting("pricing.service_fee", "99", "NUMBER", 
                "Service fee per booking (in rupees)", "PRICING", false);
        
        // General
        createDefaultSetting("general.platform_name", "BOOK-KARO", "TEXT", 
                "Platform name", "GENERAL", true);

        result.put("message", "Default settings initialized successfully");
        return ResponseEntity.ok(result);
    }

    private void createDefaultSetting(String key, String value, String type, 
                                     String description, String category, boolean isPublic) {
        if (settingsRepository.findBySettingKey(key).isEmpty()) {
            SystemSettings setting = SystemSettings.builder()
                    .settingKey(key)
                    .settingValue(value)
                    .settingType(type)
                    .description(description)
                    .category(category)
                    .isPublic(isPublic)
                    .build();
            settingsRepository.save(setting);
        }
    }

    private SystemSettingsDTO convertToDTO(SystemSettings setting) {
        return SystemSettingsDTO.builder()
                .id(setting.getId())
                .settingKey(setting.getSettingKey())
                .settingValue(setting.getSettingValue())
                .settingType(setting.getSettingType())
                .description(setting.getDescription())
                .category(setting.getCategory())
                .isPublic(setting.getIsPublic())
                .build();
    }
}
