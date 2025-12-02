package com.bookkaro.exception;

/**
 * Exception thrown when a user attempts to access or modify a resource
 * without proper authorization or permission.
 * 
 * This exception maps to HTTP 403 Forbidden status.
 * Use when authenticated users lack permission for the requested action.
 * 
 * Examples:
 * - Accessing another user's bookings
 * - Modifying another vendor's services
 * - Unauthorized admin operations
 */
public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }
    
    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}
