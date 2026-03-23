import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar,
  History,
  Wrench,
  Receipt,
  Package,
  DollarSign,
  BarChart3,
  Bell,
  Users,
  User,
  Truck,
  UserCog,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Printer,
  ShoppingCart,
  Battery,
  CircleDot,
  Boxes,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  Wallet,
  CreditCard,
  PieChart,
  FileBarChart,
  UserPlus,
  List,
  Car,
  DollarSign as Payment,
  AlertCircle,
  CalendarClock,
  MessageSquare,
  Building2,
  FileCheck,
  Download,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import kkLogo from '@/assets/images/eab7e99ea14e9b675e2cabe248e69859cc970a59.png';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigate?: (screen: string) => void;
  onOpenBackup?: () => void;
  onOpenRestore?: () => void;
  onOpenReceiptPanel?: () => void;
  onOpenAlignmentPanel?: () => void;
  currentScreen?: string;
}

const screenKeyMap: Record<string, string> = {
    'Dashboard': 'dashboard',
    'Job Card': 'job-card',
    'Labour Bill': 'labour',
    'Estimation': 'estimation',
    'Receipt': 'receipt',
    'Payment': 'payment',
    'Purchase': 'purchase',
    'Sales': 'sales',
    'Expense Entry': 'expense',
    'Staff Advance': 'advance',
    'Salary Entry': 'salary',
    'Bank Ledger': 'bank-ledger',
    'Stock Adjustment': 'stock-adjustment',
    'Stock List': 'stock-list',
    'Cash Entry': 'cash-register',
    'Cash Register': 'cash-register-report',
    'Stock Report': 'stock-report',
    'Stock Adjustments Register': 'stock-adjustments-register',
    'Alignment': 'alignment',
    'Alignment Register': 'alignment-register',
    'Expense Register': 'expense-register',
    'Receipt Register': 'receipt-register',
    'Stock Register': 'stock-register',
    'GST Report': 'gst-report',
    'MIS Report': 'mis-report',
    'Customer': 'customer',
    'Transport': 'transport',
    'Vehicle Make': 'vehicle-make',
    'Vehicle Register': 'vehicle-register',
    'Work Group': 'work-group',
    'Work Type': 'work-type',
    'Supplier': 'supplier',
    'Staff': 'staff',
    'Brand': 'brand',
    'Item': 'item',
    'Bank Accounts': 'bank-accounts',
    'Company': 'company',
    'User Management': 'user-management',
    'Financial Year': 'financial-year'
  };

