package com.bookkaro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettingsDTO {
    private Long id;
    private String settingKey;
    private String settingValue;
    private String settingType;
    private String description;
    private String category;
    private Boolean isPublic;
}
