package com.easepath.backend.model;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Stores learned mappings between form fields and user profile fields.
 * The AI learns which form fields correspond to which profile data based on
 * the URL pattern, field labels, and user corrections.
 */
@Document(collection = "form_mappings")
public class FormMappingDocument {

    @Id
    private String id;
    
    // URL pattern (e.g., "greenhouse.io", "workday.com", "linkedin.com/jobs")
    private String urlPattern;
    
    // Domain-specific identifier (e.g., "greenhouse", "workday", "lever")
    private String platform;
    
    // List of field mappings learned for this platform
    private List<FieldMapping> fieldMappings;
    
    // How many times this mapping has been used successfully
    private int successCount;
    
    // How many times users corrected this mapping
    private int correctionCount;
    
    // Confidence score (0.0 to 1.0) based on success/correction ratio
    private double confidenceScore;
    
    private Instant createdAt;
    private Instant updatedAt;

    public FormMappingDocument() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.confidenceScore = 0.5; // Start with neutral confidence
    }

    // Nested class for individual field mappings
    public static class FieldMapping {
        // Identifiers from the form
        private String fieldId;
        private String fieldName;
        private String fieldLabel;
        private String fieldType; // text, email, tel, select, textarea, etc.
        private String placeholder;
        
        // Which user profile field this maps to
        private String profileField; // e.g., "firstName", "email", "linkedInUrl"
        
        // AI confidence for this specific mapping
        private double confidence;

        public FieldMapping() {}

        public String getFieldId() { return fieldId; }
        public void setFieldId(String fieldId) { this.fieldId = fieldId; }

        public String getFieldName() { return fieldName; }
        public void setFieldName(String fieldName) { this.fieldName = fieldName; }

        public String getFieldLabel() { return fieldLabel; }
        public void setFieldLabel(String fieldLabel) { this.fieldLabel = fieldLabel; }

        public String getFieldType() { return fieldType; }
        public void setFieldType(String fieldType) { this.fieldType = fieldType; }

        public String getPlaceholder() { return placeholder; }
        public void setPlaceholder(String placeholder) { this.placeholder = placeholder; }

        public String getProfileField() { return profileField; }
        public void setProfileField(String profileField) { this.profileField = profileField; }

        public double getConfidence() { return confidence; }
        public void setConfidence(double confidence) { this.confidence = confidence; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUrlPattern() { return urlPattern; }
    public void setUrlPattern(String urlPattern) { this.urlPattern = urlPattern; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public List<FieldMapping> getFieldMappings() { return fieldMappings; }
    public void setFieldMappings(List<FieldMapping> fieldMappings) { this.fieldMappings = fieldMappings; }

    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }

    public int getCorrectionCount() { return correctionCount; }
    public void setCorrectionCount(int correctionCount) { this.correctionCount = correctionCount; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
