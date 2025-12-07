package com.easepath.backend.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.easepath.backend.model.JobSearchCache;

public interface JobSearchRepository extends MongoRepository<JobSearchCache, String> {
    Optional<JobSearchCache> findByQuery(String query);
}
