package com.bookkaro.constants;

/**
 * Constants for booking-related messages and validation
 */
public class BookingConstants {

    // Validation Messages
    public static final String BOOKING_ADVANCE_TIME_ERROR = 
        "Bookings must be made at least 2 hours in advance. Please select a later time.";
    
    public static final String BOOKING_MAX_ADVANCE_ERROR = 
        "Bookings can only be made up to 90 days in advance. Please select an earlier date.";
    
    public static final String SERVICE_NOT_AVAILABLE_ERROR = 
        "Service is no longer available for booking";
    
    public static final String BOOKING_PAST_TIME_ERROR = 
        "Cannot book in the past. Please select a future date and time";
    
    public static final String VENDOR_NOT_AVAILABLE_SLOT_ERROR = 
        "Vendor is not available on %s at %s. Available times: %s";
    
    public static final String VENDOR_NOT_AVAILABLE_DATE_ERROR = 
        "Vendor is not available on %s";
    
    public static final String SLOT_NOT_AVAILABLE_ERROR = 
        "The selected time slot %s on %s is not available for this vendor";
    
    public static final String BOOKING_CONFLICT_ERROR = 
        "The selected time slot conflicts with an existing booking";

    // Business Logic Constants
    public static final int MIN_ADVANCE_HOURS = 2;
    public static final int MAX_ADVANCE_DAYS = 90;

    // Notification Messages
    public static final String BOOKING_CREATED_NOTIFICATION = 
        "Your booking for %s has been confirmed for %s";
    
    public static final String BOOKING_CANCELLED_NOTIFICATION = 
        "Your booking for %s on %s has been cancelled";
    
    public static final String BOOKING_COMPLETED_NOTIFICATION = 
        "Your booking for %s has been completed. Please rate your experience";

    // Audit Log Messages
    public static final String AUDIT_BOOKING_CREATED = 
        "Booking created for service: %s, scheduled for: %s";
    
    public static final String AUDIT_BOOKING_CANCELLED = 
        "Booking cancelled - ID: %d, Reason: %s";
    
    public static final String AUDIT_BOOKING_STATUS_UPDATED = 
        "Booking status updated - ID: %d, New Status: %s";

    // Coupon Messages
    public static final String COUPON_VALIDATION_FAILED = 
        "Coupon validation failed: %s";
    
    public static final String COUPON_APPLIED_SUCCESS = 
        "Coupon applied successfully. Discount: ₹%s";

    private BookingConstants() {
        // Private constructor to prevent instantiation
    }
}