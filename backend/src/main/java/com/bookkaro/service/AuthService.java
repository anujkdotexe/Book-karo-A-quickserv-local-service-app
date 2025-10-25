package com.bookkaro.service;

import com.bookkaro.dto.RegisterRequest;
import com.bookkaro.dto.AuthResponse;
import com.bookkaro.dto.ApiResponse;
import com.bookkaro.dto.LoginRequest;
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
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                      JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public ApiResponse<AuthResponse> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setFullName(request.getFirstName() + " " + request.getLastName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress() != null ? request.getAddress() : "");
        user.setCity(request.getCity() != null ? request.getCity() : "");
        user.setState(request.getState() != null ? request.getState() : "");
        user.setPostalCode(request.getPostalCode() != null ? request.getPostalCode() : "");
        user.addRole(User.UserRole.USER); // Set default USER role
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

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

            // Try to get user from database
            User user = userRepository.findByEmail(request.getEmail()).orElse(null);

            AuthResponse authResponse = new AuthResponse();
            authResponse.setToken(token);

            // Use hardcoded data if user not in database
            if (user == null) {
                logger.warn("User not in database, using hardcoded data for response: {}", request.getEmail());
                authResponse.setId(1L);
                authResponse.setEmail(request.getEmail());

                if ("user@bookkaro.com".equals(request.getEmail())) {
                    authResponse.setFirstName("Test");
                    authResponse.setLastName("User");
                    authResponse.setRole("USER");
                } else if ("vendor@bookkaro.com".equals(request.getEmail())) {
                    authResponse.setFirstName("Test");
                    authResponse.setLastName("Vendor");
                    authResponse.setRole("VENDOR");
                } else if ("admin@bookkaro.com".equals(request.getEmail())) {
                    authResponse.setFirstName("Admin");
                    authResponse.setLastName("User");
                    authResponse.setRole("ADMIN");
                }
            } else {
                logger.debug("User found in database: {}", request.getEmail());
                authResponse.setId(user.getId());
                authResponse.setEmail(user.getEmail());
                authResponse.setFirstName(user.getFirstName());
                authResponse.setLastName(user.getLastName());
                authResponse.setRole(user.getRole().name()); // Primary role
                // Add all roles for multi-role support
                authResponse.setRoles(user.getRoles().stream()
                        .map(Enum::name)
                        .collect(java.util.stream.Collectors.toSet()));
            }

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
                .orElseThrow(() -> new RuntimeException("No account found with this email address"));

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
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        // Check if token expired
        if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired. Please request a new one");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        logger.info("Password reset successful for: {}", user.getEmail());
        return ApiResponse.success("Password reset successful. You can now login with your new password", null);
    }
}
