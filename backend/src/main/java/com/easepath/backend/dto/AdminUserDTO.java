package com.easepath.backend.dto;

import java.time.Instant;

/**
 * DTO for user data in admin panel.
 */
public class AdminUserDTO {

    private String id;
    private String email;
    private String name;
    private String picture;
    private Instant createdAt;
    private int applicationCount;

    public AdminUserDTO() {
    }

    public AdminUserDTO(String id, String email, String name, String picture, Instant createdAt, int applicationCount) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.picture = picture;
        this.createdAt = createdAt;
        this.applicationCount = applicationCount;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public int getApplicationCount() {
        return applicationCount;
    }

    public void setApplicationCount(int applicationCount) {
        this.applicationCount = applicationCount;
    }
}
