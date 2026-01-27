import React from 'react';
import { StepProps } from './types';

const JobPreferencesStep: React.FC<StepProps> = ({ formData, onChange }) => {
    return (
        <div className="onboarding-step">
            <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
                Job Preferences
            </h2>
            <p className="step-description">Tell us what you're looking for in your next role.</p>

            <div className="form-group">
                <label>Desired Job Title</label>
                <input
                    type="text"
                    name="desiredJobTitle"
                    value={formData.desiredJobTitle}
                    onChange={onChange}
                    placeholder="Software Engineer"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Desired Salary</label>
                    <input
                        type="text"
                        name="desiredSalary"
                        value={formData.desiredSalary}
                        onChange={onChange}
                        placeholder="$100,000"
                    />
                </div>
                <div className="form-group">
                    <label>Years of Experience</label>
                    <select name="yearsOfExperience" value={formData.yearsOfExperience} onChange={onChange}>
                        <option value="">Select...</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                    </select>
                </div>
            </div>

            <div className="form-group checkbox-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="willingToRelocate"
                        checked={formData.willingToRelocate}
                        onChange={onChange}
                    />
                    <span>
                        I am willing to relocate{' '}
                        <span className={`check-pill ${formData.willingToRelocate ? 'on' : ''}`}>
                            {formData.willingToRelocate ? '✓' : 'X'}
                        </span>
                    </span>
                </label>
            </div>

            <div className="form-group">
                <label>When can you start?</label>
                <input
                    type="date"
                    name="availableStartDate"
                    value={formData.availableStartDate}
                    onChange={onChange}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Highest Degree</label>
                    <select name="highestDegree" value={formData.highestDegree} onChange={onChange}>
                        <option value="">Select...</option>
                        <option value="High School">High School</option>
                        <option value="Associate">Associate's Degree</option>
                        <option value="Bachelor">Bachelor's Degree</option>
                        <option value="Master">Master's Degree</option>
                        <option value="PhD">PhD / Doctorate</option>
                        <option value="Bootcamp">Bootcamp / Certification</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Major / Field of Study</label>
                    <input
                        type="text"
                        name="major"
                        value={formData.major}
                        onChange={onChange}
                        placeholder="Computer Science"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>University / School</label>
                    <input
                        type="text"
                        name="university"
                        value={formData.university}
                        onChange={onChange}
                        placeholder="Stanford University"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>College Start Date (MM/YYYY)</label>
                    <input
                        type="text"
                        name="educationStartDate"
                        value={formData.educationStartDate}
                        onChange={onChange}
                        placeholder="08/2023"
                    />
                </div>
                <div className="form-group">
                    <label>College End Date (MM/YYYY)</label>
                    <input
                        type="text"
                        name="educationEndDate"
                        value={formData.educationEndDate}
                        onChange={onChange}
                        placeholder="05/2027"
                    />
                </div>
            </div>
        </div>
    );
};

export default JobPreferencesStep;
