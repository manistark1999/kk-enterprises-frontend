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
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useTransactions, type CashEntry } from '@/contexts/TransactionsContext';

interface CashRegisterReportScreenProps {
  isDarkMode: boolean;
}

export function CashRegisterReportScreen({ isDarkMode }: CashRegisterReportScreenProps) {
  const { cashEntries } = useTransactions();

  const [dateFilter, setDateFilter] = useState({
    from: '',
    to: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let filtered = [...cashEntries];

    // Date range filter
    if (dateFilter.from) {
      filtered = filtered.filter(entry => entry.date >= dateFilter.from);
    }
    if (dateFilter.to) {
      filtered = filtered.filter(entry => entry.date <= dateFilter.to);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.entryNo.toLowerCase().includes(query) ||
        entry.referenceNo.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.paymentType.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });

    return filtered;
  }, [cashEntries, dateFilter, searchQuery]);

  // Calculate running balance
  const entriesWithBalance = useMemo(() => {
    let runningBalance = 0;
    
    // Calculate initial balance from entries before the filter date
    if (dateFilter.from) {
      const earlierEntries = cashEntries.filter(entry => entry.date < dateFilter.from);
      earlierEntries.forEach(entry => {
        if (entry.transactionType === 'Cash In') {
          runningBalance += entry.amount;
        } else {
          runningBalance -= entry.amount;
        }
      });
    }

    return filteredEntries.map(entry => {
      if (entry.transactionType === 'Cash In') {
        runningBalance += entry.amount;
      } else {
        runningBalance -= entry.amount;
      }
      return {
        ...entry,
        balance: runningBalance
      };
    });
  }, [filteredEntries, cashEntries, dateFilter.from]);

  // Calculate totals
  const totalCashIn = filteredEntries
    .filter(e => e.transactionType === 'Cash In')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCashOut = filteredEntries
    .filter(e => e.transactionType === 'Cash Out')
    .reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalCashIn - totalCashOut;
  const finalBalance = entriesWithBalance.length > 0 
    ? entriesWithBalance[entriesWithBalance.length - 1].balance 
    : 0;

  const handleClearFilters = () => {
    setDateFilter({ from: '', to: '' });
    setSearchQuery('');
    toast.success('Filters cleared');
  };

  const handleExport = () => {
    const csvContent = [
      ['Entry No.', 'Date', 'Time', 'Reference No.', 'Description', 'Cash In', 'Cash Out', 'Balance', 'Payment Type'].join(','),
      ...entriesWithBalance.map(entry => [
        entry.entryNo,
        entry.date,
        entry.time,
        entry.referenceNo,
        entry.description,
        entry.transactionType === 'Cash In' ? entry.amount : '',
        entry.transactionType === 'Cash Out' ? entry.amount : '',
        entry.balance,
        entry.paymentType
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cash-register-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Cash Register exported successfully!');
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
            }`}>Cash Register Report</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>View all cash transactions with running balance - Auto-synced from Cash Entry</p>
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
              }`}>Total Cash In</span>
              <ArrowUpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">₹{totalCashIn.toLocaleString()}</div>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>{filteredEntries.filter(e => e.transactionType === 'Cash In').length} receipts</p>
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
              }`}>Total Cash Out</span>
              <ArrowDownCircle className="w-5 h-5 text-blue-700" />
            </div>
            <div className="text-3xl font-bold text-blue-700">₹{totalCashOut.toLocaleString()}</div>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>{filteredEntries.filter(e => e.transactionType === 'Cash Out').length} payments</p>
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
              }`}>Net Balance</span>
              <TrendingUp className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className={`text-3xl font-bold ${
              netBalance >= 0 
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                : 'text-blue-700'
            }`}>₹{netBalance.toLocaleString()}</div>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Period balance</p>
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
              }`}>Current Balance</span>
              <DollarSign className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className={`text-3xl font-bold ${
              finalBalance >= 0
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                : 'text-blue-700'
            }`}>₹{finalBalance.toLocaleString()}</div>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Running balance</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Cash Register Table */}
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
              }`}>Cash Register Transactions</h2>
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total: {filteredEntries.length} entries
            </div>
          </div>

          {entriesWithBalance.length === 0 ? (
            <div className={`text-center py-12 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No cash entries found</p>
              <p className="text-sm mt-1">Go to Accounts → Cash Entry to add transactions</p>
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
                      }`}>Entry No.</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Date</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Time</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Reference No.</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Description</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Cash In</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Cash Out</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Balance</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Payment</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                  }`}>
                    {entriesWithBalance.map((entry, index) => (
                      <tr
                        key={entry.id}
                        className={`transition-colors ${
                          isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className={`py-3 px-4 text-sm font-medium ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>{entry.entryNo}</td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{entry.date}</td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{entry.time}</td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{entry.referenceNo}</td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{entry.description}</td>
                        <td className={`py-3 px-4 text-sm font-bold text-right ${
                          entry.transactionType === 'Cash In' 
                            ? 'text-blue-600' 
                            : isDarkMode ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {entry.transactionType === 'Cash In' ? `₹${entry.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className={`py-3 px-4 text-sm font-bold text-right ${
                          entry.transactionType === 'Cash Out' 
                            ? 'text-blue-700' 
                            : isDarkMode ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {entry.transactionType === 'Cash Out' ? `₹${entry.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className={`py-3 px-4 text-sm font-bold text-right ${
                          entry.balance >= 0
                            ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                            : 'text-blue-700'
                        }`}>₹{entry.balance.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{entry.paymentType}</td>
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
