import React, { useEffect, useState } from 'react';
import './DashboardPage.css';

interface JobApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  jobUrl: string;
  status: string;
  matchScore: number;
  matchReason: string;
  appliedAt: string;
}

const DashboardPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/apply/history')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch history');
        }
        return res.json();
      })
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load dashboard data.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="dashboard-page"><p>Loading dashboard...</p></div>;
  if (error) return <div className="dashboard-page"><p className="error-text">{error}</p></div>;

  // Calculate stats
  const totalApplications = applications.length;
  const appliedCount = applications.filter(app => app.status === 'APPLIED').length;
  const skippedCount = applications.filter(app => app.status.startsWith('SKIPPED')).length;
  
  // Sort by date descending for recent activity
  const recentActivity = [...applications].sort((a, b) => 
    new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
  ).slice(0, 5);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Your job search snapshot.</p>
      </header>
      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h3>Total Processed</h3>
          <p className="stat-number">{totalApplications}</p>
          <p className="stat-label">Jobs analyzed</p>
        </article>
        <article className="dashboard-card">
          <h3>Applications Sent</h3>
          <p className="stat-number">{appliedCount}</p>
          <p className="stat-label">Successfully applied</p>
        </article>
        <article className="dashboard-card">
          <h3>Skipped</h3>
          <p className="stat-number">{skippedCount}</p>
          <p className="stat-label">Low score or unrelated</p>
        </article>
      </section>

      <section className="recent-activity">
        <h3>Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="no-data">No activity yet. Start an auto-apply session!</p>
        ) : (
          <div className="activity-list">
            {recentActivity.map((app) => (
              <div key={app.id} className="activity-item">
                <div className="activity-info">
                  <h4>{app.jobTitle || 'Unknown Job'}</h4>
                  <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="job-link">
                    {app.jobUrl}
                  </a>
                  <span className="activity-date">
                    {new Date(app.appliedAt).toLocaleDateString()} {new Date(app.appliedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className={`activity-status status-${app.status.toLowerCase().split('_')[0]}`}>
                  {app.status.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
