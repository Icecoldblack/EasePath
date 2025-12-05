package com.easepath.backend.service;

import java.util.List;
import java.util.Map;

import com.easepath.backend.dto.AutofillRequest.FormFieldInfo;
import com.easepath.backend.model.FormMappingDocument;
import com.easepath.backend.model.UserProfileDocument;

/**
 * Service for AI-powered form field mapping.
 * Learns which form fields correspond to which user profile fields.
 */
public interface FormMappingService {
    
    /**
     * Analyze form fields and return the best mapping to user profile data.
     */
    Map<String, String> analyzeAndMap(String url, List<FormFieldInfo> fields, UserProfileDocument profile);
    
    /**
     * Record a successful autofill (increases confidence).
     */
    void recordSuccess(String url);
    
    /**
     * Record a user correction (decreases confidence, updates mapping).
     */
    void recordCorrection(String url, String fieldId, String correctProfileField);
    
    /**
     * Get existing mapping for a URL pattern.
     */
    FormMappingDocument getMappingForUrl(String url);
}
