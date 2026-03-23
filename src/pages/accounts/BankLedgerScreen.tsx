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

  const { transactions, summary, loading, addTransaction, deleteTransaction, fetchTransactions } = useBankTransactions();
  const { bankAccounts } = useBankAccounts();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Credit' | 'Debit'>('All');
  const [filterBank, setFilterBank] = useState('All');
  const [dateFrom, setDateFrom] = useState('2024-02-01');
  const [dateTo, setDateTo] = useState('2024-02-28');

  const { totalCredit, totalDebit, balance: netBalance } = summary;

  const bankNames = ['All', ...Array.from(new Set(transactions.map(t => t.bank_name)))];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredTransactions = transactions.filter(transaction => {
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
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bank Ledger</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage all bank transactions</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button onClick={() => fetchTransactions()} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700 shadow-sm'}`}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <button onClick={() => toast.success('Printing...')} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700 shadow-sm'}`}>
            <Printer className="w-4 h-4" />
            <span className="text-sm font-medium">Print</span>
          </button>
          <button onClick={() => toast.success('Exporting...')} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </motion.div>

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
              {bankAccounts.map(acc => (
                <option key={acc.id} value={acc.bankName}>{acc.bankName} ({acc.accountName})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-500 uppercase">Account No *</label>
            <select name="accountNo" value={formData.accountNo} onChange={handleInputChange} className={`w-full h-10 px-3 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
              <option value="">Select Account</option>
              {bankAccounts.filter(acc => acc.bankName === formData.bankName).map(acc => (
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
            <Save className="w-4 h-4" /> Save Transaction
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="Total Credit" value={totalCredit} icon={<TrendingUp />} color="green" isDarkMode={isDarkMode} />
        <SummaryCard label="Total Debit" value={totalDebit} icon={<TrendingDown />} color="red" isDarkMode={isDarkMode} />
        <SummaryCard label="Net Balance" value={netBalance} icon={<DollarSign />} color="blue" isDarkMode={isDarkMode} />
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
              {filteredTransactions.map((t) => (
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
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.type === 'Credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.category}</td>
                  <td className="px-6 py-4">
                    <div className="line-clamp-1">{t.description}</div>
                    <div className="text-xs text-gray-500">{t.reference_no}</div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${t.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{t.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                       <button onClick={() => deleteTransaction(t.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
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
  );
}

function SummaryCard({ label, value, icon, color, isDarkMode }: any) {
  const colors: any = {
    green: isDarkMode ? 'bg-green-900/20 border-green-700/50 text-green-400' : 'bg-green-50 border-green-200 text-green-700',
    red: isDarkMode ? 'bg-red-900/20 border-red-700/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700',
    blue: isDarkMode ? 'bg-blue-900/20 border-blue-700/50 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className={`p-6 rounded-xl border ${colors[color]} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-2xl font-bold">₹{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg bg-current opacity-10`} />
        <div className="absolute opacity-100">{React.cloneElement(icon, { className: 'w-6 h-6' })}</div>
      </div>
    </div>
  );
}