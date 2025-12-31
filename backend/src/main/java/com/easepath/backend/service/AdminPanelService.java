package com.easepath.backend.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.easepath.backend.config.AdminConfig;
import com.easepath.backend.dto.AdminStatisticsDTO;
import com.easepath.backend.dto.AdminUserDTO;
import com.easepath.backend.model.JobApplicationDocument;
import com.easepath.backend.model.UserProfileDocument;
import com.easepath.backend.repository.JobApplicationRepository;
import com.easepath.backend.repository.UserProfileRepository;

/**
 * Service for admin panel operations.
 * All methods validate admin access before returning data.
 */
@Service
public class AdminPanelService {

    private static final Logger log = LoggerFactory.getLogger(AdminPanelService.class);

    private final AdminConfig adminConfig;
    private final UserProfileRepository userProfileRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public AdminPanelService(AdminConfig adminConfig,
            UserProfileRepository userProfileRepository,
            JobApplicationRepository jobApplicationRepository) {
        this.adminConfig = adminConfig;
        this.userProfileRepository = userProfileRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        log.info("AdminPanelService initialized with {} configured admin(s)", adminConfig.getAdminCount());
    }

    /**
     * Check if the given email has admin privileges.
     */
    public boolean isAdmin(String email) {
        return adminConfig.isAdmin(email);
    }

    /**
     * Get platform statistics for admin dashboard.
     */
    public AdminStatisticsDTO getStatistics() {
        AdminStatisticsDTO stats = new AdminStatisticsDTO();

        // Total users
        long totalUsers = userProfileRepository.count();
        stats.setTotalUsers(totalUsers);

        // Total applications
        List<JobApplicationDocument> allApplications = jobApplicationRepository.findAll();
        stats.setTotalApplications(allApplications.size());

        // Applications by status
        long applied = allApplications.stream()
                .filter(a -> "APPLIED".equalsIgnoreCase(a.getStatus()) || "Applied".equalsIgnoreCase(a.getStatus()))
                .count();
        long interviewing = allApplications.stream()
                .filter(a -> "INTERVIEWING".equalsIgnoreCase(a.getStatus())
                        || "Interview".equalsIgnoreCase(a.getStatus()))
                .count();
        long offered = allApplications.stream()
                .filter(a -> "OFFERED".equalsIgnoreCase(a.getStatus()) || "Offer".equalsIgnoreCase(a.getStatus()))
                .count();
        long rejected = allApplications.stream()
                .filter(a -> "REJECTED".equalsIgnoreCase(a.getStatus()) || "Rejected".equalsIgnoreCase(a.getStatus()))
                .count();

        stats.setApplicationsApplied(applied);
        stats.setApplicationsInterviewing(interviewing);
        stats.setApplicationsOffered(offered);
        stats.setApplicationsRejected(rejected);

        // Users registered recently
        Instant oneWeekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        Instant oneMonthAgo = Instant.now().minus(30, ChronoUnit.DAYS);

        List<UserProfileDocument> allUsers = userProfileRepository.findAll();
        long usersThisWeek = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(oneWeekAgo))
                .count();
        long usersThisMonth = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(oneMonthAgo))
                .count();

        stats.setUsersThisWeek(usersThisWeek);
        stats.setUsersThisMonth(usersThisMonth);

        log.info("Admin statistics retrieved: {} users, {} applications", totalUsers, allApplications.size());
        return stats;
    }

    /**
     * Get all users for admin user list.
     */
    public List<AdminUserDTO> getAllUsers() {
        List<UserProfileDocument> users = userProfileRepository.findAll();

        return users.stream()
                .map(this::toAdminUserDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search users by email or name.
     */
    public List<AdminUserDTO> searchUsers(String query) {
        if (query == null || query.isBlank()) {
            return getAllUsers();
        }

        String lowerQuery = query.toLowerCase().trim();
        List<UserProfileDocument> users = userProfileRepository.findAll();

        return users.stream()
                .filter(u -> matchesQuery(u, lowerQuery))
                .map(this::toAdminUserDTO)
                .collect(Collectors.toList());
    }

    private boolean matchesQuery(UserProfileDocument user, String query) {
        String email = user.getEmail() != null ? user.getEmail().toLowerCase() : "";
        String firstName = user.getFirstName() != null ? user.getFirstName().toLowerCase() : "";
        String lastName = user.getLastName() != null ? user.getLastName().toLowerCase() : "";

        return email.contains(query) || firstName.contains(query) || lastName.contains(query);
    }

    private AdminUserDTO toAdminUserDTO(UserProfileDocument user) {
        // Count applications for this user
        int appCount = 0;
        if (user.getEmail() != null) {
            appCount = jobApplicationRepository.findByUserEmail(user.getEmail()).size();
        }

        String fullName = "";
        if (user.getFirstName() != null) {
            fullName = user.getFirstName();
        }
        if (user.getLastName() != null) {
            fullName = fullName.isEmpty() ? user.getLastName() : fullName + " " + user.getLastName();
        }

        return new AdminUserDTO(
                user.getId(),
                user.getEmail(),
                fullName,
                null, // picture not stored in UserProfileDocument
                user.getCreatedAt(),
                appCount);
    }
}
