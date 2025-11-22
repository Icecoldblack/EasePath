package com.easepath.backend.service;

import org.springframework.stereotype.Service;

import com.easepath.backend.dto.JobApplicationRequest;

@Service
public interface JobApplicationService {
    void applyToJobs(JobApplicationRequest request);
}
