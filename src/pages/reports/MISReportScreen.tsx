import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Wrench,
  Calendar,
  Download,
  Printer,
  Filter,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  ShoppingCart,
  Wallet,
  Receipt,
  PieChart,
  Activity,
  Target,
  AlertCircle
} from 'lucide-react';
import { UnifiedPrintPreview } from '@/components/print/UnifiedPrintPreview';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface MISReportScreenProps {
  isDarkMode: boolean;
  module?: string; // NEW: Module from sidebar navigation
}

// Data generator function based on period
const generateDataForPeriod = (period: string) => {
  const dataMap: Record<string, any> = {
    'Today': {
      revenue: 12000,
      expenses: 8500,
      profit: 3500,
      customers: 8,
      percentages: { revenue: '+5.2%', expenses: '+3.1%', profit: '+8.5%', customers: '+12.5%' },
      revenueData: [
        { month: '6 AM', revenue: 2000, expenses: 1400, profit: 600, id: 'today-6am' },
        { month: '9 AM', revenue: 3500, expenses: 2500, profit: 1000, id: 'today-9am' },
        { month: '12 PM', revenue: 4200, expenses: 3000, profit: 1200, id: 'today-12pm' },
        { month: '3 PM', revenue: 2300, expenses: 1600, profit: 700, id: 'today-3pm' },
      ],
    },
    'Yesterday': {
      revenue: 15000,
      expenses: 10500,
      profit: 4500,
      customers: 12,
      percentages: { revenue: '+8.5%', expenses: '+6.2%', profit: '+12.8%', customers: '+15.0%' },
      revenueData: [
        { month: '6 AM', revenue: 2500, expenses: 1800, profit: 700, id: 'yesterday-6am' },
        { month: '9 AM', revenue: 4200, expenses: 3000, profit: 1200, id: 'yesterday-9am' },
        { month: '12 PM', revenue: 5100, expenses: 3500, profit: 1600, id: 'yesterday-12pm' },
        { month: '3 PM', revenue: 3200, expenses: 2200, profit: 1000, id: 'yesterday-3pm' },
      ],
    },
    'This Week': {
      revenue: 85000,
      expenses: 59000,
      profit: 26000,
      customers: 52,
      percentages: { revenue: '+12.3%', expenses: '+9.8%', profit: '+18.2%', customers: '+10.5%' },
      revenueData: [
        { month: 'Mon', revenue: 12000, expenses: 8400, profit: 3600, id: 'week-mon' },
        { month: 'Tue', revenue: 13500, expenses: 9500, profit: 4000, id: 'week-tue' },
        { month: 'Wed', revenue: 14200, expenses: 10000, profit: 4200, id: 'week-wed' },
        { month: 'Thu', revenue: 15300, expenses: 10600, profit: 4700, id: 'week-thu' },
        { month: 'Fri', revenue: 16000, expenses: 11000, profit: 5000, id: 'week-fri' },
        { month: 'Sat', revenue: 14000, expenses: 9500, profit: 4500, id: 'week-sat' },
      ],
    },
    'Last Week': {
      revenue: 78000,
      expenses: 54000,
      profit: 24000,
      customers: 48,
      percentages: { revenue: '+9.5%', expenses: '+7.2%', profit: '+14.5%', customers: '+8.3%' },
      revenueData: [
        { month: 'Mon', revenue: 11000, expenses: 7700, profit: 3300, id: 'lastweek-mon' },
        { month: 'Tue', revenue: 12500, expenses: 8800, profit: 3700, id: 'lastweek-tue' },
        { month: 'Wed', revenue: 13200, expenses: 9200, profit: 4000, id: 'lastweek-wed' },
        { month: 'Thu', revenue: 14300, expenses: 10000, profit: 4300, id: 'lastweek-thu' },
        { month: 'Fri', revenue: 15000, expenses: 10300, profit: 4700, id: 'lastweek-fri' },
        { month: 'Sat', revenue: 12000, expenses: 8000, profit: 4000, id: 'lastweek-sat' },
      ],
    },
    'This Month': {
      revenue: 328000,
      expenses: 216000,
      profit: 112000,
      customers: 245,
      percentages: { revenue: '+18.5%', expenses: '+12.3%', profit: '+28.7%', customers: '+15.2%' },
      revenueData: [
        { month: 'Week 1', revenue: 72000, expenses: 48000, profit: 24000, id: 'month-w1' },
        { month: 'Week 2', revenue: 78000, expenses: 52000, profit: 26000, id: 'month-w2' },
        { month: 'Week 3', revenue: 85000, expenses: 58000, profit: 27000, id: 'month-w3' },
        { month: 'Week 4', revenue: 93000, expenses: 58000, profit: 35000, id: 'month-w4' },
      ],
    },
    'Last Month': {
      revenue: 277500,
      expenses: 192400,
      profit: 85100,
      customers: 213,
      percentages: { revenue: '+14.2%', expenses: '+10.5%', profit: '+22.1%', customers: '+12.8%' },
      revenueData: [
        { month: 'Week 1', revenue: 65000, expenses: 45000, profit: 20000, id: 'lastmonth-w1' },
        { month: 'Week 2', revenue: 68000, expenses: 47000, profit: 21000, id: 'lastmonth-w2' },
        { month: 'Week 3', revenue: 72000, expenses: 50000, profit: 22000, id: 'lastmonth-w3' },
        { month: 'Week 4', revenue: 72500, expenses: 50400, profit: 22100, id: 'lastmonth-w4' },
      ],
    },
    'This Quarter': {
      revenue: 985000,
      expenses: 648000,
      profit: 337000,
      customers: 735,
      percentages: { revenue: '+22.8%', expenses: '+15.7%', profit: '+35.2%', customers: '+18.5%' },
      revenueData: [
        { month: 'Jan', revenue: 277500, expenses: 192400, profit: 85100, id: 'quarter-jan' },
        { month: 'Feb', revenue: 320000, expenses: 210000, profit: 110000, id: 'quarter-feb' },
        { month: 'Mar', revenue: 387500, expenses: 245600, profit: 141900, id: 'quarter-mar' },
      ],
    },
    'This Year': {
      revenue: 3936000,
      expenses: 2592000,
      profit: 1344000,
      customers: 2940,
      percentages: { revenue: '+28.5%', expenses: '+18.9%', profit: '+42.3%', customers: '+22.7%' },
      revenueData: [
        { month: 'Jan', revenue: 277500, expenses: 192400, profit: 85100, id: 'year-jan' },
        { month: 'Feb', revenue: 320000, expenses: 210000, profit: 110000, id: 'year-feb' },
        { month: 'Mar', revenue: 387500, expenses: 245600, profit: 141900, id: 'year-mar' },
        { month: 'Apr', revenue: 328000, expenses: 216000, profit: 112000, id: 'year-apr' },
        { month: 'May', revenue: 345000, expenses: 225000, profit: 120000, id: 'year-may' },
        { month: 'Jun', revenue: 360000, expenses: 234000, profit: 126000, id: 'year-jun' },
        { month: 'Jul', revenue: 375000, expenses: 243000, profit: 132000, id: 'year-jul' },
        { month: 'Aug', revenue: 392000, expenses: 252000, profit: 140000, id: 'year-aug' },
        { month: 'Sep', revenue: 405000, expenses: 261000, profit: 144000, id: 'year-sep' },
        { month: 'Oct', revenue: 415000, expenses: 267000, profit: 148000, id: 'year-oct' },
        { month: 'Nov', revenue: 428000, expenses: 273000, profit: 155000, id: 'year-nov' },
        { month: 'Dec', revenue: 303000, expenses: 173000, profit: 130000, id: 'year-dec' },
      ],
    },
    'Custom': {
      revenue: 500000,
      expenses: 350000,
      profit: 150000,
      customers: 400,
      percentages: { revenue: '+20.0%', expenses: '+15.0%', profit: '+30.0%', customers: '+18.0%' },
      revenueData: [
        { month: 'Period 1', revenue: 100000, expenses: 70000, profit: 30000, id: 'custom-p1' },
        { month: 'Period 2', revenue: 120000, expenses: 84000, profit: 36000, id: 'custom-p2' },
        { month: 'Period 3', revenue: 130000, expenses: 91000, profit: 39000, id: 'custom-p3' },
        { month: 'Period 4', revenue: 150000, expenses: 105000, profit: 45000, id: 'custom-p4' },
      ],
    },
  };

  return dataMap[period] || dataMap['This Month'];
};

