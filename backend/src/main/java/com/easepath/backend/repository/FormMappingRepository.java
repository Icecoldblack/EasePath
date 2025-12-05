package com.easepath.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.easepath.backend.model.FormMappingDocument;

@Repository
public interface FormMappingRepository extends MongoRepository<FormMappingDocument, String> {
    
    Optional<FormMappingDocument> findByUrlPattern(String urlPattern);
    
    Optional<FormMappingDocument> findByPlatform(String platform);
    
    List<FormMappingDocument> findByConfidenceScoreGreaterThan(double minConfidence);
}
