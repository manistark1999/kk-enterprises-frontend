import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Save,
  Plus,
  Search,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  FileText,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Landmark
} from 'lucide-react';
import { toast } from 'sonner';
import { useBankTransactions } from '@/contexts/BankTransactionContext';
import { useBankAccounts } from '@/contexts/BankAccountsContext';
import { getCurrentDate, getCurrentTime } from '@/utils/formatting/dateTimeUtils';

interface BankLedgerScreenProps {
  isDarkMode: boolean;
}

export function BankLedgerScreen({ isDarkMode }: BankLedgerScreenProps) {
  const [formData, setFormData] = useState({
    date: getCurrentDate(),
    time: getCurrentTime(),
    bankName: '',
    accountNo: '',
    transactionType: 'Credit',
    category: '',
    amount: '',
    transactionMode: 'NEFT',
    referenceNo: '',
    chequeNo: '',
    receivedFrom: '',
    paidTo: '',
    description: ''
  });

  const { transactions = [], summary = { totalCredit: 0, totalDebit: 0, balance: 0 }, loading, addTransaction, deleteTransaction, fetchTransactions } = useBankTransactions();
  const { bankAccounts = [] } = useBankAccounts();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Credit' | 'Debit'>('All');
  const [filterBank, setFilterBank] = useState('All');
  const [dateFrom, setDateFrom] = useState('2024-02-01');
  const [dateTo, setDateTo] = useState('2024-02-28');

  // Defensive values for destructuring
  const currentSummary = summary || { totalCredit: 0, totalDebit: 0, balance: 0 };
  const { totalCredit = 0, totalDebit = 0, balance: netBalance = 0 } = currentSummary;

  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const bankNames = ['All', ...Array.from(new Set(safeTransactions.map(t => t.bank_name)))];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredTransactions = safeTransactions.filter(transaction => {
    const matchesSearch =
      (transaction.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.bank_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.reference_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.received_from?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.paid_to?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'All' || transaction.type === filterType;
    const matchesBank = filterBank === 'All' || transaction.bank_name === filterBank;

    return matchesSearch && matchesType && matchesBank;
  });

  const handleSaveTransaction = async () => {
    if (!formData.bankName || !formData.accountNo || !formData.category || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedAccount = bankAccounts.find(acc => acc.bankName === formData.bankName && acc.accountNumber === formData.accountNo);

    const payload = {
      date: formData.date,
      time: formData.time,
      bank_account_id: selectedAccount?.id,
      bank_name: formData.bankName,
      account_no: formData.accountNo,
      type: formData.transactionType,
      category: formData.category,
      description: formData.description,
      amount: formData.amount,
      transaction_mode: formData.transactionMode,
      reference_no: formData.referenceNo,
      cheque_no: formData.chequeNo,
      received_from: formData.receivedFrom,
      paid_to: formData.paidTo
    };

    const success = await addTransaction(payload);
    if (success) {
      setFormData({
        date: getCurrentDate(),
        time: getCurrentTime(),
        bankName: '',
        accountNo: '',
        transactionType: 'Credit',
        category: '',
        amount: '',
        transactionMode: 'NEFT',
        referenceNo: '',
        chequeNo: '',
        receivedFrom: '',
        paidTo: '',
        description: ''
      });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600 shadow-sm'}`}>
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bank Ledger</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monitor and manage your bank transactions</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => fetchTransactions()} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm border border-gray-100'}`}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <button onClick={() => toast.success('Printing...')} className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm border border-gray-100'}`}>
            <Printer className="w-4 h-4" />
            <span className="text-sm font-medium">Print</span>
          </button>
          <button onClick={() => toast.success('Exporting...')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 shadow-md transition-all active:scale-95">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </motion.div>

      {/* Summary Cards - Moved to Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="Total Credit" value={totalCredit} icon={<TrendingUp />} color="green" isDarkMode={isDarkMode} />
        <SummaryCard label="Total Debit" value={totalDebit} icon={<TrendingDown />} color="red" isDarkMode={isDarkMode} />
        <SummaryCard label="Net Balance" value={netBalance} icon={<Building2 />} color="blue" isDarkMode={isDarkMode} />
      </div>

      {/* Entry Form */}
      <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'} border`}>
        <div className="flex items-center gap-2 mb-6">
          <Plus className="w-5 h-5 text-blue-500" />
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>New Transaction</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500 uppercase">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} className={`w-full h-10 px-3 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500 uppercase">Bank Name *</label>
            <select name="bankName" value={formData.bankName} onChange={handleInputChange} className={`w-full h-10 px-3 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
              <option value="">Select Bank</option>
              {Array.isArray(bankAccounts) && bankAccounts.map(acc => (
                <option key={acc.id} value={acc.bankName}>{acc.bankName} ({acc.accountName})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500 uppercase">Account No *</label>
            <select name="accountNo" value={formData.accountNo} onChange={handleInputChange} className={`w-full h-10 px-3 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
              <option value="">Select Account</option>
              {(Array.isArray(bankAccounts) ? bankAccounts : []).filter(acc => acc.bankName === formData.bankName).map(acc => (
                <option key={acc.id} value={acc.accountNumber}>{acc.accountNumber}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500 uppercase">Type</label>
            <select name="transactionType" value={formData.transactionType} onChange={handleInputChange} className={`w-full h-10 px-3 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
              <option value="Credit">Credit (In)</option>
              <option value="Debit">Debit (Out)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500 uppercase">Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Sales, Rent" className={`w-full h-10 px-3 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500 uppercase">Amount *</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="0.00" className={`w-full h-10 px-3 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500 uppercase">Mode</label>
            <select name="transactionMode" value={formData.transactionMode} onChange={handleInputChange} className={`w-full h-10 px-3 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="IMPS">IMPS</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500 uppercase">{formData.transactionType === 'Credit' ? 'From' : 'To'}</label>
            <input type="text" name={formData.transactionType === 'Credit' ? 'receivedFrom' : 'paidTo'} value={formData.transactionType === 'Credit' ? formData.receivedFrom : formData.paidTo} onChange={handleInputChange} placeholder="Name" className={`w-full h-10 px-3 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
          <div className="lg:col-span-4">
            <label className="block text-xs font-medium mb-1 text-gray-500 uppercase">Description</label>
            <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="Notes..." className={`w-full h-10 px-3 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={handleSaveTransaction} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 shadow-md">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>


      {/* Table */}
      <div className={`rounded-xl overflow-hidden border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-gray-500">Date/Time</th>
                <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-gray-500">Bank/Account</th>
                <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-gray-500">Description</th>
                <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-6 py-4 text-center font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className={isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{new Date(t.transaction_date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{t.transaction_time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-medium">{t.bank_name}</div>
                      <div className="text-xs text-gray-500">{t.account_no}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.type === 'Credit' ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'}`}>{t.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{t.category}</td>
                    <td className="px-6 py-4">
                      <div className="line-clamp-1">{t.description}</div>
                      <div className="text-xs text-gray-500">{t.reference_no}</div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${t.type === 'Credit' ? 'text-blue-600' : 'text-blue-700'}`}>
                      ₹{(t.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => deleteTransaction(t.id)} className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <FileText className="w-8 h-8 opacity-20" />
                      <p>No transactions found matching criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, color, isDarkMode }: any) {
  const colors: any = {
    green: isDarkMode ? 'bg-blue-600/10 border-green-500/20 text-blue-400 font-bold' : 'bg-blue-50 border-green-200 text-blue-600',
    red: isDarkMode ? 'bg-blue-700/10 border-red-500/20 text-blue-400 font-bold' : 'bg-blue-50 border-red-200 text-blue-700',
    blue: isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 font-bold' : 'bg-blue-50 border-blue-200 text-blue-600',
  };

  return (
    <div className={`group p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg relative overflow-hidden flex items-center min-h-[110px] w-full ${colors[color]} ${isDarkMode ? 'backdrop-blur-md' : 'shadow-sm'}`}>
      <div className="relative z-10 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1.5">{label}</p>
        <h3 className="text-2xl md:text-3xl font-black tracking-tight">₹{(value || 0).toLocaleString()}</h3>
      </div>

      <div className={`relative z-10 p-4 rounded-2xl bg-current/10 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 duration-300`}>
        {React.cloneElement(icon, { className: 'w-7 h-7' })}
      </div>

      {/* Premium background accent */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-current opacity-[0.05] rounded-full blur-2xl transition-all duration-500 group-hover:opacity-[0.1]" />
    </div>
  );
}