import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText,
  Download,
  Printer,
  Search,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Package,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useStock } from '@/contexts/StockContext';

interface StockAdjustmentsRegisterScreenProps {
  isDarkMode: boolean;
}

export function StockAdjustmentsRegisterScreen({ isDarkMode }: StockAdjustmentsRegisterScreenProps) {
  const { adjustments, stockItems } = useStock();

  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const cardClass = `rounded-xl ${
    isDarkMode 
      ? 'bg-gray-800/40 border-gray-700/50' 
      : 'bg-white/60'
  } backdrop-blur-xl border border-white/20 shadow-lg`;

  const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all outline-none text-sm ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
  }`;

  // Filter adjustments
  const filteredAdjustments = useMemo(() => {
    let filtered = [...adjustments];

    // Date range filter
    if (dateFilter.from) {
      filtered = filtered.filter(adj => adj.date >= dateFilter.from);
    }
    if (dateFilter.to) {
      filtered = filtered.filter(adj => adj.date <= dateFilter.to);
    }

    // Type filter
    if (typeFilter !== 'All') {
      filtered = filtered.filter(adj => adj.adjustmentType === typeFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(adj =>
        adj.id.toLowerCase().includes(query) ||
        adj.itemName.toLowerCase().includes(query) ||
        adj.itemCode.toLowerCase().includes(query) ||
        adj.reason.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.localeCompare(a.date));

    return filtered;
  }, [adjustments, dateFilter, searchQuery, typeFilter]);

  // Calculate totals
  const totalAdditions = filteredAdjustments
    .filter(adj => adj.adjustmentType === 'Add')
    .reduce((sum, adj) => sum + adj.quantity, 0);
  const totalRemovals = filteredAdjustments
    .filter(adj => adj.adjustmentType === 'Remove')
    .reduce((sum, adj) => sum + adj.quantity, 0);
  const netAdjustment = totalAdditions - totalRemovals;

  const handleClearFilters = () => {
    setDateFilter({ from: '', to: '' });
    setSearchQuery('');
    setTypeFilter('All');
    toast.success('Filters cleared');
  };

  const handleExport = () => {
    const csvContent = [
      ['Adj. No.', 'Date', 'Item Code', 'Item Name', 'Type', 'Quantity', 'Previous Stock', 'New Stock', 'Reason', 'Remarks'].join(','),
      ...filteredAdjustments.map(adj => [
        adj.adjustmentNo,
        adj.date,
        adj.itemCode,
        adj.itemName,
        adj.adjustmentType,
        adj.quantity,
        adj.previousStock,
        adj.newStock,
        adj.reason,
        adj.remarks
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stock-adjustments-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Stock Adjustments exported successfully!');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
          }`}>
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Stock Adjustments Register</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Complete history of stock corrections - Auto-synced from Stock Adjustment</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleExport}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Additions</span>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{totalAdditions}</div>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>{filteredAdjustments.filter(a => a.adjustmentType === 'Add').length} entries</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Removals</span>
              <TrendingDown className="w-5 h-5 text-blue-900" />
            </div>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-700' : 'text-blue-900'}`}>{totalRemovals}</div>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>{filteredAdjustments.filter(a => a.adjustmentType === 'Remove').length} entries</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Net Adjustment</span>
              <Package className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className={`text-3xl font-bold ${
              netAdjustment >= 0 
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                : 'text-blue-900 border-b border-blue-900/40'
            }`}>{netAdjustment >= 0 ? '+' : ''}{netAdjustment}</div>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Overall change</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Adjustments</span>
              <FileText className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>{filteredAdjustments.length}</div>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Filtered results</p>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Date From */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>From Date</label>
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Date To */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>To Date</label>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={inputClass}
              >
                <option value="All">All Types</option>
                <option value="Add">Additions Only</option>
                <option value="Remove">Removals Only</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Search</label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className={`w-full px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Adjustments Table */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Stock Adjustment History</h2>
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total: {filteredAdjustments.length} adjustments
            </div>
          </div>

          {filteredAdjustments.length === 0 ? (
            <div className={`text-center py-12 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No stock adjustments found</p>
              <p className="text-sm mt-1">Go to Inventory → Stock Adjustment to add entries</p>
            </div>
          ) : (
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
                      }`}>Adj. No.</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Date</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Item Code</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Item Name</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Type</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Quantity</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Previous Stock</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>New Stock</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Reason</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                  }`}>
                    {filteredAdjustments.map((adj) => (
                      <tr
                        key={adj.id}
                        className={`transition-colors ${
                          isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className={`py-3 px-4 text-sm font-medium ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>{adj.id}</td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{adj.date}</td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{adj.itemCode}</td>
                        <td className={`py-3 px-4 text-sm font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{adj.itemName}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            adj.adjustmentType === 'Add'
                              ? isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                              : isDarkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-900/10 text-blue-800'
                          }`}>
                            {adj.adjustmentType === 'Add' ? (
                              <><TrendingUp className="w-3 h-3" /> Add</>
                            ) : (
                              <><TrendingDown className="w-3 h-3" /> Remove</>
                            )}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-sm font-bold text-right ${
                          adj.adjustmentType === 'Add' ? 'text-blue-600' : 'text-blue-800'
                        }`}>{adj.quantity}</td>
                        <td className={`py-3 px-4 text-sm text-right ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{adj.previousStock}</td>
                        <td className={`py-3 px-4 text-sm font-bold text-right ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>{adj.newStock}</td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{adj.reason}</td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>{adj.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}