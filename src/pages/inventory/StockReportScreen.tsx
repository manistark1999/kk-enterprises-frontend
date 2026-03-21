import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  Download,
  Printer,
  Filter,
  RefreshCw,
  Box,
  Boxes,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Activity,
  ShoppingCart,
  BarChart3,
  PieChart as PieChartIcon,
  Search,
  FileText,
  Archive,
  Target
} from 'lucide-react';
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

interface StockReportScreenProps {
  isDarkMode: boolean;
}

interface StockMovement {
  itemName: string;
  opening: number;
  inward: number;
  outward: number;
  closing: number;
  value: number;
}

export function StockReportScreen({ isDarkMode }: StockReportScreenProps) {
  const [dateRange, setDateRange] = useState('This Month');
  const [reportType, setReportType] = useState('Summary');
  const [categoryFilter, setCategoryFilter] = useState('All');

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
  const stockMovementData = [
    { month: 'Jan', inward: 45, outward: 32, net: 13, id: 'stock-jan' },
    { month: 'Feb', inward: 52, outward: 38, net: 14, id: 'stock-feb' },
    { month: 'Mar', inward: 48, outward: 42, net: 6, id: 'stock-mar' },
    { month: 'Apr', inward: 61, outward: 35, net: 26, id: 'stock-apr' },
    { month: 'May', inward: 55, outward: 48, net: 7, id: 'stock-may' },
    { month: 'Jun', inward: 67, outward: 45, net: 22, id: 'stock-jun' },
  ];

  const categoryDistribution = [
    { name: 'Lubricants', value: 28, color: '#2563EB', id: 'dist-lube' },
    { name: 'Filters', value: 22, color: '#10B981', id: 'dist-filters' },
    { name: 'Brake Parts', value: 18, color: '#F59E0B', id: 'dist-brake' },
    { name: 'Engine Parts', value: 15, color: '#8B5CF6', id: 'dist-engine' },
    { name: 'Electrical', value: 10, color: '#EF4444', id: 'dist-electrical' },
    { name: 'Others', value: 7, color: '#6B7280', id: 'dist-others' },
  ];

  const stockValueTrend = [
    { month: 'Jan', value: 275000, id: 'value-jan' },
    { month: 'Feb', value: 298000, id: 'value-feb' },
    { month: 'Mar', value: 285000, id: 'value-mar' },
    { month: 'Apr', value: 315000, id: 'value-apr' },
    { month: 'May', value: 302000, id: 'value-may' },
    { month: 'Jun', value: 335000, id: 'value-jun' },
  ];

  const stockMovements: StockMovement[] = [
    { itemName: 'Engine Oil 5W-30', opening: 50, inward: 30, outward: 35, closing: 45, value: 20250 },
    { itemName: 'Brake Pad Set', opening: 20, inward: 15, outward: 23, closing: 12, value: 14400 },
    { itemName: 'Air Filter', opening: 35, inward: 25, outward: 32, closing: 28, value: 9800 },
    { itemName: 'Oil Filter', opening: 40, inward: 20, outward: 25, closing: 35, value: 9800 },
    { itemName: 'Spark Plug Set', opening: 15, inward: 10, outward: 25, closing: 0, value: 0 },
    { itemName: 'Coolant Fluid', opening: 25, inward: 8, outward: 25, closing: 8, value: 2560 },
  ];

  const topMovingItems = [
    { item: 'Engine Oil 5W-30', units: 156, trend: '+18%', status: 'Fast Moving' },
    { item: 'Brake Pad Set', units: 142, trend: '+22%', status: 'Fast Moving' },
    { item: 'Air Filter', units: 128, trend: '+15%', status: 'Fast Moving' },
    { item: 'Oil Filter', units: 115, trend: '+12%', status: 'Regular' },
    { item: 'Spark Plug Set', units: 98, trend: '+8%', status: 'Regular' },
  ];

  const slowMovingItems = [
    { item: 'Battery Terminal Cleaner', units: 8, trend: '-5%', daysInStock: 145 },
    { item: 'Engine Degreaser', units: 12, trend: '-3%', daysInStock: 120 },
    { item: 'Radiator Flush', units: 15, trend: '-2%', daysInStock: 98 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
          }`}>
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Stock Reports Dashboard</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Comprehensive inventory analytics and stock movement tracking</p>
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

      {/* Filters */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-4">
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
              <option value="Summary">Summary Report</option>
              <option value="Movement">Stock Movement</option>
              <option value="Valuation">Stock Valuation</option>
              <option value="Aging">Aging Analysis</option>
              <option value="Turnover">Turnover Report</option>
              <option value="Reorder">Reorder Report</option>
            </select>

            <div className="flex items-center gap-2 ml-4">
              <Box className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Category:</span>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={inputClass}
            >
              <option value="All">All Categories</option>
              <option value="Lubricants">Lubricants</option>
              <option value="Filters">Filters</option>
              <option value="Brake Parts">Brake Parts</option>
              <option value="Engine Parts">Engine Parts</option>
              <option value="Electrical">Electrical</option>
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
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
              }`}>
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +12.5%
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Stock Value</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>₹3,35,000</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>vs ₹2,98,000 last month</p>
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
                isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50'
              }`}>
                <AlertCircle className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex items-center gap-1 text-orange-500 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                Alert
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Low Stock Items</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>8</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Reorder required soon</p>
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
                isDarkMode ? 'bg-red-500/20' : 'bg-red-50'
              }`}>
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex items-center gap-1 text-red-500 text-sm font-medium">
                <TrendingDown className="w-4 h-4" />
                Critical
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Out of Stock</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>3</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Immediate action needed</p>
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
                <Activity className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Good
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Stock Turnover Ratio</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>4.8x</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Better than target (4.0x)</p>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Trend */}
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
                }`}>Stock Movement Trend</h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Inward vs Outward (6 months)</p>
              </div>
              <Activity className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stockMovementData} key="stock-movement-chart">
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="month" 
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                  }}
                />
                <Legend />
                <Bar dataKey="inward" fill="#10B981" name="Inward" radius={[8, 8, 0, 0]} id="bar-inward" />
                <Bar dataKey="outward" fill="#EF4444" name="Outward" radius={[8, 8, 0, 0]} id="bar-outward" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution */}
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
                }`}>Stock by Category</h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Inventory distribution</p>
              </div>
              <PieChartIcon className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPie>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry) => (
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
                  formatter={(value: any) => `${value} items`}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Stock Value Trend */}
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
              }`}>Stock Valuation Trend</h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Monthly stock value progression</p>
            </div>
            <BarChart3 className={`w-5 h-5 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stockValueTrend}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Stock Value']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#06B6D4" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Stock Movement Table */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Stock Movement Details</h2>
            </div>
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
                    }`}>Item Name</th>
                    <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Opening</th>
                    <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Inward</th>
                    <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Outward</th>
                    <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Closing</th>
                    <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Value</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {stockMovements.map((movement, index) => (
                    <tr
                      key={index}
                      className={`transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`py-3 px-4 text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{movement.itemName}</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{movement.opening}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className="text-green-500 font-medium">+{movement.inward}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className="text-red-500 font-medium">-{movement.outward}</span>
                      </td>
                      <td className={`py-3 px-4 text-sm font-semibold text-right ${
                        movement.closing === 0
                          ? 'text-red-500'
                          : movement.closing < 15
                          ? isDarkMode ? 'text-orange-400' : 'text-orange-600'
                          : isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>{movement.closing}</td>
                      <td className={`py-3 px-4 text-sm font-bold text-right ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>₹{movement.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Moving Items */}
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Fast Moving Items</h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>High turnover products</p>
              </div>
              <Target className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className="space-y-3">
              {topMovingItems.map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
                    }`}>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{item.item}</h4>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{item.units} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-500 font-bold">{item.trend}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                    }`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Slow Moving Items */}
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Slow Moving Items</h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Review inventory strategy</p>
              </div>
              <Archive className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className="space-y-3">
              {slowMovingItems.map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50'
                    }`}>
                      <TrendingDown className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{item.item}</h4>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{item.units} units • {item.daysInStock} days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-500 font-bold">{item.trend}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'
                    }`}>Review</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}