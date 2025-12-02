package com.bookkaro.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Simple in-memory rate limiter for registration attempts
 * Prevents spam registrations by tracking attempts per IP address
 */
@Service
public class RateLimiterService {

    private static class RateLimitInfo {
        int attempts;
        LocalDateTime firstAttempt;

        RateLimitInfo() {
            this.attempts = 1;
            this.firstAttempt = LocalDateTime.now();
        }

        void incrementAttempt() {
            this.attempts++;
        }

        boolean isExpired(int windowMinutes) {
            return LocalDateTime.now().isAfter(firstAttempt.plusMinutes(windowMinutes));
        }
    }

    // Store registration attempts by IP address
    private final ConcurrentMap<String, RateLimitInfo> registrationAttempts = new ConcurrentHashMap<>();
    
    // Configuration
    private static final int MAX_REGISTRATION_ATTEMPTS = 5; // Max attempts
    private static final int RATE_LIMIT_WINDOW_MINUTES = 60; // Per hour

    /**
     * Check if registration is allowed for given IP address
     * @param ipAddress Client IP address
     * @return true if allowed, false if rate limit exceeded
     */
    public boolean isRegistrationAllowed(String ipAddress) {
        if (ipAddress == null || ipAddress.isEmpty()) {
            return true; // Allow if IP cannot be determined
        }

        RateLimitInfo info = registrationAttempts.get(ipAddress);

        // No previous attempts - allow
        if (info == null) {
            registrationAttempts.put(ipAddress, new RateLimitInfo());
            return true;
        }

        // Check if window expired - reset counter
        if (info.isExpired(RATE_LIMIT_WINDOW_MINUTES)) {
            registrationAttempts.put(ipAddress, new RateLimitInfo());
            return true;
        }

        // Check if limit exceeded
        if (info.attempts >= MAX_REGISTRATION_ATTEMPTS) {
            return false; // Rate limit exceeded
        }

        // Increment attempt and allow
        info.incrementAttempt();
        return true;
    }

    /**
     * Get remaining attempts for IP address
     */
    public int getRemainingAttempts(String ipAddress) {
        if (ipAddress == null || ipAddress.isEmpty()) {
            return MAX_REGISTRATION_ATTEMPTS;
        }

        RateLimitInfo info = registrationAttempts.get(ipAddress);
        if (info == null || info.isExpired(RATE_LIMIT_WINDOW_MINUTES)) {
            return MAX_REGISTRATION_ATTEMPTS;
        }

        return Math.max(0, MAX_REGISTRATION_ATTEMPTS - info.attempts);
    }

    /**
     * Cleanup expired entries periodically (call from scheduled task)
     */
    public void cleanupExpiredEntries() {
        registrationAttempts.entrySet().removeIf(entry -> 
            entry.getValue().isExpired(RATE_LIMIT_WINDOW_MINUTES)
        );
    }

    /**
     * Generic rate limiting method for any operation
     * @param key Unique key for the operation (e.g., "LOGIN_192.168.1.1")
     * @param maxAttempts Maximum number of attempts allowed
     * @param windowMinutes Time window in minutes
     * @return true if allowed, false if rate limit exceeded
     */
    public boolean tryAcquire(String key, int maxAttempts, int windowMinutes) {
        if (key == null || key.isEmpty()) {
            return true;
        }

        RateLimitInfo info = registrationAttempts.get(key);

        // No previous attempts - allow
        if (info == null) {
            registrationAttempts.put(key, new RateLimitInfo());
            return true;
        }

        // Check if window expired - reset counter
        if (info.isExpired(windowMinutes)) {
            registrationAttempts.put(key, new RateLimitInfo());
            return true;
        }

        // Check if limit exceeded
        if (info.attempts >= maxAttempts) {
            return false; // Rate limit exceeded
        }

        // Increment attempt and allow
        info.incrementAttempt();
        return true;
    }
}
