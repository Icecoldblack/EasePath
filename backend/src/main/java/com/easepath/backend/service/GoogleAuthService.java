package com.easepath.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Map;

/**
 * Service for validating Google OAuth JWT tokens.
 * Google uses RS256 (RSA) algorithm for signing tokens.
 */
@Service
public class GoogleAuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthService.class);
    
    /**
     * Validates Google JWT token without signature verification.
     * In production, you should verify the signature using Google's public keys.
     * For development, we'll just decode and validate expiration.
     */
    public Claims validateJWT(String token) {
        try {
            // For Google OAuth tokens, we parse without signature verification
            // since Google uses RS256 and we'd need to fetch their public keys
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new RuntimeException("Invalid JWT token format");
            }
            
            // Decode payload (middle part)
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            
            // Parse as Claims manually
            @SuppressWarnings("unchecked")
            Map<String, Object> claims = new com.fasterxml.jackson.databind.ObjectMapper()
                .readValue(payload, Map.class);
            
            // Check expiration
            if (claims.containsKey("exp")) {
                long exp = ((Number) claims.get("exp")).longValue();
                if (System.currentTimeMillis() / 1000 > exp) {
                    throw new RuntimeException("Token has expired");
                }
            }
            
            // Convert to Claims object
            return Jwts.claims().add(claims).build();
            
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            logger.warn("JWT validation failed: {}", e.getMessage());
            throw new RuntimeException("Invalid JWT token");
        }
    }
    
    public String getEmailFromToken(String token) {
        Claims claims = validateJWT(token);
        return claims.get("email", String.class);
    }
    
    public String getNameFromToken(String token) {
        try {
            Claims claims = validateJWT(token);
            return claims.get("name", String.class);
        } catch (Exception e) {
            logger.debug("Could not extract name from token: {}", e.getMessage());
            return null;
        }
    }
    
    public String getPictureFromToken(String token) {
        try {
            Claims claims = validateJWT(token);
            return claims.get("picture", String.class);
        } catch (Exception e) {
            logger.debug("Could not extract picture from token: {}", e.getMessage());
            return null;
        }
    }
}
