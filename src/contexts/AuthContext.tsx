import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from './NotificationContext';
import { api, endpoints } from '@/services/api';

// Auth types
interface User {
  username: string;
  email: string;
  role?: string;
  id?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const AUTH_TOKEN_KEY = 'kk_auth_token';
const USER_DATA_KEY = 'kk_user_data';
const SESSION_EXPIRY_KEY = 'kk_session_expiry';

// Session duration (24 hours in milliseconds)
const SESSION_DURATION = 24 * 60 * 60 * 1000;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotifications();

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Check if there's a valid existing session
  const checkExistingSession = () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const userData = localStorage.getItem(USER_DATA_KEY);
      const sessionExpiry = localStorage.getItem(SESSION_EXPIRY_KEY);

      // Check if session exists and hasn't expired
      if (token && userData && sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry, 10);
        const now = Date.now();

        if (now < expiryTime) {
          // Session is still valid
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('[Auth] Valid session found, user authenticated');
        } else {
          // Session expired
          console.log('[Auth] Session expired, clearing storage');
          clearAuthData();
        }
      } else {
        console.log('[Auth] No valid session found');
      }
    } catch (error) {
      console.error('[Auth] Error checking session:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await api.post(endpoints.auth.login, {
        email,
        password
      });

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      const { user: userData, token } = response.data;

      // Calculate session expiry
      const expiryTime = Date.now() + SESSION_DURATION;

      // Store authentication data
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        // Fallback for demo if no token returned
        localStorage.setItem(AUTH_TOKEN_KEY, `dummy_token_${Date.now()}`);
      }
      
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      // Add login notification
      addNotification(
        'Login',
        'System Access',
        'User Session',
        `Logged in as ${userData.username || userData.name}`
      );

      console.log('[Auth] Login successful:', userData.username || userData.name);
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function - PROPER CLEANUP
  const logout = () => {
    try {
      console.log('[Auth] Logging out user:', user?.username);

      // Add logout notification BEFORE clearing user data
      if (user) {
        addNotification(
          'Logout',
          'System Access',
          'User Session',
          `Logged out: ${user.username}`
        );
      }

      // Clear all authentication data
      clearAuthData();

      // Update state
      setIsAuthenticated(false);
      setUser(null);

      console.log('[Auth] Logout complete');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      // Force clear even if there's an error
      clearAuthData();
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Clear all authentication data from storage
  const clearAuthData = () => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
      
      // Also clear session storage (if you use it)
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(USER_DATA_KEY);
      sessionStorage.removeItem(SESSION_EXPIRY_KEY);
      
      console.log('[Auth] Authentication data cleared');
    } catch (error) {
      console.error('[Auth] Error clearing auth data:', error);
    }
  };

  // Auto-logout when session expires
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSessionExpiry = () => {
      const sessionExpiry = localStorage.getItem(SESSION_EXPIRY_KEY);
      if (sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry, 10);
        const now = Date.now();

        if (now >= expiryTime) {
          console.log('[Auth] Session expired, auto-logout');
          logout();
        }
      }
    };

    // Check every minute
    const intervalId = setInterval(checkSessionExpiry, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Utility function to get auth token (for API calls)
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

// Utility function to check if user is authenticated
export function isUserAuthenticated(): boolean {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const sessionExpiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  
  if (!token || !sessionExpiry) return false;
  
  const expiryTime = parseInt(sessionExpiry, 10);
  const now = Date.now();
  
  return now < expiryTime;
}
