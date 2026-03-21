import React, { useState } from 'react';
import { Bell, Search, Settings, ChevronDown, Calendar, User, LogOut, HelpCircle, Download, Database, Cloud, HardDrive, FileArchive, X, CheckCircle, Upload, FolderOpen, RefreshCw, LogIn, Package, Wrench, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationPanel } from '@/components/shared/NotificationPanel';

interface TopBarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  showBackupPanel: boolean;
  onCloseBackupPanel: () => void;
  showRestorePanel: boolean;
  onCloseRestorePanel: () => void;
}

export function TopBar({ isDarkMode, onToggleTheme, showBackupPanel, onCloseBackupPanel, showRestorePanel, onCloseRestorePanel }: TopBarProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState('2025-26');
  
  // Get notification count from context
  const { unreadCount } = useNotifications();
  
  // Get auth context
  const { logout, user } = useAuth();
  
  // Handle logout
  const handleLogout = () => {
    setShowUserDropdown(false); // Close dropdown first
    logout(); // Call logout from AuthContext
  };

  return (
    <div className={`h-16 border-b backdrop-blur-xl sticky top-0 z-50 ${
      isDarkMode 
        ? 'bg-gray-900/80 border-gray-800' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Side - Company Name */}
        <div className="flex items-center gap-4">
          <h1 className={`text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent`}>
            KK Enterprises
          </h1>
        </div>

        {/* Right Side - Financial Year, Notification Bell, User Profile */}
        <div className="flex items-center gap-4">
          {/* Financial Year Selector */}
          <div className="relative">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">FY {selectedFinancialYear}</span>
            </button>
          </div>

          {/* Divider */}
          <div className={`h-8 w-px ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`} />

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-lg border transition-all relative ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-5 h-5" />
              {/* Notification Badge - Only show if there are unread notifications */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel - New Component */}
            <NotificationPanel 
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Divider */}
          <div className={`h-8 w-px ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`} />

          {/* User Profile with Email */}
          <div className="flex items-center gap-3">
            {/* Avatar with initials */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
            }`}>
              {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </div>

            {/* User Name and Email */}
            <div className="flex flex-col">
              <p className={`text-sm font-bold leading-tight ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{user?.username || 'Admin'}</p>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>{user?.email || 'admin@kkenterprises.com'}</p>
            </div>

            {/* Dropdown Button */}
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-600'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute right-6 top-14 mt-2 w-56 rounded-xl shadow-xl border z-[9970] ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="p-2">
                  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}>
                    <User className="w-4 h-4" />
                    <span className="text-sm">My Profile</span>
                  </button>

                  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}>
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>

                  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}>
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-sm">Help & Support</span>
                  </button>

                  <div className={`h-px my-2 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />

                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isDarkMode
                        ? 'hover:bg-red-500/20 text-red-400'
                        : 'hover:bg-red-50 text-red-600'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}