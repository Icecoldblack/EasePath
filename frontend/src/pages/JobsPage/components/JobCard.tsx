import React from 'react';
import { motion } from 'motion/react';
import './JobCard.css';

export interface Job {
    job_id: string;
    job_title: string;
    employer_name: string;
    employer_logo: string | null;
    job_city: string;
    job_state: string;
    job_country: string;
    job_employment_type: string;
    job_posted_at_datetime_utc: string;
    job_description: string;
    job_apply_link: string;
    job_min_salary: number | null;
    job_max_salary: number | null;
    job_salary_currency: string | null;
    job_salary_period: string | null;
    job_is_remote: boolean;
    job_required_skills: string[] | null;
    job_required_experience: {
        no_experience_required: boolean;
        required_experience_in_months: number | null;
    } | null;
}

interface JobCardProps {
    job: Job;
    isSelected: boolean;
    isSaved: boolean;
    index: number;
    onSelect: (job: Job) => void;
    onToggleSave: (jobId: string) => void;
    formatDate: (date: string) => string;
    formatSalary: (job: Job) => string;
}

const JobCard: React.FC<JobCardProps> = ({
    job,
    isSelected,
    isSaved,
    index,
    onSelect,
    onToggleSave,
    formatDate,
    formatSalary,
}) => {
    return (
        <motion.div
            className={`job-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(job)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
        >
            <div className="job-card-header">
                <div className="job-card-info">
                    <h3 className="job-title">{job.job_title}</h3>
                    <span className="company-name">{job.employer_name}</span>
                </div>
                <button
                    className={`save-button ${isSaved ? 'saved' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(job.job_id);
                    }}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={isSaved ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                </button>
            </div>

            <div className="job-card-meta">
                <span className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    {job.job_is_remote ? 'Remote' : `${job.job_city}, ${job.job_state}`}
                </span>
                {(job.job_min_salary || job.job_max_salary) && (
                    <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        {formatSalary(job)}
                    </span>
                )}
                <span className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {formatDate(job.job_posted_at_datetime_utc)}
                </span>
            </div>

            {job.job_required_skills && job.job_required_skills.length > 0 && (
                <div className="job-card-skills">
                    {job.job_required_skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="skill-chip">{skill}</span>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default JobCard;
