/**
 * Admin Panel API service.
 * Provides methods to interact with admin-only backend endpoints.
 */
import { apiGet } from './apiClient';

export interface AdminStatistics {
    totalUsers: number;
    totalApplications: number;
    applicationsApplied: number;
    applicationsInterviewing: number;
    applicationsOffered: number;
    applicationsRejected: number;
    usersThisWeek: number;
    usersThisMonth: number;
}

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    picture: string | null;
    createdAt: string;
    applicationCount: number;
}

/**
 * Check if the current user has admin privileges.
 */
export async function checkAdminStatus(): Promise<boolean> {
    try {
        const response = await apiGet('/api/admin/status');
        if (!response.ok) {
            return false;
        }
        const data = await response.json();
        return data.isAdmin === true;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

/**
 * Get platform statistics (admin only).
 */
export async function getStatistics(): Promise<AdminStatistics | null> {
    try {
        const response = await apiGet('/api/admin/statistics');
        if (!response.ok) {
            console.error('Failed to get statistics:', response.status);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting statistics:', error);
        return null;
    }
}

/**
 * Get all users (admin only).
 */
export async function getUsers(): Promise<AdminUser[]> {
    try {
        const response = await apiGet('/api/admin/users');
        if (!response.ok) {
            console.error('Failed to get users:', response.status);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}

/**
 * Search users by email or name (admin only).
 */
export async function searchUsers(query: string): Promise<AdminUser[]> {
    try {
        const response = await apiGet(`/api/admin/users/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            console.error('Failed to search users:', response.status);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error('Error searching users:', error);
        return [];
    }
}
