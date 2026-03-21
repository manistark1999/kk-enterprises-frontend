import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Minus,
  Calendar,
  DollarSign,
  FileOutput,
  CreditCard,
  FileText,
  Users,
  FileCheck,
  Bell,
  User
} from 'lucide-react';

interface PaymentsVouchersScreenProps {
  isDarkMode: boolean;
}

export function PaymentsVouchersScreen({ isDarkMode }: PaymentsVouchersScreenProps) {
  const [activeTab, setActiveTab] = useState<'journal' | 'vouchers' | 'creditors' | 'invoices'>('vouchers');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [selectedVoucherType, setSelectedVoucherType] = useState('Payment');
  const [formData, setFormData] = useState({
    date: '25/02/2026',
    debitGroup: '',
    debitLedger: '',
    creditGroup: '',
    creditLedger: '',
    amount: '',
    narration: ''
  });

  const tabs = [
    { id: 'journal', label: 'Sales & Purchase Journal', icon: FileText },
    { id: 'vouchers', label: 'Payments & Vouchers', icon: CreditCard },
    { id: 'creditors', label: 'Sundry Creditors Payment', icon: Users },
    { id: 'invoices', label: 'Invoices', icon: FileCheck }
  ];

  const accountGroups = [
    { id: 'purchase', label: 'Purchase Accounts', ledgers: ['Local Purchase', 'Interstate Purchase', 'Import Purchase'] },
    { id: 'sales', label: 'Sales Accounts', ledgers: ['Local Sales', 'Interstate Sales', 'Export Sales'] },
    { id: 'duties', label: 'Duties & Taxes', ledgers: ['GST Input', 'GST Output', 'TDS Payable', 'TCS Receivable'] },
    { id: 'trading', label: 'Direct Expenses (Trading A/c)', ledgers: ['Freight Inward', 'Carriage', 'Loading Charges'] },
    { id: 'indirect-exp', label: 'Indirect Expenses', ledgers: ['Salary', 'Rent', 'Electricity', 'Office Expenses'] },
    { id: 'indirect-income', label: 'Indirect Income', ledgers: ['Interest Received', 'Commission Received', 'Discount Received'] },
    { id: 'bank', label: 'Bank & Cash', ledgers: ['Cash in Hand', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'] },
    { id: 'capital', label: 'Capital & Reserves', ledgers: ['Capital Account', 'Reserves & Surplus', 'Retained Earnings'] }
  ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <div className={`min-h-screen p-6 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50'
    }`}>
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border p-6 mb-6 ${
          isDarkMode
            ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700'
            : 'bg-white/50 backdrop-blur-xl border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Ledger Accounts (Tally Style)</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Manage payment vouchers, receipts, and journal entries</p>
          </div>
          
          {/* Right side - User Info and Buttons */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100/10 transition-all">
              <Bell className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            {/* Divider */}
            <div className={`h-10 w-px ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`} />

            {/* User Info Section - Minimalist */}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <User className={`w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </div>

              {/* User Name Only */}
              <p className={`text-sm font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>kk</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-xl border overflow-hidden mb-6 ${
          isDarkMode
            ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700'
            : 'bg-white/50 backdrop-blur-xl border-gray-200'
        }`}
      >
        <div className={`flex overflow-x-auto ${
          isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'
        }`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? isDarkMode
                      ? 'bg-gray-700 text-blue-400'
                      : 'bg-blue-50 text-blue-600'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                      isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'vouchers' ? (
            <motion.div
              key="vouchers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side - Chart of Accounts */}
                <div className="lg:col-span-4">
                  <div className={`rounded-xl border p-5 ${
                    isDarkMode
                      ? 'bg-gray-800/50 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-bold mb-4 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      Chart of Accounts
                    </h3>
                    
                    <div className="space-y-2">
                      {accountGroups.map((group) => (
                        <div key={group.id}>
                          {/* Group Header */}
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all border ${
                              isDarkMode
                                ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-700 text-gray-300'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <span className="font-medium text-sm">{group.label}</span>
                            {expandedGroups.includes(group.id) ? (
                              <Minus className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </button>

                          {/* Ledgers */}
                          <AnimatePresence>
                            {expandedGroups.includes(group.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-4 space-y-1 py-2">
                                  {group.ledgers.map((ledger) => (
                                    <button
                                      key={ledger}
                                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                        isDarkMode
                                          ? 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200'
                                          : 'hover:bg-blue-50 text-gray-600 hover:text-blue-600'
                                      }`}
                                    >
                                      {ledger}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side - Record Payment / Receipt Form */}
                <div className="lg:col-span-8">
                  <div className={`rounded-xl border p-6 ${
                    isDarkMode
                      ? 'bg-gray-800/50 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-bold mb-6 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      Record Payment / Receipt
                    </h3>

                    <div className="space-y-5">
                      {/* Date and Voucher Type Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Date */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Date
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.date}
                              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                              className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                                isDarkMode
                                  ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500'
                                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            />
                            <Calendar className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                          </div>
                        </div>

                        {/* Voucher Type */}
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Voucher Type
                          </label>
                          <select
                            value={selectedVoucherType}
                            onChange={(e) => setSelectedVoucherType(e.target.value)}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                              isDarkMode
                                ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500'
                                : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          >
                            <option>Payment</option>
                            <option>Receipt</option>
                            <option>Contra</option>
                            <option>Journal</option>
                          </select>
                        </div>
                      </div>

                      {/* Debit Account Section */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Debit Account (Dr)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <select
                            value={formData.debitGroup}
                            onChange={(e) => setFormData({ ...formData, debitGroup: e.target.value, debitLedger: '' })}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                              isDarkMode
                                ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500'
                                : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          >
                            <option value="">Select Group...</option>
                            {accountGroups.map((group) => (
                              <option key={group.id} value={group.id}>{group.label}</option>
                            ))}
                          </select>

                          <select
                            value={formData.debitLedger}
                            onChange={(e) => setFormData({ ...formData, debitLedger: e.target.value })}
                            disabled={!formData.debitGroup}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                              isDarkMode
                                ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 disabled:opacity-50'
                                : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 disabled:opacity-50'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          >
                            <option value="">Select Ledger...</option>
                            {formData.debitGroup && accountGroups
                              .find(g => g.id === formData.debitGroup)?.ledgers
                              .map((ledger) => (
                                <option key={ledger} value={ledger}>{ledger}</option>
                              ))}
                          </select>
                        </div>
                      </div>

                      {/* Credit Account Section */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Credit Account (Cr)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <select
                            value={formData.creditGroup}
                            onChange={(e) => setFormData({ ...formData, creditGroup: e.target.value, creditLedger: '' })}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                              isDarkMode
                                ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500'
                                : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          >
                            <option value="">Select Group...</option>
                            {accountGroups.map((group) => (
                              <option key={group.id} value={group.id}>{group.label}</option>
                            ))}
                          </select>

                          <select
                            value={formData.creditLedger}
                            onChange={(e) => setFormData({ ...formData, creditLedger: e.target.value })}
                            disabled={!formData.creditGroup}
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                              isDarkMode
                                ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 disabled:opacity-50'
                                : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 disabled:opacity-50'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          >
                            <option value="">Select Ledger...</option>
                            {formData.creditGroup && accountGroups
                              .find(g => g.id === formData.creditGroup)?.ledgers
                              .map((ledger) => (
                                <option key={ledger} value={ledger}>{ledger}</option>
                              ))}
                          </select>
                        </div>
                      </div>

                      {/* Amount */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Amount (₹)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.00"
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                              isDarkMode
                                ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500'
                                : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                          />
                          <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                            }`}>
                              <span className="text-xs">↑</span>
                            </div>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                            }`}>
                              <span className="text-xs">↓</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Narration */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Narration
                        </label>
                        <textarea
                          value={formData.narration}
                          onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                          rows={4}
                          placeholder="Enter narration..."
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all resize-none ${
                            isDarkMode
                              ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500'
                              : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-end pt-2">
                        <button className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}>
                          Cancel
                        </button>
                        <button className="px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl">
                          Save Entry
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="other"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-20 text-center"
            >
              <FileText className={`w-16 h-16 mx-auto mb-4 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Select an option above
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Click on any tab above to open the respective form
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Recent Receipts Section (when not in form view) */}
      {activeTab !== 'vouchers' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl border overflow-hidden ${
            isDarkMode
              ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700'
              : 'bg-white/50 backdrop-blur-xl border-gray-200'
          }`}
        >
          <div className={`p-6 ${
            isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold flex items-center gap-2 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              <FileText className="w-5 h-5" />
              Recent Receipts
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Receipt ID</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Date</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Customer</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Receipt No</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Amount</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Payment Mode</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Reference</th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <FileText className={`w-12 h-12 mx-auto mb-3 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      No receipts found
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}