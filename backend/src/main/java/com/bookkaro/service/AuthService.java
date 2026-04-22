package com.bookkaro.service;

import com.bookkaro.dto.RegisterRequest;
import com.bookkaro.dto.AuthResponse;
import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.LoginRequest;
import com.bookkaro.exception.BadRequestException;
import com.bookkaro.model.User;
import com.bookkaro.repository.UserRepository;
import com.bookkaro.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                      JwtUtil jwtUtil, AuthenticationManager authenticationManager,
                      AuditLogService auditLogService,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.auditLogService = auditLogService;
        this.passwordEncoder = passwordEncoder;
    }

    public ApiResponse<AuthResponse> register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error("This email is already registered. Please login or use a different email.");
        }
        
        // Check if phone number already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            return ApiResponse.error("This phone number is already registered. Please use a different number.");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Handle names properly
        String firstName = request.getFirstName() != null ? request.getFirstName().trim() : "";
        String lastName = request.getLastName() != null ? request.getLastName().trim() : "";
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setFullName((firstName + " " + lastName).trim());
        user.setPhone(request.getPhone());
        
        // Handle optional address fields with null-safe trimming
        user.setAddress(request.getAddress() != null ? request.getAddress().trim() : "");
        user.setCity(request.getCity() != null ? request.getCity().trim() : "");
        user.setState(request.getState() != null ? request.getState().trim() : "");
        user.setPostalCode(request.getPostalCode() != null ? request.getPostalCode().trim() : "");
        user.addRole(User.UserRole.USER); // Set default USER role
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        
        // Audit log for registration
        java.util.Map<String, Object> auditData = new java.util.HashMap<>();
        auditData.put("email", savedUser.getEmail());
        auditData.put("fullName", savedUser.getFullName());
        auditData.put("role", savedUser.getRole().name());
        auditData.put("city", savedUser.getCity());
        auditLogService.log("USER", savedUser.getId(), "CREATE", savedUser.getId(), auditData);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(jwtUtil.generateToken(org.springframework.security.core.userdetails.User
                .withUsername(savedUser.getEmail())
                .password(savedUser.getPassword())
                .authorities("ROLE_" + savedUser.getRole().name())
                .build()));
        authResponse.setId(savedUser.getId());
        authResponse.setEmail(savedUser.getEmail());
        authResponse.setFirstName(savedUser.getFirstName());
        authResponse.setLastName(savedUser.getLastName());
        authResponse.setRole(savedUser.getRole().name());
        authResponse.setRoles(savedUser.getRoles().stream()
                .map(Enum::name)
                .collect(java.util.stream.Collectors.toSet()));

        return ApiResponse.success("Registration successful", authResponse);
    }

    public ApiResponse<AuthResponse> login(LoginRequest request) {
        try {
            logger.info("Login attempt for email: {}", request.getEmail());

            // Try to authenticate
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);

            // User MUST exist in database - no hardcoded fallback
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User authenticated but not found in database. Please contact support."));

            AuthResponse authResponse = new AuthResponse();
            authResponse.setToken(token);
            authResponse.setId(user.getId());
            authResponse.setEmail(user.getEmail());
            authResponse.setFirstName(user.getFirstName());
            authResponse.setLastName(user.getLastName());
            authResponse.setRole(user.getRole().name()); // Primary role
            // Add all roles for multi-role support
            authResponse.setRoles(user.getRoles().stream()
                    .map(Enum::name)
                    .collect(java.util.stream.Collectors.toSet()));
            
            // Audit log for successful login
            java.util.Map<String, Object> auditData = new java.util.HashMap<>();
            auditData.put("email", user.getEmail());
            auditData.put("role", user.getRole().name());
            auditLogService.log("USER", user.getId(), "LOGIN", user.getId(), auditData);

            logger.info("Login successful for: {}", request.getEmail());
            return ApiResponse.success("Login successful", authResponse);
        } catch (BadCredentialsException e) {
            logger.warn("Bad credentials for: {}", request.getEmail());
            return ApiResponse.error("Incorrect password. Please try again");
        } catch (UsernameNotFoundException e) {
            logger.warn("User not found: {}", request.getEmail());
            return ApiResponse.error("No account found with this email address");
        } catch (AuthenticationException e) {
            logger.error("Authentication failed for {}: {}", request.getEmail(), e.getMessage());
            return ApiResponse.error("Authentication failed: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Login error for {}", request.getEmail(), e);
            return ApiResponse.error("Login failed: " + e.getMessage());
        }
    }

    /**
     * Generate password reset token
     */
    public ApiResponse<String> forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("If an account exists with this email, you will receive password reset instructions."));

        // Generate reset token (UUID-based)
        String resetToken = java.util.UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusHours(24)); // 24 hour expiry
        userRepository.save(user);

        // In production, send email with reset link:
        // String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
        // emailService.sendPasswordResetEmail(user.getEmail(), resetLink);

        logger.info("Password reset token generated for: {}", email);
        return ApiResponse.success("Password reset instructions sent to your email", resetToken);
    }

    /**
     * Reset password using token
     */
    public ApiResponse<String> resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token. Please request a new password reset."));

        // Check if token expired
        if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired. Please request a new one");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        logger.info("Password reset successful for: {}", user.getEmail());
        return ApiResponse.success("Password reset successful. You can now login with your new password", null);
    }
}
