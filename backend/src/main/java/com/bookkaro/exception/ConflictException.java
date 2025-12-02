package com.bookkaro.exception;

/**
 * Exception thrown when a request conflicts with the current state of the resource.
 * 
 * This exception maps to HTTP 409 Conflict status.
 * Use when operations cannot be completed due to state conflicts.
 * 
 * Examples:
 * - Attempting to delete a service with active bookings
 * - Requesting a refund when one already exists
 * - Updating already processed/completed records
 * - Deleting users/vendors with dependent data
 */
public class ConflictException extends RuntimeException {
    
    public ConflictException(String message) {
        super(message);
    }
    
    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
