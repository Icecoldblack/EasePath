package com.easepath.backend.dto;

/**
 * Represents the result returned by the AI scoring service.
 */
public record AiScoreResult(double score, String reasoning) {
}
