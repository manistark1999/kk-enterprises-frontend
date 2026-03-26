import React, { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, CheckCheck, Bell, BellOff } from 'lucide-react';
import { 
  useNotifications, 
  Notification,
  formatRelativeTime,
  getActionColor,
  getActionIcon
} from '@/contexts/NotificationContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const NotificationPanel = React.forwardRef<HTMLDivElement, NotificationPanelProps>(function NotificationPanel({
  isOpen,
  onClose,
  isDarkMode,
}, _ref) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const panelRef = useRef<HTMLDivElement>(null);

  // Sync forwarded ref (from AnimatePresence) with internal panelRef
  const setRef = useCallback((node: HTMLDivElement | null) => {
    (panelRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof _ref === 'function') {
      _ref(node);
    } else if (_ref) {
      (_ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [_ref]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle individual notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={setRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={`absolute right-0 top-full mt-2 w-[420px] max-h-[600px] rounded-xl shadow-2xl overflow-hidden z-50 ${
            isDarkMode
              ? 'bg-gray-800/95 backdrop-blur-xl border border-gray-700/50'
              : 'bg-white/95 backdrop-blur-xl border border-gray-200/50'
          }`}
        >
          {/* Header */}
          <div
            className={`px-5 py-4 border-b flex items-center justify-between sticky top-0 z-10 ${
              isDarkMode
                ? 'bg-gray-800/95 border-gray-700/50 backdrop-blur-xl'
                : 'bg-white/95 border-gray-200/50 backdrop-blur-xl'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar */}
          {notifications.length > 0 && (
            <div
              className={`px-5 py-3 border-b flex items-center justify-between ${
                isDarkMode ? 'border-gray-700/50 bg-gray-800/50' : 'border-gray-200/50 bg-gray-50/50'
              }`}
            >
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  unreadCount === 0
                    ? isDarkMode
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 cursor-not-allowed'
                    : isDarkMode
                    ? 'text-blue-400 hover:bg-blue-500/10'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
              <button
                onClick={clearAllNotifications}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[480px] custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-5">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                  }`}
                >
                  <BellOff className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  No notifications
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/30">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-5 py-4 cursor-pointer transition-all group relative ${
                      !notification.isRead
                        ? isDarkMode
                          ? 'bg-blue-500/5 hover:bg-blue-500/10'
                          : 'bg-blue-50/50 hover:bg-blue-50'
                        : isDarkMode
                        ? 'hover:bg-gray-700/30'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                    )}

                    <div className="flex items-start gap-3 pl-3">
                      {/* Action Icon */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-lg ${
                          notification.action === 'Created' || notification.action === 'Added'
                            ? isDarkMode
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-green-100 text-green-700'
                            : notification.action === 'Edited' || notification.action === 'Updated'
                            ? isDarkMode
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-blue-100 text-blue-700'
                            : notification.action === 'Deleted' || notification.action === 'Removed'
                            ? isDarkMode
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-red-100 text-red-700'
                            : isDarkMode
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {getActionIcon(notification.action)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            <span className={getActionColor(notification.action, isDarkMode)}>
                              {notification.action}
                            </span>{' '}
                            {notification.itemType}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                              isDarkMode
                                ? 'hover:bg-red-500/20 text-gray-500 hover:text-red-400'
                                : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <p className={`text-sm mb-1 truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="font-medium">{notification.itemName}</span>
                        </p>

                        {/* Financial Data Section */}
                        {(notification.totalAmount !== undefined || notification.amount !== undefined) && (
                          <div className={`my-2 p-2.5 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-gray-700/30 border-gray-600/30' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            {/* Total Amount */}
                            {notification.totalAmount !== undefined && (
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Total Amount
                                </span>
                                <span className={`text-sm font-bold ${
                                  isDarkMode ? 'text-green-400' : 'text-green-600'
                                }`}>
                                  ₹{notification.totalAmount.toFixed(2)}
                                </span>
                              </div>
                            )}
                            
                            {/* Rate, GST, Amount Row */}
                            {(notification.rate !== undefined || notification.gstPercent !== undefined || notification.amount !== undefined) && (
                              <div className={`grid grid-cols-3 gap-2 pt-1.5 border-t ${
                                isDarkMode ? 'border-gray-600/30' : 'border-gray-200'
                              }`}>
                                {notification.rate !== undefined && (
                                  <div className="text-center">
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                      Rate
                                    </p>
                                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      ₹{notification.rate}
                                    </p>
                                  </div>
                                )}
                                
                                {notification.gstPercent !== undefined && (
                                  <div className="text-center">
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                      GST %
                                    </p>
                                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {notification.gstPercent}%
                                    </p>
                                  </div>
                                )}
                                
                                {notification.amount !== undefined && (
                                  <div className="text-center">
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                      Amount
                                    </p>
                                    <p className={`text-sm font-semibold ${
                                      isDarkMode ? 'text-green-400' : 'text-green-600'
                                    }`}>
                                      ₹{notification.amount.toFixed(2)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {notification.description && (
                          <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {notification.description}
                          </p>
                        )}

                        <div className={`flex items-center gap-3 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          <span className="flex items-center gap-1">
                            👤 {notification.userName}
                          </span>
                          <span>•</span>
                          <span>{formatRelativeTime(notification.timestamp)}</span>
                        </div>
                      </div>

                      {/* Read Status Icon */}
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-blue-500/20 text-blue-400'
                              : 'hover:bg-blue-50 text-blue-600'
                          }`}
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Show count */}
          {notifications.length > 0 && (
            <div
              className={`px-5 py-3 border-t text-center ${
                isDarkMode ? 'border-gray-700/50 bg-gray-800/50' : 'border-gray-200/50 bg-gray-50/50'
              }`}
            >
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

NotificationPanel.displayName = 'NotificationPanel';