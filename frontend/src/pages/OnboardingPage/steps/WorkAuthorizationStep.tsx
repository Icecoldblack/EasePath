import React from 'react';
import { StepProps } from './types';

const WorkAuthorizationStep: React.FC<StepProps> = ({ formData, onChange }) => {
    return (
        <div className="onboarding-step">
            <h2> Work Authorization *</h2>
            <p className="step-description">Many applications ask about your eligibility to work.</p>

            <div className="form-group checkbox-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="isUsCitizen"
                        checked={formData.isUsCitizen}
                        onChange={onChange}
                    />
                    <span>
                        I am a U.S. Citizen{' '}
                        <span className={`check-pill ${formData.isUsCitizen ? 'on' : ''}`}>
                            {formData.isUsCitizen ? '✓' : 'X'}
                        </span>
                    </span>
                </label>
            </div>

            {!formData.isUsCitizen && (
                <>
                    <div className="form-group">
                        <label>Work Authorization Status</label>
                        <select name="workAuthorization" value={formData.workAuthorization} onChange={onChange}>
                            <option value="">Select...</option>

                            <optgroup label="Permanent Authorization">
                                <option value="Green Card">Green Card / Permanent Resident</option>
                                <option value="Asylee/Refugee">Asylee / Refugee</option>
                            </optgroup>

                            <optgroup label="Work Visas">
                                <option value="H1B">H-1B Visa</option>
                                <option value="H1B1">H-1B1 Visa (Chile/Singapore)</option>
                                <option value="H4 EAD">H-4 EAD (H-4 with Work Authorization)</option>
                                <option value="L1">L-1 Visa (Intracompany Transfer)</option>
                                <option value="L2 EAD">L-2 EAD (L-2 with Work Authorization)</option>
                                <option value="O1">O-1 Visa (Extraordinary Ability)</option>
                                <option value="TN">TN Visa (USMCA/NAFTA)</option>
                                <option value="E1">E-1 Visa (Treaty Trader)</option>
                                <option value="E2">E-2 Visa (Treaty Investor)</option>
                                <option value="E3">E-3 Visa (Australian Specialty)</option>
                            </optgroup>

                            <optgroup label="Student/Training Visas">
                                <option value="F1 OPT">F-1 OPT (Optional Practical Training)</option>
                                <option value="F1 STEM OPT">F-1 STEM OPT Extension</option>
                                <option value="F1 CPT">F-1 CPT (Curricular Practical Training)</option>
                                <option value="J1">J-1 Visa (Exchange Visitor)</option>
                                <option value="J1 Academic Training">J-1 Academic Training</option>
                                <option value="M1">M-1 Visa (Vocational Student)</option>
                            </optgroup>

                            <optgroup label="Other">
                                <option value="EAD">EAD (Employment Authorization Document)</option>
                                <option value="Pending Adjustment">Pending Adjustment of Status</option>
                                <option value="DACA">DACA</option>
                                <option value="TPS">TPS (Temporary Protected Status)</option>
                                <option value="Other">Other Work Authorization</option>
                                <option value="None">No Current Authorization</option>
                            </optgroup>
                        </select>
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="requiresSponsorship"
                                checked={formData.requiresSponsorship}
                                onChange={onChange}
                            />
                            <span>
                                I will require visa sponsorship now or in the future{' '}
                                <span className={`check-pill ${formData.requiresSponsorship ? 'on' : ''}`}>
                                    {formData.requiresSponsorship ? '✓' : 'X'}
                                </span>
                            </span>
                        </label>
                    </div>
                </>
            )}
        </div>
    );
};

export default WorkAuthorizationStep;
