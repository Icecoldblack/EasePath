package com.easepath.backend.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.easepath.backend.model.UserProfileDocument;

@Repository
public interface UserProfileRepository extends MongoRepository<UserProfileDocument, String> {

    Optional<UserProfileDocument> findByGoogleId(String googleId);

    Optional<UserProfileDocument> findByEmail(String email);

    void deleteByEmail(String email);
}
