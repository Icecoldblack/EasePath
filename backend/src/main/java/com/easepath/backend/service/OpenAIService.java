package com.easepath.backend.service;

import java.util.List;
import java.util.Map;

import com.easepath.backend.dto.AutofillRequest.FormFieldInfo;
import com.easepath.backend.model.UserProfileDocument;

/**
 * Service interface for OpenAI GPT-3.5-turbo integration.
 * Used for intelligent form field analysis and answer generation.
 */
public interface OpenAIService {

    /**
     * Analyze form fields and intelligently map them to user profile data.
     * Uses GPT-3.5-turbo to understand field context and find best matches.
     */
    Map<String, String> analyzeAndMapFields(
        List<FormFieldInfo> fields, 
        UserProfileDocument profile,
        String platformName
    );

    /**
     * Generate an answer for a complex question (like "Why do you want to work here?")
     * based on user's profile and the job context.
     */
    String generateAnswer(
        String question, 
        UserProfileDocument profile,
        String jobTitle,
        String company
    );

    /**
     * Learn from a user's answer to improve future responses.
     * Stores the pattern for similar questions.
     */
    void learnFromAnswer(
        String question,
        String userAnswer,
        String userEmail
    );

    /**
     * Check if the OpenAI API is configured and available.
     */
    boolean isAvailable();
}
