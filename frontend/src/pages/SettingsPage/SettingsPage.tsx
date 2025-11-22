import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="settings-page">
      <section className="settings-card">
        <header className="settings-header">
          <div>
            <p className="settings-eyebrow">Account</p>
            <h1>Settings</h1>
            <p>Manage your EasePath account and authentication.</p>
          </div>
          {user?.email && <span className="settings-email">{user.email}</span>}
        </header>
        <div className="settings-actions">
          <button type="button" onClick={handleSignOut}>
            Sign out and return to login
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
