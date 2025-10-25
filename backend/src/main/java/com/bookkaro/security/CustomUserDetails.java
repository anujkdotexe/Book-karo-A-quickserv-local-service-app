package com.bookkaro.security;

import com.bookkaro.model.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Custom UserDetails implementation for Spring Security
 * Supports multi-role authentication
 */
@Getter
public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final Set<User.UserRole> roles;
    private final boolean isActive;

    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.roles = user.getRoles();
        this.isActive = user.getIsActive();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convert all user roles to GrantedAuthority objects
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());
    }
    
    // Backward compatibility - get primary role
    public User.UserRole getRole() {
        if (roles == null || roles.isEmpty()) {
            return User.UserRole.USER;
        }
        // Return ADMIN if present, then VENDOR, then USER
        if (roles.contains(User.UserRole.ADMIN)) return User.UserRole.ADMIN;
        if (roles.contains(User.UserRole.VENDOR)) return User.UserRole.VENDOR;
        return User.UserRole.USER;
    }
    
    public boolean hasRole(User.UserRole role) {
        return roles != null && roles.contains(role);
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }
}
