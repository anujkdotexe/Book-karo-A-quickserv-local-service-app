package com.bookkaro.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Validation annotation to prevent HTML/XSS injection
 * Rejects strings containing HTML tags or JavaScript
 */
@Documented
@Constraint(validatedBy = NoHtmlValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface NoHtml {
    
    String message() default "Input contains invalid characters (HTML/Script tags not allowed)";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Whether to allow basic formatting characters like line breaks
     */
    boolean allowLineBreaks() default false;
}
