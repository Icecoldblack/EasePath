package com.easepath.backend.config;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Admin Panel access control.
 * Admin emails are read from the ADMIN_EMAILS environment variable.
 */
@Configuration
public class AdminConfig {

    private final Set<String> adminEmails;

    public AdminConfig(@Value("${easepath.admin.emails:}") String adminEmailsProperty) {
        if (adminEmailsProperty == null || adminEmailsProperty.isBlank()) {
            this.adminEmails = Collections.emptySet();
        } else {
            this.adminEmails = Arrays.stream(adminEmailsProperty.split(","))
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .filter(email -> !email.isEmpty())
                    .collect(Collectors.toSet());
        }
    }

    /**
     * Check if the given email has admin privileges.
     * 
     * @param email User's email address
     * @return true if the user is an admin
     */
    public boolean isAdmin(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        return adminEmails.contains(email.toLowerCase().trim());
    }

    /**
     * Get the count of configured admin emails (for logging/debugging).
     */
    public int getAdminCount() {
        return adminEmails.size();
    }
}
