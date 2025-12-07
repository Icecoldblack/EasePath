package com.easepath.backend.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.easepath.backend.model.JobSearchCache;
import com.easepath.backend.repository.JobSearchRepository;

@Service
public class JobSearchService {

    private static final Logger log = LoggerFactory.getLogger(JobSearchService.class);

    private final JobSearchRepository jobSearchRepository;
    private final WebClient webClient;

    @Value("${rapidapi.key}")
    private String rapidApiKey;

    @Value("${rapidapi.host}")
    private String rapidApiHost;

    public JobSearchService(JobSearchRepository jobSearchRepository, WebClient.Builder webClientBuilder) {
        this.jobSearchRepository = jobSearchRepository;
        this.webClient = webClientBuilder.baseUrl("https://jsearch.p.rapidapi.com").build();
    }

    public String searchJobs(String query, String numPages, String datePosted, String remoteJobsOnly, String employmentTypes, String jobRequirements) {
        // Create a unique cache key based on parameters
        String cacheKey = query + "|" + numPages + "|" + datePosted + "|" + remoteJobsOnly + "|" + employmentTypes + "|" + jobRequirements;
        
        // 1. Check cache
        Optional<JobSearchCache> cached = jobSearchRepository.findByQuery(cacheKey);
        if (cached.isPresent()) {
            log.info("Returning cached job search results for: {}", cacheKey);
            return cached.get().getResultJson();
        }

        // 2. Call API if not cached
        log.info("Fetching fresh job search results for: {}", cacheKey);
        
        try {
            String response = webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder
                        .path("/search")
                        .queryParam("query", query)
                        .queryParam("page", "1")
                        .queryParam("num_pages", numPages != null ? numPages : "1")
                        .queryParam("date_posted", datePosted != null ? datePosted : "all");
                    
                    if (remoteJobsOnly != null) {
                        uriBuilder.queryParam("remote_jobs_only", remoteJobsOnly);
                    }
                    if (employmentTypes != null) {
                        uriBuilder.queryParam("employment_types", employmentTypes);
                    }
                    if (jobRequirements != null) {
                        uriBuilder.queryParam("job_requirements", jobRequirements);
                    }
                    
                    return uriBuilder.build();
                })
                .header("X-RapidAPI-Key", rapidApiKey)
                .header("X-RapidAPI-Host", rapidApiHost)
                .retrieve()
                .bodyToMono(String.class)
                .block(); // Blocking is okay here as we are in a servlet container

            // 3. Save to cache
            if (response != null && !response.isEmpty()) {
                JobSearchCache cache = new JobSearchCache(cacheKey, response);
                jobSearchRepository.save(cache);
            }
            
            return response;
        } catch (Exception e) {
            log.error("Error fetching jobs from RapidAPI", e);
            throw new RuntimeException("Failed to fetch jobs", e);
        }
    }
}
