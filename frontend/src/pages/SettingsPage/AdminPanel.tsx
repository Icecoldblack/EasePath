import React, { useState, useEffect, useCallback } from 'react';
import { checkAdminStatus, getStatistics, getUsers, searchUsers, AdminStatistics, AdminUser } from '../../utils/adminService';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'statistics' | 'users'>('statistics');

    // Statistics state
    const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Users state
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Check admin status on mount
    useEffect(() => {
        const checkAccess = async () => {
            setLoading(true);
            const adminStatus = await checkAdminStatus();
            setIsAdmin(adminStatus);
            setLoading(false);

            if (adminStatus) {
                loadStatistics();
            }
        };
        checkAccess();
    }, []);

    const loadStatistics = async () => {
        setStatsLoading(true);
        const stats = await getStatistics();
        setStatistics(stats);
        setStatsLoading(false);
    };

    const loadUsers = useCallback(async () => {
        setUsersLoading(true);
        const allUsers = await getUsers();
        setUsers(allUsers);
        setUsersLoading(false);
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setUsersLoading(true);
        const results = await searchUsers(searchQuery);
        setUsers(results);
        setUsersLoading(false);
    };

    const handleTabChange = (tab: 'statistics' | 'users') => {
        setActiveTab(tab);
        if (tab === 'users' && users.length === 0) {
            loadUsers();
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="admin-panel loading">
                <div className="admin-loading-spinner">
                    <div className="admin-spinner"></div>
                    <p>Checking admin access...</p>
                </div>
            </div>
        );
    }

    // Unauthorized state
    if (!isAdmin) {
        return (
            <div className="admin-panel unauthorized">
                <div className="admin-unauthorized-content">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="admin-unauthorized-icon">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <line x1="4.5" y1="4.5" x2="19.5" y2="19.5" />
                    </svg>
                    <h2>Access Denied</h2>
                    <p>You do not have permission to access the admin panel.</p>
                    <p>Only authorized administrators can view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            {/* Header */}
            <div className="admin-header">
                <div className="admin-heading">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="admin-heading-icon">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <div>
                        <h2>Admin Panel</h2>
                        <p>Manage users, statistics, and application data.</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'statistics' ? 'active' : ''}`}
                    onClick={() => handleTabChange('statistics')}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 20V10" />
                        <path d="M12 20V4" />
                        <path d="M6 20v-6" />
                    </svg>
                    Statistics
                </button>
                <button
                    className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => handleTabChange('users')}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Users
                </button>
            </div>

            {/* Content */}
            <div className="admin-content">
                {/* Statistics Tab */}
                {activeTab === 'statistics' && (
                    <div className="admin-section">
                        {statsLoading ? (
                            <div className="admin-section-loading">
                                <div className="admin-spinner"></div>
                                <p>Loading statistics...</p>
                            </div>
                        ) : statistics ? (
                            <div className="admin-stats-grid">
                                {/* User Stats */}
                                <div className="admin-stat-card">
                                    <div className="admin-stat-icon users">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                        </svg>
                                    </div>
                                    <div className="admin-stat-info">
                                        <span className="admin-stat-value">{statistics.totalUsers}</span>
                                        <span className="admin-stat-label">Total Users</span>
                                    </div>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-icon applications">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="7" width="20" height="14" rx="2" />
                                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                                        </svg>
                                    </div>
                                    <div className="admin-stat-info">
                                        <span className="admin-stat-value">{statistics.totalApplications}</span>
                                        <span className="admin-stat-label">Total Applications</span>
                                    </div>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-icon weekly">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                    </div>
                                    <div className="admin-stat-info">
                                        <span className="admin-stat-value">{statistics.usersThisWeek}</span>
                                        <span className="admin-stat-label">New Users (Week)</span>
                                    </div>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-icon monthly">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                    </div>
                                    <div className="admin-stat-info">
                                        <span className="admin-stat-value">{statistics.usersThisMonth}</span>
                                        <span className="admin-stat-label">New Users (Month)</span>
                                    </div>
                                </div>

                                {/* Application Status Breakdown */}
                                <div className="admin-stat-card wide">
                                    <h3>Application Status Breakdown</h3>
                                    <div className="admin-status-breakdown">
                                        <div className="admin-status-item applied">
                                            <span className="admin-status-count">{statistics.applicationsApplied}</span>
                                            <span className="admin-status-label">Applied</span>
                                        </div>
                                        <div className="admin-status-item interviewing">
                                            <span className="admin-status-count">{statistics.applicationsInterviewing}</span>
                                            <span className="admin-status-label">Interviewing</span>
                                        </div>
                                        <div className="admin-status-item offered">
                                            <span className="admin-status-count">{statistics.applicationsOffered}</span>
                                            <span className="admin-status-label">Offered</span>
                                        </div>
                                        <div className="admin-status-item rejected">
                                            <span className="admin-status-count">{statistics.applicationsRejected}</span>
                                            <span className="admin-status-label">Rejected</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="admin-no-data">Failed to load statistics.</p>
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="admin-section">
                        {/* Search bar */}
                        <form className="admin-search-form" onSubmit={handleSearch}>
                            <div className="admin-search-input-wrapper">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="admin-search-icon">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by email or name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="admin-search-input"
                                />
                            </div>
                            <button type="submit" className="admin-search-btn">Search</button>
                            <button
                                type="button"
                                className="admin-search-btn secondary"
                                onClick={() => {
                                    setSearchQuery('');
                                    loadUsers();
                                }}
                            >
                                Clear
                            </button>
                        </form>

                        {/* Users list */}
                        {usersLoading ? (
                            <div className="admin-section-loading">
                                <div className="admin-spinner"></div>
                                <p>Loading users...</p>
                            </div>
                        ) : users.length > 0 ? (
                            <div className="admin-users-table">
                                <div className="admin-users-header">
                                    <span>Name</span>
                                    <span>Email</span>
                                    <span>Applications</span>
                                    <span>Joined</span>
                                </div>
                                {users.map(user => (
                                    <div key={user.id} className="admin-user-row">
                                        <span className="admin-user-name">{user.name || 'No name'}</span>
                                        <span className="admin-user-email">{user.email || 'No email'}</span>
                                        <span className="admin-user-apps">{user.applicationCount}</span>
                                        <span className="admin-user-joined">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="admin-no-data">No users found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
