package com.bookkaro.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class UserDtoTest {

    @Test
    @DisplayName("UserDto correctly stores and retrieves fields")
    void testUserDtoFields() {
        UserDto dto = new UserDto();
        dto.setId(1L);
        dto.setEmail("test@bookkaro.com");
        dto.setFullName("John Doe");
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setPhone("+919876543210");
        dto.setRole("USER");
        dto.setIsActive(true);
        dto.setCreatedAt(LocalDateTime.now());

        assertEquals(1L, dto.getId());
        assertEquals("test@bookkaro.com", dto.getEmail());
        assertEquals("John Doe", dto.getFullName());
        assertEquals("John", dto.getFirstName());
        assertEquals("Doe", dto.getLastName());
        assertEquals("+919876543210", dto.getPhone());
        assertEquals("USER", dto.getRole());
        assertTrue(dto.getIsActive());
        assertNotNull(dto.getCreatedAt());
    }
}
