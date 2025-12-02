package com.bookkaro.dto;

import com.bookkaro.validation.NoHtml;
import com.bookkaro.validation.NoSqlInjection;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServiceCreateRequest {
    
    @NotBlank(message = "Service name is required")
    @NoHtml(message = "Service name contains invalid HTML/script tags")
    @NoSqlInjection(message = "Service name contains invalid characters")
    private String serviceName;
    
    @NotBlank(message = "Description is required")
    @NoHtml(allowLineBreaks = true, message = "Description contains invalid HTML/script tags")
    @NoSqlInjection(message = "Description contains invalid characters")
    private String description;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "1000000.00", message = "Price cannot exceed ₹10,00,000")
    private BigDecimal price;
    
    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer duration; // in minutes
    
    @NoHtml(message = "Image URL contains invalid characters")
    private String imageUrl;
    
    private Boolean isAvailable = true;
}
