package com.easepath.backend.filter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Rate limiting filter to prevent API abuse.
 * Uses a sliding window approach with in-memory tracking per IP/user.
 * 
 * SECURITY: Protects against:
 * - Brute force attacks
 * - API credit exhaustion (OpenAI, RapidAPI)
 * - DoS attempts
 */
@Component
@Order(1) // Run before AuthenticationFilter
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    // Rate limit: requests per window
    @Value("${easepath.ratelimit.requests-per-minute:60}")
    private int requestsPerMinute;

    @Value("${easepath.ratelimit.ai-requests-per-minute:10}")
    private int aiRequestsPerMinute;

    // In-memory storage: IP -> RequestTracker
    private final Map<String, RequestTracker> requestTrackers = new ConcurrentHashMap<>();

    // Cleanup old entries every 5 minutes
    private Instant lastCleanup = Instant.now();
    private static final Duration CLEANUP_INTERVAL = Duration.ofMinutes(5);
    private static final Duration WINDOW_DURATION = Duration.ofMinutes(1);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip OPTIONS (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientId = getClientIdentifier(request);
        String path = request.getRequestURI();

        // Determine rate limit based on endpoint type
        int limit = isAiEndpoint(path) ? aiRequestsPerMinute : requestsPerMinute;

        // Check rate limit
        if (!checkRateLimit(clientId, path, limit)) {
            log.warn("⚠️ Rate limit exceeded for client: {} on path: {}", clientId, path);
            sendTooManyRequests(response, limit);
            return;
        }

        // Periodic cleanup of old entries
        cleanupIfNeeded();

        filterChain.doFilter(request, response);
    }

    /**
     * Get client identifier - prefer authenticated user email, fallback to IP.
     */
    private String getClientIdentifier(HttpServletRequest request) {
        // Try to get user from request attribute (set by AuthenticationFilter)
        Object userAttr = request.getAttribute("currentUser");
        if (userAttr != null) {
            try {
                // Use reflection to avoid circular dependency
                var emailMethod = userAttr.getClass().getMethod("getEmail");
                String email = (String) emailMethod.invoke(userAttr);
                if (email != null && !email.isEmpty()) {
                    return "user:" + email;
                }
            } catch (Exception e) {
                // Fall through to IP-based tracking
            }
        }

        // Fallback to IP address
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        } else {
            // X-Forwarded-For can contain multiple IPs, take the first
            ip = ip.split(",")[0].trim();
        }
        return "ip:" + ip;
    }

    /**
     * Check if request is within rate limit.
     */
    private boolean checkRateLimit(String clientId, String path, int limit) {
        String key = clientId + ":" + (isAiEndpoint(path) ? "ai" : "general");

        RequestTracker tracker = requestTrackers.computeIfAbsent(key, k -> new RequestTracker());
        return tracker.allowRequest(limit, WINDOW_DURATION);
    }

    /**
     * Check if path is an AI-heavy endpoint (should have stricter limits).
     */
    private boolean isAiEndpoint(String path) {
        return path.contains("/generate-essay")
                || path.contains("/autofill")
                || path.contains("/score")
                || path.contains("/ai/");
    }

    /**
     * Send 429 Too Many Requests response.
     */
    private void sendTooManyRequests(HttpServletResponse response, int limit) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.setHeader("Retry-After", "60");
        response.getWriter().write(
                "{\"error\": \"Too Many Requests\", \"message\": \"Rate limit exceeded. Max " + limit
                        + " requests per minute.\", \"retryAfter\": 60}");
    }

    /**
     * Clean up old request trackers to prevent memory leaks.
     */
    private void cleanupIfNeeded() {
        Instant now = Instant.now();
        if (Duration.between(lastCleanup, now).compareTo(CLEANUP_INTERVAL) > 0) {
            lastCleanup = now;
            Instant cutoff = now.minus(WINDOW_DURATION.multipliedBy(2));

            requestTrackers.entrySet().removeIf(entry -> entry.getValue().getLastRequest().isBefore(cutoff));

            log.debug("Rate limiter cleanup: {} active trackers", requestTrackers.size());
        }
    }

    /**
     * Tracks requests for a single client using sliding window.
     */
    private static class RequestTracker {
        private int requestCount = 0;
        private Instant windowStart = Instant.now();
        private Instant lastRequest = Instant.now();

        synchronized boolean allowRequest(int limit, Duration windowDuration) {
            Instant now = Instant.now();
            lastRequest = now;

            // Reset window if expired
            if (Duration.between(windowStart, now).compareTo(windowDuration) > 0) {
                windowStart = now;
                requestCount = 0;
            }

            // Check limit
            if (requestCount >= limit) {
                return false;
            }

            requestCount++;
            return true;
        }

        Instant getLastRequest() {
            return lastRequest;
        }
    }
}
