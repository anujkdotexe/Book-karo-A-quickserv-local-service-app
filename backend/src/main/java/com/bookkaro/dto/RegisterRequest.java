package com.bookkaro.dto;

import com.bookkaro.validation.NoHtml;
import com.bookkaro.validation.NoSqlInjection;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @NoHtml(message = "Email contains invalid characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64, message = "Password must be 8-64 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&*()_+\\-=\\[\\]{}|;:,.<>?]).{8,}$",
        message = "Password must contain uppercase, lowercase, number, and special character"
    )
    private String password;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be 2-50 characters")
    @NoHtml(message = "First name contains invalid characters")
    @NoSqlInjection(message = "First name contains invalid characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be 2-50 characters")
    @NoHtml(message = "Last name contains invalid characters")
    @NoSqlInjection(message = "Last name contains invalid characters")
    private String lastName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+91[6-9]\\d{9}$", message = "Invalid phone number format. Must be +91 followed by 10 digits starting with 6-9")
    private String phone;

    @Size(max = 200, message = "Address cannot exceed 200 characters")
    @NoHtml(message = "Address contains invalid characters")
    @NoSqlInjection(message = "Address contains invalid characters")
    private String address;
    
    @Size(max = 100, message = "City cannot exceed 100 characters")
    @NoHtml(message = "City contains invalid characters")
    @NoSqlInjection(message = "City contains invalid characters")
    private String city;
    
    @Size(max = 100, message = "State cannot exceed 100 characters")
    @NoHtml(message = "State contains invalid characters")
    @NoSqlInjection(message = "State contains invalid characters")
    private String state;
    
    @Pattern(regexp = "^\\d{6}$", message = "PIN code must be exactly 6 digits")
    private String postalCode;

    public RegisterRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
}
