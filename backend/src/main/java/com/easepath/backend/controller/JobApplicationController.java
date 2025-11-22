package com.easepath.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easepath.backend.dto.JobApplicationRequest;
import com.easepath.backend.service.JobApplicationService;

@RestController
@RequestMapping("/api/apply")
public class JobApplicationController {

    @Autowired
    private JobApplicationService jobApplicationService;

    @PostMapping
    public void startApplicationProcess(@RequestBody JobApplicationRequest request) {
        jobApplicationService.applyToJobs(request);
    }
}
