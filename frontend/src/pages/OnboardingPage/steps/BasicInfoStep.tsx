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
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                    border: '2px dashed rgba(99, 102, 241, 0.4)',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--primary)' }}>⚡ Quick Fill from Resume</h3>
                    <p style={{ margin: '0 0 16px 0', opacity: 0.8, fontSize: '14px' }}>
                        Upload your resume to auto-fill most fields instantly
                    </p>
                    <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: isParsingResume ? 'wait' : 'pointer',
                        opacity: isParsingResume ? 0.7 : 1,
                    }}>
                        {isParsingResume ? (
                            <>Parsing Resume...</>
                        ) : (
                            <>📄 Upload PDF Resume</>
                        )}
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={onResumeUpload}
                            disabled={isParsingResume}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <p style={{ margin: '12px 0 0 0', fontSize: '12px', opacity: 0.6 }}>
                        Or fill in the fields manually below
                    </p>
                </div>
            )}

            {resumeParseSuccess && (
                <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{ fontSize: '20px' }}>✅</span>
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
