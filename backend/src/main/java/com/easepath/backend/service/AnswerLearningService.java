package com.easepath.backend.service;

import java.util.List;
import java.util.Optional;

import com.easepath.backend.model.LearnedAnswerDocument;
import com.easepath.backend.model.LearnedAnswerDocument.QuestionCategory;

/**
 * Service for learning and retrieving answers to complex application questions.
 */
public interface AnswerLearningService {
    
    /**
     * Find the best matching answer for a given question.
     */
    Optional<LearnedAnswerDocument> findBestAnswer(String userEmail, String question);
    
    /**
     * Learn a new answer from user input.
     */
    LearnedAnswerDocument learnAnswer(String userEmail, String question, String answer, 
                                       String platform, String jobTitle);
    
    /**
     * Record that a learned answer was used (increases confidence).
     */
    void recordAnswerUsed(String answerId);
    
    /**
     * Record that a user edited a suggested answer (updates the answer).
     */
    void recordAnswerEdited(String answerId, String newAnswer);
    
    /**
     * Get all learned answers for a user.
     */
    List<LearnedAnswerDocument> getUserAnswers(String userEmail);
    
    /**
     * Get answers by category.
     */
    List<LearnedAnswerDocument> getAnswersByCategory(String userEmail, QuestionCategory category);
    
    /**
     * Categorize a question based on its content.
     */
    QuestionCategory categorizeQuestion(String question);
}
