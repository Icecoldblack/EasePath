package com.easepath.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.easepath.backend.model.LearnedAnswerDocument;
import com.easepath.backend.model.LearnedAnswerDocument.QuestionCategory;

@Repository
public interface LearnedAnswerRepository extends MongoRepository<LearnedAnswerDocument, String> {

    List<LearnedAnswerDocument> findByUserEmail(String userEmail);

    List<LearnedAnswerDocument> findByUserEmailAndCategory(String userEmail, QuestionCategory category);

    Optional<LearnedAnswerDocument> findByUserEmailAndQuestionPattern(String userEmail, String questionPattern);

    List<LearnedAnswerDocument> findByUserEmailAndConfidenceGreaterThan(String userEmail, double minConfidence);

    List<LearnedAnswerDocument> findByUserEmailOrderByUseCountDesc(String userEmail);

    void deleteByUserEmail(String userEmail);
}
