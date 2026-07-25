import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import SubmitClaimPage from './pages/patient/SubmitClaimPage';
import InsurerDashboard from './pages/insurer/InsurerDashboard';
import ClaimDetailPage from './pages/insurer/ClaimDetailPage';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <div className="w-7 h-7 border-2 border-[#005a60] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <LandingPage />;
  if (user?.role === 'patient') return <Navigate to="/patient/dashboard" replace />;
  if (user?.role === 'insurer') return <Navigate to="/insurer/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Patient Portal */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/submit"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <SubmitClaimPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['patient', 'insurer']}><ProfileSettingsPage /></ProtectedRoute>} />

          {/* Insurer Portal */}
          <Route
            path="/insurer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['insurer']}>
                <InsurerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insurer/claims/:id"
            element={
              <ProtectedRoute allowedRoles={['insurer']}>
                <ClaimDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Default + Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
