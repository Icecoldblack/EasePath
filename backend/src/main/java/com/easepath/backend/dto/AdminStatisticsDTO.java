package com.easepath.backend.dto;

/**
 * DTO for admin panel statistics response.
 */
public class AdminStatisticsDTO {

    private long totalUsers;
    private long totalApplications;
    private long applicationsApplied;
    private long applicationsInterviewing;
    private long applicationsOffered;
    private long applicationsRejected;
    private long usersThisWeek;
    private long usersThisMonth;

    public AdminStatisticsDTO() {
    }

    // Getters and Setters
    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getApplicationsApplied() {
        return applicationsApplied;
    }

    public void setApplicationsApplied(long applicationsApplied) {
        this.applicationsApplied = applicationsApplied;
    }

    public long getApplicationsInterviewing() {
        return applicationsInterviewing;
    }

    public void setApplicationsInterviewing(long applicationsInterviewing) {
        this.applicationsInterviewing = applicationsInterviewing;
    }

    public long getApplicationsOffered() {
        return applicationsOffered;
    }

    public void setApplicationsOffered(long applicationsOffered) {
        this.applicationsOffered = applicationsOffered;
    }

    public long getApplicationsRejected() {
        return applicationsRejected;
    }

    public void setApplicationsRejected(long applicationsRejected) {
        this.applicationsRejected = applicationsRejected;
    }

    public long getUsersThisWeek() {
        return usersThisWeek;
    }

    public void setUsersThisWeek(long usersThisWeek) {
        this.usersThisWeek = usersThisWeek;
    }

    public long getUsersThisMonth() {
        return usersThisMonth;
    }

    public void setUsersThisMonth(long usersThisMonth) {
        this.usersThisMonth = usersThisMonth;
    }
}
