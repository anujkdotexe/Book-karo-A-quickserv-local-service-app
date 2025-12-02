package com.bookkaro.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

/**
 * Validator implementation for @NoHtml annotation
 * Prevents XSS attacks by rejecting HTML tags and JavaScript
 */
public class NoHtmlValidator implements ConstraintValidator<NoHtml, String> {
    
    // Patterns to detect HTML tags and JavaScript
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>", Pattern.CASE_INSENSITIVE);
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("javascript:|on\\w+\\s*=|<script", Pattern.CASE_INSENSITIVE);
    private static final Pattern IMG_ONERROR_PATTERN = Pattern.compile("<img[^>]+onerror\\s*=", Pattern.CASE_INSENSITIVE);
    private static final Pattern IFRAME_PATTERN = Pattern.compile("<iframe", Pattern.CASE_INSENSITIVE);
    private static final Pattern OBJECT_EMBED_PATTERN = Pattern.compile("<(object|embed)", Pattern.CASE_INSENSITIVE);
    
    @Override
    public void initialize(NoHtml constraintAnnotation) {
        // No initialization needed - patterns are static
    }
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // Null values are valid (use @NotNull/@NotBlank for null checks)
        if (value == null || value.isEmpty()) {
            return true;
        }
        
        // Check for HTML tags
        if (HTML_TAG_PATTERN.matcher(value).find()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Input contains HTML tags which are not allowed"
            ).addConstraintViolation();
            return false;
        }
        
        // Check for JavaScript/event handlers
        if (SCRIPT_PATTERN.matcher(value).find()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Input contains JavaScript or event handlers which are not allowed"
            ).addConstraintViolation();
            return false;
        }
        
        // Check for img onerror XSS
        if (IMG_ONERROR_PATTERN.matcher(value).find()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Input contains potentially malicious image code"
            ).addConstraintViolation();
            return false;
        }
        
        // Check for iframes
        if (IFRAME_PATTERN.matcher(value).find()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Input contains iframe tags which are not allowed"
            ).addConstraintViolation();
            return false;
        }
        
        // Check for object/embed tags
        if (OBJECT_EMBED_PATTERN.matcher(value).find()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Input contains object/embed tags which are not allowed"
            ).addConstraintViolation();
            return false;
        }
        
        return true;
    }
}
