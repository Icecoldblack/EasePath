package com.easepath.backend.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.easepath.backend.dto.AdminStatisticsDTO;
import com.easepath.backend.dto.AdminUserDTO;
import com.easepath.backend.model.User;
import com.easepath.backend.service.AdminPanelService;

import jakarta.servlet.http.HttpServletRequest;

/**
 * REST Controller for Admin Panel endpoints.
 * All endpoints verify admin status before processing.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final AdminPanelService adminPanelService;

    public AdminController(AdminPanelService adminPanelService) {
        this.adminPanelService = adminPanelService;
    }

    /**
     * Check if the current user has admin privileges.
     * Returns { "isAdmin": true/false }
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> checkAdminStatus(HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");

        if (currentUser == null) {
            log.warn("Admin status check failed: no authenticated user");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("isAdmin", false));
        }

        boolean isAdmin = adminPanelService.isAdmin(currentUser.getEmail());
        log.info("Admin status check for {}: {}", currentUser.getEmail(), isAdmin);

        return ResponseEntity.ok(Map.of("isAdmin", isAdmin));
    }

    /**
     * Get platform statistics (admin only).
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics(HttpServletRequest request) {
        ResponseEntity<?> authCheck = checkAdminAccess(request);
        if (authCheck != null) {
            return authCheck;
        }

        AdminStatisticsDTO stats = adminPanelService.getStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all users (admin only).
     */
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(HttpServletRequest request) {
        ResponseEntity<?> authCheck = checkAdminAccess(request);
        if (authCheck != null) {
            return authCheck;
        }

        List<AdminUserDTO> users = adminPanelService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Search users by email or name (admin only).
     */
    @GetMapping("/users/search")
    public ResponseEntity<?> searchUsers(
            HttpServletRequest request,
            @RequestParam(value = "q", required = false) String query) {

        ResponseEntity<?> authCheck = checkAdminAccess(request);
        if (authCheck != null) {
            return authCheck;
        }

        List<AdminUserDTO> users = adminPanelService.searchUsers(query);
        return ResponseEntity.ok(users);
    }

    /**
     * Verify admin access. Returns null if access granted, or error response if
     * denied.
     */
    private ResponseEntity<?> checkAdminAccess(HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");

        if (currentUser == null) {
            log.warn("Admin endpoint accessed without authentication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized", "message", "Authentication required"));
        }

        if (!adminPanelService.isAdmin(currentUser.getEmail())) {
            log.warn("Admin endpoint accessed by non-admin user: {}", currentUser.getEmail());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Forbidden", "message", "Admin access required"));
        }

        return null; // Access granted
    }
}
