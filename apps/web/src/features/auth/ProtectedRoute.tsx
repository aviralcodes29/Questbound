import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping"></div>
          <div className="w-16 h-16 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-amber-400 border-l-transparent animate-spin"></div>
        </div>
        <p className="font-serif text-slate-300 text-lg tracking-wider animate-pulse">
          Entering Guild Hall...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
