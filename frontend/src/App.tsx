import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage/HomePage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import AutoApplyPage from './pages/AutoApplyPage/AutoApplyPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import OnboardingPage from './pages/OnboardingPage/OnboardingPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  // Hide navbar on onboarding page or if user hasn't completed onboarding
  const showNavbar = isAuthenticated && 
                     user?.onboardingCompleted && 
                     location.pathname !== '/onboarding';

  return (
    <div className="app-root">
      {showNavbar && <Navbar />}
      <main className="app-main" data-authenticated={isAuthenticated}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/auto-apply" element={<AutoApplyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

export default App;
