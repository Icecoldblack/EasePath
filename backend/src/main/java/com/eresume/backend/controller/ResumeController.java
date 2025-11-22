package com.eresume.backend.controller;

import com.eresume.backend.dto.ResumeDto;
import com.eresume.backend.service.ResumeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping
    public ResponseEntity<ResumeDto> createResume(@Valid @RequestBody ResumeDto resumeDto) {
        return ResponseEntity.ok(resumeService.createResume(resumeDto));
    }

    @GetMapping("/sample")
    public ResponseEntity<ResumeDto> getSampleResume() {
        return ResponseEntity.ok(resumeService.getSampleResume());
    }
}
