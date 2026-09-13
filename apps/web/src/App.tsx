import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { AnnouncerProvider } from './components/Announcer';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { LandingPage } from './features/landing/LandingPage';
import { AuthPage } from './features/auth/AuthPage';
import { DashboardPage } from './app/DashboardPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AnnouncerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AnnouncerProvider>
    </AuthProvider>
  );
};

export default App;
