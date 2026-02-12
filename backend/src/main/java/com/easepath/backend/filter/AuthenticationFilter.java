package com.easepath.backend.filter;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.easepath.backend.model.User;
import com.easepath.backend.service.GoogleAuthService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * WHAT IS A JWT (JSON Web Token)?
 * A JWT has 3 parts separated by dots: header.payload.signature
 * Example: eyJhbGciOiJSUzI1NiJ9.eyJlbWFpbCI6InVzZXJAZ21haWwuY29tIn0.signature
 * AUTHENTICATION FILTER - Intercepts ALL HTTP requests before they reach
 * controllers.
 * DESIGN PATTERN: Filter Chain Pattern
 * - This filter runs BEFORE any controller code executes
 * - It's like a security checkpoint - every request must pass through here
 * - If authentication fails, the request is rejected and never reaches the
 * controller
 * 
 * HOW IT WORKS:
 * 1. Client sends request with "Authorization: Bearer <JWT_TOKEN>" header
 * 2. This filter extracts the token and sends it to GoogleAuthService for
 * verification
 * 3. If valid, the User object is attached to the request and passed to the
 * controller
 * 4. If invalid, returns 401 Unauthorized immediately
 * 
 * WHY OncePerRequestFilter?
 * - Guarantees this filter runs exactly ONCE per request (not multiple times
 * for forwards/includes)
 * - Spring might internally forward requests, and we don't want to verify twice
 */
@Component // Makes Spring auto-detect and register this as a bean
public class AuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationFilter.class);

    // DEPENDENCY INJECTION: Spring automatically injects GoogleAuthService
    // This is "Constructor Injection" - the preferred way in Spring
    private final GoogleAuthService googleAuthService;

    public AuthenticationFilter(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    /**
     * THE MAIN FILTER METHOD - Called for every HTTP request
     * 
     * @param request     - Contains all request data (headers, body, URL)
     * @param response    - Where we write our response (used for 401 errors)
     * @param filterChain - The chain of filters; calling doFilter passes to next
     *                    one
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // STEP 1: Allow CORS preflight requests through without auth

        // Browsers send OPTIONS requests before actual requests to check permissions

        // These don't include auth headers, so we must skip them
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response); // Pass to next filter
            return;
        }

        String path = request.getRequestURI();

        // STEP 2: Skip auth for public endpoints (health checks, etc.)
        if (isPublicPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // STEP 3: Extract JWT from "Authorization: Bearer <token>" header

        // HTTP standard format is "Bearer eyJhbGciOiJSUzI1NiIs..."

        // We need to strip off "Bearer " to get just the token
        String authHeader = request.getHeader("Authorization");
        log.debug("Path: {}, Authorization header present: {}", path, authHeader != null);

        // Validate header exists and has correct format
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn(" No Bearer token provided for path: {}", path);
            sendUnauthorized(response, "Missing or invalid Authorization header");
            return; // STOP - Request rejected, never reaches controller
        }

        // Extract just the token part (skip "Bearer " which is 7 characters)
        String token = authHeader.substring(7);
        log.debug("Token length: {}", token.length());

        try {
            // STEP 4: Verify JWT with Google's public keys

            // GoogleAuthService does cryptographic verification:
            // - Checks signature using Google's public keys
            // - Validates expiration time
            // - Confirms token was issued for THIS app (audience check)
            User user = googleAuthService.verifyToken(token);

            if (user == null) {
                log.warn(" Invalid token for path: {}", path);
                sendUnauthorized(response, "Invalid or expired token");
                return;
            }

            // STEP 5: Attach user to request & pass to controller

            // Store user object where controllers can access it
            // Controllers use: request.getAttribute("currentUser")
            request.setAttribute("currentUser", user);
            log.info("Authenticated user: {} for path: {}", user.getEmail(), path);

            // PASS THE BATON - Continue to the next filter or controller
            // This is the "chain" part of Filter Chain pattern
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            // Token verification threw an exception (network error, invalid format, etc.)
            log.error("Error verifying token for path {}: {}", path, e.getMessage());
            sendUnauthorized(response, "Token verification failed");
        }
    }

    /**
     * Check if the path is public (no authentication required)
     * SECURITY: Extension endpoints NOW REQUIRE authentication via Bearer token.
     */
    private boolean isPublicPath(String path) {
        return path.contains("/health")
                || path.contains("/sample")
                || path.contains("/api/auth/");
    }

    /**
     * Send 401 Unauthorized response
     */
    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"" + message + "\"}");
    }
}
