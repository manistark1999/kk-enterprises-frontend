import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
  Calendar,
  Wrench,
  ArrowUp,
  Bell,
  MoreVertical,
  Download,
  Printer,
  Share2,
  BarChart3,
  PieChart,
  LineChart,
  ChevronDown,
  Wallet,
  History as HistoryIcon,
  RefreshCw,
} from 'lucide-react';
import { api, endpoints } from '@/services/api';
import { useStock } from '@/contexts/StockContext';
import { useLabourBills } from '@/contexts/LabourBillContext';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { LottieLoadingScreen } from '@/components/shared/LottieLoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardRefresh } from '@/contexts/DashboardRefreshContext';

interface DashboardContentProps {
  isDarkMode: boolean;
  onNavigate: (screen: string, data?: any) => void;
}

type TimePeriod = 'today' | 'weekly' | 'monthly' | 'yearly';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (val: any) => {
  const num = parseFloat(String(val || 0));
  return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
};

export function DashboardPage({ isDarkMode, onNavigate }: DashboardContentProps) {
  const { hasPermission } = useAuth();
  const { registerRefreshCallback } = useDashboardRefresh();

  // ── Filter state ────────────────────────────────────────────────────────────
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('today');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [showAnalyticsMenu, setShowAnalyticsMenu] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [chartRenderKey, setChartRenderKey] = useState(0);

  // ── Data state ──────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [inventoryOverview, setInventoryOverview] = useState<any>(null);
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Contexts (used for recent-jobs table)
  const { labourBills } = useLabourBills();
  const { stockItems } = useStock();

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentPeriodRef = useRef(selectedPeriod);
  const currentDateRangeRef = useRef(dateRange);
  const currentIsCustomRef = useRef(isCustomRange);

  // Keep refs current
  useEffect(() => { currentPeriodRef.current = selectedPeriod; }, [selectedPeriod]);
  useEffect(() => { currentDateRangeRef.current = dateRange; }, [dateRange]);
  useEffect(() => { currentIsCustomRef.current = isCustomRange; }, [isCustomRange]);

  // ── Core fetch function ──────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const period = currentPeriodRef.current;
      const custom = currentIsCustomRef.current;
      const dr = currentDateRangeRef.current;

      let url = `${endpoints.dashboard.stats}?period=${period}`;
      if (custom && dr.from && dr.to) url += `&from=${dr.from}&to=${dr.to}`;

      const [statsRes, activityRes, stockRes, invOverviewRes] = await Promise.all([
        api.get(url),
        api.get(endpoints.dashboard.recentActivity),
        api.get(endpoints.dashboard.stockAlerts),
        api.get(endpoints.dashboard.inventoryOverview),
      ]);

      if (statsRes.success) {
        const payload = statsRes.data?.data || statsRes.data || {};
        setStats(payload);
        setChartData(Array.isArray(payload.chartData) ? payload.chartData : []);
      }

      if (activityRes.success) {
        const d = activityRes.data?.data || activityRes.data;
        setRecentActivity(Array.isArray(d) ? d : []);
      }

      if (stockRes.success) {
        const d = stockRes.data?.data || stockRes.data;
        setStockAlerts(Array.isArray(d) ? d : []);
      }

      if (invOverviewRes.success) {
        const d = invOverviewRes.data?.data || invOverviewRes.data;
        setInventoryOverview(d);
      }
    } catch (_) {
      // Errors are handled gracefully – we keep showing previous data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── Register fetch so any context can call it after mutations ────────────────
  useEffect(() => {
    registerRefreshCallback(() => fetchDashboard(true));
  }, [registerRefreshCallback, fetchDashboard]);

  // ── Initial + period/dateRange re-fetch ──────────────────────────────────────
  useEffect(() => {
    fetchDashboard(false);
    // Auto-refresh every 5 minutes
    const id = setInterval(() => fetchDashboard(true), 300_000);
    return () => clearInterval(id);
  }, [selectedPeriod, dateRange, isCustomRange, fetchDashboard]);

  // ── Close dropdown on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTimeRangeDropdown(false);
      }
    };
    if (showTimeRangeDropdown) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTimeRangeDropdown]);

  // ── Date-range handlers ──────────────────────────────────────────────────────
  const handleApplyDateRange = () => {
    if (!fromDate || !toDate) { alert('Please select From and To dates'); return; }
    if (new Date(fromDate) > new Date(toDate)) { alert('From Date cannot be after To Date'); return; }
    setIsCustomRange(true);
    setDateRange({ from: fromDate, to: toDate });
  };

  const handlePeriodChange = (p: TimePeriod) => {
    setSelectedPeriod(p);
    setIsCustomRange(false);
    setFromDate('');
    setToDate('');
  };

  // ── Derived values ───────────────────────────────────────────────────────────
  const currentData = useMemo(() => {
    const fallback = {
      revenue: { value: '₹0', change: '0 bills' },
      sales: { value: '₹0', change: '0 sales' },
      jobs: { value: '0', change: 'Active jobs' },
      expenses: { value: '₹0', change: '+0%' },
      inventoryValue: { value: '₹0', change: '0 items' },
      stockQty: { value: '0', change: 'Total units' },
    };
    if (!stats || typeof stats !== 'object' || Object.keys(stats).length === 0) return fallback;

    // Support both wrapped and unwrapped API response
    const payload = stats.data && typeof stats.data === 'object' ? stats.data : stats;

    return {
      revenue: {
        value: formatCurrency(payload.totalLabourRevenue),
        change: `${payload.totalLabourBills || 0} bills`,
      },
      sales: {
        value: formatCurrency(payload.totalSalesRevenue),
        change: `${payload.totalSalesCount || 0} sales`,
      },
      jobs: {
        value: String(payload.activeJobCards || 0),
        change: 'Active jobs',
      },
      expenses: {
        value: formatCurrency(payload.totalExpenses),
        change: `${payload.totalVehicles || 0} vehicles`,
      },
      inventoryValue: {
        value: formatCurrency(inventoryOverview?.summary?.total_value),
        change: `${inventoryOverview?.summary?.total_items || 0} items`,
      },
      stockQty: {
        value: String(inventoryOverview?.summary?.total_quantity || 0),
        change: 'Total units',
      },
    };
  }, [stats, inventoryOverview]);

  const lowStockItems = useMemo(() => {
    // Requirements: final_stock = opening_stock + stock_in - stock_out + adjustments
    // We already have currentStock which is the ground truth (opening + movements) in backend.
    
    let rawItems = [];
    if (Array.isArray(stockAlerts) && stockAlerts.length > 0) {
      rawItems = stockAlerts;
    } else {
      // Fallback to stockItems from context if API alerts are empty
      rawItems = (Array.isArray(stockItems) ? stockItems : [])
        .filter(item => {
           const currentStock = parseFloat(String(item?.currentStock ?? 0));
           const minStock = parseFloat(String(item?.minStock ?? 0));
           // Req 4: Show all low-stock items where finalStock <= minStock
           return currentStock <= minStock;
        })
        .slice(0, 10);
    }

    const final = rawItems.map(item => {
      const current = parseFloat(String(item?.current ?? item?.currentStock ?? 0));
      const minimum = parseFloat(String(item?.minimum ?? item?.minStock ?? 0));
      const status = item?.status || (current <= (minimum / 2) ? 'Critical' : 'Warning');
      
      return {
        name: item?.name || item?.itemName || 'Unknown',
        itemCode: item?.itemCode || item?.item_code || '',
        current,
        minimum,
        status,
        adjustmentTotal: parseFloat(String(item?.adjustmentTotal || 0)),
        color: status === 'Critical' ? 'text-red-500' : 'text-orange-500'
      };
    });

    console.log('Dashboard Derived Low Stock Items:', final);
    return final;
  }, [stockItems, stockAlerts]);

  const overStockItems = useMemo(() => {
    return (inventoryOverview?.overStock || []).map((item: any) => ({
      ...item,
      color: 'text-blue-900'
    }));
  }, [inventoryOverview]);

  const recentlyIncreasedItems = useMemo(() => {
    return (inventoryOverview?.recentlyIncreased || []);
  }, [inventoryOverview]);

  const recentlyDecreasedItems = useMemo(() => {
    return (inventoryOverview?.recentlyDecreased || []);
  }, [inventoryOverview]);

  const recentJobs = useMemo(() =>
    (labourBills || []).slice(0, 5).map(bill => ({
      id: bill?.billNo || 'N/A',
      vehicle: bill?.vehicleNumber || 'N/A',
      customer: bill?.customerName || 'N/A',
      status: bill?.status || 'Pending',
      amount: formatCurrency(bill?.grandTotal),
    })),
    [labourBills]
  );

  // ── Activity icon helper ─────────────────────────────────────────────────────
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CREATE': return <span className="text-blue-500 font-bold text-xs">+</span>;
      case 'UPDATE': return <span className="text-blue-400 font-bold text-xs">✎</span>;
      case 'DELETE': return <span className="text-blue-300 font-bold text-xs">✕</span>;
      default: return <span className="text-gray-400 font-bold text-xs">•</span>;
    }
  };

  // ── Card style ───────────────────────────────────────────────────────────────
  const cardClass = `rounded-xl ${
    isDarkMode
      ? 'bg-gray-800/50 border-gray-700/50'
      : 'bg-white/80'
  } backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300`;

  const statCards = [
    {
      title: 'Labour Revenue',
      value: currentData.revenue.value,
      change: currentData.revenue.change,
      isPositive: true,
      icon: DollarSign,
      color: 'from-blue-500 to-blue-700',
      target: 'labour-history',
      module: 'Labour Bill',
    },
    {
      title: 'Sales Revenue',
      value: currentData.sales.value,
      change: currentData.sales.change,
      isPositive: true,
      icon: TrendingUp,
      color: 'from-blue-400 to-blue-600',
      target: 'sales',
      module: 'Sales',
    },
    {
      title: 'Stock Value',
      value: currentData.inventoryValue.value,
      change: currentData.inventoryValue.change,
      isPositive: true,
      icon: DollarSign,
      color: 'from-blue-600 to-blue-800',
      target: 'inventory',
      module: 'Stock List',
    },
    {
      title: 'Current Stock',
      value: currentData.stockQty.value,
      change: 'Total Units',
      isPositive: true,
      icon: Package,
      color: 'from-blue-400 to-blue-500',
      target: 'inventory',
      module: 'Stock List',
    },
  ].filter(c => typeof hasPermission === 'function' && hasPermission(c.module));

  const timeButtons: { label: string; value: TimePeriod }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  const COLORS = ['#2563EB', '#60A5FA', '#1E3A8A', '#3B82F6', '#93C5FD', '#DBEAFE', '#1D4ED8', '#1E40AF'];

  // ── First-load skeleton ──────────────────────────────────────────────────────
  if (loading && !stats) {
    return <LottieLoadingScreen isDarkMode={isDarkMode} message="Preparing Dashboard Analytics" />;
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dashboard Overview
          </h1>
          <p className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Real-time data from database
            {refreshing && (
              <span className="flex items-center gap-1 text-blue-500 text-xs">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Updating…
              </span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
            <input
              type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className={`px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleApplyDateRange}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              Apply
            </motion.button>
          </div>

          {/* Period dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowTimeRangeDropdown(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium min-w-[140px] justify-between ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="capitalize">{selectedPeriod}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showTimeRangeDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showTimeRangeDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 mt-2 w-full rounded-xl shadow-2xl border z-50 overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                >
                  {timeButtons.map(btn => (
                    <button
                      key={btn.value}
                      onClick={() => { handlePeriodChange(btn.value); setShowTimeRangeDropdown(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors ${
                        selectedPeriod === btn.value
                          ? isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                          : isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      {btn.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Manual refresh button */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => fetchDashboard(true)}
            title="Refresh dashboard"
            className={`p-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Main Dashboard Layout: Left (Revenue) & Right (Inventory Insights) */}
      {/* Top Summary Row (Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            className={`${cardClass} cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onNavigate(stat.target)}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'} flex items-center justify-center border ${isDarkMode ? 'border-blue-500/20' : 'border-blue-100'}`}>
                  <stat.icon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                {stat.isPositive ? (
                  <div className="flex items-center gap-1 text-blue-500 text-[10px] font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/10">
                    <ArrowUp className="w-2.5 h-2.5" />
                    {stat.change}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-blue-600 text-[10px] font-bold bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                    <AlertCircle className="w-2.5 h-2.5" />
                    {stat.change}
                  </div>
                )}
              </div>
              <h3 className={`text-xs font-semibold mb-1 uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {stat.title}
              </h3>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {loading ? '…' : stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Row: Revenue Chart (Left) & Inventory Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Revenue Overview */}
        <div className="lg:col-span-2">
          <motion.div
            className={cardClass}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            key={selectedPeriod}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Revenue Overview
                  </h2>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Labour billing revenue — live from database
                  </p>
                </div>

                {/* Chart type switcher */}
                <div className="relative">
                  <button
                    onClick={() => setShowAnalyticsMenu(v => !v)}
                    className={`p-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-700'} hover:opacity-80`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showAnalyticsMenu && (
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAnalyticsMenu(false)}
                    />
                  )}
                  <AnimatePresence>
                    {showAnalyticsMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className={`absolute right-0 mt-2 w-52 rounded-xl shadow-2xl border z-50 overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                      >
                        <div className="py-1">
                          <p className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Chart Type</p>
                          {([['bar', BarChart3, 'Bar Chart'], ['line', LineChart, 'Line Graph'], ['pie', PieChart, 'Pie Chart']] as const).map(([type, Icon, label]) => (
                            <button
                              key={type}
                              onClick={() => { setSelectedChartType(type); setChartRenderKey(k => k + 1); setShowAnalyticsMenu(false); }}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                selectedChartType === type
                                  ? isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                                  : isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {label}
                            </button>
                          ))}
                          <div className={`my-1 mx-3 h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
                          <p className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Export</p>
                          {([['Download', Download], ['Print', Printer], ['Share', Share2]] as const).map(([label, Icon]) => (
                            <button key={label} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                              <Icon className="w-4 h-4" />
                              {label} Data
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="h-[340px] w-full">
                {chartData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <BarChart3 className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-200'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      No billing data for this period
                    </p>
                  </div>
                ) : (
                  <RevenueChart
                    key={`${selectedChartType}-${chartRenderKey}`}
                    chartType={selectedChartType}
                    isDarkMode={isDarkMode}
                    data={chartData}
                    colors={COLORS}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Inventory Insights */}
        {hasPermission('Stock List', 'view') && (
          <motion.div
            className={`lg:col-span-1 ${cardClass} h-full overflow-hidden`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6 border-b pb-4 border-gray-100/10">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-500" />
                  <div>
                    <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Inventory Insights</h2>
                    <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stock monitoring</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('inventory')}
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-widest"
                >
                  Full Stock →
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    <AlertCircle className="w-3.5 h-3.5" /> Low Stock Alerts
                  </h3>
                  <div className="space-y-3">
                    {lowStockItems.length > 0 ? lowStockItems.map((item: any, idx: number) => (
                      <div key={idx} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-red-50 border-red-100 shadow-sm'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.name}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${item.status === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${(item.status === 'Critical' || item.current <= 0) ? 'text-red-500' : 'text-orange-500'}`}>{item.current}</p>
                            <p className="text-[10px] text-gray-500">Min: {item.minimum}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-10 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <Package className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-20" />
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No low stock items</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 pb-6">

        {/* History Feed (Requires History view) */}
        {hasPermission('History', 'view') && (
          <motion.div
            className={cardClass}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recent Activity
                </h2>
                <div className={`p-2 rounded-lg cursor-pointer ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Bell className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {Array.isArray(recentActivity) && recentActivity.length > 0 ? (
                  recentActivity.map((activity, idx) => (
                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/40' : 'bg-gray-50'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500/10 border border-blue-500/10`}>
                        {getActivityIcon(activity.action_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {activity.title || activity.description || 'Activity'}
                        </p>
                        <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {activity.module_name} · {activity.user_name || 'admin'}
                        </p>
                      </div>
                      <span className={`text-[10px] whitespace-nowrap ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {new Date(activity.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <HistoryIcon className="w-10 h-10 text-gray-300 mx-auto mb-2 opacity-20" />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
