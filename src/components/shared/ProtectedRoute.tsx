import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LottieLoadingScreen } from '@/components/shared/LottieLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isDarkMode?: boolean;
}

export function ProtectedRoute({ children, isDarkMode = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LottieLoadingScreen isDarkMode={isDarkMode} message="Verifying session" />;
  }

  if (!isAuthenticated) {
    // Redirect to home (login) if not authenticated, storing the target location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Handle mandatory password change requirement
  if (user?.must_change_password && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
}
