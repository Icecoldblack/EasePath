import React from 'react';
import { motion } from 'motion/react';
import { Job } from './JobCard';
import './JobDetailsPanel.css';

interface JobDetailsPanelProps {
    job: Job;
    isSaved: boolean;
    isApplied: boolean;
    onSave: (jobId: string) => void;
    onApply: (job: Job) => void;
    formatSalary: (job: Job) => string;
    formatDate: (date: string) => string;
    getEmploymentTypeLabel: (type: string) => string;
}

const JobDetailsPanel: React.FC<JobDetailsPanelProps> = ({
    job,
    isSaved,
    isApplied,
    onSave,
    onApply,
    formatSalary,
    formatDate,
    getEmploymentTypeLabel,
}) => {
    return (
        <motion.div
            className="job-details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="job-details-header">
                <div className="details-tabs">
                    <span className="tab active">Overview</span>
                    <span className="tab">Company</span>
                </div>
                <div className="details-actions">
                    <span className="already-applied">Already Applied?</span>
                    <button
                        className={`save-btn ${isSaved ? 'saved' : ''}`}
                        onClick={() => onSave(job.job_id)}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill={isSaved ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        Save
                    </button>
                    <button
                        onClick={() => onApply(job)}
                        className={`apply-btn ${isApplied ? 'applied' : ''}`}
                    >
                        {isApplied ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Applied
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                </svg>
                                Apply
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="job-details-content">
                <div className="details-hero">
                    <h2 className="detail-job-title">{job.job_title}</h2>
                    <div className="detail-company-info">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" />
                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                        </svg>
                        <span>{job.employer_name}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{job.job_city}, {job.job_state}</span>
                    </div>
                </div>

                <div className="job-info-tags">
                    <span className="info-tag type">{getEmploymentTypeLabel(job.job_employment_type)}</span>
                    {(job.job_min_salary || job.job_max_salary) && (
                        <span className="info-tag salary">{formatSalary(job)}</span>
                    )}
                    <span className="info-tag posted">Posted {formatDate(job.job_posted_at_datetime_utc)}</span>
                </div>

                <div className="detail-section">
                    <h4>About the Role</h4>
                    <p className="role-description">
                        We are looking for an experienced {job.job_title} to join our team...
                    </p>
                    <p className="role-description">
                        {job.job_description.slice(0, 300)}...
                    </p>
                </div>

                <div className="company-info-card">
                    <div className="company-logo-large">
                        {job.employer_logo ? (
                            <img src={job.employer_logo} alt={job.employer_name} />
                        ) : (
                            <div className="logo-placeholder-large">
                                {job.employer_name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="company-details">
                        <h3>{job.employer_name}</h3>
                        <p className="company-size">10,001+ employees</p>
                    </div>
                </div>

                <div className="job-highlights">
                    <div className="highlight-item">
                        <span className="highlight-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </span>
                        <span className="highlight-text">{formatSalary(job)}</span>
                    </div>
                    <div className="highlight-item">
                        <span className="highlight-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" />
                                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                            </svg>
                        </span>
                        <span className="highlight-text">{getEmploymentTypeLabel(job.job_employment_type)}</span>
                    </div>
                    <div className="highlight-item">
                        <span className="highlight-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </span>
                        <span className="highlight-text">{job.job_city}, {job.job_state}, {job.job_country}</span>
                    </div>
                    <div className="highlight-item">
                        <span className="highlight-icon">
                            {job.job_is_remote ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="4" y="2" width="16" height="20" rx="2" />
                                    <line x1="8" y1="6" x2="16" y2="6" />
                                    <line x1="8" y1="10" x2="16" y2="10" />
                                    <line x1="8" y1="14" x2="12" y2="14" />
                                </svg>
                            )}
                        </span>
                        <span className="highlight-text">{job.job_is_remote ? 'Remote' : 'In Person'}</span>
                    </div>
                </div>

                {job.job_required_skills && job.job_required_skills.length > 0 && (
                    <div className="detail-section">
                        <h4>Key Skills</h4>
                        <div className="skills-list">
                            {job.job_required_skills.map((skill, index) => (
                                <span key={index} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="detail-section">
                    <h4>Requirements</h4>
                    <div className="requirements-list">
                        {job.job_description.split('.').filter(s => s.trim()).slice(0, 10).map((req, index) => (
                            <div key={index} className="requirement-item">
                                <span className="bullet">•</span>
                                <span>{req.trim()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default JobDetailsPanel;
