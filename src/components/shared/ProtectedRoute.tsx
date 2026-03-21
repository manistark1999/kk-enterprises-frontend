import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LottieLoadingScreen } from '@/components/shared/LottieLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isDarkMode?: boolean;
}

export function ProtectedRoute({ children, isDarkMode = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LottieLoadingScreen isDarkMode={isDarkMode} message="Verifying session" />;
  }

  if (!isAuthenticated) {
    // Redirect to signin if not authenticated, storing the target location
    console.log('[ProtectedRoute] Access denied. Redirecting to /signin');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
