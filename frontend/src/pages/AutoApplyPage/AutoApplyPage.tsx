import React, { useState } from 'react';
import './AutoApplyPage.css';

const AutoApplyPage: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('Software Engineering Intern');
  const [jobBoardUrl, setJobBoardUrl] = useState('');
  const [applicationCount, setApplicationCount] = useState(5);
  const [resumeSummary, setResumeSummary] = useState('');
  const [preferredCompanies, setPreferredCompanies] = useState('');
  const [jobPreference, setJobPreference] = useState('full-time');
  const [salaryRange, setSalaryRange] = useState('$70k - $90k');
  const [lookingForInternships, setLookingForInternships] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeFileData, setResumeFileData] = useState('');
  const [resumeError, setResumeError] = useState('');

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setResumeFileName('');
      setResumeFileData('');
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setResumeError('Please upload a PDF or Word document (.pdf, .doc, .docx).');
      setResumeFileName('');
      setResumeFileData('');
      return;
    }

    setResumeError('');
    setResumeFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.split(',')[1] ?? '';
        setResumeFileData(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const preferredCompaniesList = preferredCompanies
      .split(',')
      .map((company) => company.trim())
      .filter(Boolean);

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle,
          jobBoardUrl,
          applicationCount,
          resumeSummary,
          resumeFileName,
          resumeFileData,
          preferredCompanies: preferredCompaniesList,
          jobPreference,
          salaryRange,
          lookingForInternships,
        }),
      });

      if (response.ok) {
        console.log('Job application process started successfully.');
        // You might want to show a success message to the user
      } else {
        console.error('Failed to start job application process.');
        // You might want to show an error message to the user
      }
    } catch (error) {
      console.error('Error communicating with the backend:', error);
    }
  };

  return (
    <div className="auto-apply-page">
      <section className="auto-apply-card">
        <h2>Auto Job Applicator</h2>
        <form className="auto-apply-form" onSubmit={handleSubmit}>
        <label>
          Job Title / Keywords
          <input
            type="text"
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
          />
        </label>
        <label>
          Job Board URL
          <input
            type="text"
            value={jobBoardUrl}
            onChange={(event) => setJobBoardUrl(event.target.value)}
            placeholder="e.g., https://www.linkedin.com/jobs"
          />
        </label>
        <label>
          Number of Applications
          <input
            type="number"
            value={applicationCount}
            onChange={(event) => setApplicationCount(parseInt(event.target.value, 10))}
            min="1"
          />
        </label>
        <label>
          Resume Summary / Highlights
          <textarea
            value={resumeSummary}
            onChange={(event) => setResumeSummary(event.target.value)}
            placeholder="Paste your resume summary or upload in the future"
            rows={4}
          />
        </label>
          <label>
            Upload Resume (PDF or Word)
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleResumeUpload}
            />
            {resumeFileName && <span className="file-hint">Selected: {resumeFileName}</span>}
            {resumeError && <span className="file-error">{resumeError}</span>}
          </label>
        <label>
          Preferred Companies (comma separated)
          <input
            type="text"
            value={preferredCompanies}
            onChange={(event) => setPreferredCompanies(event.target.value)}
            placeholder="e.g., Google, Microsoft, Stripe"
          />
        </label>
        <label>
          Job Preference
          <select value={jobPreference} onChange={(event) => setJobPreference(event.target.value)}>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
            <option value="internship">Internship</option>
          </select>
        </label>
        <label>
          Target Salary Range
          <input
            type="text"
            value={salaryRange}
            onChange={(event) => setSalaryRange(event.target.value)}
            placeholder="$70k - $90k"
          />
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={lookingForInternships}
            onChange={(event) => setLookingForInternships(event.target.checked)}
          />
          Also include internship opportunities
        </label>
        <button type="submit">Start Applying</button>
        </form>
      </section>
    </div>
  );
};

export default AutoApplyPage;

