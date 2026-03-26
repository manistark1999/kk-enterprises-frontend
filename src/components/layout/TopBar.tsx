import React, { useState } from 'react';
import { Bell, Settings, ChevronDown, Calendar, User, LogOut, HelpCircle, Sun, Moon, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationPanel } from '@/components/shared/NotificationPanel';
import kkHeaderLogo from '../../assets/images/kk-groups-logo-header-print.png';

interface TopBarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  showBackupPanel: boolean;
  onCloseBackupPanel: () => void;
  showRestorePanel: boolean;
  onCloseRestorePanel: () => void;
  onMobileMenuToggle?: () => void;
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
}

export function TopBar({ 
  isDarkMode, 
  onToggleTheme, 
  showBackupPanel, 
  onCloseBackupPanel, 
  showRestorePanel, 
  onCloseRestorePanel, 
  onMobileMenuToggle,
  onToggleCollapse,
  isCollapsed
}: TopBarProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedFinancialYear] = useState('2025-26');

  const { unreadCount } = useNotifications();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    setShowUserDropdown(false);
    logout();
  };

  return (
    <div className={`h-14 md:h-16 border-b backdrop-blur-xl sticky top-0 z-50 ${
      isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'
    }`}>
      <div className="h-full px-3 md:px-6 flex items-center justify-between gap-2">
        {/* Left Side: Toggle + Logo */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <button 
            onClick={() => {
              if (window.innerWidth < 768) {
                onMobileMenuToggle?.();
              } else {
                onToggleCollapse?.();
              }
            }}
            className={`p-2 rounded-lg transition-all flex items-center justify-center hover:scale-110 active:scale-95 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Menu className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          <div className="flex items-center gap-2 md:gap-3">
            <img src={kkHeaderLogo} alt="KK Groups Logo" className="h-8 md:h-10 w-auto object-contain flex-shrink-0" />
            <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent truncate hidden sm:block">
              KK Enterprises
            </h1>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Financial Year - hidden on small mobile */}
          <div className="relative hidden sm:block">
            <button className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 rounded-lg border transition-all text-sm ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}>
              <Calendar className="w-4 h-4" />
              <span className="font-medium text-xs md:text-sm">FY {selectedFinancialYear}</span>
            </button>
          </div>

          {/* Divider */}
          <div className={`h-8 w-px hidden sm:block ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 md:p-2.5 rounded-lg border transition-all relative ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Divider */}
          <div className={`h-8 w-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />

          {/* User Profile */}
          <div className="relative flex items-center gap-1.5 md:gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold bg-blue-600 text-white text-sm flex-shrink-0">
              {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
            </div>

            {/* Name + Email -- hidden on mobile/tablet */}
            <div className="hidden lg:flex flex-col">
              <p className={`text-sm font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.username || 'Admin'}</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user?.email || 'admin@kkenterprises.com'}</p>
            </div>

            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {showUserDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute right-0 top-12 mt-1 w-52 rounded-xl shadow-xl border z-[9970] ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="p-2">
                  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                    <User className="w-4 h-4" /><span className="text-sm">My Profile</span>
                  </button>
                  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                    <Settings className="w-4 h-4" /><span className="text-sm">Settings</span>
                  </button>
                  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                    <HelpCircle className="w-4 h-4" /><span className="text-sm">Help & Support</span>
                  </button>
                  <div className={`h-px my-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                  >
                    <LogOut className="w-4 h-4" /><span className="text-sm">Logout</span>
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