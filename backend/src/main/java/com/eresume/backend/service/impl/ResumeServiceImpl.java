package com.eresume.backend.service.impl;

import com.eresume.backend.dto.ResumeDto;
import com.eresume.backend.service.ResumeService;
import org.springframework.stereotype.Service;

@Service
public class ResumeServiceImpl implements ResumeService {

    @Override
    public ResumeDto createResume(ResumeDto resume) {
        // TODO: replace with real persistence later
        resume.setId(1L);
        return resume;
    }

    @Override
    public ResumeDto getSampleResume() {
        return new ResumeDto(
                1L,
                "Software Engineer Resume",
                "This is a sample resume summary for the E-Resume project."
        );
    }
}
