import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save,
  Plus,
  FileText,
  DollarSign,
  Search,
  Trash2,
  Eye,
  Edit2,
  Download,
  Printer,
  Filter,
  X,
  User,
  Calendar,
  CreditCard,
  Building2,
  TrendingDown,
  Wallet,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  FORM_CONSTANTS,
  getCardClass,
  getInputClass,
  getLabelClass,
  getPrimaryButtonClass,
  getSecondaryButtonClass
} from '@/utils/formStyles';
import { useReceiptsPayments, PaymentRecord } from '@/contexts/ReceiptsPaymentsContext';
import { useCustomers } from '@/contexts/CustomerContext';
import { useLabourBills } from '@/contexts/LabourBillContext';
import { useBankAccounts } from '@/contexts/BankAccountsContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentScreenProps {
  isDarkMode: boolean;
}

export function PaymentScreenEnhanced({ isDarkMode }: PaymentScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Completed' | 'Pending'>('All');
  const [filterCategory, setFilterCategory] = useState<'All' | 'Purchase' | 'Expense' | 'Salary' | 'Advance' | 'Other'>('All');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    paymentTo: '',
    customerId: '',
    jobcardId: '',
    jobcardNo: '',
    billId: '',
    billNo: '',
    description: '',
    amount: 0,
    paymentMode: 'Cash' as 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque',
    paymentType: 'Other',
    bankAccountId: '',
    bankAccountName: '',
    referenceNo: '',
    status: 'Completed' as 'Completed' | 'Pending',
    paymentNo: '',
    remarks: '',
    createdBy: 'Admin'
  });

  const { canCreate, canEdit, canDelete, canPrint, canExport } = useAuth();
  const { payments, addPayment, updatePayment, deletePayment, getTotalPaid, getNextPaymentNo } = useReceiptsPayments();
  const { customers } = useCustomers();
  const { labourBills } = useLabourBills();
  const { bankAccounts } = useBankAccounts();

  const cardClass = getCardClass(isDarkMode);
  const inputClass = getInputClass(isDarkMode);
  const labelClass = getLabelClass(isDarkMode);
  const primaryButtonClass = getPrimaryButtonClass();
  const secondaryButtonClass = getSecondaryButtonClass(isDarkMode);

  // Filter payments
  const filteredPayments = payments.filter((payment: PaymentRecord) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (payment.customer_name || '').toLowerCase().includes(searchLower) ||
      (payment.payment_no || '').toLowerCase().includes(searchLower) ||
      (payment.remarks || '').toLowerCase().includes(searchLower);
    
    const matchesStatus = 
      filterStatus === 'All' || payment.status === filterStatus;
    
    const matchesCategory =
      filterCategory === 'All' || payment.payment_type === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Open drawer for adding new payment
  const handleAddNew = async () => {
    setEditingPayment(null);
    let autoNo = '';
    try {
      const nextNo = await getNextPaymentNo();
      if (nextNo) autoNo = nextNo;
    } catch (err) {
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      paymentTo: '',
      customerId: '',
      jobcardId: '',
      jobcardNo: '',
      billId: '',
      billNo: '',
      description: '',
      amount: 0,
      paymentMode: 'Cash',
      paymentType: 'Other',
      bankAccountId: '',
      bankAccountName: '',
      referenceNo: '',
      status: 'Completed',
      paymentNo: autoNo,
      remarks: '',
      createdBy: 'Admin'
    });
    setIsDrawerOpen(true);
  };

  // Open drawer for editing payment
  const handleEdit = (payment: PaymentRecord) => {
    setEditingPayment(payment);
    setFormData({
      date: payment.payment_date,
      paymentTo: payment.customer_name || '',
      customerId: payment.customer_id?.toString() || '',
      jobcardId: payment.jobcard_id?.toString() || '',
      jobcardNo: payment.jobcard_no || '',
      billId: payment.bill_id?.toString() || '',
      billNo: payment.bill_no || '',
      description: payment.remarks || '',
      amount: Number(payment.amount),
      paymentMode: payment.payment_mode as any,
      paymentType: payment.payment_type || 'Other',
      bankAccountId: payment.bank_account_id?.toString() || '',
      bankAccountName: payment.bank_account_name || '',
      referenceNo: payment.reference_no || '',
      status: payment.status as any,
      paymentNo: payment.payment_no,
      remarks: payment.remarks || '',
      createdBy: payment.created_by || 'Admin'
    });
    setIsDrawerOpen(true);
  };

  // Delete payment
  const handleDelete = (id: string, paymentNo: string) => {
    if (window.confirm(`Are you sure you want to delete payment "${paymentNo}"?`)) {
      deletePayment(id);
      toast.success('Payment deleted successfully');
    }
  };

  // Save payment
  const handleSave = async () => {
    // Validation
    if (!formData.paymentTo.trim()) {
      toast.error('Please enter payment recipient');
      return;
    }
    if (formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const payload = {
      payment_date: formData.date,
      customer_id: formData.customerId || null,
      customer_name: formData.paymentTo,
      jobcard_id: formData.jobcardId || null,
      jobcard_no: formData.jobcardNo,
      bill_id: formData.billId || null,
      bill_no: formData.billNo,
      payment_type: formData.paymentType,
      payment_mode: formData.paymentMode,
      bank_account_id: formData.bankAccountId || null,
      bank_account_name: formData.bankAccountName,
      reference_no: formData.referenceNo,
      amount: formData.amount,
      remarks: formData.remarks,
      status: formData.status,
      payment_no: formData.paymentNo,
      created_by: formData.createdBy
    };

    try {
      if (editingPayment) {
        await updatePayment(editingPayment.id, payload);
      } else {
        await addPayment(payload);
      }
      setIsDrawerOpen(false);
    } catch (err) {
    }
  };

  // Close drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingPayment(null);
  };

  // Calculate statistics
  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'Completed').length,
    pending: payments.filter(p => p.status === 'Pending').length,
    totalAmount: getTotalPaid()
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData({
        ...formData,
        customerId: customer.id,
        paymentTo: customer.name
      });
    }
  };

  const handleBankAccountChange = (accountId: string) => {
    const account = bankAccounts.find(a => a.id === accountId);
    if (account) {
      setFormData({
        ...formData,
        bankAccountId: account.id,
        bankAccountName: account.accountName
      });
    }
  };

  const handleBillChange = (billId: string) => {
    const bill = labourBills.find(b => b.id === billId);
    if (bill) {
      setFormData({
        ...formData,
        billId: bill.id,
        billNo: bill.billNo,
        paymentTo: bill.customerName,
        amount: bill.grandTotal,
        description: `Payment for Labour Bill ${bill.billNo}`
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Payment Management</h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Record and track all outgoing payments</p>
        </div>
        {canCreate('Payment') && (
          <button 
            onClick={handleAddNew}
            className={`${primaryButtonClass} flex items-center gap-2`}
          >
            <Plus className="w-4 h-4" />
            New Payment
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Payments
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{stats.total}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-700/20' : 'bg-blue-100'
              }`}>
                <DollarSign className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Paid
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>{stats.paid}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'
              }`}>
                <TrendingDown className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
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
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pending
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-800'
                }`}>{stats.pending}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-800/20' : 'bg-blue-100'
              }`}>
                <Wallet className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`} />
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
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Amount
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>₹{stats.totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Package className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Card */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search by recipient, payment number, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className={inputClass}
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className={inputClass}
              >
                <option value="All">All Categories</option>
                <option value="Purchase">Purchase</option>
                <option value="Expense">Expense</option>
                <option value="Salary">Salary</option>
                <option value="Advance">Advance</option>
                <option value="Other">Other</option>
              </select>

              {canExport('Payment') && (
                <button className={secondaryButtonClass}>
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline">Export</span>
                </button>
              )}
              {canPrint('Payment') && (
                <button className={secondaryButtonClass}>
                  <Printer className="w-4 h-4" />
                  <span className="hidden md:inline">Print</span>
                </button>
              )}
            </div>
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
                    }`}>Payment No</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Date</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Payment To</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Description</th>
                    <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Amount</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Category</th>
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
                  {filteredPayments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`py-3 px-4 text-sm font-medium ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>{payment.payment_no}</td>
                      <td className={`py-3 px-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{new Date(payment.payment_date).toLocaleDateString('en-IN')}</td>
                      <td className={`py-3 px-4 text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{payment.customer_name || 'N/A'}</td>
                      <td className={`py-3 px-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{payment.remarks || '-'}</td>
                      <td className={`py-3 px-4 text-sm font-semibold text-right ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-700'
                      }`}>₹{Number(payment.amount).toLocaleString('en-IN')}</td>
                      <td className={`py-3 px-4 text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          payment.payment_type === 'Supplier Payment'
                            ? 'bg-blue-500/20 text-blue-500'
                            : payment.payment_type === 'Expense'
                            ? 'bg-blue-800/20 text-blue-800'
                            : payment.payment_type === 'Salary'
                            ? 'bg-blue-600/20 text-purple-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {payment.payment_type || 'Other'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{payment.payment_mode}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'Completed'
                            ? 'bg-blue-600/20 text-blue-600'
                            : 'bg-blue-800/20 text-blue-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {canEdit('Payment') && (
                            <button 
                              onClick={() => handleEdit(payment)}
                              className={`p-1.5 rounded-lg transition-all ${
                                isDarkMode 
                                  ? 'hover:bg-blue-500/20 text-blue-400' 
                                  : 'hover:bg-blue-50 text-blue-600'
                              }`}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete('Payment') && (
                            <button 
                              onClick={() => handleDelete(payment.id, payment.payment_no)}
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

              {filteredPayments.length === 0 && (
                <div className="py-12 text-center">
                  <DollarSign className={`w-12 h-12 mx-auto mb-3 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>No payments found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add/Edit Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
            >
              {/* Modal */}
              <motion.div
                className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
                  isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
                } backdrop-blur-xl border ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className={`px-6 py-5 border-b ${
                  isDarkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-white/80'
                } backdrop-blur-xl`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${
                        isDarkMode ? 'bg-blue-700/20' : 'bg-blue-100'
                      }`}>
                        <DollarSign className={`w-5 h-5 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-700'
                        }`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {editingPayment ? 'Edit Payment' : 'New Payment'}
                        </h2>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {editingPayment ? 'Update payment details' : 'Record a new payment'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseDrawer}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Body with Form - Scrollable */}
                <div className="px-6 py-6 max-h-[calc(90vh-180px)] overflow-y-auto">
                  {/* Payment Details */}
                  <div>
                    <h3 className={`text-sm font-semibold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Payment Details</h3>
                    
                    <div className={`${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.FIELD_GAP}`}>
                      <div>
                        <label className={labelClass}>
                          Date <span className="text-blue-700">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Payment No
                        </label>
                        <input
                          type="text"
                          value={formData.paymentNo}
                          readOnly
                          className={`${inputClass} bg-gray-100/50 opacity-70`}
                          placeholder="Auto-generated"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Customer
                        </label>
                        <select
                          value={formData.customerId}
                          onChange={(e) => handleCustomerChange(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select Customer</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Labour Bill
                        </label>
                        <select
                          value={formData.billId}
                          onChange={(e) => handleBillChange(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select Bill</option>
                          {labourBills.map(b => (
                            <option key={b.id} value={b.id}>{b.billNo} - {b.customerName}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Recipient Name <span className="text-blue-700">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.paymentTo}
                          onChange={(e) => setFormData({ ...formData, paymentTo: e.target.value })}
                          className={inputClass}
                          placeholder="Recipient name"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Payment Type</label>
                        <select
                          value={formData.paymentType}
                          onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                          className={inputClass}
                        >
                          <option value="Supplier Payment">Supplier Payment</option>
                          <option value="Customer Refund">Customer Refund</option>
                          <option value="Salary">Salary</option>
                          <option value="Expense">Expense</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="lg:col-span-2">
                        <label className={labelClass}>Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className={inputClass}
                          rows={2}
                          placeholder="Payment description"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Amount <span className="text-blue-700">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                          className={inputClass}
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Bank Account</label>
                        <select
                          value={formData.bankAccountId}
                          onChange={(e) => handleBankAccountChange(e.target.value)}
                          className={inputClass}
                          disabled={formData.paymentMode === 'Cash'}
                        >
                          <option value="">Select Account</option>
                          {bankAccounts.map(a => (
                            <option key={a.id} value={a.id}>{a.accountName}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Payment Mode</label>
                        <select
                          value={formData.paymentMode}
                          onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
                          className={inputClass}
                        >
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>

                      {formData.paymentMode !== 'Cash' && (
                        <div>
                          <label className={labelClass}>Reference Number</label>
                          <input
                            type="text"
                            value={formData.referenceNo}
                            onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                            className={inputClass}
                            placeholder="Transaction/Cheque number"
                          />
                        </div>
                      )}

                      <div>
                        <label className={labelClass}>Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className={inputClass}
                        >
                          <option value="Completed">Completed</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>

                      <div className="lg:col-span-2">
                        <label className={labelClass}>Remarks</label>
                        <textarea
                          value={formData.remarks}
                          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                          className={inputClass}
                          rows={2}
                          placeholder="Additional remarks"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className={`px-6 py-4 border-t ${
                  isDarkMode 
                    ? 'bg-gray-800/80 border-gray-700' 
                    : 'bg-white/80 border-gray-200'
                } backdrop-blur-xl`}>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={handleCloseDrawer}
                      className={secondaryButtonClass}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    {(editingPayment ? canEdit('Payment') : canCreate('Payment')) && (
                      <button
                        onClick={handleSave}
                        className={primaryButtonClass}
                      >
                        <Save className="w-4 h-4" />
                        {editingPayment ? 'Update Payment' : 'Save Payment'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}