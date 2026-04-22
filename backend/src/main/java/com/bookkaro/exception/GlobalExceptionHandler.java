package com.bookkaro.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Global Exception Handler for bookkaro API
 * Handles all exceptions and returns consistent error responses
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle ResourceNotFoundException
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                ex.getMessage(),
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle BadRequestException
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequestException(
            BadRequestException ex, WebRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                ex.getMessage(),
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle UnauthorizedException (403 Forbidden)
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(
            UnauthorizedException ex, WebRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                ex.getMessage(),
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    /**
     * Handle ConflictException (409 Conflict)
     */
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflictException(
            ConflictException ex, WebRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                ex.getMessage(),
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * Handle Validation Exceptions
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {

        List<String> errors = new ArrayList<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.add(error.getField() + ": " + error.getDefaultMessage());
        }

        // Create a more descriptive message with the first error
        String mainMessage = errors.isEmpty() ? "Validation failed" : 
            "Validation failed: " + errors.get(0);

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                mainMessage,
                errors,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle Authentication Exceptions
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(
            BadCredentialsException ex, WebRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                "Invalid email or password",
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handle NoResourceFoundException (404 - Resource not found)
     */
    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFoundException(
            org.springframework.web.servlet.resource.NoResourceFoundException ex, WebRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                "Resource not found: " + ex.getResourcePath(),
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle IllegalArgumentException
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                ex.getMessage(),
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle NullPointerException
     */
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ErrorResponse> handleNullPointerException(
            NullPointerException ex, WebRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                "A null value was encountered. Please ensure all required fields are provided.",
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle DataIntegrityViolationException (Database constraint violations)
     */
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(
            org.springframework.dao.DataIntegrityViolationException ex, WebRequest request) {

        String message = "Database constraint violation";
        if (ex.getMessage().contains("duplicate key")) {
            message = "Duplicate entry detected. This record already exists.";
        } else if (ex.getMessage().contains("foreign key")) {
            message = "Cannot delete or update. This record is referenced by other data.";
        } else if (ex.getMessage().contains("not-null")) {
            message = "Required field is missing. Please provide all mandatory information.";
        }

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                message,
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle AccessDeniedException (403 Forbidden)
     */
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            org.springframework.security.access.AccessDeniedException ex, WebRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                "Access denied. You do not have permission to perform this action.",
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    /**
     * Handle all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {

        // Log the full exception for debugging
        System.err.println("Unhandled exception: " + ex.getClass().getName() + " - " + ex.getMessage());
        ex.printStackTrace();

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                "An unexpected error occurred. Please try again later.",
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Handle BookingException
     */
    @ExceptionHandler(BookingException.class)
    public ResponseEntity<ErrorResponse> handleBookingException(
            BookingException ex, WebRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                ex.getMessage(),
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle AvailabilityException
     */
    @ExceptionHandler(AvailabilityException.class)
    public ResponseEntity<ErrorResponse> handleAvailabilityException(
            AvailabilityException ex, WebRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                ex.getMessage(),
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * Handle CouponException
     */
    @ExceptionHandler(CouponException.class)
    public ResponseEntity<ErrorResponse> handleCouponException(
            CouponException ex, WebRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                false,
                ex.getMessage(),
                null,
                LocalDateTime.now(),
                request.getDescription(false).replace("uri=", "")
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}
