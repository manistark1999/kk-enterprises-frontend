import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package,
  Calendar,
  Download,
  Printer,
  Filter,
  RefreshCw,
  Search,
  FileText,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { useStock } from '@/contexts/StockContext';

interface StockRegisterScreenProps {
  isDarkMode: boolean;
}

export function StockRegisterScreen({ isDarkMode }: StockRegisterScreenProps) {
  const { stockItems, refreshStock } = useStock();

  React.useEffect(() => {
    refreshStock();
    const interval = setInterval(refreshStock, 60000);
    return () => clearInterval(interval);
  }, [refreshStock]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

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

  // Get unique categories
  const categories = ['All', ...new Set(stockItems.map(item => item.category))];

  // Filter stock items
  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    
    let matchesDateRange = true;
    if (fromDate && toDate) {
      const itemDate = new Date(item.lastPurchaseDate);
      matchesDateRange = itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDateRange;
  });

  // Calculate totals
  const totalStock = filteredItems.reduce((sum, item) => sum + item.currentStock, 0);
  const totalValue = filteredItems.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockCount = filteredItems.filter(item => item.status === 'Low Stock').length;
  const outOfStockCount = filteredItems.filter(item => item.status === 'Out of Stock').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-blue-600 text-white shadow-sm';
      case 'Low Stock': return isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'Out of Stock': return 'bg-blue-900/40 text-blue-300 border border-blue-800';
      case 'Overstocked': return 'bg-blue-500/20 text-blue-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header Card */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Stock Register</h1>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Complete inventory listing with real-time updates</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span className="text-sm font-medium">Print</span>
              </motion.button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Total Items</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{filteredItems.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Total Stock Qty</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{totalStock}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Total Value</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>₹{totalValue.toLocaleString()}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Alerts</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{lowStockCount + outOfStockCount}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search by item name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputClass} pl-10 w-full`}
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={inputClass}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClass}
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Overstocked">Overstocked</option>
            </select>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                isDarkMode
                  ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
                  : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
              }`}
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setStatusFilter('All');
                setFromDate('');
                setToDate('');
              }}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Reset</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Table Card */}
      <motion.div
        className={`${cardClass} mt-6 flex-1 flex flex-col overflow-hidden`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Stock Items ({filteredItems.length})</h2>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-full inline-block align-middle">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead className={`sticky top-0 ${
                isDarkMode ? 'bg-gray-800/95' : 'bg-gray-50/95'
              } backdrop-blur-sm z-10`}>
                <tr className={`border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <th className={`text-left py-4 px-4 text-xs font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Item Code</th>
                  <th className={`text-left py-4 px-4 text-xs font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Item Name</th>
                  <th className={`text-left py-4 px-4 text-xs font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Category</th>
                  <th className={`text-left py-4 px-4 text-xs font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Brand</th>
                  <th className={`text-right py-4 px-4 text-xs font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Current Stock</th>
                  <th className={`text-right py-4 px-4 text-xs font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Unit Price</th>
                  <th className={`text-right py-4 px-4 text-xs font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Total Value</th>
                  <th className={`text-left py-4 px-4 text-xs font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Last Purchase</th>
                  <th className={`text-center py-4 px-4 text-xs font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <Package className={`w-12 h-12 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>No stock items found</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`border-b ${
                        isDarkMode
                          ? 'border-gray-700/50 hover:bg-gray-700/30'
                          : 'border-gray-100 hover:bg-gray-50'
                      } transition-colors cursor-pointer`}
                    >
                      <td className={`py-4 px-4 text-sm font-medium truncate ${
                        item.status === 'Low Stock'
                          ? isDarkMode ? 'hover:bg-blue-600/20 text-blue-400' : 'hover:bg-blue-100 text-blue-600'
                          : item.status === 'Out of Stock'
                              ? isDarkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-900/10 text-blue-800'
                              : isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} title={item.itemCode}>{item.itemCode}</td>
                      <td className={`py-4 px-4 text-sm font-medium truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`} title={item.itemName}>{item.itemName}</td>
                      <td className={`py-4 px-4 text-sm truncate ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`} title={item.category}>{item.category}</td>
                      <td className={`py-4 px-4 text-sm truncate ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`} title={item.brand}>{item.brand}</td>
                      <td className={`py-4 px-4 text-sm font-semibold text-right truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`} title={`${item.currentStock} ${item.unit}`}>
                        {item.currentStock} <span className="text-xs opacity-70">{item.unit}</span>
                      </td>
                      <td className={`py-4 px-4 text-sm text-right truncate ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`} title={`₹${item.unitPrice.toLocaleString()}`}>₹{item.unitPrice.toLocaleString()}</td>
                      <td className={`py-4 px-4 text-sm font-semibold text-right truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`} title={`₹${item.totalValue.toLocaleString()}`}>₹{item.totalValue.toLocaleString()}</td>
                      <td className={`py-4 px-4 text-sm truncate ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`} title={new Date(item.lastPurchaseDate).toLocaleDateString()}>
                        {new Date(item.lastPurchaseDate).toLocaleDateString('en-IN', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                          getStatusColor(item.status)
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        <div className={`p-6 border-t ${
          isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Items Displayed</p>
              <p className={`text-xl font-bold mt-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{filteredItems.length}</p>
            </div>
            <div>
              <p className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Quantity</p>
              <p className={`text-xl font-bold mt-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{totalStock} Units</p>
            </div>
            <div>
              <p className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Stock Value</p>
              <p className={`text-xl font-bold mt-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>₹{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}