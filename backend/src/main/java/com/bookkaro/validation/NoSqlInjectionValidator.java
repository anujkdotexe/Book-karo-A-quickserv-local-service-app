package com.bookkaro.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

/**
 * Validator implementation for @NoSqlInjection annotation
 * Prevents SQL injection attacks by detecting suspicious SQL patterns
 */
public class NoSqlInjectionValidator implements ConstraintValidator<NoSqlInjection, String> {
    
    // Pattern to detect SQL injection attempts
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
        "('(''|[^'])*')|" +                      // SQL string literals
        "(;\\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|EXEC|EXECUTE)\\s)|" + // Dangerous SQL commands
        "(--)|" +                                 // SQL comments
        "(/\\*.*?\\*/)|" +                       // Multi-line SQL comments
        "(\\bUNION\\b.*?\\bSELECT\\b)|" +        // UNION-based injection
        "(\\bOR\\b.*?=.*?)|" +                   // OR-based injection (e.g., OR 1=1)
        "(\\bAND\\b.*?=.*?)|" +                  // AND-based injection
        "(\\bEXEC(UTE)?\\s+)|" +                 // EXEC/EXECUTE commands
        "(\\bDROP\\s+TABLE\\b)|" +               // DROP TABLE
        "(\\bDELETE\\s+FROM\\b)|" +              // DELETE FROM
        "(xp_cmdshell)|" +                       // SQL Server specific
        "(\\bSLEEP\\s*\\()|" +                   // Time-based blind injection
        "(\\bBENCHMARK\\s*\\()",                 // MySQL benchmark
        Pattern.CASE_INSENSITIVE
    );
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // Null values are valid (use @NotNull/@NotBlank for null checks)
        if (value == null || value.isEmpty()) {
            return true;
        }
        
        // Check for SQL injection patterns
        if (SQL_INJECTION_PATTERN.matcher(value).find()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Input contains potentially dangerous SQL patterns. Please use only letters, numbers, and basic punctuation."
            ).addConstraintViolation();
            return false;
        }
        
        return true;
    }
}
