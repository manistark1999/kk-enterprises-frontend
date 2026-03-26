import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useNotifications } from './NotificationContext';
import { api, endpoints } from '@/services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ModulePermission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_print: boolean;
  can_export: boolean;
}

interface User {
  username: string;
  email: string;
  role?: string;
  id?: string | number;
  must_change_password?: boolean;
  permissions?: ModulePermission[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  /**
   * Check if the current user has a specific action on a module.
   * action defaults to 'view'. super_admin always returns true.
   */
  hasPermission: (module: string, action?: 'view' | 'create' | 'edit' | 'delete' | 'print' | 'export') => boolean;
  canView:   (module: string) => boolean;
  canCreate: (module: string) => boolean;
  canEdit:   (module: string) => boolean;
  canDelete: (module: string) => boolean;
  canPrint:  (module: string) => boolean;
  canExport: (module: string) => boolean;
  refreshPermissions: () => Promise<void>;
  permissions: ModulePermission[];
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY    = 'kk_auth_token';
const USER_DATA_KEY     = 'kk_user_data';
const SESSION_EXPIRY_KEY = 'kk_session_expiry';
const SESSION_DURATION  = 24 * 60 * 60 * 1000; // 24 h

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const { addNotification } = useNotifications();

  // ── Helpers ────────────────────────────────────────────────────────────────

  const clearAuthData = () => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(USER_DATA_KEY);
      sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    } catch {}
  };

  // ── Fetch live permissions from backend ────────────────────────────────────
  const fetchLivePermissions = useCallback(async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return;
      const res = await api.get('/user-permissions/me');
      if (res.success) {
        const data: ModulePermission[] = res.data?.data || res.data || [];
        setPermissions(data);
        // Also update cached user data
        const stored = localStorage.getItem(USER_DATA_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.livePermissions = data;
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(parsed));
        }
      }
    } catch {}
  }, []);

  // ── Session check ──────────────────────────────────────────────────────────
  const checkExistingSession = useCallback(async () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const userData = localStorage.getItem(USER_DATA_KEY);
      const sessionExpiry = localStorage.getItem(SESSION_EXPIRY_KEY);

      if (token && userData && sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry, 10);
        if (Date.now() < expiryTime) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          // Load live permissions in background
          await fetchLivePermissions();
        } else {
          clearAuthData();
        }
      }
    } catch {
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  }, [fetchLivePermissions]);

  useEffect(() => {
    checkExistingSession();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post(endpoints.auth.login, { email, password });

      if (!response.success) throw new Error(response.message || 'Login failed');

      const { user: userData, token } = response.data;
      const expiryTime = Date.now() + SESSION_DURATION;

      localStorage.setItem(AUTH_TOKEN_KEY, token || `dummy_token_${Date.now()}`);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());

      setUser(userData);
      setIsAuthenticated(true);

      // Immediately fetch live permissions
      await fetchLivePermissions();

      addNotification('Login', 'System Access', 'User Session', `Logged in as ${userData.username || userData.email}`);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    try {
      if (user) addNotification('Logout', 'System Access', 'User Session', `Logged out: ${user.username || user.email}`);
      clearAuthData();
      setIsAuthenticated(false);
      setUser(null);
      setPermissions([]);
    } catch {
      clearAuthData();
      setIsAuthenticated(false);
      setUser(null);
      setPermissions([]);
    }
  };

  // ── Session expiry watcher ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    const id = setInterval(() => {
      const exp = localStorage.getItem(SESSION_EXPIRY_KEY);
      if (exp && Date.now() >= parseInt(exp, 10)) logout();
    }, 60_000);
    return () => clearInterval(id);
  }, [isAuthenticated]);

  // ── Refresh permissions (call from admin UI after saving) ──────────────────
  const refreshPermissions = useCallback(async () => {
    await fetchLivePermissions();
  }, [fetchLivePermissions]);

  // ── Permission checker ─────────────────────────────────────────────────────
  const hasPermission = useCallback(
    (moduleName: string, action: 'view' | 'create' | 'edit' | 'delete' | 'print' | 'export' = 'view'): boolean => {
      if (!user) return false;

      // 1. Check permissions set (live overrides in memory OR role defaults from user object)
      const perms = permissions.length > 0 ? permissions : (user.permissions as ModulePermission[] || []);
      
      if (Array.isArray(perms) && perms.length > 0) {
        // Find module (case-insensitive)
        const moduleSpec = perms.find(
          p => p.module && p.module.toLowerCase() === moduleName.toLowerCase()
        );

        if (moduleSpec) {
          // Normalize key check (can_view vs view)
          const hasIt = !!(moduleSpec[`can_${action}` as keyof ModulePermission] ?? (moduleSpec as any)[action]);
          return hasIt;
        }
      }

      // 2. super_admin fallback (only if no explicit module rule was found)
      if (user.role === 'super_admin' || user.role === 'admin' || user.email === 'admin@kkenterprises.com') {
        return true;
      }

      return false;
    },
    [user, permissions]
  );

  // ── Convenience Helpers ───────────────────────────────────────────────────
  const { canView, canCreate, canEdit, canDelete, canPrint, canExport } = useMemo(() => ({
    canView:   (module: string) => hasPermission(module, 'view'),
    canCreate: (module: string) => hasPermission(module, 'create'),
    canEdit:   (module: string) => hasPermission(module, 'edit'),
    canDelete: (module: string) => hasPermission(module, 'delete'),
    canPrint:  (module: string) => hasPermission(module, 'print'),
    canExport: (module: string) => hasPermission(module, 'export')
  }), [hasPermission]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated, user, login, logout, isLoading,
      hasPermission, refreshPermissions, permissions,
      canView, canCreate, canEdit, canDelete, canPrint, canExport
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function isUserAuthenticated(): boolean {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const sessionExpiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (!token || !sessionExpiry) return false;
  return Date.now() < parseInt(sessionExpiry, 10);
}
