package com.easepath.backend.service.impl;

import java.io.IOException;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.easepath.backend.dto.JobApplicationRequest;
import com.easepath.backend.service.JobApplicationService;

@Service
public class JobApplicationServiceImpl implements JobApplicationService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${easepath.ai.api-key:PLACEHOLDER_AI_KEY}")
    private String aiApiKey;

    @Override
    public void applyToJobs(JobApplicationRequest request) {
        final String jobTitle = request.getJobTitle();
        final String jobBoardUrl = request.getJobBoardUrl();
        final int applicationCount = request.getApplicationCount();

        // Placeholder for using the internally managed AI key.
        System.out.println("Using AI key (placeholder): " + aiApiKey);
        System.out.println("Starting job application process...");
        System.out.println("Job Title: " + jobTitle);
        System.out.println("Job Board URL: " + jobBoardUrl);
        System.out.println("Application Count: " + applicationCount);
        System.out.println("Resume summary length: " +
                (request.getResumeSummary() != null ? request.getResumeSummary().length() : 0));
        System.out.println("Resume file provided: " + (request.getResumeFileName() != null));
        if (request.getResumeFileName() != null) {
            int dataLength = request.getResumeFileData() != null ? request.getResumeFileData().length() : 0;
            System.out.println("Resume file name: " + request.getResumeFileName() + " (encoded length: " + dataLength + ")");
        }
        System.out.println("Preferred companies: " + request.getPreferredCompanies());
        System.out.println("Job preference: " + request.getJobPreference());
        System.out.println("Salary range: " + request.getSalaryRange());
        System.out.println("Looking for internships: " + request.isLookingForInternships());
        System.out.println("Mail sender configured: " + (mailSender != null));

        try {
            Document doc = Jsoup.connect(jobBoardUrl).get();
            Elements jobLinks = doc.select("a[href*=/jobs/view/]"); // Example selector for LinkedIn

            int appliedCount = 0;
            for (Element link : jobLinks) {
                if (appliedCount >= applicationCount) {
                    break;
                }

                String jobUrl = link.absUrl("href");
                if (isPromisingJob(jobUrl, jobTitle)) {
                    // Placeholder for checking for writing prompts
                    if (hasWritingPrompt(jobUrl)) {
                        sendEmailToUser(jobUrl, jobTitle);
                    } else {
                        // Placeholder for submitting the application
                        System.out.println("Applying to: " + jobUrl);
                        appliedCount++;
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("Failed to scrape job board: " + e.getMessage());
        }
    }

    private boolean isPromisingJob(String jobUrl, String jobTitle) {
        // Placeholder for AI logic to determine if the job is a good fit.
        // For now, we'll just check if the URL contains the job title keywords.
        String[] keywords = jobTitle.toLowerCase().split(" ");
        String urlLower = jobUrl.toLowerCase();
        for (String keyword : keywords) {
            if (urlLower.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private boolean hasWritingPrompt(String jobUrl) {
        // Placeholder for AI logic to detect writing prompts.
        // This would be a complex task. For now, we'll simulate it.
        return jobUrl.contains("assessment"); // Simple simulation
    }

    private void sendEmailToUser(String jobUrl, String jobTitle) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("user@example.com"); // This should be the user's actual email
        message.setSubject("Action Required for Job Application: " + jobTitle);
        message.setText("Please complete the writing prompt for the following job application:\n\n" + jobUrl);
        // mailSender.send(message); // Uncomment when email is configured
        System.out.println("Sending email for job with writing prompt: " + jobUrl);
    }
}
