import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage/ApplicationsPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import OnboardingPage from './pages/OnboardingPage/OnboardingPage';
import JobsPage from './pages/JobsPage/JobsPage';
import ResumePage from './pages/ResumePage/ResumePage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  // Hide navbar on onboarding page, dashboard (has own sidebar), settings, auto-apply, jobs, resume, and homepage
  // Navbar removed as per cleanup

  return (
    <div className={`app-root ${theme}`} data-theme={theme}>
      <main className="app-main" data-authenticated={isAuthenticated && location.pathname !== '/' && location.pathname !== '/index.html'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/resume" element={<ResumePage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
