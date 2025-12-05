import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [currentResume, setCurrentResume] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.email) {
      fetchProfile();
    }
  }, [user?.email]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/extension/profile?email=${encodeURIComponent(user?.email || '')}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        if (data.resumeFileName) {
          setCurrentResume(data.resumeFileName);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Please upload a PDF or Word document.' });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB.' });
        return;
      }
      setResumeFile(file);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!resumeFile || !user?.email) return;
    
    setUploading(true);
    setMessage(null);
    
    try {
      const formData = new FormData();
      formData.append('file', resumeFile);
      formData.append('email', user.email);
      
      const response = await fetch('http://localhost:8080/api/resume/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentResume(resumeFile.name);
        setResumeFile(null);
        setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        let errorMessage = 'Failed to upload resume.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If not JSON, try text
          errorMessage = await response.text() || errorMessage;
        }
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload resume. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Please upload a PDF or Word document.' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB.' });
        return;
      }
      setResumeFile(file);
      setMessage(null);
    }
  };

  return (
    <div className="settings-page">
      {/* Account Section */}
      <section className="settings-card">
        <header className="settings-header">
          <div>
            <p className="settings-eyebrow">Account</p>
            <h1>Settings</h1>
            <p>Manage your EasePath account and preferences.</p>
          </div>
          {user?.email && <span className="settings-email">{user.email}</span>}
        </header>
      </section>

      {/* Resume Section */}
      <section className="settings-card">
        <header className="settings-header">
          <div>
            <p className="settings-eyebrow">Resume</p>
            <h2>Your Resume</h2>
            <p>Upload your resume to use with job applications.</p>
          </div>
        </header>
        
        <div className="resume-section">
          {currentResume && (
            <div className="current-resume">
              <div className="resume-icon">📄</div>
              <div className="resume-info">
                <span className="resume-name">{currentResume}</span>
                <span className="resume-status">Current resume</span>
              </div>
            </div>
          )}
          
          <div 
            className={`upload-zone ${resumeFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {resumeFile ? (
              <>
                <div className="upload-icon">✓</div>
                <p className="upload-text">{resumeFile.name}</p>
                <p className="upload-hint">Click to change file</p>
              </>
            ) : (
              <>
                <div className="upload-icon">📤</div>
                <p className="upload-text">
                  {currentResume ? 'Upload a new resume' : 'Drag & drop your resume here'}
                </p>
                <p className="upload-hint">or click to browse (PDF, DOC, DOCX - Max 5MB)</p>
              </>
            )}
          </div>
          
          {resumeFile && (
            <button 
              className="upload-btn" 
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          )}
          
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>
      </section>

      {/* Profile Section */}
      <section className="settings-card">
        <header className="settings-header">
          <div>
            <p className="settings-eyebrow">Profile</p>
            <h2>Edit Profile</h2>
            <p>Update your personal information used for autofill.</p>
          </div>
        </header>
        <div className="settings-actions">
          <button type="button" onClick={() => navigate('/onboarding')} className="secondary-btn">
            Update Profile Information
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="settings-card danger">
        <header className="settings-header">
          <div>
            <p className="settings-eyebrow">Danger Zone</p>
            <h2>Sign Out</h2>
            <p>Sign out of your EasePath account.</p>
          </div>
        </header>
        <div className="settings-actions">
          <button type="button" onClick={handleSignOut} className="danger-btn">
            Sign out and return to login
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
