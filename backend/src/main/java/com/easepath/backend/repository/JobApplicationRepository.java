package com.easepath.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.easepath.backend.model.JobApplicationDocument;

@Repository
public interface JobApplicationRepository extends MongoRepository<JobApplicationDocument, String> {
    // Find all job applications for a specific user
    List<JobApplicationDocument> findByUserEmail(String userEmail);
}
