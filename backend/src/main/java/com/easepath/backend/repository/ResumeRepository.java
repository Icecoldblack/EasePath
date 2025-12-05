package com.easepath.backend.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.easepath.backend.model.ResumeDocument;

public interface ResumeRepository extends MongoRepository<ResumeDocument, String> {

    Optional<ResumeDocument> findTopByOrderByCreatedAtDesc();
    
    Optional<ResumeDocument> findByUserEmail(String userEmail);
    
    Optional<ResumeDocument> findTopByUserEmailOrderByCreatedAtDesc(String userEmail);
}
