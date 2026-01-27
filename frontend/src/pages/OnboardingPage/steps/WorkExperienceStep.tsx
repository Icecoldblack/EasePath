import React from 'react';
import { OnboardingData, WorkExperience } from './types';

interface WorkExperienceStepProps {
    formData: OnboardingData;
    jobForm: WorkExperience;
    editingJobIndex: number | null;
    onJobChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSaveJob: () => void;
    onEditJob: (index: number) => void;
    onDeleteJob: (index: number) => void;
    onCancelEdit: () => void;
}

const WorkExperienceStep: React.FC<WorkExperienceStepProps> = ({
    formData,
    jobForm,
    editingJobIndex,
    onJobChange,
    onSaveJob,
    onEditJob,
    onDeleteJob,
    onCancelEdit,
}) => {
    return (
        <div className="onboarding-step">
            <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Work Experience
            </h2>
            <p className="step-description">Add your employment history for complex auto-fills.</p>

            {/* List of added jobs */}
            <div className="jobs-list">
                {formData.workExperience.map((job, idx) => (
                    <div key={idx} className="job-card">
                        <div className="job-header">
                            <div>
                                <h4 className="job-title">{job.jobTitle}</h4>
                                <div className="job-company">{job.company}</div>
                                <div className="job-meta">
                                    {job.startDate} - {job.isCurrent ? 'Present' : job.endDate} • {job.location}
                                </div>
                            </div>
                            <div className="job-actions">
                                <button onClick={() => onEditJob(idx)} className="btn-icon" title="Edit">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                    </svg>
                                </button>
                                <button onClick={() => onDeleteJob(idx)} className="btn-icon delete" title="Delete">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Form */}
            <div className="add-job-form">
                <h3>
                    {editingJobIndex !== null ? 'Edit Position' : 'Add New Position'}
                </h3>

                <div className="form-row">
                    <div className="form-group">
                        <label>Company *</label>
                        <input type="text" name="company" value={jobForm.company} onChange={onJobChange} placeholder="Google" />
                    </div>
                    <div className="form-group">
                        <label>Job Title *</label>
                        <input type="text" name="jobTitle" value={jobForm.jobTitle} onChange={onJobChange} placeholder="Software Engineer" />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Start Date (YYYY-MM) *</label>
                        <input type="text" name="startDate" value={jobForm.startDate} onChange={onJobChange} placeholder="2022-01" />
                    </div>
                    <div className="form-group">
                        <label>End Date (YYYY-MM)</label>
                        <input
                            type="text"
                            name="endDate"
                            value={jobForm.endDate}
                            onChange={onJobChange}
                            placeholder="2023-05"
                            disabled={jobForm.isCurrent}
                            style={jobForm.isCurrent ? { opacity: 0.5, background: '#eee' } : {}}
                        />
                    </div>
                </div>

                <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                        <input type="checkbox" name="isCurrent" checked={jobForm.isCurrent} onChange={onJobChange} />
                        <span>I currently work here</span>
                    </label>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" name="location" value={jobForm.location} onChange={onJobChange} placeholder="New York, NY" />
                    </div>
                </div>

                <div className="form-group">
                    <label>Description (Responsibilities)</label>
                    <textarea
                        name="description"
                        value={jobForm.description}
                        onChange={onJobChange}
                        rows={4}
                        placeholder="Describe your key responsibilities and achievements..."
                    />
                </div>

                <div className="add-job-actions">
                    <button
                        type="button"
                        onClick={onSaveJob}
                        disabled={!jobForm.company || !jobForm.jobTitle}
                        className="btn-save-job"
                    >
                        {editingJobIndex !== null ? 'Update Position' : 'Add Position'}
                    </button>
                    {editingJobIndex !== null && (
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="btn-cancel-job"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <p className="helper-text">
                Note: You can always add more experience later in Settings.
            </p>
        </div>
    );
};

export default WorkExperienceStep;
