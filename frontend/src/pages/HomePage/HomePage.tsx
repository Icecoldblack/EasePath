import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const HomePage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = () => {
    login();
    navigate('/dashboard');
  };

  const handleError = () => {
    console.error('Login Failed');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">EasePath</div>
        <h2>Welcome</h2>
        <p>Use your Google account to continue.</p>
        <div className="google-login-container">
          <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
