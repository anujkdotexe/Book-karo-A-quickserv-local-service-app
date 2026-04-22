package com.bookkaro.exception;

/**
 * Custom exception for availability-related errors
 */
public class AvailabilityException extends RuntimeException {
    
    public AvailabilityException(String message) {
        super(message);
    }
    
    public AvailabilityException(String message, Throwable cause) {
        super(message, cause);
    }
}