export function Sidebar({ isCollapsed, onToggleCollapse, isDarkMode, onToggleTheme, onNavigate, onOpenBackup, onOpenRestore, onOpenReceiptPanel, onOpenAlignmentPanel, currentScreen }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [expandedNestedItems, setExpandedNestedItems] = useState<string[]>([]);
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const { user, logout } = useAuth();

  // Map screen names to menu labels (reverse of handleNavigation map)
  const screenToMenuMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'job-card': 'Job Card',
    'job-card-form': 'Job Card',
    'labour': 'Labour Bill',
    'labour-history': 'Labour Bill',
    'estimation': 'Estimation',
    'receipt': 'Receipt',
    'payment': 'Payment',
    'purchase': 'Purchase',
    'sales': 'Sales',
    'expense': 'Expense Entry',
    'advance': 'Staff Advance',
    'salary': 'Salary Entry',
    'bank-ledger': 'Bank Ledger',
    'stock-adjustment': 'Stock Adjustment',
    'stock-list': 'Stock List',
    'cash-register': 'Cash Entry',
    'cash-register-report': 'Cash Register',
    'stock-report': 'Stock Report',
    'stock-adjustments-register': 'Stock Adjustments Register',
    'alignment': 'Alignment',
    'alignment-register': 'Alignment Register',
    'expense-register': 'Expense Register',
    'receipt-register': 'Receipt Register',
    'stock-register': 'Stock Register',
    'gst-report': 'GST Report',
    'mis-report': 'MIS Report',
    'customer': 'Customer',
    'transport': 'Transport',
    'vehicle-make': 'Vehicle Make',
    'vehicle-register': 'Vehicle Register',
    'work-group': 'Work Group',
    'work-type': 'Work Type',
    'supplier': 'Supplier',
    'staff': 'Staff',
    'brand': 'Brand',
    'item': 'Item',
    'bank-accounts': 'Bank Accounts',
    'company': 'Company',
    'user-management': 'User Management',
    'financial-year': 'Financial Year'
  };

  // Get current active menu item
  const currentMenuItem = currentScreen ? screenToMenuMap[currentScreen] : 'Dashboard';

  // Auto-expand parent menu if a submenu item is active
  React.useEffect(() => {
    if (currentMenuItem && !isCollapsed) {
      mainNavItems.forEach((item) => {
        if (item.hasSubmenu && item.submenu) {
          const hasActiveChild = item.submenu.some((subItem) => subItem.label === currentMenuItem);
          if (hasActiveChild && !expandedItems.includes(item.label)) {
            setExpandedItems((prev) => [...prev, item.label]);
          }
        }
      });
    }
  }, [currentMenuItem, isCollapsed]);

  // Helper function to check if a menu item is active
  const isMenuItemActive = (label: string) => {
    return label === currentMenuItem;
  };

  // Helper function to check if parent menu has active child
  const hasActiveChild = (item: any) => {
    if (!item.hasSubmenu || !item.submenu) return false;
    return item.submenu.some((subItem: any) => subItem.label === currentMenuItem);
  };

  // Handle clicks outside popup to close it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.popup-trigger') && !target.closest('.popup-menu')) {
        setClickedItem(null);
      }
    };

    if (clickedItem) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clickedItem]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const toggleNestedExpand = (label: string) => {
    setExpandedNestedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const mainNavItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      active: false,
      hasSubmenu: false,
      hasNestedSubmenu: false
    },
    { 
      icon: Users, 
      label: 'Masters',
      hasSubmenu: true,
      hasNestedSubmenu: false,
      submenu: [
        { icon: User, label: 'Customer' },
        { icon: Truck, label: 'Transport' },
        { icon: Car, label: 'Vehicle Make' },
        { icon: List, label: 'Vehicle Register' },
        { icon: Users, label: 'Work Group' },
        { icon: Wrench, label: 'Work Type' },
        { icon: Truck, label: 'Supplier' },
        { icon: UserCog, label: 'Staff' },
        { icon: CircleDot, label: 'Brand' },
        { icon: Package, label: 'Item' },
        { icon: Building2, label: 'Bank Accounts' }
      ]
    },
    { 
      icon: FileText, 
      label: 'Job Card', 
      active: false,
      hasSubmenu: false,
      hasNestedSubmenu: false
    },
    { 
      icon: Receipt, 
      label: 'Billing',
      hasSubmenu: true,
      hasNestedSubmenu: false,
      submenu: [
        { icon: Wrench, label: 'Labour Bill' },
        { icon: FileText, label: 'Estimation' },
        { icon: Receipt, label: 'Receipt' },
        { icon: DollarSign, label: 'Payment' }
      ]
    },
    { 
      icon: Package, 
      label: 'Inventory',
      hasSubmenu: true,
      hasNestedSubmenu: false,
      submenu: [
        { icon: ShoppingCart, label: 'Purchase' },
        { icon: TrendingUp, label: 'Sales' },
        { icon: List, label: 'Stock List' },
        { icon: Settings, label: 'Stock Adjustment' },
        { icon: Settings, label: 'Alignment' }
      ]
    },
    { 
      icon: DollarSign, 
      label: 'Accounts',
      hasSubmenu: true,
      hasNestedSubmenu: false,
      submenu: [
        { icon: Wallet, label: 'Expense Entry' },
        { icon: Users, label: 'Staff Advance' },
        { icon: DollarSign, label: 'Salary Entry' },
        { icon: Wallet, label: 'Cash Entry' },
        { icon: Building2, label: 'Bank Ledger' }
      ]
    },
    { 
      icon: BarChart3, 
      label: 'Reports',
      hasSubmenu: true,
      hasNestedSubmenu: false,
      submenu: [
        { icon: Settings, label: 'Alignment Register' },
        { icon: Wallet, label: 'Expense Register' },
        { icon: Receipt, label: 'Receipt Register' },
        { icon: DollarSign, label: 'Cash Register' },
        { icon: Package, label: 'Stock Adjustments Register' },
        { icon: Package, label: 'Stock Report' },
        { icon: Package, label: 'Stock Register' },
        { icon: FileBarChart, label: 'GST Report' },
        { icon: PieChart, label: 'MIS Report' }
      ]
    },
    { 
      icon: Settings, 
      label: 'Settings',
      hasSubmenu: true,
      hasNestedSubmenu: false,
      submenu: [
        { icon: Building2, label: 'Company' },
        { icon: Calendar, label: 'Financial Year' },
        { icon: Shield, label: 'User Management' }
      ]
    }
  ];

  return (
    <motion.div 
      className={`h-full p-6 flex flex-col relative transition-all duration-300`}
      style={{
        width: isCollapsed ? '80px' : '240px',
        background: isDarkMode 
          ? 'linear-gradient(180deg, #1e293b, #0f172a)'
          : 'linear-gradient(180deg, #1E3A8A, #1D4ED8)',
        boxShadow: 'inset 0 0 60px rgba(255,255,255,0.05)'
      }}
      animate={{ width: isCollapsed ? 80 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className={`absolute -right-3 top-8 w-6 h-6 ${
          isDarkMode ? 'bg-gray-700' : 'bg-[#2563EB]'
        } rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-[60] focus:outline-none focus:ring-2 focus:ring-offset-0 ${
          isDarkMode ? 'focus:ring-gray-500' : 'focus:ring-blue-400'
        }`}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-white" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-white" />
        )}
      </button>

      {/* Logo Section */}
      <div className={`mb-6 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className={`${
            isCollapsed ? 'w-12 h-12' : 'w-24 h-24'
          } transition-all duration-300 mb-3`}>
            <img 
              src={kkLogo} 
              alt="KK Groups Logo" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <h2 className="text-white font-bold text-lg tracking-wide">
                  KK Enterprises
                </h2>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-blue-200'
                }`}>
                  Workshop Management
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Divider */}
      <div className={`mb-6 ${
        isDarkMode ? 'border-gray-700/50' : 'border-white/20'
      } border-t`}></div>

      {/* Main Navigation */}
      <div 
        className="space-y-1 flex-1 overflow-y-auto pr-2" 
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {mainNavItems.map((item) => (
          <div 
            key={item.label}
            className="relative popup-trigger"
          >
            {item.hasSubmenu ? (
              <div
                className={`sidebar-item flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer group relative transition-all duration-200 ${
                  isMenuItemActive(item.label) || hasActiveChild(item)
                    ? isDarkMode
                      ? 'bg-blue-600/30 text-white border-l-4 border-blue-400'
                      : 'bg-white/20 text-white border-l-4 border-white'
                    : isDarkMode
                    ? 'text-gray-300 hover:bg-white/10 hover:text-white'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
                onClick={() => {
                  if (isCollapsed && item.hasSubmenu) {
                    onToggleCollapse();
                    setTimeout(() => {
                      toggleExpand(item.label);
                    }, 350);
                  } else {
                    toggleExpand(item.label);
                  }
                }}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${
                  isMenuItemActive(item.label) || hasActiveChild(item)
                    ? 'text-white'
                    : isDarkMode ? 'text-gray-300' : 'text-blue-100'
                }`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span 
                      className="flex-1 font-medium text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!isCollapsed && item.hasSubmenu && (
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${
                      expandedItems.includes(item.label) ? 'rotate-180' : ''
                    } ${isDarkMode ? 'text-gray-400' : 'text-blue-200'}`} 
                  />
                )}
              </div>
            ) : (
             <Link to={`/${screenKeyMap[item.label] || ''}`}>
              <div
                className={`sidebar-item flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer group relative transition-all duration-200 ${
                  isMenuItemActive(item.label) || hasActiveChild(item)
                    ? isDarkMode
                      ? 'bg-blue-600/30 text-white border-l-4 border-blue-400'
                      : 'bg-white/20 text-white border-l-4 border-white'
                    : isDarkMode
                    ? 'text-gray-300 hover:bg-white/10 hover:text-white'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${
                  isMenuItemActive(item.label) || hasActiveChild(item)
                    ? 'text-white'
                    : isDarkMode ? 'text-gray-300' : 'text-blue-100'
                }`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span 
                      className="flex-1 font-medium text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Tooltip for collapsed state - Only show if no submenu */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </div>
              </Link>
            )}
            {/* Floating Submenu Popover for Collapsed State */}
            <AnimatePresence>
              {isCollapsed && item.hasSubmenu && clickedItem === item.label && item.submenu && (
                <motion.div
                  className={`popup-menu absolute left-full ml-2 top-0 min-w-[200px] rounded-xl shadow-2xl border z-[9980] overflow-hidden backdrop-blur-xl ${
                    isDarkMode
                      ? 'bg-gray-800/95 border-gray-700'
                      : 'bg-white/95 border-gray-200'
                  }`}
                  style={{
                    backdropFilter: 'blur(12px)',
                    boxShadow: isDarkMode 
                      ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
                      : '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
                  }}
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {/* Popover Header */}
                  <div className={`px-4 py-3 border-b ${
                    isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-100 bg-blue-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <item.icon className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`font-semibold text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>{item.label}</span>
                    </div>
                  </div>
                  
                  {/* Submenu Items */}
                  <div className="py-2">
                    {item.submenu.map((subItem) => (
                      <Link to={`/${screenKeyMap[subItem.label]}`} key={subItem.label}>
                        <div
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-150 ${
                            isDarkMode
                              ? 'text-gray-300 hover:bg-blue-600/20 hover:text-white'
                              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                          onClick={() => {
                            setClickedItem(null);
                          }}
                        >
                          <subItem.icon className={`w-4 h-4 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`} />
                          <span className="font-medium text-sm">{subItem.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submenu - Expanded State (Simple Menu) */}
            <AnimatePresence>
              {!isCollapsed && !item.hasNestedSubmenu && item.hasSubmenu && expandedItems.includes(item.label) && item.submenu && (
                <motion.div
                  className="ml-9 mt-1 space-y-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.submenu.map((subItem) => (
                    <Link to={`/${screenKeyMap[subItem.label]}`} key={subItem.label}>
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          isMenuItemActive(subItem.label)
                            ? isDarkMode
                              ? 'bg-blue-500/40 text-white font-semibold'
                              : 'bg-white/30 text-white font-semibold'
                            : isDarkMode
                            ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                            : 'text-blue-200 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <subItem.icon className={`w-4 h-4 ${
                          isMenuItemActive(subItem.label)
                            ? 'text-white'
                            : isDarkMode ? 'text-gray-400' : 'text-blue-200'
                        }`} />
                        <span className="font-normal text-sm">{subItem.label}</span>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nested Submenu - Expanded State (For Inventory & Accounts) */}
            <AnimatePresence>
              {!isCollapsed && item.hasNestedSubmenu && expandedItems.includes(item.label) && item.submenu && (
                <motion.div
                  className="ml-9 mt-1 space-y-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.submenu.map((subItem: any) => (
                    <div key={subItem.label}>
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
                          isDarkMode
                            ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                            : 'text-blue-200 hover:bg-white/5 hover:text-white'
                        }`}
                        onClick={() => subItem.nested && toggleNestedExpand(subItem.label)}
                      >
                        <subItem.icon className={`w-4 h-4 ${
                          isDarkMode ? 'text-gray-400' : 'text-blue-200'
                        }`} />
                        <span className="flex-1 font-normal text-sm">{subItem.label}</span>
                        {subItem.nested && (
                          <ChevronDown 
                            className={`w-3 h-3 transition-transform ${
                              expandedNestedItems.includes(subItem.label) ? 'rotate-180' : ''
                            } ${isDarkMode ? 'text-gray-400' : 'text-blue-200'}`} 
                          />
                        )}
                      </div>
                      
                      {/* Third Level Nested Items */}
                      <AnimatePresence>
                        {subItem.nested && expandedNestedItems.includes(subItem.label) && (
                          <motion.div
                            className="ml-6 mt-1 space-y-1"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {subItem.nested.map((nestedItem: any) => (
                              <div
                                key={nestedItem.label}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
                                  isDarkMode
                                    ? 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                                    : 'text-blue-300 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                <nestedItem.icon className={`w-3.5 h-3.5 ${
                                  isDarkMode ? 'text-gray-500' : 'text-blue-300'
                                }`} />
                                <span className="font-normal text-xs">{nestedItem.label}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Dark Mode Toggle */}
      <div className="mt-6 pt-6">
        <div
          className={`sidebar-item flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer ${
            isDarkMode
              ? 'text-gray-300 hover:bg-white/10'
              : 'text-blue-100 hover:bg-white/10'
          } ${isCollapsed ? 'justify-center' : ''}`}
          onClick={onToggleTheme}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 flex-shrink-0" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0" />
          )}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                className="flex-1 font-medium text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <div className={`w-10 h-6 rounded-full transition-colors ${
              isDarkMode ? 'bg-blue-500' : 'bg-white/20'
            } relative`}>
              <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${
                isDarkMode ? 'translate-x-5' : 'translate-x-1'
              }`}></div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile / Logout Section */}
      <div className={`mt-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div 
          onClick={() => {
            if (window.confirm('Are you sure you want to logout?')) {
              logout();
            }
          }}
          className={`flex items-center gap-3 ${
            isCollapsed ? '' : 'px-3 py-3'
          } rounded-xl ${
            isDarkMode
              ? 'bg-white/5 hover:bg-white/10'
              : 'bg-white/10 hover:bg-white/15'
          } cursor-pointer transition-all group overflow-hidden`}
          title={isCollapsed ? "Click to Logout" : ""}
        >
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#60A5FA] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-medium text-sm">
                {(user?.username || 'Admin').substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                className="flex-1 min-w-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-white font-semibold text-sm truncate">
                  {user?.username || 'Administrator'}
                </div>
                <div className={`${
                  isDarkMode ? 'text-gray-400' : 'text-blue-200'
                } text-xs truncate`}>
                  {user?.email || 'admin@kkenterprises.com'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <LogOut className={`w-4 h-4 flex-shrink-0 ${
              isDarkMode ? 'text-gray-400' : 'text-blue-200'
            } opacity-0 group-hover:opacity-100 transition-opacity`} />
          )}
        </div>
      </div>
    </motion.div>
  );
}