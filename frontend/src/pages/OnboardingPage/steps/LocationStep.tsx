import React from 'react';
import { StepProps } from './types';

const LocationStep: React.FC<StepProps> = ({ formData, onChange }) => {
    return (
        <div className="onboarding-step">
            <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
                Where are you located?
            </h2>
            <p className="step-description">Your location helps match you with relevant opportunities.</p>

            <div className="form-group">
                <label>Street Address *</label>
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={onChange}
                    placeholder="123 Main Street"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>City *</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={onChange}
                        placeholder="San Francisco"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>State *</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={onChange}
                        placeholder="CA"
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>ZIP Code *</label>
                    <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={onChange}
                        placeholder="94102"
                    />
                </div>
                <div className="form-group">
                    <label>Country *</label>
                    <select name="country" value={formData.country} onChange={onChange}>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default LocationStep;
