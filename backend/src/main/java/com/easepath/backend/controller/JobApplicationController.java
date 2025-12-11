package com.easepath.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

import com.easepath.backend.dto.JobApplicationRequest;
import com.easepath.backend.dto.JobApplicationResult;
import com.easepath.backend.model.JobApplicationDocument;
import com.easepath.backend.model.User;
import com.easepath.backend.service.JobApplicationService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/apply")
public class JobApplicationController {

    @Autowired
    private JobApplicationService jobApplicationService;

    @PostMapping
    public ResponseEntity<?> startApplicationProcess(
            @Valid @RequestBody JobApplicationRequest request,
            HttpServletRequest httpRequest) {
        
        // Get authenticated user from request attribute (set by AuthenticationInterceptor)
        User currentUser = (User) httpRequest.getAttribute("currentUser");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(java.util.Map.of("error", "Authentication required", "message", "Please log in to apply to jobs"));
        }
        
        // Set the authenticated user's email in the request
        request.setUserEmail(currentUser.getEmail());
        
        JobApplicationResult result = jobApplicationService.applyToJobs(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getApplicationHistory(HttpServletRequest httpRequest) {
        
        // Get authenticated user from request attribute (set by AuthenticationInterceptor)
        User currentUser = (User) httpRequest.getAttribute("currentUser");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(java.util.Map.of("error", "Authentication required", "message", "Please log in to view your application history"));
        }
        
        // Return ONLY the authenticated user's applications
        List<JobApplicationDocument> userApplications = jobApplicationService.getApplicationHistory(currentUser.getEmail());
        return ResponseEntity.ok(userApplications);
    }
}
