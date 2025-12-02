package com.bookkaro.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Validation annotation to prevent SQL injection
 * Rejects strings containing SQL keywords and suspicious patterns
 */
@Documented
@Constraint(validatedBy = NoSqlInjectionValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface NoSqlInjection {
    
    String message() default "Input contains potentially dangerous SQL keywords";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}
