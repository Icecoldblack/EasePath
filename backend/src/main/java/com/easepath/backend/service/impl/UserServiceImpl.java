package com.easepath.backend.service.impl;

import org.springframework.stereotype.Service;

import com.easepath.backend.dto.UserDto;
import com.easepath.backend.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final com.easepath.backend.repository.UserProfileRepository userProfileRepository;
    private final com.easepath.backend.repository.JobApplicationRepository jobApplicationRepository;
    private final com.easepath.backend.repository.ResumeRepository resumeRepository;
    private final com.easepath.backend.repository.LearnedAnswerRepository learnedAnswerRepository;

    public UserServiceImpl(com.easepath.backend.repository.UserProfileRepository userProfileRepository,
            com.easepath.backend.repository.JobApplicationRepository jobApplicationRepository,
            com.easepath.backend.repository.ResumeRepository resumeRepository,
            com.easepath.backend.repository.LearnedAnswerRepository learnedAnswerRepository) {
        this.userProfileRepository = userProfileRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.resumeRepository = resumeRepository;
        this.learnedAnswerRepository = learnedAnswerRepository;
    }

    @Override
    public UserDto createUser(UserDto user) {
        user.setId(1L);
        return user;
    }

    @Override
    public UserDto getSampleUser() {
        return new UserDto(1L, "Sample User", "sample@easepath.app");
    }

    @Override
    public void deleteUser(String email) {
        userProfileRepository.deleteByEmail(email);
        jobApplicationRepository.deleteByUserEmail(email);
        resumeRepository.deleteAllByUserEmail(email);
        learnedAnswerRepository.deleteByUserEmail(email);
    }
}
