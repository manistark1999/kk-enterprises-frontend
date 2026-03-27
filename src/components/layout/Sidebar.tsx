import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar,
  History as HistoryIcon,
  Wrench,
  Receipt,
  Package,
  DollarSign,
  BarChart3,
  Users,
  User,
  Truck,
  UserCog,
  Shield,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  TrendingUp,
  FileText,
  ShoppingCart,
  CircleDot,
  Wallet,
  PieChart,
  FileBarChart,
  List,
  Car,
  Building2,
  Download,
  Upload,
  X,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import kkSidebarLogo from '../../assets/images/kk-groups-logo-sidebar.png';
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
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onMobileOpen?: () => void;
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
  'Role Management': 'role-management',
  'Financial Year': 'financial-year'
};

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isDarkMode,
  onToggleTheme,
  currentScreen,
  isMobileOpen = false,
  onMobileClose,
  onMobileOpen
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [expandedNestedItems, setExpandedNestedItems] = useState<string[]>([]);
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const { user, logout, canView } = useAuth();

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
    'role-management': 'Role Management',
    'financial-year': 'Financial Year'
  };

  const currentMenuItem = currentScreen ? screenToMenuMap[currentScreen] : 'Dashboard';

  interface NavItem {
    icon: any;
    label: string;
    hasSubmenu: boolean;
    hasNestedSubmenu: boolean;
    submenu?: { icon: any; label: string }[];
  }

  const navTemplates: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', hasSubmenu: false, hasNestedSubmenu: false },
    {
      icon: Users, label: 'Masters', hasSubmenu: true, hasNestedSubmenu: false,
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
    { icon: FileText, label: 'Job Card', hasSubmenu: false, hasNestedSubmenu: false },
    {
      icon: Receipt, label: 'Billing', hasSubmenu: true, hasNestedSubmenu: false,
      submenu: [
        { icon: Wrench, label: 'Labour Bill' },
        { icon: FileText, label: 'Estimation' },
        { icon: Receipt, label: 'Receipt' },
        { icon: DollarSign, label: 'Payment' }
      ]
    },
    {
      icon: Package, label: 'Inventory', hasSubmenu: true, hasNestedSubmenu: false,
      submenu: [
        { icon: ShoppingCart, label: 'Purchase' },
        { icon: TrendingUp, label: 'Sales' },
        { icon: List, label: 'Stock List' },
        { icon: Settings, label: 'Stock Adjustment' },
        { icon: Settings, label: 'Alignment' }
      ]
    },
    {
      icon: DollarSign, label: 'Accounts', hasSubmenu: true, hasNestedSubmenu: false,
      submenu: [
        { icon: Wallet, label: 'Expense Entry' },
        { icon: Users, label: 'Staff Advance' },
        { icon: DollarSign, label: 'Salary Entry' },
        { icon: Wallet, label: 'Cash Entry' },
        { icon: Building2, label: 'Bank Ledger' }
      ]
    },
    {
      icon: BarChart3, label: 'Reports', hasSubmenu: true, hasNestedSubmenu: false,
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
      icon: Settings, label: 'Settings', hasSubmenu: true, hasNestedSubmenu: false,
      submenu: [
        { icon: Building2, label: 'Company' },
        { icon: Calendar, label: 'Financial Year' },
        { icon: Shield, label: 'User Management' },
        { icon: ShieldAlert, label: 'Role Management' },
        { icon: HistoryIcon, label: 'History' }
      ]
    }
  ];

  const mainNavItems: NavItem[] = navTemplates.map(item => {
    if (item.hasSubmenu && item.submenu) {
      const filteredSubmenu = item.submenu.filter(subItem => canView(subItem.label));
      if (filteredSubmenu.length === 0) return null;
      return { ...item, submenu: filteredSubmenu };
    }
    if (!canView(item.label)) return null;
    return item;
  }).filter(Boolean) as NavItem[];

  React.useEffect(() => {
    if (currentMenuItem && !isCollapsed) {
      mainNavItems.forEach((item) => {
        if (item.hasSubmenu && item.submenu) {
          const hasActive = item.submenu.some((s: any) => s.label === currentMenuItem);
          if (hasActive && !expandedItems.includes(item.label)) {
            setExpandedItems(prev => [...prev, item.label]);
          }
        }
      });
    } else if (isCollapsed) {
      // Clear expanded items in compact mode
      if (expandedItems.length > 0) setExpandedItems([]);
      if (expandedNestedItems.length > 0) setExpandedNestedItems([]);
    }
  }, [currentMenuItem, isCollapsed]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.popup-trigger') && !target.closest('.popup-menu')) {
        setClickedItem(null);
      }
    };
    if (clickedItem) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clickedItem]);

  const isMenuItemActive = (label: string) => label === currentMenuItem;
  const hasActiveChild = (item: any) => {
    if (!item.hasSubmenu || !item.submenu) return false;
    return item.submenu.some((s: any) => s.label === currentMenuItem);
  };

  const toggleExpand = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const handleMobileNav = () => {
    if (onMobileClose) onMobileClose();
  };

  const sidebarContent = (
    <div
      className="h-full p-4 md:p-6 flex flex-col relative"
      style={{ 
        background: 'linear-gradient(180deg, #011638 0%, #003399 50%, #001529 100%)',
        minHeight: '100vh'
      }}
    >
    

      {/* Logo */}
      <div className={`mb-6 flex flex-col items-center transition-all duration-300 ${isCollapsed ? 'px-0' : ''}`}>
        <div className="flex flex-col items-center">
          <div className={`${isCollapsed ? 'w-14 h-14' : 'w-20 h-20 md:w-28 md:h-28'} transition-all duration-300 mb-2`}>
            <img src={kkSidebarLogo} alt="KK Groups Logo" className="w-full h-full object-contain drop-shadow-xl p-1" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <h2 className="text-white font-bold text-base md:text-lg tracking-wide">KK Enterprises</h2>
                <p className="text-xs mt-1 text-blue-200/80">Workshop Management</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Divider */}
      <div className={`mb-4 md:mb-6 border-t ${isDarkMode ? 'border-gray-700/50' : 'border-white/20'}`} />

      {/* Navigation */}
      <div className="space-y-1 flex-1 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {mainNavItems.map((item) => (
          <div key={item.label} className="relative popup-trigger">
            {item.hasSubmenu ? (
              <div
                className={`sidebar-item flex items-center gap-3 px-3 py-2.5 md:py-3 rounded-xl cursor-pointer group transition-all duration-200 ${
                  isMenuItemActive(item.label) || hasActiveChild(item)
                    ? 'bg-blue-500/20 text-white border-l-4 border-blue-400'
                    : 'text-blue-100/70 hover:bg-blue-400/10 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
                onClick={() => {
                  if (isCollapsed && item.hasSubmenu) {
                    onToggleCollapse();
                    setTimeout(() => toggleExpand(item.label), 350);
                  } else {
                    toggleExpand(item.label);
                  }
                }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isMenuItemActive(item.label) || hasActiveChild(item) ? 'bg-blue-500/30' : 'bg-blue-400/10 group-hover:bg-blue-400/20'
                }`}>
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isMenuItemActive(item.label) || hasActiveChild(item) ? 'text-blue-300' : 'text-white/80'}`} />
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span className="flex-1 font-medium text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!isCollapsed && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedItems.includes(item.label) ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-blue-200'}`} />
                )}
              </div>
            ) : (
              <Link to={`/${screenKeyMap[item.label] || ''}`} onClick={handleMobileNav}>
                <div className={`sidebar-item flex items-center gap-3 px-3 py-2.5 md:py-3 rounded-xl cursor-pointer group relative transition-all duration-200 ${
                  isMenuItemActive(item.label) || hasActiveChild(item)
                    ? 'bg-blue-500/20 text-white border-l-4 border-blue-400'
                    : 'text-blue-100/70 hover:bg-blue-400/10 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isMenuItemActive(item.label) ? 'bg-blue-500/30' : 'bg-blue-400/10 group-hover:bg-blue-400/20'
                  }`}>
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isMenuItemActive(item.label) ? 'text-blue-300' : 'text-white/80'}`} />
                  </div>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span className="flex-1 font-medium text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            )}

            {/* Collapsed Popover */}
            <AnimatePresence>
              {isCollapsed && item.hasSubmenu && clickedItem === item.label && item.submenu && (
                <motion.div
                  className={`popup-menu absolute left-full ml-2 top-0 min-w-[200px] rounded-xl shadow-2xl border z-[9980] overflow-hidden ${isDarkMode ? 'bg-[#0f172a] border-blue-800/30' : 'bg-[#011638] border-blue-700/30'}`}
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-blue-800/30 bg-blue-900/20' : 'border-blue-700/30 bg-blue-800/20'}`}>
                    <div className="flex items-center gap-2">
                      <item.icon className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.label}</span>
                    </div>
                  </div>
                  <div className="py-2">
                    {item.submenu.map((subItem: any) => (
                      <Link to={`/${screenKeyMap[subItem.label]}`} key={subItem.label} onClick={handleMobileNav}>
                        <div
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all ${isDarkMode ? 'text-gray-300 hover:bg-blue-600/20 hover:text-white' : 'text-blue-100 hover:bg-blue-700/30 hover:text-white'}`}
                          onClick={() => setClickedItem(null)}
                        >
                          <subItem.icon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                          <span className="font-medium text-sm">{subItem.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded Submenu */}
            <AnimatePresence>
              {!isCollapsed && item.hasSubmenu && expandedItems.includes(item.label) && item.submenu && (
                <motion.div
                  className="ml-9 mt-1 space-y-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.submenu.map((subItem: { label: string; icon: any }) => (
                    <Link to={`/${screenKeyMap[subItem.label]}`} key={subItem.label} onClick={handleMobileNav}>
                      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        isMenuItemActive(subItem.label)
                          ? 'bg-blue-500/30 text-white font-semibold'
                          : 'text-blue-200/70 hover:bg-white/5 hover:text-white'
                      }`}>
                        <subItem.icon className={`w-4 h-4 ${isMenuItemActive(subItem.label) ? 'text-blue-300' : 'text-blue-200/60'}`} />
                        <span className="font-normal text-sm">{subItem.label}</span>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Dark Mode Toggle */}
      <div className="mt-4 md:mt-6 pt-4 md:pt-6">
        <div
          className={`flex items-center gap-3 px-3 py-2.5 md:py-3 rounded-xl cursor-pointer text-blue-100/70 hover:bg-blue-400/10 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}
          onClick={onToggleTheme}
        >
          {isDarkMode ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span className="flex-1 font-medium text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <div className={`w-10 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-blue-500' : 'bg-blue-800/40'} relative`}>
              <div className={`absolute w-4 h-4 bg-white/90 rounded-full top-1 transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-1'} shadow-sm`} />
            </div>
          )}
        </div>
      </div>

      {/* User / Logout */}
      <div className={`mt-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div
          onClick={() => { if (window.confirm('Are you sure you want to logout?')) logout(); }}
          className={`flex items-center gap-3 ${isCollapsed ? '' : 'px-3 py-3'} rounded-xl cursor-pointer transition-all group overflow-hidden`}
        >
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-800 to-blue-500 rounded-full flex items-center justify-center shadow-lg border border-white/10">
              <span className="text-white font-medium text-sm">{(user?.username || 'Admin').substring(0, 2).toUpperCase()}</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div className="flex-1 min-w-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-white font-semibold text-sm truncate">{user?.username || 'Administrator'}</div>
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-blue-200'} text-xs truncate`}>{user?.email || 'admin@kkenterprises.com'}</div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <LogOut className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-blue-200'} opacity-0 group-hover:opacity-100 transition-opacity`} />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-[90] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <motion.div
        className="fixed left-0 top-0 h-full w-72 z-[100] md:hidden"
        initial={false}
        animate={{ 
          x: isMobileOpen ? 0 : -272,
          boxShadow: isMobileOpen ? '4px 0 24px rgba(0,0,0,0.5)' : 'none'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {sidebarContent}
      </motion.div>

      {/* Desktop Sidebar */}
      <motion.div
        className="hidden md:block h-full flex-shrink-0 relative z-[60]"
        animate={{ width: isCollapsed ? 80 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ width: isCollapsed ? '80px' : '240px' }}
      >
        {sidebarContent}
      </motion.div>
    </>
  );
}