import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download,
  Printer,
  FileText,
  Calendar,
  Filter,
  Search,
  DollarSign,
  Receipt,
  TrendingUp,
  Eye,
  Edit2,
  Trash2,
  X,
  User,
  CreditCard,
  ArrowUpDown,
  Share2
} from 'lucide-react';
import { 
  FORM_CONSTANTS,
  getCardClass,
  getInputClass,
  getLabelClass,
  getPrimaryButtonClass,
  getSecondaryButtonClass
} from '@/utils/formStyles';
import { useReceiptsPayments } from '@/contexts/ReceiptsPaymentsContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UnifiedPrintPreview } from '@/components/print/UnifiedPrintPreview';
import { exportData } from '@/utils/exportUtils';
import { shareData } from '@/utils/shareUtils';
import { handlePrintPage } from '@/utils/printUtils';

interface ReceiptRegisterScreenProps {
  isDarkMode: boolean;
}

export function ReceiptRegisterScreen({ isDarkMode }: ReceiptRegisterScreenProps) {
  const { canEdit, canDelete, canPrint, canExport } = useAuth();
  const { receipts, deleteReceipt, refreshReceipts } = useReceiptsPayments();

  React.useEffect(() => {
    refreshReceipts();
    const interval = setInterval(refreshReceipts, 60000);
    return () => clearInterval(interval);
  }, [refreshReceipts]);
  
  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Received' | 'Pending'>('All');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'All' | 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'customer'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewingReceipt, setViewingReceipt] = useState<any>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  const cardClass = getCardClass(isDarkMode);
  const inputClass = getInputClass(isDarkMode);
  const labelClass = getLabelClass(isDarkMode);
  const primaryButtonClass = getPrimaryButtonClass();
  const secondaryButtonClass = getSecondaryButtonClass(isDarkMode);

  // Filter and sort receipts
  const filteredReceipts = useMemo(() => {
    let filtered = [...receipts];

    // Date range filter
    if (fromDate) {
      filtered = filtered.filter(r => r.receipt_date >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter(r => r.receipt_date <= toDate);
    }

    // Status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }

    // Payment mode filter
    if (selectedPaymentMode !== 'All') {
      filtered = filtered.filter(r => r.payment_mode === selectedPaymentMode);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        (r.customer_name || '').toLowerCase().includes(search) ||
        (r.receipt_no || '').toLowerCase().includes(search) ||
        (r.description || '').toLowerCase().includes(search) ||
        (r.labour_bill_no || '').toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.receipt_date).getTime() - new Date(b.receipt_date).getTime();
      } else if (sortField === 'amount') {
        comparison = Number(a.amount) - Number(b.amount);
      } else if (sortField === 'customer') {
        comparison = (a.customer_name || '').localeCompare(b.customer_name || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [receipts, fromDate, toDate, selectedStatus, selectedPaymentMode, searchTerm, sortField, sortOrder]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);
    const receivedAmount = filteredReceipts.filter(r => r.status === 'Received').reduce((sum, r) => sum + r.amount, 0);
    const pendingAmount = filteredReceipts.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.amount, 0);
    
    return {
      total: totalAmount,
      received: receivedAmount,
      pending: pendingAmount,
      count: filteredReceipts.length
    };
  }, [filteredReceipts]);

  // Reset filters
  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setSelectedStatus('All');
    setSelectedPaymentMode('All');
    setSearchTerm('');
    toast.success('Filters reset');
  };

  // Handle delete
  const handleDelete = (id: string, receiptNo: string) => {
    if (window.confirm(`Are you sure you want to delete receipt "${receiptNo}"?`)) {
      deleteReceipt(id);
      toast.success('Receipt deleted successfully');
    }
  };

  // Handlers for Export and Share
  const handleDownloadData = () => {
    if (filteredReceipts.length === 0) {
      toast.error('No data to export');
      return;
    }

    const dataToExport = filteredReceipts.map(r => ({
      'Receipt No': r.receipt_no,
      'Date': new Date(r.receipt_date).toLocaleDateString('en-IN'),
      'Customer': r.customer_name,
      'Phone': r.customer_phone || '-',
      'Labour Bill': r.labour_bill_no || '-',
      'Description': r.description || '-',
      'Amount': r.amount,
      'Payment Mode': r.payment_mode,
      'Reference': r.reference_no || '-',
      'Status': r.status
    }));

    exportData(dataToExport, {
      fileName: `Receipt-Register-${new Date().toISOString().split('T')[0]}`,
      format: 'xlsx'
    });
  };

  const handleShareDataLocal = async () => {
    if (filteredReceipts.length === 0) {
      toast.error('No data to share');
      return;
    }

    const summaryText = `Receipt Register Report\nTotal Receipts: ${totals.count}\nTotal Amount: ₹${totals.total.toLocaleString('en-IN')}`;
    
    await shareData({
      title: 'Receipts Report',
      text: summaryText,
      url: window.location.href
    });
  };

  const handlePrintRegister = () => {
    handlePrintPage('Receipt Register Report');
    toast.success('Preparing print view...');
  };

  // Print function
  const handlePrint = (receipt: any) => {
    // Map backend response fields to the print view expectations
    const formattedReceipt = {
      receiptNo: receipt.receipt_no,
      date: receipt.receipt_date,
      customerName: receipt.customer_name,
      customerPhone: receipt.customer_phone,
      customerAddress: receipt.customer_address || '', // Might need this
      amount: receipt.amount,
      paymentMode: receipt.payment_mode,
      transactionId: receipt.reference_no,
      billNo: receipt.labour_bill_no,
      remarks: receipt.description
    };
    setPrintData(formattedReceipt);
    setIsPrintModalOpen(true);
    toast.success('Opening print preview...');
  };

  // Toggle sort
  const handleSort = (field: 'date' | 'amount' | 'customer') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Receipt Register</h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Complete receipt report with all customer payments</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Integration Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            isDarkMode 
              ? 'bg-blue-600/10 border-green-500/30 text-blue-400' 
              : 'bg-blue-50 border-green-200 text-blue-700'
          }`}>
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-medium">Live sync with Receipt Module • {receipts.length} records</span>
          </div>
          {canExport('Receipt') && (
            <button 
              onClick={handleDownloadData}
              className={`${secondaryButtonClass} flex items-center gap-2`}
            >
              <Download className="w-4 h-4" />
              Download Data
            </button>
          )}
          <button 
            onClick={handleShareDataLocal}
            className={`${secondaryButtonClass} flex items-center gap-2`}
          >
            <Share2 className="w-4 h-4" />
            Share Data
          </button>
          {canPrint('Receipt') && (
            <button 
              onClick={handlePrintRegister}
              className={`${secondaryButtonClass} flex items-center gap-2`}
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          )}
        </div>
      </div>

      {/* Main Layout: Left Filter Panel + Right Report Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Filter Panel */}
        <div className="lg:col-span-3">
          <motion.div
            className={cardClass}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Filters</h2>
              </div>

              <div className="space-y-4">
                {/* Date Range */}
                <div>
                  <label className={labelClass}>Date Range</label>
                  <div className="space-y-2">
                    <input 
                      type="date" 
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className={inputClass}
                      placeholder="From Date"
                    />
                    <input 
                      type="date" 
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className={inputClass}
                      placeholder="To Date"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className={labelClass}>Status</label>
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className={inputClass}
                  >
                    <option value="All">All Status</option>
                    <option value="Received">Received</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Payment Mode Filter */}
                <div>
                  <label className={labelClass}>Payment Mode</label>
                  <select 
                    value={selectedPaymentMode}
                    onChange={(e) => setSelectedPaymentMode(e.target.value as any)}
                    className={inputClass}
                  >
                    <option value="All">All Modes</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className={labelClass}>Search</label>
                  <div className="relative">
                    <Search className={`absolute left-3 top-3 w-4 h-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Customer, receipt no, bill no..."
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                {/* Apply/Reset Buttons */}
                <button 
                  onClick={handleResetFilters}
                  className={`w-full ${secondaryButtonClass} justify-center`}
                >
                  <X className="w-4 h-4" />
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Report Table */}
        <div className="lg:col-span-9 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              className={cardClass}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Total Receipts</p>
                    <p className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{totals.count}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={cardClass}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Total Amount</p>
                    <p className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>₹{totals.total.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={cardClass}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Received</p>
                    <p className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>₹{totals.received.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={cardClass}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-800/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-800" />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Pending</p>
                    <p className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>₹{totals.pending.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Report Table */}
          <motion.div
            className={cardClass}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Receipt Records</h2>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Showing {filteredReceipts.length} of {receipts.length} receipts</p>
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
                        <th 
                          className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                          onClick={() => handleSort('date')}
                        >
                          <div className="flex items-center gap-1">
                            Date
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Receipt No</th>
                        <th 
                          className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                          onClick={() => handleSort('customer')}
                        >
                          <div className="flex items-center gap-1">
                            Customer
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Labour Bill</th>
                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Description</th>
                        <th 
                          className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                          onClick={() => handleSort('amount')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Amount
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Payment Mode</th>
                        <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
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
                      {filteredReceipts.map((receipt, index) => (
                        <motion.tr
                          key={receipt.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={`transition-colors ${
                            isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className={`py-3 px-4 text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>{new Date(receipt.receipt_date).toLocaleDateString('en-IN')}</td>
                          <td className={`py-3 px-4 text-sm font-medium ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}>{receipt.receipt_no}</td>
                          <td className={`py-3 px-4 text-sm ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            <div>{receipt.customer_name}</div>
                            <div className="text-xs text-gray-500">{receipt.customer_phone}</div>
                          </td>
                          <td className={`py-3 px-4 text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>{receipt.labour_bill_no || '-'}</td>
                          <td className={`py-3 px-4 text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <div className="max-w-xs truncate" title={receipt.description}>
                              {receipt.description}
                            </div>
                          </td>
                          <td className={`py-3 px-4 text-sm font-semibold text-right ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}>₹{receipt.amount.toLocaleString('en-IN')}</td>
                          <td className={`py-3 px-4 text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <div className="flex flex-col">
                              <span>{receipt.payment_mode}</span>
                              {receipt.reference_no && (
                                <span className="text-xs text-gray-500">Ref: {receipt.reference_no}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              receipt.status === 'Received'
                                ? 'bg-blue-600/20 text-blue-600'
                                : 'bg-blue-800/20 text-blue-800'
                            }`}>
                              {receipt.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => setViewingReceipt(receipt)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isDarkMode 
                                    ? 'hover:bg-blue-600/20 text-blue-400' 
                                    : 'hover:bg-blue-50 text-blue-600'
                                }`}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {canDelete('Receipt') && (
                                <button 
                                  onClick={() => handleDelete(receipt.id, receipt.receipt_no)}
                                  className={`p-1.5 rounded-lg transition-all ${
                                    isDarkMode 
                                      ? 'hover:bg-blue-700/20 text-blue-400' 
                                      : 'hover:bg-blue-50 text-blue-700'
                                  }`}
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredReceipts.length === 0 && (
                    <div className="py-12 text-center">
                      <Receipt className={`w-12 h-12 mx-auto mb-3 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>No receipts found matching your filters</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Footer */}
              {filteredReceipts.length > 0 && (
                <div className={`mt-4 pt-4 border-t ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Total for filtered results:
                    </p>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-600'
                        }`}>Received</p>
                        <p className={`text-lg font-bold ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>₹{totals.received.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-600'
                        }`}>Pending</p>
                        <p className={`text-lg font-bold ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-800'
                        }`}>₹{totals.pending.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-600'
                        }`}>Grand Total</p>
                        <p className={`text-xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>₹{totals.total.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* View Receipt Modal */}
      <AnimatePresence>
        {viewingReceipt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingReceipt(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl ${
                isDarkMode ? 'bg-gray-900' : 'bg-white'
              } rounded-xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto`}
            >
              <div className={`sticky top-0 z-10 px-6 py-4 border-b ${
                isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Receipt Details</h2>
                  <button
                    onClick={() => setViewingReceipt(null)}
                    className={`p-2 rounded-lg transition-all ${
                      isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Receipt Number</p>
                    <p className={`text-sm font-semibold ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>{viewingReceipt.receipt_no}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Date</p>
                    <p className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{new Date(viewingReceipt.receipt_date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Customer</p>
                    <p className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{viewingReceipt.customer_name}</p>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-600'
                    }`}>{viewingReceipt.customer_phone}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Labour Bill</p>
                    <p className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{viewingReceipt.labour_bill_no || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Description</p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{viewingReceipt.description}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Amount</p>
                    <p className={`text-2xl font-bold ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>₹{viewingReceipt.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Status</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      viewingReceipt.status === 'Received'
                        ? 'bg-blue-600/20 text-blue-600'
                        : 'bg-blue-800/20 text-blue-800'
                    }`}>
                      {viewingReceipt.status}
                    </span>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Payment Mode</p>
                    <p className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{viewingReceipt.payment_mode}</p>
                  </div>
                  {viewingReceipt.reference_no && (
                    <div>
                      <p className={`text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Reference Number</p>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{viewingReceipt.reference_no}</p>
                    </div>
                  )}
                  {viewingReceipt.bank_name && (
                    <div>
                      <p className={`text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Bank Name</p>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{viewingReceipt.bank_name}</p>
                    </div>
                  )}
                  <div>
                    <p className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Created By</p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{viewingReceipt.createdBy}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium mb-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Created At</p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{new Date(viewingReceipt.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className={`sticky bottom-0 px-6 py-4 border-t ${
                isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex gap-3">
                  {canPrint('Receipt') && (
                    <button
                      onClick={() => handlePrint(viewingReceipt)}
                      className={`flex-1 ${primaryButtonClass} justify-center bg-blue-500 hover:bg-blue-600`}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print Receipt
                    </button>
                  )}
                  <button
                    onClick={() => setViewingReceipt(null)}
                    className={`flex-1 ${secondaryButtonClass} justify-center`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <UnifiedPrintPreview
        type="receipt"
        data={printData}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}