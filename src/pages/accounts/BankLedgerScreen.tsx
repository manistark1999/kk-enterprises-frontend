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
import { getCurrentDate, getCurrentTime } from '@/utils/formatting/dateTimeUtils';

interface BankLedgerScreenProps {
  isDarkMode: boolean;
}

interface BankTransaction {
  id: string;
  date: string;
  time: string;
  bankName: string;
  accountNo: string;
  type: 'Credit' | 'Debit';
  category: string;
  description: string;
  amount: number;
  transactionMode: string;
  referenceNo: string;
  chequeNo?: string;
  receivedFrom?: string;
  paidTo?: string;
  balance: number;
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

  const [transactions, setTransactions] = useState<BankTransaction[]>([]);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('bankTransactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Set default sample transactions
      const defaultTransactions = [
        {
          id: 'BNK-001',
          date: '2024-02-24',
          time: '10:30 AM',
          bankName: 'HDFC Bank',
          accountNo: '****1234',
          type: 'Credit' as const,
          category: 'Customer Payment',
          description: 'Labour bill payment received',
          amount: 25000,
          transactionMode: 'NEFT',
          referenceNo: 'NEFT2024022401',
          receivedFrom: 'Rajesh Kumar',
          balance: 125000
        },
        {
          id: 'BNK-002',
          date: '2024-02-24',
          time: '02:15 PM',
          bankName: 'ICICI Bank',
          accountNo: '****5678',
          type: 'Debit' as const,
          category: 'Supplier Payment',
          description: 'Parts purchase payment',
          amount: 45000,
          transactionMode: 'RTGS',
          referenceNo: 'RTGS2024022402',
          paidTo: 'AutoParts India Ltd',
          balance: 280000
        },
        {
          id: 'BNK-003',
          date: '2024-02-25',
          time: '11:00 AM',
          bankName: 'SBI',
          accountNo: '****9012',
          type: 'Credit' as const,
          category: 'Sales Receipt',
          description: 'Parts sale payment',
          amount: 18500,
          transactionMode: 'UPI',
          referenceNo: 'UPI2024022501',
          receivedFrom: 'Amit Sharma',
          balance: 198500
        }
      ];
      setTransactions(defaultTransactions);
      localStorage.setItem('bankTransactions', JSON.stringify(defaultTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('bankTransactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Credit' | 'Debit'>('All');
  const [filterBank, setFilterBank] = useState('All');
  const [dateFrom, setDateFrom] = useState('2024-02-01');
  const [dateTo, setDateTo] = useState('2024-02-28');

  // Calculate totals
  const totalCredit = transactions
    .filter(t => t.type === 'Credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDebit = transactions
    .filter(t => t.type === 'Debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netBalance = totalCredit - totalDebit;

  // Get unique bank names for filter
  const bankNames = ['All', ...Array.from(new Set(transactions.map(t => t.bankName)))];

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.receivedFrom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.paidTo?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'All' || transaction.type === filterType;
    const matchesBank = filterBank === 'All' || transaction.bankName === filterBank;
    
    return matchesSearch && matchesType && matchesBank;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveTransaction = () => {
    // Validation
    if (!formData.bankName || !formData.accountNo || !formData.category || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTransaction: BankTransaction = {
      id: `BNK-${String(transactions.length + 1).padStart(3, '0')}`,
      date: formData.date,
      time: formData.time,
      bankName: formData.bankName,
      accountNo: formData.accountNo,
      type: formData.transactionType as 'Credit' | 'Debit',
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      transactionMode: formData.transactionMode,
      referenceNo: formData.referenceNo,
      chequeNo: formData.chequeNo,
      receivedFrom: formData.receivedFrom,
      paidTo: formData.paidTo,
      balance: 0 // Calculate based on previous balance
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Reset form
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

    toast.success('Bank transaction saved successfully!');
  };

  const handleRefresh = () => {
    toast.success('Data refreshed successfully!');
  };

  const handleExport = () => {
    toast.success('Bank ledger exported successfully!');
  };

  const handlePrint = () => {
    toast.success('Printing bank ledger...');
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${
            isDarkMode 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Bank Ledger
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage all bank transactions
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handlePrint}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Print</span>
          </button>
          <button
            onClick={handleExport}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            }`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Export</span>
          </button>
        </div>
      </motion.div>

      {/* Transaction Entry Form */}
      <motion.div
        className={`rounded-xl p-6 ${
          isDarkMode
            ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50'
            : 'bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-lg'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Plus className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            New Bank Transaction
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
          {/* Date & Time */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date
            </label>
            <div className="relative">
              <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`w-full h-10 pl-10 pr-3 rounded-lg border text-sm transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className={`w-full h-10 px-3 rounded-lg border text-sm transition-all ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          {/* Bank Details */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Bank Name *
            </label>
            <div className="relative">
              <Landmark className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className={`w-full h-10 pl-10 pr-3 rounded-lg border text-sm transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="">Select Bank</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="SBI">State Bank of India</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Bank">Kotak Mahindra Bank</option>
                <option value="PNB">Punjab National Bank</option>
                <option value="BOB">Bank of Baroda</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Account Number *
            </label>
            <input
              type="text"
              name="accountNo"
              value={formData.accountNo}
              onChange={handleInputChange}
              placeholder="Enter account number"
              className={`w-full h-10 px-3 rounded-lg border text-sm transition-all ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Transaction Type
            </label>
            <div className="relative">
              <ArrowUpCircle className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleInputChange}
                className={`w-full h-10 pl-10 pr-3 rounded-lg border text-sm transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="Credit">Credit (Money In)</option>
                <option value="Debit">Debit (Money Out)</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Category *
            </label>
            <div className="relative">
              <FileText className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full h-10 pl-10 pr-3 rounded-lg border text-sm transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="">Select Category</option>
                <option value="Customer Payment">Customer Payment</option>
                <option value="Sales Receipt">Sales Receipt</option>
                <option value="Supplier Payment">Supplier Payment</option>
                <option value="Expense">Expense</option>
                <option value="Salary Payment">Salary Payment</option>
                <option value="Loan">Loan</option>
                <option value="Investment">Investment</option>
                <option value="Insurance Claim">Insurance Claim</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Amount *
            </label>
            <div className="relative">
              <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                className={`w-full h-10 pl-10 pr-3 rounded-lg border text-sm transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          </div>

          {/* Transaction Mode */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Transaction Mode
            </label>
            <div className="relative">
              <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <select
                name="transactionMode"
                value={formData.transactionMode}
                onChange={handleInputChange}
                className={`w-full h-10 pl-10 pr-3 rounded-lg border text-sm transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="IMPS">IMPS</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="DD">Demand Draft</option>
                <option value="Wire Transfer">Wire Transfer</option>
              </select>
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Reference Number
            </label>
            <input
              type="text"
              name="referenceNo"
              value={formData.referenceNo}
              onChange={handleInputChange}
              placeholder="UTR/Reference No"
              className={`w-full h-10 px-3 rounded-lg border text-sm transition-all ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          {/* Cheque Number - Conditional */}
          {formData.transactionMode === 'Cheque' && (
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Cheque Number
              </label>
              <input
                type="text"
                name="chequeNo"
                value={formData.chequeNo}
                onChange={handleInputChange}
                placeholder="Cheque No"
                className={`w-full h-10 px-3 rounded-lg border text-sm transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          )}

          {/* Received From / Paid To */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {formData.transactionType === 'Credit' ? 'Received From' : 'Paid To'}
            </label>
            <input
              type="text"
              name={formData.transactionType === 'Credit' ? 'receivedFrom' : 'paidTo'}
              value={formData.transactionType === 'Credit' ? formData.receivedFrom : formData.paidTo}
              onChange={handleInputChange}
              placeholder="Party name"
              className={`w-full h-10 px-3 rounded-lg border text-sm transition-all ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          {/* Description - Full Width */}
          <div className="lg:col-span-2">
            <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Transaction details..."
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border text-sm transition-all resize-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveTransaction}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <Save className="w-4 h-4" />
            <span>Save Transaction</span>
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {/* Total Credit */}
        <div className={`rounded-xl p-6 ${
          isDarkMode
            ? 'bg-green-900/20 backdrop-blur-xl border border-green-700/50'
            : 'bg-green-50/70 backdrop-blur-xl border border-green-200/50 shadow-lg'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-green-400' : 'text-green-700'
              }`}>
                Total Credit
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-green-300' : 'text-green-800'
              }`}>
                ₹{totalCredit.toLocaleString('en-IN')}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
            }`}>
              <TrendingUp className={`w-6 h-6 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
          </div>
        </div>

        {/* Total Debit */}
        <div className={`rounded-xl p-6 ${
          isDarkMode
            ? 'bg-red-900/20 backdrop-blur-xl border border-red-700/50'
            : 'bg-red-50/70 backdrop-blur-xl border border-red-200/50 shadow-lg'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-red-400' : 'text-red-700'
              }`}>
                Total Debit
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-red-300' : 'text-red-800'
              }`}>
                ₹{totalDebit.toLocaleString('en-IN')}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
            }`}>
              <TrendingDown className={`w-6 h-6 ${
                isDarkMode ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>

        {/* Net Balance */}
        <div className={`rounded-xl p-6 ${
          isDarkMode
            ? 'bg-blue-900/20 backdrop-blur-xl border border-blue-700/50'
            : 'bg-blue-50/70 backdrop-blur-xl border border-blue-200/50 shadow-lg'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium mb-1 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-700'
              }`}>
                Net Balance
              </p>
              <p className={`text-2xl font-bold ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>
                ₹{netBalance.toLocaleString('en-IN')}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <DollarSign className={`w-6 h-6 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        className={`rounded-xl p-6 ${
          isDarkMode
            ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50'
            : 'bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-lg'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          </div>

          {/* Date From */}
          <div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          {/* Date To */}
          <div>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          {/* Transaction Type Filter */}
          <div>
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'All' | 'Credit' | 'Debit')}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="All">All Types</option>
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
            </div>
          </div>

          {/* Bank Filter */}
          <div>
            <div className="relative">
              <Landmark className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <select
                value={filterBank}
                onChange={(e) => setFilterBank(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                {bankNames.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        className={`rounded-xl overflow-hidden ${
          isDarkMode
            ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50'
            : 'bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-lg'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50/80'}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ID
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date & Time
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Bank & Account
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Type
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Category
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Mode
                </th>
                <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Amount
                </th>
                <th className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Balance
                </th>
                <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredTransactions.map((transaction, index) => (
                <tr 
                  key={transaction.id}
                  className={`transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50/50'
                  }`}
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {transaction.id}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div>
                      <div>{transaction.date}</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {transaction.time}
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div>
                      <div className="font-medium">{transaction.bankName}</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {transaction.accountNo}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'Credit'
                        ? isDarkMode
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-green-100 text-green-700'
                        : isDarkMode
                        ? 'bg-red-900/30 text-red-400'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.type === 'Credit' ? (
                        <ArrowDownCircle className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                      )}
                      {transaction.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {transaction.category}
                  </td>
                  <td className={`px-6 py-4 text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="max-w-xs truncate">
                      {transaction.description}
                    </div>
                    {transaction.receivedFrom && (
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        From: {transaction.receivedFrom}
                      </div>
                    )}
                    {transaction.paidTo && (
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        To: {transaction.paidTo}
                      </div>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div>{transaction.transactionMode}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {transaction.referenceNo}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-semibold ${
                    transaction.type === 'Credit'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'Credit' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    ₹{transaction.balance.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toast.info('View transaction details')}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'hover:bg-gray-700 text-blue-400'
                            : 'hover:bg-gray-100 text-blue-600'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toast.info('Edit transaction')}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'hover:bg-gray-700 text-green-400'
                            : 'hover:bg-gray-100 text-green-600'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toast.error('Delete transaction')}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'hover:bg-gray-700 text-red-400'
                            : 'hover:bg-gray-100 text-red-600'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Results */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Building2 className={`w-12 h-12 mx-auto mb-3 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No transactions found
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}