// Data generator function based on report type
const generateDataForReportType = (type: string, baseData: any) => {
  const typeMultipliers: Record<string, any> = {
    'Overview': {
      multiplier: 1,
      focus: 'all',
    },
    'Revenue Analysis': {
      multiplier: 1.15,
      focus: 'revenue',
      categoryData: [
        { name: 'Labour Services', value: 165000, color: '#2563EB', id: 'rev-labour' },
        { name: 'Spare Parts', value: 128000, color: '#10B981', id: 'rev-parts' },
        { name: 'Oil & Lubricants', value: 87000, color: '#F59E0B', id: 'rev-oil' },
        { name: 'Accessories', value: 65000, color: '#8B5CF6', id: 'rev-accessories' },
      ],
    },
    'Expense Analysis': {
      multiplier: 0.85,
      focus: 'expenses',
      categoryData: [
        { name: 'Salaries', value: 85000, color: '#EF4444', id: 'exp-salaries' },
        { name: 'Rent & Utilities', value: 45000, color: '#F97316', id: 'exp-rent' },
        { name: 'Inventory', value: 95000, color: '#F59E0B', id: 'exp-inventory' },
        { name: 'Maintenance', value: 28000, color: '#EAB308', id: 'exp-maintenance' },
      ],
    },
    'Profit Analysis': {
      multiplier: 1.25,
      focus: 'profit',
      categoryData: [
        { name: 'Gross Profit', value: 185000, color: '#10B981', id: 'profit-gross' },
        { name: 'Operating Profit', value: 142000, color: '#059669', id: 'profit-operating' },
        { name: 'Net Profit', value: 125000, color: '#047857', id: 'profit-net' },
      ],
    },
    'Customer Analysis': {
      multiplier: 1.1,
      focus: 'customers',
      categoryData: [
        { name: 'New Customers', value: 145, color: '#3B82F6', id: 'cust-new' },
        { name: 'Returning Customers', value: 298, color: '#2563EB', id: 'cust-returning' },
        { name: 'VIP Customers', value: 67, color: '#1D4ED8', id: 'cust-vip' },
      ],
    },
  };

  const config = typeMultipliers[type] || typeMultipliers['Overview'];
  
  return {
    ...baseData,
    revenue: Math.round(baseData.revenue * (type === 'Revenue Analysis' ? 1.15 : config.multiplier)),
    expenses: Math.round(baseData.expenses * (type === 'Expense Analysis' ? 1.12 : config.multiplier)),
    profit: Math.round(baseData.profit * (type === 'Profit Analysis' ? 1.3 : config.multiplier)),
    customers: Math.round(baseData.customers * (type === 'Customer Analysis' ? 1.25 : config.multiplier)),
    categoryData: config.categoryData,
    focus: config.focus,
  };
};

