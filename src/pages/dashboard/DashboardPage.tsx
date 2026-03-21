import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  AlertCircle,
  Calendar,
  Wrench,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Bell,
  MoreVertical,
  Download,
  Printer,
  Share2,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  User,
  Settings,
  LogIn,
  X,
  ChevronDown,
  Wallet,
  Filter,
  History as HistoryIcon,
  PlusCircle,
  FileEdit,
  Trash2
} from 'lucide-react';
import { api, endpoints } from '@/services/api';
import { useStock } from '@/contexts/StockContext';
import { useLabourBills } from '@/contexts/LabourBillContext';
import { useAlignment } from '@/contexts/AlignmentContext';
import { useCustomers } from '@/contexts/CustomerContext';
import { useReceiptsPayments } from '@/contexts/ReceiptsPaymentsContext';
import { useMasters } from '@/contexts/MastersContext';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { LottieLoadingScreen } from '@/components/shared/LottieLoadingScreen';

interface DashboardContentProps {
  isDarkMode: boolean;
  onNavigate: (screen: any, data?: any) => void;
}

type TimePeriod = 'today' | 'weekly' | 'monthly' | 'yearly';


export function DashboardPage({ isDarkMode, onNavigate }: DashboardContentProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today');
  const [showAnalyticsMenu, setShowAnalyticsMenu] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [showNotifications, setShowNotifications] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [chartKey, setChartKey] = useState(Date.now());
  const [renderCount, setRenderCount] = useState(0);
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  
  // Real stats from backend
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real stats from backend
  const fetchStats = async (period: TimePeriod, from?: string, to?: string) => {
    setLoading(true);
    try {
      let url = `${endpoints.dashboard.stats}?period=${period}`;
      if (from && to) url += `&from=${from}&to=${to}`;
      
      const statsRes = await api.get(url);
      if (statsRes.success) {
        const statsPayload = statsRes.data?.data || statsRes.data || {};
        setStats(statsPayload);
        setChartData(Array.isArray(statsPayload.chartData) ? statsPayload.chartData : []);
      }
      
      const activityRes = await api.get(endpoints.dashboard.recentActivity);
      if (activityRes.success) {
        const activityData = activityRes.data?.data || activityRes.data;
        setRecentActivity(Array.isArray(activityData) ? activityData : []);
      }

      // Fetch Low Stock Alerts from Dedicated Backend Endpoint
      const stockRes = await api.get(endpoints.dashboard.stockAlerts);
      if (stockRes.success) {
        const stockData = stockRes.data?.data || stockRes.data;
        setStockAlerts(Array.isArray(stockData) ? stockData : []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFrom = isCustomRange ? dateRange.from : undefined;
    const fetchTo = isCustomRange ? dateRange.to : undefined;
    
    fetchStats(selectedPeriod, fetchFrom, fetchTo);
    // Auto-refresh every 5 minutes
    const interval = () => fetchStats(selectedPeriod, fetchFrom, fetchTo);
    const intervalId = setInterval(interval, 300000);
    return () => clearInterval(intervalId);
  }, [selectedPeriod, dateRange, isCustomRange]);

  // Generate a unique ID for this component instance to avoid duplicate keys
  const componentId = useRef(`chart-${Math.random().toString(36).substr(2, 9)}`).current;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get data from all contexts to check completion
  const { stockItems } = useStock();
  const { labourBills } = useLabourBills();
  const { alignmentEntries } = useAlignment();
  const { customers } = useCustomers();
  const { receipts, payments } = useReceiptsPayments();
  const { suppliers, brands } = useMasters();

  // Helpers to check if contexts have data
  const hasInventoryData = (stockItems?.length || 0) > 0;
  const hasBillingData = (labourBills?.length || 0) > 0;
  const hasAlignmentData = (alignmentEntries?.length || 0) > 0;
  const hasCustomerData = (customers?.length || 0) > 0;
  const hasAccountsData = (receipts?.length || 0) > 0 || (payments?.length || 0) > 0;
  const hasMastersData = (suppliers?.length || 0) > 0 || (brands?.length || 0) > 0;

  // Check if system has required data - Dashboard visible only when data exists
  // Prioritize real backend stats if available
  const isSystemReady = stats ? (
    (stats.totalCustomers || 0) > 0 || 
    (stats.activeJobCards || 0) > 0 || 
    (stats.totalLabourBills || 0) > 0 ||
    (stockItems?.length || 0) > 0
  ) : (
    (stockItems?.length || 0) > 0 || (labourBills?.length || 0) > 0 || (alignmentEntries?.length || 0) > 0 || 
    (customers?.length || 0) > 0 || (receipts?.length || 0) > 0 || (suppliers?.length || 0) > 0
  );


  const lowStockItems = useMemo(() => {
    if (stockAlerts?.length > 0) return stockAlerts;
    
    // Fallback to client-side calc ONLY if backend returned nothing and context has items
    return (stockItems || [])
      .filter(item => (item?.currentStock || 0) <= (item?.minStock || 0))
      .slice(0, 5)
      .map(item => ({
        name: item?.itemName || 'Unknown Item',
        current: item?.currentStock || 0,
        minimum: item?.minStock || 0,
        status: (item?.currentStock || 0) <= ((item?.minStock || 0) / 2) ? 'Critical' : 'Warning'
      }));
  }, [stockItems, stockAlerts]);

  const recentJobs = useMemo(() => {
    return (labourBills || []).slice(0, 5).map(bill => ({
      id: bill?.billNo || 'N/A',
      vehicle: bill?.vehicleNumber || 'N/A',
      customer: bill?.customerName || 'N/A',
      service: 'Labour Service',
      status: bill?.status || 'Pending',
      amount: `₹${(bill?.grandTotal || 0).toLocaleString()}`
    }));
  }, [labourBills]);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTimeRangeDropdown(false);
      }
    };

    if (showTimeRangeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimeRangeDropdown]);

  // Function to Apply Date Range
  const handleApplyDateRange = () => {
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      
      if (start > end) {
        alert('From Date cannot be after To Date');
        return;
      }
      
      setIsCustomRange(true);
      setDateRange({ from: fromDate, to: toDate });
    } else {
      alert('Please select From and To dates');
    }
  };

  // Handle preset period selection
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    setIsCustomRange(false);
    setFromDate('');
    setToDate('');
  };

  const currentData = useMemo(() => {
    // Default fallback object
    const fallback = {
      revenue: { value: '₹0', change: '0%', isPositive: true },
      sales: { value: '₹0', change: '0 sales', isPositive: true },
      jobs: { value: '0', change: '0', isPositive: true },
      stock: { value: '₹0', change: '0 items', isPositive: true },
      customers: { value: '0', change: '0', isPositive: true },
      expenses: { value: '₹0', change: '0%', isPositive: false },
      chartData: [],
      chartLabel: loading ? 'Fetching latest data...' : 'Real-time overview',
    };

    // Extract payload correctly - handle different API response variants
    let payload = null;
    if (stats) {
      if (stats.data && typeof stats.data === 'object') {
        payload = stats.data;
      } else if (stats && !stats.success && typeof stats === 'object' && !('data' in stats)) {
        // If it's already the unwrapped data (fallback from some versions of API handler)
        payload = stats;
      } else if (stats.success && stats.data === null) {
        // Success but no data
        return fallback;
      }
    }

    if (!payload || (typeof payload === 'object' && Object.keys(payload).length === 0)) {
      return fallback;
    }

    // Helper to format currency safely
    const formatCurrency = (val: any) => {
      const num = parseFloat(String(val || 0));
      return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
    };

    return {
      revenue: { 
        value: formatCurrency(payload.totalLabourRevenue), 
        change: '+100%', 
        isPositive: true 
      },
      sales: {
        value: formatCurrency(payload.totalSalesRevenue),
        change: `${payload.totalSalesCount || 0} sales`,
        isPositive: true
      },
      jobs: { 
        value: String(payload.activeJobCards || '0'), 
        change: 'Active jobs', 
        isPositive: true 
      },
      expenses: { 
        value: formatCurrency(payload.totalExpenses), 
        change: '+0%', 
        isPositive: false 
      },
      chartData: [],
      chartLabel: 'Real-time revenue from database',
    };
  }, [isCustomRange, stats, loading]);

  const cardClass = `rounded-xl ${
    isDarkMode 
      ? 'bg-gray-800/40 border-gray-700/50' 
      : 'bg-white/60'
  } backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300`;

  const statCards = [
    { 
      title: "Labour Revenue", 
      value: currentData.revenue.value,
      change: currentData.revenue.change,
      isPositive: true,
      icon: DollarSign,
      color: 'from-blue-400 to-blue-600',
      target: 'labour-history'
    },
    { 
      title: "Sales Revenue", 
      value: currentData.sales.value,
      change: currentData.sales.change,
      isPositive: true,
      icon: TrendingUp,
      color: 'from-green-400 to-green-600',
      target: 'sales'
    },
    { 
      title: 'Expenses', 
      value: currentData.expenses.value,
      change: currentData.expenses.change,
      isPositive: false,
      icon: Wallet,
      color: 'from-red-400 to-red-600',
      target: 'expense-register'
    },
    { 
      title: 'Pending Jobs', 
      value: currentData.jobs.value,
      change: currentData.jobs.change,
      isPositive: true,
      icon: Wrench,
      color: 'from-orange-400 to-orange-600',
      target: 'job-card'
    }
  ];

  const timeButtons: { label: string; value: TimePeriod }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  // Handle chart type change
  const handleChartTypeChange = (type: 'bar' | 'pie' | 'line') => {
    setSelectedChartType(type);
    setShowAnalyticsMenu(false);
    setRenderCount(prev => prev + 1); // Increment to force new unique key
  };

  // Colors for pie chart - Using application theme colors (Cobalt Sky palette)
  const COLORS = [
    '#2563EB', // Primary Blue
    '#60A5FA', // Accent Blue
    '#1E3A8A', // Deep Navy
    '#3B82F6', // Mid Blue
    '#93C5FD', // Light Blue
    '#DBEAFE', // Very Light Blue
    '#1D4ED8', // Royal Blue
    '#1E40AF', // Dark Blue
  ];

  // If system is not ready, show welcome screen instead of dashboard
  /*
  if (!isSystemReady) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`max-w-2xl w-full text-center ${cardClass} p-12`}
        >
          <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-xl`}>
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className={`text-3xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome to KK Enterprises Dashboard
          </h1>
          <p className={`text-lg mb-8 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Your dashboard analytics will appear once you start adding data to the system.
          </p>
          <div className={`p-6 rounded-xl mb-8 ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Get Started by Adding:
            </h3>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  hasInventoryData 
                    ? 'bg-green-500/20' 
                    : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  {hasInventoryData ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Package className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Inventory Items
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  hasBillingData 
                    ? 'bg-green-500/20' 
                    : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  {hasBillingData ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Wrench className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Labour Bills
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  hasAlignmentData 
                    ? 'bg-green-500/20' 
                    : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  {hasAlignmentData ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Settings className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Alignment Entries
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  hasCustomerData 
                    ? 'bg-green-500/20' 
                    : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  {hasCustomerData ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Users className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Customers
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  hasAccountsData 
                    ? 'bg-green-500/20' 
                    : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  {hasAccountsData ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <DollarSign className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Receipts/Payments
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  hasMastersData 
                    ? 'bg-green-500/20' 
                    : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  {hasMastersData ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <User className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Masters Data
                </span>
              </div>
            </div>
          </div>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            The dashboard will automatically appear once you add data to any module.
          </p>
        </motion.div>
      </div>
    );
  }
  */

  // Show loading screen during initial fetch
  if (loading && !stats) {
    return <LottieLoadingScreen isDarkMode={isDarkMode} message="Preparing Dashboard Analytics" />;
  }

  // Show loading screen during initial fetch
  if (loading && !stats) {
    return <LottieLoadingScreen isDarkMode={isDarkMode} message="Preparing Dashboard Analytics" />;
  }

  // System is ready - show full dashboard analysis
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Dashboard Overview</h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Welcome back! Here's what's happening {selectedPeriod === 'today' ? 'today' : `this ${selectedPeriod.replace('ly', '')}`}.</p>
        </div>
        
        {/* Right side - Date Range and Time Period Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            {/* From Date */}
            <div className="flex flex-col">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="From Date"
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="To Date"
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            {/* Apply Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-2 rounded-lg border transition-all ${
                isDarkMode
                  ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                  : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
              }`}
              onClick={handleApplyDateRange}
            >
              <span className="text-sm font-medium">Apply</span>
            </motion.button>
          </div>

          {/* Time Period Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
              className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg border transition-all min-w-[160px] ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium capitalize">
                  {selectedPeriod === 'today' ? 'Today' : 
                   selectedPeriod === 'weekly' ? 'Weekly' : 
                   selectedPeriod === 'monthly' ? 'Monthly' : 'Yearly'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                showTimeRangeDropdown ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showTimeRangeDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute right-0 mt-2 w-full rounded-xl shadow-2xl border z-50 overflow-hidden max-h-60 overflow-y-auto ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="py-1">
                    {timeButtons.map((btn) => (
                      <button
                        key={btn.value}
                        onClick={() => {
                          handlePeriodChange(btn.value);
                          setShowTimeRangeDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          selectedPeriod === btn.value
                            ? isDarkMode
                              ? 'bg-blue-600/20 text-blue-400'
                              : 'bg-blue-50 text-blue-600'
                            : isDarkMode
                            ? 'hover:bg-gray-700/50 text-gray-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            className={`${cardClass} cursor-pointer group hover:scale-[1.02] active:scale-[0.98] transition-all`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onNavigate(stat.target)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {stat.isPositive ? (
                  <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                    <ArrowUp className="w-3 h-3" />
                    {stat.change}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-orange-500 text-xs font-medium">
                    <AlertCircle className="w-3 h-3" />
                    {stat.change}
                  </div>
                )}
              </div>
              <h3 className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>{stat.title}</h3>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - 2 columns */}
        <motion.div
          className={`${cardClass} lg:col-span-2`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          key={selectedPeriod} // Re-animate on period change
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-lg font-bold mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Revenue Overview</h2>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>{currentData.chartLabel}</p>
              </div>
              
              {/* Right side - Change indicator and Analytics Menu */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                  <ArrowUp className="w-4 h-4" />
                  <span>{currentData.revenue.change}</span>
                </div>

                {/* Analytics Tools Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowAnalyticsMenu(!showAnalyticsMenu)}
                    className={`p-2 rounded-lg border transition-all ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Backdrop for closing menu */}
                  <AnimatePresence>
                    {showAnalyticsMenu && (
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowAnalyticsMenu(false)}
                      />
                    )}
                  </AnimatePresence>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showAnalyticsMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border z-50 overflow-hidden ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="py-2">
                          {/* Quick Actions Section */}
                          <div className="px-3 py-2 mb-1">
                            <p className={`text-xs font-semibold uppercase tracking-wider ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Quick Actions</p>
                          </div>
                          
                          <button className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            isDarkMode
                              ? 'hover:bg-gray-700/50 text-gray-200'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}>
                            <Download className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">Export Data</span>
                          </button>

                          <button className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            isDarkMode
                              ? 'hover:bg-gray-700/50 text-gray-200'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}>
                            <Printer className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">Print Report</span>
                          </button>

                          <button className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            isDarkMode
                              ? 'hover:bg-gray-700/50 text-gray-200'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}>
                            <Share2 className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">Share Analytics</span>
                          </button>

                          {/* Divider */}
                          <div className={`my-2 mx-3 h-px ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`} />

                          {/* Analysis Charts Section */}
                          <div className="px-3 py-2 mb-1">
                            <p className={`text-xs font-semibold uppercase tracking-wider ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Analysis Charts</p>
                          </div>

                          <button className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            isDarkMode
                              ? 'hover:bg-gray-700/50 text-gray-200'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`} onClick={() => handleChartTypeChange('bar')}>
                            <BarChart3 className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">Bar Chart</span>
                          </button>

                          <button className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            isDarkMode
                              ? 'hover:bg-gray-700/50 text-gray-200'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`} onClick={() => handleChartTypeChange('pie')}>
                            <PieChart className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">Pie Chart</span>
                          </button>

                          <button className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            isDarkMode
                              ? 'hover:bg-gray-700/50 text-gray-200'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`} onClick={() => handleChartTypeChange('line')}>
                            <LineChart className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">Analysis Chart</span>
                          </button>

                          {/* Divider */}
                          <div className={`my-2 mx-3 h-px ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`} />

                          {/* Advanced Tools Section */}
                          <div className="px-3 py-2 mb-1">
                            <p className={`text-xs font-semibold uppercase tracking-wider ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Advanced Tools</p>
                          </div>

                          <button className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            isDarkMode
                              ? 'hover:bg-gray-700/50 text-gray-200'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}>
                            <TrendingDown className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium">Trend Analysis</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <div 
              key={`chart-wrapper-${selectedPeriod}-${selectedChartType}-${isCustomRange}-${renderCount}`}
              className="min-h-[300px] flex items-center justify-center overflow-hidden"
            >
              <RevenueChart 
                isDarkMode={isDarkMode} 
                data={chartData} 
                loading={loading}
                period={selectedPeriod} 
                chartType={selectedChartType} 
              />
            </div>

          </div>
        </motion.div>


        {/* Low Stock Alert - 1 column */}
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Low Stock Alert</h2>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : !lowStockItems || lowStockItems.length === 0 ? (
                <div className="text-center py-10 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-400 opacity-20" />
                  <p className="text-sm text-gray-400">No low stock items alerts</p>
                </div>
              ) : (
                lowStockItems.map((item, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{item.name}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'Critical'
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-orange-500/20 text-orange-500'
                      }`}>{item.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            item.status === 'Critical' ? 'bg-red-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${(item.current / item.minimum) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{item.current}/{item.minimum}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent System Activity Table */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-lg font-bold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Recent Jobs</h2>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Overview of latest service activities</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Bill No</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Vehicle</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Customer</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Status</th>
                  <th className={`text-right py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {!recentJobs || recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">
                      No recent jobs found
                    </td>
                  </tr>
                ) : (
                  recentJobs.map((job, index) => (
                    <tr 
                      key={job.id}
                      className={`border-b ${
                        isDarkMode ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {job.id}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {job.vehicle}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {job.customer}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          job.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                          job.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className={`text-sm font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {job.amount}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
      
      {/* System Activity Log */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-lg font-bold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>System Activity Log</h2>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Real-time tracking of system-wide changes</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('system-history')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isDarkMode 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
              }`}
            >
              View All History
            </motion.button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : !recentActivity || recentActivity.length === 0 ? (
              <div className="text-center py-10 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <HistoryIcon className="w-8 h-8 mx-auto mb-2 text-gray-400 opacity-20" />
                <p className="text-sm text-gray-400">No recent system activities found</p>
              </div>
            ) : (
              (Array.isArray(recentActivity) ? recentActivity : []).map((log, index) => (
                <div 
                  key={log.id}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                    isDarkMode ? 'hover:bg-gray-700/30 border border-gray-700/50' : 'hover:bg-blue-50/30 border border-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    log.action_type === 'CREATE' ? 'bg-green-500/10 text-green-500' :
                    log.action_type === 'UPDATE' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {log.action_type === 'CREATE' ? <PlusCircle className="w-5 h-5" /> :
                     log.action_type === 'UPDATE' ? <FileEdit className="w-5 h-5" /> :
                     <Trash2 className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {log.title}
                      </p>
                      <span className={`text-[10px] font-medium whitespace-nowrap ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {log.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isDarkMode ? 'bg-gray-900/50 text-blue-400' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {log.module_name}
                      </span>
                      <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        by {log.user_name || 'Admin'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Completed Today</p>
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>12</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>In Progress</p>
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>5</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Pending</p>
                <p className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>8</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
