package com.bookkaro.dto;

import lombok.Data;

@Data
public class CartItemDto {
    private Long id;
    private Long serviceId;
    private String serviceName;
    private String name; // Alias for serviceName to support frontend
    private String description;
    private String category;
    private String city;
    private String state;
    private Double price;
    private Integer quantity;
    private Double subtotal;
    private VendorInfoDto vendor;
}