export function MISReportScreen({ isDarkMode, module }: MISReportScreenProps) {
  const [dateRange, setDateRange] = useState('This Month');
  const [reportType, setReportType] = useState('Overview');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(() => {
    const baseData = generateDataForPeriod('This Month');
    return generateDataForReportType('Overview', baseData);
  });
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  // Update dashboard when period OR report type changes
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call with smooth transition
    const timer = setTimeout(() => {
      const baseData = generateDataForPeriod(dateRange);
      const newData = generateDataForReportType(reportType, baseData);
      setDashboardData(newData);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [dateRange, reportType]); // Watch BOTH dateRange and reportType

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      const baseData = generateDataForPeriod(dateRange);
      const newData = generateDataForReportType(reportType, baseData);
      setDashboardData(newData);
      setIsLoading(false);
    }, 500);
  };

  const handlePrint = () => {
    // Format MIS data for ReportPrintView
    // We'll prepare a summary report
    const formattedData = {
      reportNo: `MIS-${new Date().getTime().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-IN'),
      headers: ['Analysis Component', 'Focus', 'Metric Value', 'Trend'],
      keys: ['name', 'focus', 'value', 'trend'],
      items: [
        { name: 'Revenue', focus: 'Earnings', value: `₹${dashboardData.revenue.toLocaleString()}`, trend: dashboardData.percentages.revenue },
        { name: 'Expenses', focus: 'Operational', value: `₹${dashboardData.expenses.toLocaleString()}`, trend: dashboardData.percentages.expenses },
        { name: 'Profit', focus: 'Net Yield', value: `₹${dashboardData.profit.toLocaleString()}`, trend: dashboardData.percentages.profit },
        { name: 'Customers', focus: 'Base', value: dashboardData.customers.toString(), trend: dashboardData.percentages.customers }
      ],
      metaDetails: [
        { label: 'Period', value: dateRange },
        { label: 'Report Type', value: reportType },
        { label: 'Generated By', value: 'MIS Dashboard' }
      ],
      summary: {
        totals: [
          { label: 'Projected Monthly Revenue', value: `₹${(dashboardData.revenue * 1.05).toLocaleString()}` },
          { label: 'Net Profit Margin', value: `${((dashboardData.profit / dashboardData.revenue) * 100).toFixed(1)}%`, isTotal: true }
        ],
        info: [
          { label: 'Focus Area', content: dashboardData.focus || 'General Overview' },
          { label: 'Timestamp', content: new Date().toLocaleString() }
        ]
      }
    };
    
    setPrintData(formattedData);
    setIsPrintModalOpen(true);
  };

  const handleExport = () => {
    // Prepare export data
    const exportData = [
      ['KK Enterprises - MIS Reports Dashboard', '', '', ''],
      ['Period:', dateRange, 'Report Type:', reportType],
      ['', '', '', ''],
      ['KPI Summary', '', '', ''],
      ['Metric', 'Value', 'Change', ''],
      ['Total Revenue', `₹${dashboardData.revenue.toLocaleString()}`, dashboardData.percentages.revenue, ''],
      ['Total Expenses', `₹${dashboardData.expenses.toLocaleString()}`, dashboardData.percentages.expenses, ''],
      ['Net Profit', `₹${dashboardData.profit.toLocaleString()}`, dashboardData.percentages.profit, ''],
      ['Total Customers', dashboardData.customers.toString(), dashboardData.percentages.customers, ''],
      ['', '', '', ''],
      ['Revenue Trend', '', '', ''],
      ['Period', 'Revenue', 'Expenses', 'Profit'],
      ...dashboardData.revenueData.map((row: any) => [
        row.month,
        row.revenue.toString(),
        row.expenses.toString(),
        row.profit.toString()
      ]),
      ['', '', '', ''],
      ['Category Breakdown', '', '', ''],
      ['Category', 'Value', '', ''],
      ...categoryData.map(cat => [cat.name, cat.value.toString(), '', '']),
      ['', '', '', ''],
      ['Top Performing Services', '', '', ''],
      ['Service', 'Count', 'Revenue', ''],
      ...topServices.map(svc => [svc.service, svc.count.toString(), svc.revenue.toString(), '']),
    ];

    // Convert to CSV
    const csv = exportData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `MIS_Report_${reportType}_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cardClass = `rounded-xl ${
    isDarkMode 
      ? 'bg-gray-800/40 border-gray-700/50' 
      : 'bg-white/60'
  } backdrop-blur-xl border border-white/20 shadow-lg`;

  const inputClass = `px-4 py-2.5 rounded-lg border transition-all outline-none text-sm ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
  }`;

  // Sample data for charts
  const revenueData = dashboardData.revenueData;

  const categoryData = dashboardData.categoryData || [
    { name: 'Labour Services', value: 145000, color: '#2563EB', id: 'cat-labour' },
    { name: 'Spare Parts', value: 98000, color: '#10B981', id: 'cat-parts' },
    { name: 'Oil & Lubricants', value: 67000, color: '#F59E0B', id: 'cat-oil' },
    { name: 'Accessories', value: 45000, color: '#8B5CF6', id: 'cat-accessories' },
  ];

  const dailyTransactions = [
    { day: 'Mon', transactions: 24, id: 'daily-mon' },
    { day: 'Tue', transactions: 31, id: 'daily-tue' },
    { day: 'Wed', transactions: 28, id: 'daily-wed' },
    { day: 'Thu', transactions: 35, id: 'daily-thu' },
    { day: 'Fri', transactions: 42, id: 'daily-fri' },
    { day: 'Sat', transactions: 38, id: 'daily-sat' },
    { day: 'Sun', transactions: 18, id: 'daily-sun' },
  ];

  const topServices = [
    { service: 'Engine Repair', count: 45, revenue: 125000 },
    { service: 'Brake Service', count: 38, revenue: 95000 },
    { service: 'Oil Change', count: 67, revenue: 85000 },
    { service: 'Tire Replacement', count: 28, revenue: 72000 },
    { service: 'AC Service', count: 32, revenue: 68000 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
            }`}>
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold mb-0.5 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>MIS Reports Dashboard</h1>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Comprehensive business analytics and performance insights</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`} onClick={handlePrint}>
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`} onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Period:</span>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={inputClass}
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
              <option value="Last Week">Last Week</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Quarter">This Quarter</option>
              <option value="This Year">This Year</option>
              <option value="Custom">Custom Range</option>
            </select>

            <div className="flex items-center gap-2 ml-4">
              <Filter className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Report Type:</span>
            </div>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={inputClass}
            >
              <option value="Overview">Overview</option>
              <option value="Revenue Analysis">Revenue Analysis</option>
              <option value="Expense Analysis">Expense Analysis</option>
              <option value="Profit Analysis">Profit Analysis</option>
              <option value="Customer Analysis">Customer Analysis</option>
              <option value="Inventory">Inventory Metrics</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards - Equal Height and Improved Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue Card */}
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
              }`}>
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                <TrendingUp className="w-3.5 h-3.5" />
                {dashboardData.percentages.revenue}
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Revenue</h3>
            <p className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>₹{dashboardData.revenue.toLocaleString()}</p>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>vs ₹{dashboardData.revenue - 50000}.00 last month</p>
          </div>
        </motion.div>

        {/* Total Expenses Card */}
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isDarkMode ? 'bg-red-500/20' : 'bg-red-50'
              }`}>
                <Wallet className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex items-center gap-1 text-red-500 text-sm font-semibold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">
                <TrendingUp className="w-3.5 h-3.5" />
                {dashboardData.percentages.expenses}
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Expenses</h3>
            <p className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>₹{dashboardData.expenses.toLocaleString()}</p>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>vs ₹{dashboardData.expenses - 5000}.00 last month</p>
          </div>
        </motion.div>

        {/* Net Profit Card */}
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
              }`}>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                <TrendingUp className="w-3.5 h-3.5" />
                {dashboardData.percentages.profit}
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Net Profit</h3>
            <p className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>₹{dashboardData.profit.toLocaleString()}</p>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Profit Margin: 34.1%</p>
          </div>
        </motion.div>

        {/* Total Customers Card */}
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
              }`}>
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                <TrendingUp className="w-3.5 h-3.5" />
                {dashboardData.percentages.customers}
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Customers</h3>
            <p className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{dashboardData.customers}</p>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Avg. Transaction: ₹1,339</p>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Revenue vs Expenses Trend</h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>6-month comparison</p>
              </div>
              <Activity className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <ResponsiveContainer width="100%" height={280} key={`revenue-chart-${dateRange}`}>
              <AreaChart data={revenueData}>
                <CartesianGrid key={`grid-revenue-${dateRange}`} strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  key={`xaxis-revenue-${dateRange}`}
                  dataKey="month" 
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  key={`yaxis-revenue-${dateRange}`}
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  key={`tooltip-revenue-${dateRange}`}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                  }}
                  formatter={(value: any) => `₹${value.toLocaleString()}`}
                />
                <Legend key={`legend-revenue-${dateRange}`} />
                <Area 
                  key={`area-revenue-${dateRange}`}
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563EB" 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
                <Area 
                  key={`area-expense-${dateRange}`}
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#EF4444" 
                  fill="url(#colorExpense)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue by Category */}
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Revenue by Category</h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Distribution breakdown</p>
              </div>
              <PieChart className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <ResponsiveContainer width="100%" height={280} key={`category-chart-${dateRange}`}>
              <RechartsPie>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                  }}
                  formatter={(value: any) => `₹${value.toLocaleString()}`}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Transactions */}
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Weekly Transactions</h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Last 7 days</p>
              </div>
              <Target className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <ResponsiveContainer width="100%" height={200} key={`transactions-chart-${dateRange}`}>
              <BarChart data={dailyTransactions}>
                <CartesianGrid key={`grid-trans-${dateRange}`} strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  key={`xaxis-trans-${dateRange}`}
                  dataKey="day" 
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  style={{ fontSize: '11px' }}
                />
                <YAxis 
                  key={`yaxis-trans-${dateRange}`}
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  style={{ fontSize: '11px' }}
                />
                <Tooltip 
                  key={`tooltip-trans-${dateRange}`}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                  }}
                />
                <Bar key={`bar-trans-${dateRange}`} dataKey="transactions" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Services */}
        <motion.div
          className={`${cardClass} lg:col-span-2`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Top Performing Services</h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Best revenue generators</p>
              </div>
              <Wrench className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div 
                  key={service.service}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                      index === 1 ? 'bg-gray-400/20 text-gray-400' :
                      index === 2 ? 'bg-orange-500/20 text-orange-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{service.service}</h4>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{service.count} services completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>₹{service.revenue.toLocaleString()}</p>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>Total revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Package className={`w-8 h-8 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
              }`}>On Track</span>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Inventory Turnover</h3>
            <p className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>4.2x</p>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Better than target (4.0x)</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Receipt className={`w-8 h-8 ${
                isDarkMode ? 'text-orange-400' : 'text-orange-600'
              }`} />
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'
              }`}>Average</span>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Avg. Invoice Value</h3>
            <p className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>₹1,339</p>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>+5.2% from last month</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <AlertCircle className={`w-8 h-8 ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`} />
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'
              }`}>Action Needed</span>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Outstanding Amount</h3>
            <p className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>₹45,200</p>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>From 12 pending invoices</p>
          </div>
        </motion.div>
      </div>

      <UnifiedPrintPreview
        type="report"
        title="MIS PERFORMANCE REPORT"
        data={printData}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}