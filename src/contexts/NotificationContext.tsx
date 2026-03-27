import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Notification Types
export type NotificationAction = 'Created' | 'Edited' | 'Deleted' | 'Login' | 'Logout' | 'Updated' | 'Added' | 'Removed' | 'Downloaded' | 'Printed' | 'Saved';

export interface Notification {
  id: string;
  action: NotificationAction;
  itemName: string;
  itemType: string; // e.g., "Labour Bill", "Stock Item", "Customer", etc.
  userName: string;
  timestamp: string; // ISO string
  isRead: boolean;
  description?: string;
  // Financial data
  totalAmount?: number;
  amount?: number;
  gstPercent?: number;
  rate?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    action: NotificationAction,
    itemName: string,
    itemType: string,
    description?: string,
    financialData?: {
      totalAmount?: number;
      amount?: number;
      gstPercent?: number;
      rate?: number;
    }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'kk_enterprises_notifications';
const MAX_NOTIFICATIONS = 100; // Keep only the latest 100 notifications

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        } else {
          setNotifications([]);
        }
      }
    } catch (error) {
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
    }
  }, [notifications]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Add a new notification
  const addNotification = (
    action: NotificationAction,
    itemName: string,
    itemType: string,
    description?: string,
    financialData?: {
      totalAmount?: number;
      amount?: number;
      gstPercent?: number;
      rate?: number;
    }
  ) => {
    // Read latest user from localStorage directly to avoid provider order stale issues
    let currentUserName = 'Admin';
    try {
      const userData = localStorage.getItem('kk_user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        currentUserName = parsed.username || parsed.email?.split('@')[0] || 'Admin';
      }
    } catch (e) {}

    const newNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      itemName,
      itemType,
      userName: currentUserName,
      timestamp: new Date().toISOString(),
      isRead: false,
      description,
      totalAmount: financialData?.totalAmount,
      amount: financialData?.amount,
      gstPercent: financialData?.gstPercent,
      rate: financialData?.rate,
    };

    setNotifications(prev => {
      // Add new notification at the beginning
      const updated = [newNotification, ...prev];
      // Keep only the latest MAX_NOTIFICATIONS
      return updated.slice(0, MAX_NOTIFICATIONS);
    });
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  // Delete a single notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Helper function to get action color
export const getActionColor = (action: NotificationAction, isDarkMode: boolean): string => {
  const colors = {
    Created: isDarkMode ? 'text-green-400' : 'text-green-600',
    Added: isDarkMode ? 'text-green-400' : 'text-green-600',
    Edited: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    Updated: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    Deleted: isDarkMode ? 'text-red-400' : 'text-red-600',
    Removed: isDarkMode ? 'text-red-400' : 'text-red-600',
    Login: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    Logout: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    Downloaded: isDarkMode ? 'text-purple-400' : 'text-purple-600',
    Printed: isDarkMode ? 'text-orange-400' : 'text-orange-600',
    Saved: isDarkMode ? 'text-green-400' : 'text-green-600',
  };
  return colors[action] || (isDarkMode ? 'text-gray-400' : 'text-gray-600');
};

// Helper function to get action icon
export const getActionIcon = (action: NotificationAction): string => {
  const icons = {
    Created: '✓',
    Added: '✓',
    Edited: '✎',
    Updated: '✎',
    Deleted: '✕',
    Removed: '✕',
    Login: '→',
    Logout: '←',
    Downloaded: '↓',
    Printed: '⎙',
    Saved: '💾',
  };
  return icons[action] || '•';
};

// Helper function to format relative time
export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const notifTime = new Date(timestamp);
  const diffMs = now.getTime() - notifTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  // Format as date for older notifications
  return notifTime.toLocaleDateString('en-IN', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};