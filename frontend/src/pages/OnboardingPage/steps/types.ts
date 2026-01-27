import React from 'react';

export interface OnboardingData {
    // Basic Info
    firstName: string;
    lastName: string;
    phone: string;

    // Professional Links
    linkedInUrl: string;
    githubUrl: string;
    portfolioUrl: string;

    // Location
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;

    // Work Authorization
    isUsCitizen: boolean;
    workAuthorization: string;
    requiresSponsorship: boolean;
    hasWorkVisa: boolean;
    visaType: string;

    // Job Preferences
    desiredJobTitle: string;
    desiredSalary: string;
    yearsOfExperience: string;
    willingToRelocate: boolean;
    preferredLocations: string;
    availableStartDate: string;

    // Education
    highestDegree: string;
    university: string;
    major: string;
    educationStartDate: string;
    educationEndDate: string;

    // EEO (Optional)
    veteranStatus: string;
    disabilityStatus: string;
    gender: string;
    ethnicity: string;
    lgbtqIdentity: string;

    // Work Experience
    workExperience: WorkExperience[];
}

export interface WorkExperience {
    company: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
    location: string;
}

export interface StepProps {
    formData: OnboardingData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}
