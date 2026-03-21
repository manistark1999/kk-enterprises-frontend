import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Download,
  Printer,
  Filter,
  RefreshCw,
  Clock,
  PhoneCall,
  Mail,
  Bell,
  CheckCircle,
  XCircle,
  CreditCard,
  Wallet,
  FileText,
  Activity,
  Target,
  User,
  Building2,
  Search,
  Send
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface OutstandingReportScreenProps {
  isDarkMode: boolean;
}

interface OutstandingCustomer {
  customerName: string;
  phone: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  days: number;
  status: string;
}

export function OutstandingReportScreen({ isDarkMode }: OutstandingReportScreenProps) {
  const [dateRange, setDateRange] = useState('All Time');
  const [agingFilter, setAgingFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const cardClass = `rounded-xl ${
    isDarkMode 
      ? 'bg-gray-800/40 border-gray-700/50' 
      : 'bg-white/60'
  } backdrop-blur-xl border border-white/20 shadow-lg`;

  const inputClass = `px-4 py-2.5 rounded-lg border transition-all outline-none text-sm ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:bg-gray-700'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:bg-white'
  }`;

  // Sample data for charts
  const agingAnalysis = [
    { range: '0-30 Days', amount: 85000, count: 12, color: '#10B981', id: 'aging-0-30' },
    { range: '31-60 Days', amount: 65000, count: 8, color: '#F59E0B', id: 'aging-31-60' },
    { range: '61-90 Days', amount: 42000, count: 5, color: '#EF4444', id: 'aging-61-90' },
    { range: '90+ Days', amount: 28000, count: 3, color: '#7C3AED', id: 'aging-90-plus' },
  ];

  const monthlyTrend = [
    { month: 'Jan', outstanding: 180000, id: 'monthly-jan' },
    { month: 'Feb', outstanding: 195000, id: 'monthly-feb' },
    { month: 'Mar', outstanding: 175000, id: 'monthly-mar' },
    { month: 'Apr', outstanding: 210000, id: 'monthly-apr' },
    { month: 'May', outstanding: 205000, id: 'monthly-may' },
    { month: 'Jun', outstanding: 220000, id: 'monthly-jun' },
  ];

  const topDefaulters = [
    { name: 'Rajesh Kumar', amount: 45000, days: 95, invoices: 3 },
    { name: 'Amit Sharma', amount: 38000, days: 78, invoices: 2 },
    { name: 'Priya Motors', amount: 32000, days: 65, invoices: 4 },
    { name: 'Singh Transport', amount: 28000, days: 52, invoices: 2 },
    { name: 'Gupta Auto', amount: 22000, days: 48, invoices: 3 },
  ];

  const outstandingCustomers: OutstandingCustomer[] = [
    { 
      customerName: 'Rajesh Kumar', 
      phone: '+91 98765 43210', 
      invoiceNo: 'INV-2024-0145', 
      invoiceDate: '2024-03-15', 
      dueDate: '2024-04-15',
      amount: 18500, 
      days: 95, 
      status: 'Critical' 
    },
    { 
      customerName: 'Amit Sharma', 
      phone: '+91 98765 43211', 
      invoiceNo: 'INV-2024-0198', 
      invoiceDate: '2024-04-02', 
      dueDate: '2024-05-02',
      amount: 22000, 
      days: 78, 
      status: 'Overdue' 
    },
    { 
      customerName: 'Priya Motors', 
      phone: '+91 98765 43212', 
      invoiceNo: 'INV-2024-0256', 
      invoiceDate: '2024-04-20', 
      dueDate: '2024-05-20',
      amount: 15400, 
      days: 65, 
      status: 'Overdue' 
    },
    { 
      customerName: 'Singh Transport', 
      phone: '+91 98765 43213', 
      invoiceNo: 'INV-2024-0298', 
      invoiceDate: '2024-05-05', 
      dueDate: '2024-06-05',
      amount: 28000, 
      days: 52, 
      status: 'Warning' 
    },
    { 
      customerName: 'Gupta Auto', 
      phone: '+91 98765 43214', 
      invoiceNo: 'INV-2024-0345', 
      invoiceDate: '2024-05-18', 
      dueDate: '2024-06-18',
      amount: 12600, 
      days: 48, 
      status: 'Warning' 
    },
    { 
      customerName: 'Verma Motors', 
      phone: '+91 98765 43215', 
      invoiceNo: 'INV-2024-0389', 
      invoiceDate: '2024-06-01', 
      dueDate: '2024-07-01',
      amount: 19500, 
      days: 35, 
      status: 'Due Soon' 
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical':
        return isDarkMode ? 'text-red-400 bg-red-500/20' : 'text-red-600 bg-red-50';
      case 'Overdue':
        return isDarkMode ? 'text-orange-400 bg-orange-500/20' : 'text-orange-600 bg-orange-50';
      case 'Warning':
        return isDarkMode ? 'text-yellow-400 bg-yellow-500/20' : 'text-yellow-600 bg-yellow-50';
      case 'Due Soon':
        return isDarkMode ? 'text-blue-400 bg-blue-500/20' : 'text-blue-600 bg-blue-50';
      default:
        return isDarkMode ? 'text-gray-400 bg-gray-500/20' : 'text-gray-600 bg-gray-50';
    }
  };

  const totalOutstanding = outstandingCustomers.reduce((sum, customer) => sum + customer.amount, 0);
  const criticalCount = outstandingCustomers.filter(c => c.status === 'Critical').length;
  const overdueCount = outstandingCustomers.filter(c => c.status === 'Overdue').length;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-orange-600' : 'bg-orange-600'
          }`}>
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Outstanding Reports Dashboard</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Track pending payments, customer dues, and aging analysis</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
            isDarkMode 
              ? 'bg-orange-600 text-white hover:bg-orange-700' 
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}>
            <Send className="w-4 h-4" />
            Send Reminders
          </button>
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search by customer name, invoice number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10 w-full`}
                />
              </div>
            </div>

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
              <option value="All Time">All Time</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 60 Days">Last 60 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="This Year">This Year</option>
              <option value="Custom">Custom Range</option>
            </select>

            <div className="flex items-center gap-2 ml-4">
              <Filter className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Aging:</span>
            </div>
            <select
              value={agingFilter}
              onChange={(e) => setAgingFilter(e.target.value)}
              className={inputClass}
            >
              <option value="All">All Outstanding</option>
              <option value="0-30">0-30 Days</option>
              <option value="31-60">31-60 Days</option>
              <option value="61-90">61-90 Days</option>
              <option value="90+">90+ Days</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50'
              }`}>
                <DollarSign className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex items-center gap-1 text-orange-500 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                Pending
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Outstanding</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>₹{totalOutstanding.toLocaleString()}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>From {outstandingCustomers.length} customers</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-red-500/20' : 'bg-red-50'
              }`}>
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex items-center gap-1 text-red-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Critical
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Critical (90+ Days)</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{criticalCount}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Immediate action required</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-50'
              }`}>
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                Warning
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Overdue (30-90 Days)</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{overdueCount}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Follow-up recommended</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
              }`}>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <TrendingDown className="w-4 h-4" />
                -8.5%
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Collection Rate</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>78.5%</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>This month performance</p>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aging Analysis Chart */}
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
                }`}>Aging Analysis</h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Outstanding by age brackets</p>
              </div>
              <Activity className={`w-5 h-5 ${
                isDarkMode ? 'text-orange-400' : 'text-orange-600'
              }`} />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={agingAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="range" 
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  style={{ fontSize: '11px' }}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  style={{ fontSize: '11px' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                  }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {agingAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Trend */}
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
                }`}>Outstanding Trend</h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>6-month progression</p>
              </div>
              <TrendingUp className={`w-5 h-5 ${
                isDarkMode ? 'text-orange-400' : 'text-orange-600'
              }`} />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="month" 
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                  }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Outstanding']}
                />
                <Line 
                  type="monotone" 
                  dataKey="outstanding" 
                  stroke="#F97316" 
                  strokeWidth={3}
                  dot={{ fill: '#F97316', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Top Defaulters */}
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
              }`}>Top Outstanding Customers</h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Highest pending amounts</p>
            </div>
            <Target className={`w-5 h-5 ${
              isDarkMode ? 'text-orange-400' : 'text-orange-600'
            }`} />
          </div>
          <div className="space-y-3">
            {topDefaulters.map((customer, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-red-500/20 text-red-500' :
                    index === 1 ? 'bg-orange-500/20 text-orange-500' :
                    index === 2 ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{customer.name}</h4>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{customer.invoices} invoices • Pending {customer.days} days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    isDarkMode ? 'text-orange-400' : 'text-orange-600'
                  }`}>₹{customer.amount.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button className={`p-1.5 rounded-lg transition-colors ${
                      isDarkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}>
                      <PhoneCall className="w-3.5 h-3.5" />
                    </button>
                    <button className={`p-1.5 rounded-lg transition-colors ${
                      isDarkMode ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}>
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Outstanding Details Table */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Outstanding Details</h2>
            </div>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{outstandingCustomers.length} pending invoices</span>
          </div>

          <div className={`border rounded-lg overflow-hidden ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}>
                  <tr className={`border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Customer</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Invoice</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Invoice Date</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Due Date</th>
                    <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Amount</th>
                    <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Days</th>
                    <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Status</th>
                    <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {outstandingCustomers.map((customer, index) => (
                    <tr
                      key={index}
                      className={`transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{customer.customerName}</p>
                          <p className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>{customer.phone}</p>
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-sm font-medium ${
                        isDarkMode ? 'text-orange-400' : 'text-orange-600'
                      }`}>{customer.invoiceNo}</td>
                      <td className={`py-3 px-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{customer.invoiceDate}</td>
                      <td className={`py-3 px-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{customer.dueDate}</td>
                      <td className={`py-3 px-4 text-sm font-bold text-right ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>₹{customer.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg font-bold text-sm ${
                          customer.days > 90 ? 'bg-red-500/20 text-red-500' :
                          customer.days > 60 ? 'bg-orange-500/20 text-orange-500' :
                          customer.days > 30 ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {customer.days}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          getStatusColor(customer.status)
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className={`p-2 rounded-lg transition-colors ${
                            isDarkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`} title="Call">
                            <PhoneCall className="w-4 h-4" />
                          </button>
                          <button className={`p-2 rounded-lg transition-colors ${
                            isDarkMode ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`} title="Email">
                            <Mail className="w-4 h-4" />
                          </button>
                          <button className={`p-2 rounded-lg transition-colors ${
                            isDarkMode ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                          }`} title="Send Reminder">
                            <Bell className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}