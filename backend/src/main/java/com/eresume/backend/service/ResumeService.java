package com.eresume.backend.service;

import com.eresume.backend.dto.ResumeDto;

public interface ResumeService {

    ResumeDto createResume(ResumeDto resume);

    ResumeDto getSampleResume();
}
