package com.bookkaro.dto;

import lombok.Data;

@Data
public class CartItemDto {
    private Long id;
    private Long serviceId;
    private String serviceName;
    private String category;
    private Double price;
    private Integer quantity;
    private Double subtotal;
}
