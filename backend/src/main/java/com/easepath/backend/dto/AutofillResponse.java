package com.easepath.backend.dto;

import java.util.Map;

/**
 * Response to the extension containing the field mappings to autofill.
 */
public class AutofillResponse {
    
    // Map of field identifier (id or name) to the value to fill
    private Map<String, String> mapping;
    
    // Overall confidence of the mapping (0.0 to 1.0)
    private double confidence;
    
    // Platform detected (e.g., "greenhouse", "workday", "linkedin")
    private String detectedPlatform;
    
    // Message for the user
    private String message;

    public AutofillResponse() {}

    public AutofillResponse(Map<String, String> mapping, double confidence) {
        this.mapping = mapping;
        this.confidence = confidence;
    }

    public Map<String, String> getMapping() { return mapping; }
    public void setMapping(Map<String, String> mapping) { this.mapping = mapping; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }

    public String getDetectedPlatform() { return detectedPlatform; }
    public void setDetectedPlatform(String detectedPlatform) { this.detectedPlatform = detectedPlatform; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
