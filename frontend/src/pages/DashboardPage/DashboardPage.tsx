import React from 'react';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Your weekly job search snapshot.</p>
      </header>
      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h3>Weekly Applications</h3>
          <p>12 jobs submitted</p>
        </article>
        <article className="dashboard-card">
          <h3>Interviews Scheduled</h3>
          <p>3 upcoming next week</p>
        </article>
        <article className="dashboard-card">
          <h3>AI Credits</h3>
          <p>62 remaining</p>
        </article>
      </section>
    </div>
  );
};

export default DashboardPage;
