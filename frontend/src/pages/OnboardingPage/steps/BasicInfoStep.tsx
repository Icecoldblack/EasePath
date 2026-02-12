import React from 'react';
import { StepProps } from './types';

interface BasicInfoStepProps extends StepProps {
    isParsingResume: boolean;
    resumeParseSuccess: boolean;
    onResumeUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
    formData,
    onChange,
    isParsingResume,
    resumeParseSuccess,
    onResumeUpload,
}) => {
    return (
        <div className="onboarding-step">
            <h2> Let's get to know you</h2>
            <p className="step-description">This info will be used to auto-fill job applications.</p>

            {/* Resume Quick Fill Section */}
            {!resumeParseSuccess && (
                <div className="resume-autofill-section" style={{
                    background: 'var(--bg-secondary)',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>Quick Fill from Resume</h3>
                    <p style={{ margin: '0 0 16px 0', opacity: 0.8, fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Upload your resume to auto-fill most fields instantly
                    </p>
                    <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'var(--primary-color)',
                        color: '#ffffff',
                        borderRadius: '8px',
                        cursor: isParsingResume ? 'wait' : 'pointer',
                        opacity: isParsingResume ? 0.7 : 1,
                        fontWeight: 600,
                    }}>
                        {isParsingResume ? (
                            <>Parsing Resume...</>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="12" y1="18" x2="12" y2="12"></line>
                                    <line x1="9" y1="15" x2="15" y2="15"></line>
                                </svg>
                                Upload PDF Resume
                            </>
                        )}
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={onResumeUpload}
                            disabled={isParsingResume}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <p style={{ margin: '12px 0 0 0', fontSize: '12px', opacity: 0.6, color: 'var(--text-secondary)' }}>
                        Or fill in the fields manually below
                    </p>
                </div>
            )}

            {resumeParseSuccess && (
                <div style={{
                    background: 'rgba(var(--primary-rgb), 0.1)',
                    border: '1px solid var(--primary-color)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-primary)'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Resume parsed! Fields have been auto-filled. Review and edit as needed.</span>
                </div>
            )}

            <div className="form-row">
                <div className="form-group">
                    <label>First Name *</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={onChange}
                        placeholder="John"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Last Name *</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={onChange}
                        placeholder="Doe"
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Phone Number *</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={onChange}
                    placeholder="(555) 123-4567"
                    required
                />
            </div>

            <div className="form-group">
                <label>LinkedIn Profile *</label>
                <input
                    type="url"
                    name="linkedInUrl"
                    value={formData.linkedInUrl}
                    onChange={onChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>GitHub Profile</label>
                    <input
                        type="url"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={onChange}
                        placeholder="https://github.com/username"
                    />
                </div>
                <div className="form-group">
                    <label>Portfolio Website</label>
                    <input
                        type="url"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={onChange}
                        placeholder="https://yourportfolio.com"
                    />
                </div>
            </div>
        </div>
    );
};

export default BasicInfoStep;
