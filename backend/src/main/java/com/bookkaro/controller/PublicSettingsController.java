package com.bookkaro.controller;

import com.bookkaro.model.SystemSettings;
import com.bookkaro.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Public System Settings Controller
 * Provides public access to system configuration settings
 */
@RestController
@RequestMapping("/public/settings")
@RequiredArgsConstructor
public class PublicSettingsController {

    private final SystemSettingsRepository settingsRepository;

    /**
     * Get public/shared settings (accessible to all users without authentication)
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> getPublicSettings() {
        List<SystemSettings> settings = settingsRepository.findByIsPublic(true);
        Map<String, String> publicSettings = new HashMap<>();
        settings.forEach(s -> publicSettings.put(s.getSettingKey(), s.getSettingValue()));
        return ResponseEntity.ok(publicSettings);
    }
}
