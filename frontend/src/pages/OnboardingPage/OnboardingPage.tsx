import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import {
  BasicInfoStep,
  LocationStep,
  WorkAuthorizationStep,
  WorkExperienceStep,
  JobPreferencesStep,
  EEOInfoStep,
  OnboardingData,
  WorkExperience,
} from './steps';
import './OnboardingPage.css';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeParseSuccess, setResumeParseSuccess] = useState(false);

  // Check if we're in edit mode (coming from settings)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('edit') === 'true') {
      setIsEditMode(true);
    }
  }, []);

  const [formData, setFormData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    phone: '',
    linkedInUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',

    isUsCitizen: false,
    workAuthorization: '',
    requiresSponsorship: false,
    hasWorkVisa: false,
    visaType: '',

    desiredJobTitle: '',
    desiredSalary: '',
    yearsOfExperience: '',
    willingToRelocate: false,
    preferredLocations: '',
    availableStartDate: '',

    highestDegree: '',
    university: '',
    major: '',
    educationStartDate: '',
    educationEndDate: '',

    veteranStatus: 'Prefer not to say',
    disabilityStatus: 'Prefer not to say',
    gender: 'Prefer not to say',
    ethnicity: 'Prefer not to say',
    lgbtqIdentity: 'Prefer not to say',

    workExperience: [],
  });

  const [editingJobIndex, setEditingJobIndex] = useState<number | null>(null);
  const [jobForm, setJobForm] = useState<WorkExperience>({
    company: '',
    jobTitle: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    location: ''
  });

  const totalSteps = 6;

  // Check if user already completed onboarding and load existing data
  useEffect(() => {
    const checkAndLoadProfile = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      // Check edit mode directly from URL to avoid race condition
      const urlParams = new URLSearchParams(window.location.search);
      const isEditing = urlParams.get('edit') === 'true';

      // For new users (not edit mode), show form immediately - no loading screen
      // This makes onboarding feel instant after login
      if (!isEditing) {
        setIsLoading(false);
      }

      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/api/extension/profile?email=${user.email}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const profile = await response.json();

          // If already completed AND not in edit mode, go to dashboard
          if (profile.onboardingCompleted && !isEditing) {
            navigate('/dashboard');
            return;
          }

          // Load existing data (for editing OR resuming incomplete onboarding)
          setFormData(prev => ({
            ...prev,
            firstName: profile.firstName || prev.firstName,
            lastName: profile.lastName || prev.lastName,
            phone: profile.phone || prev.phone,
            linkedInUrl: profile.linkedInUrl || prev.linkedInUrl,
            githubUrl: profile.githubUrl || prev.githubUrl,
            portfolioUrl: profile.portfolioUrl || prev.portfolioUrl,
            address: profile.address || prev.address,
            city: profile.city || prev.city,
            state: profile.state || prev.state,
            zipCode: profile.zipCode || prev.zipCode,
            country: profile.country || prev.country,
            isUsCitizen: profile.isUsCitizen !== undefined ? profile.isUsCitizen : prev.isUsCitizen,
            workAuthorization: profile.workAuthorization || prev.workAuthorization,
            requiresSponsorship: profile.requiresSponsorship !== undefined ? profile.requiresSponsorship : prev.requiresSponsorship,
            hasWorkVisa: profile.hasWorkVisa !== undefined ? profile.hasWorkVisa : prev.hasWorkVisa,
            visaType: profile.visaType || prev.visaType,
            willingToRelocate: profile.willingToRelocate !== undefined ? profile.willingToRelocate : prev.willingToRelocate,
            desiredJobTitle: profile.desiredJobTitle || prev.desiredJobTitle,
            desiredSalary: profile.desiredSalary || prev.desiredSalary,
            yearsOfExperience: profile.yearsOfExperience || prev.yearsOfExperience,
            preferredLocations: profile.preferredLocations || prev.preferredLocations,
            availableStartDate: profile.availableStartDate || prev.availableStartDate,
            highestDegree: profile.highestDegree || prev.highestDegree,
            university: profile.university || prev.university,
            major: profile.major || prev.major,
            educationStartDate: profile.educationStartDate || prev.educationStartDate,
            educationEndDate: profile.educationEndDate || prev.educationEndDate,
            veteranStatus: profile.veteranStatus || prev.veteranStatus,
            disabilityStatus: profile.disabilityStatus || prev.disabilityStatus,
            gender: profile.gender || prev.gender,
            ethnicity: profile.ethnicity || prev.ethnicity,
            lgbtqIdentity: profile.lgbtqIdentity || prev.lgbtqIdentity,
            workExperience: profile.workExperience || prev.workExperience || [],
          }));
        }
      } catch (err) {
        console.log('Could not load existing profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAndLoadProfile();
  }, [user?.email, navigate, updateUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    // Special behavior: if user checks "U.S. Citizen", clear visa-related fields
    if (name === 'isUsCitizen' && type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;

      setFormData(prev => ({
        ...prev,
        isUsCitizen: checked,
        ...(checked
          ? {
            workAuthorization: '',
            requiresSponsorship: false,
            hasWorkVisa: false,
            visaType: '',
          }
          : {}),
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Work Experience Helpers
  const handleJobChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setJobForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const saveJob = () => {
    if (!jobForm.company || !jobForm.jobTitle) return;

    if (editingJobIndex !== null) {
      // Update existing
      const updated = [...formData.workExperience];
      updated[editingJobIndex] = jobForm;
      setFormData(prev => ({ ...prev, workExperience: updated }));
      setEditingJobIndex(null);
    } else {
      // Add new
      setFormData(prev => ({
        ...prev,
        workExperience: [...prev.workExperience, jobForm]
      }));
    }

    // Reset form
    setJobForm({
      company: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      location: ''
    });
  };

  const editJob = (index: number) => {
    setJobForm(formData.workExperience[index]);
    setEditingJobIndex(index);
  };

  const deleteJob = (index: number) => {
    const updated = formData.workExperience.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, workExperience: updated }));
  };

  const cancelEdit = () => {
    setEditingJobIndex(null);
    setJobForm({
      company: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      location: ''
    });
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.linkedInUrl) {
          setError('Please fill in all required fields (*)');
          return false;
        }
        return true;
      case 2:
        if (!formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.country) {
          setError('Please fill in all required fields (*)');
          return false;
        }
        return true;
      case 3:
        if (!formData.isUsCitizen && !formData.workAuthorization) {
          setError('Please select your work authorization status');
          return false;
        }
        return true;
      case 4:
        if (jobForm.company || jobForm.jobTitle) {
          setError('Please save or cancel your current entry before continuing.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  const prevStep = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Resume parsing for autofill
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setIsParsingResume(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/resume/parse`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formDataUpload,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to parse resume');
      }

      const parsed = await response.json();

      // Auto-fill form fields with parsed data
      setFormData(prev => ({
        ...prev,
        firstName: parsed.firstName || prev.firstName,
        lastName: parsed.lastName || prev.lastName,
        phone: parsed.phone || prev.phone,
        linkedInUrl: parsed.linkedInUrl || prev.linkedInUrl,
        githubUrl: parsed.githubUrl || prev.githubUrl,
        portfolioUrl: parsed.portfolioUrl || prev.portfolioUrl,
        city: parsed.city || prev.city,
        state: parsed.state || prev.state,
        country: parsed.country || prev.country,
        highestDegree: parsed.highestDegree || prev.highestDegree,
        university: parsed.university || prev.university,
        major: parsed.major || prev.major,
        educationStartDate: parsed.educationStartDate || prev.educationStartDate,
        educationEndDate: parsed.educationEndDate || prev.educationEndDate,
        desiredJobTitle: parsed.desiredJobTitle || prev.desiredJobTitle,
        yearsOfExperience: parsed.yearsOfExperience || prev.yearsOfExperience,
        workExperience: parsed.workExperience?.length > 0
          ? parsed.workExperience.map((job: { company?: string; jobTitle?: string; startDate?: string; endDate?: string; isCurrent?: boolean; location?: string; description?: string }) => ({
            company: job.company || '',
            jobTitle: job.jobTitle || '',
            startDate: job.startDate || '',
            endDate: job.endDate || '',
            isCurrent: job.isCurrent || false,
            location: job.location || '',
            description: job.description || '',
          }))
          : prev.workExperience,
      }));

      setResumeParseSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse resume');
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/extension/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          email: user?.email,
          googleId: user?.googleId,
          onboardingCompleted: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to save profile');

      // Mark user as known for instant login next time
      if (user?.email) {
        localStorage.setItem(`user_known_${user.email}`, 'true');
      }

      updateUser({ onboardingCompleted: true });
      navigate(isEditMode ? '/settings' : '/dashboard');
    } catch (err) {
      setError('Failed to save your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            onChange={handleChange}
            isParsingResume={isParsingResume}
            resumeParseSuccess={resumeParseSuccess}
            onResumeUpload={handleResumeUpload}
          />
        );
      case 2:
        return <LocationStep formData={formData} onChange={handleChange} />;
      case 3:
        return <WorkAuthorizationStep formData={formData} onChange={handleChange} />;
      case 4:
        return (
          <WorkExperienceStep
            formData={formData}
            jobForm={jobForm}
            editingJobIndex={editingJobIndex}
            onJobChange={handleJobChange}
            onSaveJob={saveJob}
            onEditJob={editJob}
            onDeleteJob={deleteJob}
            onCancelEdit={cancelEdit}
          />
        );
      case 5:
        return <JobPreferencesStep formData={formData} onChange={handleChange} />;
      case 6:
        return <EEOInfoStep formData={formData} onChange={handleChange} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="onboarding-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">


        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <span className="progress-text">Step {currentStep} of {totalSteps}</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="step-content">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="button-group">
          {currentStep > 1 && (
            <button type="button" className="btn-secondary" onClick={prevStep}>
              ← Back
            </button>
          )}
          {currentStep < totalSteps ? (
            <button type="button" className="btn-primary" onClick={nextStep}>
              Continue →
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Complete Setup')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
