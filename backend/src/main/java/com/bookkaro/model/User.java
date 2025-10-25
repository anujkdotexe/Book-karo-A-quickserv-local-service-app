package com.bookkaro.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * User Entity - Represents users in the bookkaro platform
 * Supports three roles: USER (Customer), VENDOR (Service Provider), ADMIN
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_role", columnList = "role"),
    @Index(name = "idx_location", columnList = "latitude, longitude")
})
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 255)
    private String address;
    
    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(name = "postal_code", length = 10)
    private String postalCode;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    // Multi-role support - users can have multiple roles (e.g., USER + VENDOR)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", nullable = false)
    @Enumerated(EnumType.STRING)
    private Set<UserRole> roles = new HashSet<>();

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Password reset fields
    @Column(name = "reset_token", length = 100)
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    // Link to Vendor (for VENDOR role users)
    // Changed from CascadeType.ALL to prevent accidental deletion of vendor data
    @OneToOne(mappedBy = "user", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private Vendor vendor;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * User Role Enum
     */
    public enum UserRole {
        USER,    // Customer
        VENDOR,  // Service Provider
        ADMIN    // Platform Administrator
    }

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    // Backward compatibility - split fullName for firstName
    public String getFirstName() {
        if (fullName == null) return "";
        String[] parts = fullName.split(" ", 2);
        return parts[0];
    }

    public void setFirstName(String firstName) {
        String lastName = getLastName();
        this.fullName = lastName.isEmpty() ? firstName : firstName + " " + lastName;
    }

    // Backward compatibility - split fullName for lastName
    public String getLastName() {
        if (fullName == null) return "";
        String[] parts = fullName.split(" ", 2);
        return parts.length > 1 ? parts[1] : "";
    }

    public void setLastName(String lastName) {
        String firstName = getFirstName();
        this.fullName = firstName + " " + lastName;
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    // Multi-role support methods
    public Set<UserRole> getRoles() { return roles; }
    public void setRoles(Set<UserRole> roles) { this.roles = roles; }
    
    // Backward compatibility - get primary role (first role or USER as default)
    public UserRole getRole() { 
        if (roles == null || roles.isEmpty()) {
            return UserRole.USER;
        }
        // Return ADMIN if present, then VENDOR, then USER
        if (roles.contains(UserRole.ADMIN)) return UserRole.ADMIN;
        if (roles.contains(UserRole.VENDOR)) return UserRole.VENDOR;
        return UserRole.USER;
    }
    
    // Backward compatibility - set role (adds to roles set)
    public void setRole(UserRole role) {
        if (this.roles == null) {
            this.roles = new HashSet<>();
        }
        this.roles.add(role);
    }
    
    // Helper methods for role checking
    public boolean hasRole(UserRole role) {
        return roles != null && roles.contains(role);
    }
    
    public boolean isAdmin() {
        return hasRole(UserRole.ADMIN);
    }
    
    public boolean isVendor() {
        return hasRole(UserRole.VENDOR);
    }
    
    public boolean isUser() {
        return hasRole(UserRole.USER);
    }
    
    public void addRole(UserRole role) {
        if (this.roles == null) {
            this.roles = new HashSet<>();
        }
        this.roles.add(role);
    }
    
    public void removeRole(UserRole role) {
        if (this.roles != null) {
            this.roles.remove(role);
        }
    }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }

    public LocalDateTime getResetTokenExpiry() { return resetTokenExpiry; }
    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) { this.resetTokenExpiry = resetTokenExpiry; }

    public Vendor getVendor() { return vendor; }
    public void setVendor(Vendor vendor) { this.vendor = vendor; }
}
