import React from 'react';
import { StepProps } from './types';

const EEOInfoStep: React.FC<StepProps> = ({ formData, onChange }) => {
    return (
        <div className="onboarding-step">
            <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Optional Information
            </h2>
            <p className="step-description">
                Many applications ask these for Equal Employment Opportunity reporting.
                All fields are optional and you can choose "Prefer not to say".
            </p>

            <div className="form-group">
                <label>Veteran Status</label>
                <select name="veteranStatus" value={formData.veteranStatus} onChange={onChange}>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Yes">Yes, I am a veteran</option>
                    <option value="No">No, I am not a veteran</option>
                </select>
            </div>

            <div className="form-group">
                <label>Disability Status</label>
                <select name="disabilityStatus" value={formData.disabilityStatus} onChange={onChange}>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Yes">Yes, I have a disability</option>
                    <option value="No">No, I don't have a disability</option>
                </select>
            </div>

            <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={onChange}>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="form-group">
                <label>Race / Ethnicity</label>
                <select name="ethnicity" value={formData.ethnicity} onChange={onChange}>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="American Indian or Alaska Native">American Indian or Alaska Native</option>
                    <option value="Asian">Asian</option>
                    <option value="Black or African American">Black or African American</option>
                    <option value="Hispanic or Latino">Hispanic or Latino</option>
                    <option value="Native Hawaiian or Other Pacific Islander">Native Hawaiian or Other Pacific Islander</option>
                    <option value="White">White</option>
                    <option value="Two or More Races">Two or More Races</option>
                </select>
            </div>

            <div className="form-group">
                <label>Do you identify as LGBTQ+?</label>
                <select name="lgbtqIdentity" value={formData.lgbtqIdentity} onChange={onChange}>
                    <option value="Prefer not to say">I don't wish to answer</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>
        </div>
    );
};

export default EEOInfoStep;
