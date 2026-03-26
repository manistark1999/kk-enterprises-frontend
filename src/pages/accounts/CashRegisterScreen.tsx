import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet,
  Save,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useTransactions, type CashEntry } from '@/contexts/TransactionsContext';

interface CashRegisterScreenProps {
  isDarkMode: boolean;
}

export function CashRegisterScreen({ isDarkMode }: CashRegisterScreenProps) {
  const { cashEntries, addCashEntry, updateCashEntry, deleteCashEntry } = useTransactions();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    referenceNo: '',
    description: '',
    amount: '',
    transactionType: 'Cash In' as 'Cash In' | 'Cash Out',
    paymentType: 'Cash',
    notes: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const cardClass = `rounded-xl ${
    isDarkMode 
      ? 'bg-gray-800/40 border-gray-700/50' 
      : 'bg-white/60'
  } backdrop-blur-xl border border-white/20 shadow-lg`;

  const inputClass = `w-full px-4 py-3 rounded-lg border transition-all outline-none text-base ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${
    isDarkMode ? 'text-gray-200' : 'text-gray-700'
  }`;

  // Calculate summary stats
  const todayDate = new Date().toISOString().split('T')[0];
  const todaysEntries = cashEntries.filter(entry => entry.date === todayDate);
  const totalCashIn = todaysEntries
    .filter(e => e.transactionType === 'Cash In')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCashOut = todaysEntries
    .filter(e => e.transactionType === 'Cash Out')
    .reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalCashIn - totalCashOut;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.referenceNo || !formData.description || !formData.amount) {
      toast.error('Please fill all required fields!');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount!');
      return;
    }

    const currentTime = new Date().toTimeString().slice(0, 5);

    if (editingId) {
      // Update existing entry
      const updatedEntry: CashEntry = {
        id: editingId,
        entryNo: cashEntries.find(e => e.id === editingId)?.entryNo || '',
        date: formData.date,
        time: currentTime,
        transactionType: formData.transactionType,
        referenceNo: formData.referenceNo,
        description: formData.description,
        amount: amount,
        paymentType: formData.paymentType,
        notes: formData.notes,
        handledBy: 'Admin',
        createdAt: cashEntries.find(e => e.id === editingId)?.createdAt || new Date().toISOString()
      };

      updateCashEntry(editingId, updatedEntry);
      toast.success(`Cash entry ${updatedEntry.entryNo} updated successfully!`);
      setEditingId(null);
    } else {
      // Create new entry
      const newEntryNo = `CE-${String(cashEntries.length + 1).padStart(4, '0')}`;
      
      const newEntry: CashEntry = {
        id: `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        entryNo: newEntryNo,
        date: formData.date,
        time: currentTime,
        transactionType: formData.transactionType,
        referenceNo: formData.referenceNo,
        description: formData.description,
        amount: amount,
        paymentType: formData.paymentType,
        notes: formData.notes,
        handledBy: 'Admin',
        createdAt: new Date().toISOString()
      };

      addCashEntry(newEntry);
      toast.success(`Cash entry ${newEntryNo} saved successfully! This will appear in Cash Register report.`);
    }

    // Clear form
    handleClear();
  };

  const handleClear = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      referenceNo: '',
      description: '',
      amount: '',
      transactionType: 'Cash In',
      paymentType: 'Cash',
      notes: '',
    });
    setEditingId(null);
  };

  const handleEdit = (entry: CashEntry) => {
    setFormData({
      date: entry.date,
      referenceNo: entry.referenceNo,
      description: entry.description,
      amount: entry.amount.toString(),
      transactionType: entry.transactionType,
      paymentType: entry.paymentType,
      notes: entry.notes || '',
    });
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string, entryNo: string) => {
    if (window.confirm(`Are you sure you want to delete entry ${entryNo}?`)) {
      deleteCashEntry(id);
      toast.success('Cash entry deleted successfully!');
    }
  };

  // Get recent entries (last 10)
  const recentEntries = [...cashEntries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
          }`}>
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Cash Entry</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Record cash transactions - Auto-syncs with Cash Register report</p>
          </div>
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
              }`}>Cash In (Today)</span>
              <ArrowUpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">₹{totalCashIn.toLocaleString()}</div>
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
              }`}>Cash Out (Today)</span>
              <ArrowDownCircle className="w-5 h-5 text-blue-700" />
            </div>
            <div className="text-3xl font-bold text-blue-700">₹{totalCashOut.toLocaleString()}</div>
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
              <DollarSign className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className={`text-3xl font-bold ${
              netBalance >= 0 
                ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                : 'text-blue-700'
            }`}>₹{netBalance.toLocaleString()}</div>
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
              }`}>Total Entries</span>
              <FileText className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>{cashEntries.length}</div>
          </div>
        </motion.div>
      </div>

      {/* Cash Entry Form */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6">
          {/* Section Title */}
          <div className={`mb-6 pb-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className={`w-5 h-5 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>{editingId ? 'Edit Cash Entry' : 'New Cash Entry'}</h2>
              </div>
              {editingId && (
                <button
                  onClick={handleClear}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <X className="w-4 h-4" />
                  Cancel Edit
                </button>
              )}
            </div>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>All entries will automatically sync with Cash Register report</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Row 1: Date and Transaction Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={labelClass}>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Transaction Type *</label>
                <select
                  value={formData.transactionType}
                  onChange={(e) => setFormData({ ...formData, transactionType: e.target.value as 'Cash In' | 'Cash Out' })}
                  className={inputClass}
                  required
                >
                  <option value="Cash In">Cash In (Receipt)</option>
                  <option value="Cash Out">Cash Out (Payment)</option>
                </select>
              </div>
            </div>

            {/* Row 2: Reference No and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={labelClass}>Reference No. / Invoice No. *</label>
                <input
                  type="text"
                  value={formData.referenceNo}
                  onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                  placeholder="Enter reference number"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Amount *</label>
                <div className="relative">
                  <span className={`absolute left-4 top-3.5 text-base ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>₹</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`${inputClass} pl-8`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Payment Type and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={labelClass}>Payment Type</label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  className={inputClass}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Row 4: Notes */}
            <div className="grid grid-cols-1 mb-6">
              <div>
                <label className={labelClass}>Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter additional notes..."
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex items-center justify-end gap-3 pt-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                type="button"
                onClick={handleClear}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Clear
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 transition-all"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Recent Entries Table */}
      {recentEntries.length > 0 && (
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
                }`}>Recent Entries (Last 10)</h2>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                View all in Reports → Cash Register
              </p>
            </div>

            {/* Table */}
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
                      }`}>Reference</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Description</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Cash In</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Cash Out</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                  }`}>
                    {recentEntries.map((entry, index) => (
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
                        }`}>{entry.referenceNo}</td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{entry.description}</td>
                        <td className={`py-3 px-4 text-sm font-bold text-right ${
                          entry.transactionType === 'Cash In' ? 'text-blue-600' : isDarkMode ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {entry.transactionType === 'Cash In' ? `₹${entry.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className={`py-3 px-4 text-sm font-bold text-right ${
                          entry.transactionType === 'Cash Out' ? 'text-blue-700' : isDarkMode ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {entry.transactionType === 'Cash Out' ? `₹${entry.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(entry)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isDarkMode
                                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              }`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id, entry.entryNo)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isDarkMode
                                  ? 'bg-blue-700/20 text-blue-400 hover:bg-blue-700/30'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              }`}
                            >
                              Delete
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
      )}
    </div>
  );
}
