package com.easepath.backend.model;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Stores answers to complex application questions that the AI learns from.
 * Examples: "Why do you want to work here?", "Tell us about a challenge you overcame", etc.
 */
@Document(collection = "learned_answers")
public class LearnedAnswerDocument {

    @Id
    private String id;
    
    private String userEmail;
    
    // The question pattern (normalized) - e.g., "why do you want to work"
    private String questionPattern;
    
    // The original question text
    private String originalQuestion;
    
    // The user's answer that was submitted
    private String answer;
    
    // Category of question for better matching
    private QuestionCategory category;
    
    // Keywords extracted from the question
    private List<String> questionKeywords;
    
    // How many times this answer has been reused
    private int useCount;
    
    // Confidence score based on reuse and user acceptance
    private double confidence;
    
    // The URL/platform where this was originally answered
    private String sourcePlatform;
    
    // Job title context (if relevant)
    private String jobTitleContext;
    
    private Instant createdAt;
    private Instant lastUsedAt;

    public enum QuestionCategory {
        MOTIVATION,          // Why do you want this job/company?
        EXPERIENCE,          // Tell us about your experience with X
        CHALLENGE,           // Describe a challenge you overcame
        STRENGTH_WEAKNESS,   // What are your strengths/weaknesses?
        SALARY,              // Salary expectations
        AVAILABILITY,        // When can you start?
        RELOCATION,          // Willing to relocate?
        COVER_LETTER,        // Cover letter / personal statement
        TECHNICAL,           // Technical questions
        BEHAVIORAL,          // Behavioral questions (STAR method)
        OTHER
    }

    public LearnedAnswerDocument() {
        this.createdAt = Instant.now();
        this.lastUsedAt = Instant.now();
        this.confidence = 0.5;
        this.useCount = 0;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getQuestionPattern() { return questionPattern; }
    public void setQuestionPattern(String questionPattern) { this.questionPattern = questionPattern; }

    public String getOriginalQuestion() { return originalQuestion; }
    public void setOriginalQuestion(String originalQuestion) { this.originalQuestion = originalQuestion; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public QuestionCategory getCategory() { return category; }
    public void setCategory(QuestionCategory category) { this.category = category; }

    public List<String> getQuestionKeywords() { return questionKeywords; }
    public void setQuestionKeywords(List<String> questionKeywords) { this.questionKeywords = questionKeywords; }

    public int getUseCount() { return useCount; }
    public void setUseCount(int useCount) { this.useCount = useCount; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }

    public String getSourcePlatform() { return sourcePlatform; }
    public void setSourcePlatform(String sourcePlatform) { this.sourcePlatform = sourcePlatform; }

    public String getJobTitleContext() { return jobTitleContext; }
    public void setJobTitleContext(String jobTitleContext) { this.jobTitleContext = jobTitleContext; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getLastUsedAt() { return lastUsedAt; }
    public void setLastUsedAt(Instant lastUsedAt) { this.lastUsedAt = lastUsedAt; }
}
