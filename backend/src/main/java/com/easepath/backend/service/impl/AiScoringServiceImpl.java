package com.easepath.backend.service.impl;

import java.time.Duration;
import java.util.List;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.easepath.backend.dto.AiScoreResult;
import com.easepath.backend.dto.JobApplicationRequest;
import com.easepath.backend.service.AiScoringService;

@Service
public class AiScoringServiceImpl implements AiScoringService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AiScoringServiceImpl.class);

    private final WebClient webClient;
    private final String apiKey;
    private final String scoreEndpoint;

    public AiScoringServiceImpl(WebClient.Builder webClientBuilder,
            @Value("${easepath.ai.api-key:}") String apiKey,
            @Value("${easepath.ai.score-endpoint:https://api.easepath.ai/v1/score}") String scoreEndpoint) {
        this.webClient = webClientBuilder.build();
        this.apiKey = apiKey;
        this.scoreEndpoint = scoreEndpoint;
    }

    @Override
    public AiScoreResult scoreJobFit(JobApplicationRequest request, String jobSnippet) {
        if (apiKey == null || apiKey.isBlank() || scoreEndpoint == null || scoreEndpoint.isBlank()) {
            return heuristicScore(request, jobSnippet, "AI key not configured; heuristic score applied.");
        }

        try {
            AiScoreResponse response = webClient.post()
                    .uri(scoreEndpoint)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .bodyValue(new AiScoreRequest(request.getJobTitle(), jobSnippet,
                            request.getResumeSummary(), request.getPreferredCompanies(),
                            request.getJobPreference(), request.isLookingForInternships()))
                    .retrieve()
                    .bodyToMono(AiScoreResponse.class)
                    .block(Duration.ofSeconds(6));

            if (response != null && response.score() != null) {
                return new AiScoreResult(response.score(),
                        response.reasoning() != null ? response.reasoning() : "AI service responded successfully.");
            }
        } catch (Exception ex) {
            LOGGER.warn("AI scoring service call failed: {}", ex.getMessage());
        }

        return heuristicScore(request, jobSnippet, "AI service unavailable; heuristic score applied.");
    }

    private AiScoreResult heuristicScore(JobApplicationRequest request, String jobSnippet, String baseReason) {
        String snippet = jobSnippet != null ? jobSnippet : "";
        double score = 0.35; // base fit

        score += keywordOverlap(request.getJobTitle(), snippet) * 0.35;
        score += keywordOverlap(request.getResumeSummary(), snippet) * 0.15;

        List<String> preferredCompanies = request.getPreferredCompanies();
        if (preferredCompanies != null && !preferredCompanies.isEmpty()) {
            String snippetLower = snippet.toLowerCase(Locale.ROOT);
            boolean matchesPreferred = preferredCompanies.stream()
                    .filter(company -> company != null && !company.isBlank())
                    .anyMatch(company -> snippetLower.contains(company.toLowerCase(Locale.ROOT)));
            if (matchesPreferred) {
                score += 0.1;
            }
        }

        if ("remote".equalsIgnoreCase(request.getJobPreference()) && snippet.toLowerCase(Locale.ROOT).contains("remote")) {
            score += 0.05;
        }

        if (request.isLookingForInternships() && snippet.toLowerCase(Locale.ROOT).contains("intern")) {
            score += 0.05;
        }

        double normalized = Math.max(0.0, Math.min(1.0, score));
        return new AiScoreResult(normalized, baseReason + " (heuristic keywords + preferences evaluation)");
    }

    private double keywordOverlap(String source, String snippet) {
        if (source == null || source.isBlank() || snippet == null || snippet.isBlank()) {
            return 0.0;
        }

        String[] tokens = source.toLowerCase(Locale.ROOT).split("\\s+");
        String snippetLower = snippet.toLowerCase(Locale.ROOT);
        long matches = 0;
        for (String token : tokens) {
            if (token.isBlank()) {
                continue;
            }
            if (snippetLower.contains(token)) {
                matches++;
            }
        }
        return tokens.length == 0 ? 0.0 : (double) matches / tokens.length;
    }

    private record AiScoreRequest(String jobTitle, String jobSnippet, String resumeSummary,
            List<String> preferredCompanies, String jobPreference, boolean lookingForInternships) {
    }

    private record AiScoreResponse(Double score, String reasoning) {
    }
}
