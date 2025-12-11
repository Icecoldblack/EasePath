package com.easepath.backend.security;

import com.easepath.backend.model.User;
import com.easepath.backend.service.GoogleAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthenticationInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationInterceptor.class);

    @Autowired
    private GoogleAuthService googleAuthService;

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, 
                           @NonNull HttpServletResponse response, 
                           @NonNull Object handler) throws Exception {
        
        // Allow OPTIONS requests (CORS preflight)
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        logger.debug("Auth header received: {}", authHeader != null ? "Bearer [REDACTED]" : "null");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("Missing or invalid authorization header for request: {}", request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\": false, \"message\": \"Missing or invalid authorization header\"}");
            return false;
        }

        try {
            String token = authHeader.replace("Bearer ", "");
            logger.debug("Attempting to validate token for request: {}", request.getRequestURI());
            
            // Validate JWT and extract user info
            String email = googleAuthService.getEmailFromToken(token);
            String name = googleAuthService.getNameFromToken(token);
            String picture = googleAuthService.getPictureFromToken(token);
            
            // Create user object and set in request
            User user = User.builder()
                    .email(email)
                    .name(name)
                    .picture(picture)
                    .build();
            
            request.setAttribute("currentUser", user);
            logger.debug("Authentication successful for user: {}", user.getEmail());
            return true;
            
        } catch (Exception e) {
            logger.error("Authentication failed for request {}: {}", request.getRequestURI(), e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\": false, \"message\": \"Invalid or expired token\"}");
            return false;
        }
    }
}
