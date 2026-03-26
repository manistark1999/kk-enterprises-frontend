import React from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionGuardProps {
  module: string;
  action?: 'view' | 'create' | 'edit' | 'delete' | 'print' | 'export';
  children: React.ReactNode;
  /** If true, show an "Access Denied" panel instead of redirecting */
  inline?: boolean;
  fallbackPath?: string;
  isDarkMode?: boolean;
}

/**
 * PermissionGuard — Route-level RBAC protection.
 * When inline=false (default) it redirects to dashboard if access denied.
 * When inline=true it renders an "Access Denied" card inside the layout.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  action = 'view',
  children,
  inline = false,
  fallbackPath = '/dashboard',
  isDarkMode = false,
}) => {
  const { hasPermission, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  const permitted = hasPermission(module, action);

  if (!permitted) {
    if (inline) {
      return (
        <div className={`flex-1 flex items-center justify-center min-h-[60vh] ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
          <div className={`text-center p-16 rounded-3xl border max-w-md mx-auto ${
            isDarkMode ? 'bg-gray-900 border-red-500/20' : 'bg-white border-red-100 shadow-2xl shadow-red-500/5'
          }`}>
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            <h2 className={`text-2xl font-black tracking-tight mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Access Denied
            </h2>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              You don't have <span className="font-bold text-red-500">{action}</span> permission for{' '}
              <span className="font-bold">{module}</span>.
            </p>
            <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Contact your administrator to grant access.
            </p>
          </div>
        </div>
      );
    }

    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
