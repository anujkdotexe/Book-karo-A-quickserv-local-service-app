package com.bookaro.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(name = "email_notifications")
    @Builder.Default
    private Boolean emailNotifications = true;
    
    @Column(name = "sms_notifications")
    @Builder.Default
    private Boolean smsNotifications = true;
    
    @Column(name = "push_notifications")
    @Builder.Default
    private Boolean pushNotifications = true;
    
    @Column(name = "booking_reminders")
    @Builder.Default
    private Boolean bookingReminders = true;
    
    @Column(name = "promotional_emails")
    @Builder.Default
    private Boolean promotionalEmails = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
