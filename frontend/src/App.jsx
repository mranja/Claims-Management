import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

// Patient Portal Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import SubmitClaimPage from './pages/patient/SubmitClaimPage';
import PatientClaimDetailPage from './pages/patient/PatientClaimDetailPage';
import PatientDocumentCenter from './pages/patient/PatientDocumentCenter';
import PatientNotificationsPage from './pages/patient/PatientNotificationsPage';
import PatientHelpSupportPage from './pages/patient/PatientHelpSupportPage';

// Insurer Portal Pages
import InsurerDashboard from './pages/insurer/InsurerDashboard';
import InsurerAllClaimsPage from './pages/insurer/InsurerAllClaimsPage';
import ClaimDetailPage from './pages/insurer/ClaimDetailPage';
import InsurerHighRiskQueuePage from './pages/insurer/InsurerHighRiskQueuePage';
import InsurerPatientDirectoryPage from './pages/insurer/InsurerPatientDirectoryPage';
import InsurerAiInsightsPage from './pages/insurer/InsurerAiInsightsPage';
import InsurerPolicyKnowledgePage from './pages/insurer/InsurerPolicyKnowledgePage';
import InsurerDocumentCenterPage from './pages/insurer/InsurerDocumentCenterPage';
import InsurerClaimComparisonPage from './pages/insurer/InsurerClaimComparisonPage';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <div className="w-7 h-7 border-2 border-[#006d77] border-t-transparent rounded-full animate-spin" />
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

          {/* Shared Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['patient', 'insurer', 'admin']}>
                <ProfileSettingsPage />
              </ProtectedRoute>
            }
          />

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
          <Route
            path="/patient/claims/:id"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientClaimDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/documents"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDocumentCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/notifications"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientNotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/support"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientHelpSupportPage />
              </ProtectedRoute>
            }
          />

          {/* Insurer Portal */}
          <Route
            path="/insurer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['insurer', 'admin']}>
                <InsurerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insurer/claims"
            element={
              <ProtectedRoute allowedRoles={['insurer', 'admin']}>
                <InsurerAllClaimsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insurer/claims/:id"
            element={
              <ProtectedRoute allowedRoles={['insurer', 'admin']}>
                <ClaimDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insurer/high-risk"
            element={
              <ProtectedRoute allowedRoles={['insurer', 'admin']}>
                <InsurerHighRiskQueuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insurer/patients"
            element={
              <ProtectedRoute allowedRoles={['insurer', 'admin']}>
                <InsurerPatientDirectoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insurer/ai-insights"
            element={
              <ProtectedRoute allowedRoles={['insurer', 'admin']}>
                <InsurerAiInsightsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insurer/policies"
            element={
              <ProtectedRoute allowedRoles={['insurer', 'admin']}>
                <InsurerPolicyKnowledgePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insurer/documents"
            element={
              <ProtectedRoute allowedRoles={['insurer', 'admin']}>
                <InsurerDocumentCenterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insurer/compare"
            element={
              <ProtectedRoute allowedRoles={['insurer', 'admin']}>
                <InsurerClaimComparisonPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
