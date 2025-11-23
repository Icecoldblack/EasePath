package com.easepath.backend.service;

import com.easepath.backend.dto.AiScoreResult;
import com.easepath.backend.dto.JobApplicationRequest;

public interface AiScoringService {

    /**
     * Scores how well a job opportunity matches the applicant profile.
     *
     * @param request     payload provided by the user (resume summary, preferences, etc.)
     * @param jobSnippet  short description or link text for the job listing.
     * @return score result from 0.0 to 1.0 along with reasoning text.
     */
    AiScoreResult scoreJobFit(JobApplicationRequest request, String jobSnippet);
}
