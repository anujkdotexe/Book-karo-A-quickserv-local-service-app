package com.bookaro.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServiceUpdateRequest {
    
    private String serviceName;
    private String description;
    private String category;
    private BigDecimal price;
    private Integer duration;
    private String imageUrl;
    private Boolean isAvailable;
}
