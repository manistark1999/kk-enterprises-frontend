import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save,
  Plus,
  FileText,
  Receipt as ReceiptIcon,
  Search,
  Trash2,
  Eye,
  Edit2,
  Download,
  Printer,
  Filter,
  X,
  DollarSign,
  User,
  Calendar,
  CreditCard,
  Building2,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import { handlePrintWithTemplate, PrintData } from '@/utils/printUtils';
import { 
  FORM_CONSTANTS,
  getCardClass,
  getInputClass,
  getLabelClass,
  getPrimaryButtonClass,
  getSecondaryButtonClass,
  getSelectClass
} from '@/utils/formStyles';
import { useReceiptsPayments, ReceiptRecord } from '@/contexts/ReceiptsPaymentsContext';
import { useCustomers } from '@/contexts/CustomerContext';
import { useLabourBills } from '@/contexts/LabourBillContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { UnifiedPrintPreview } from '@/components/print/UnifiedPrintPreview';

interface ReceiptScreenProps {
  isDarkMode: boolean;
}

export function ReceiptScreenEnhanced({ isDarkMode }: ReceiptScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Received' | 'Pending'>('All');
  const [filterPaymentMode, setFilterPaymentMode] = useState<'All' | 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque'>('All');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerId: '',
    customer: '',
    customerPhone: '',
    labourBillId: '',
    labourBillNo: '',
    description: '',
    amount: 0,
    paymentMode: 'Cash' as 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque',
    referenceNo: '',
    bankName: '',
    status: 'Received' as 'Received' | 'Pending',
    receiptNo: '',
    createdBy: 'Yatan Prajapati'
  });

  const { canCreate, canEdit, canDelete, canPrint } = useAuth();
  const { receipts, addReceipt, updateReceipt, deleteReceipt, getTotalReceived, getNextReceiptNo, refreshReceipts } = useReceiptsPayments();
  const { customers } = useCustomers();
  const { labourBills } = useLabourBills();
  
  // Auto-refresh every 60 seconds
  React.useEffect(() => {
    refreshReceipts();
    const interval = setInterval(refreshReceipts, 60000);
    return () => clearInterval(interval);
  }, [refreshReceipts]);

  const cardClass = getCardClass(isDarkMode);
  const inputClass = getInputClass(isDarkMode);
  const labelClass = getLabelClass(isDarkMode);
  const primaryButtonClass = getPrimaryButtonClass();
  const secondaryButtonClass = getSecondaryButtonClass(isDarkMode);
  const selectClass = getSelectClass(isDarkMode);

  // Filter receipts
  const filteredReceipts = receipts.filter((receipt: ReceiptRecord) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (receipt.customer_name || '').toLowerCase().includes(searchLower) ||
      (receipt.receipt_no || '').toLowerCase().includes(searchLower) ||
      (receipt.payment_mode || '').toLowerCase().includes(searchLower) ||
      (receipt.description || '').toLowerCase().includes(searchLower);

    const matchesStatus =
      filterStatus === 'All' || receipt.status === filterStatus;

    const matchesPaymentMode =
      filterPaymentMode === 'All' || receipt.payment_mode === filterPaymentMode;

    return matchesSearch && matchesStatus && matchesPaymentMode;
  });

  const handleAddNew = async () => {
    setEditingReceipt(null);
    let autoReceiptNo = '';
    const nextNo = await getNextReceiptNo();
    if (nextNo) autoReceiptNo = nextNo;

    setFormData({
      date: new Date().toISOString().split('T')[0],
      customerId: '',
      customer: '',
      customerPhone: '',
      labourBillId: '',
      labourBillNo: '',
      description: '',
      amount: 0,
      paymentMode: 'Cash',
      referenceNo: '',
      bankName: '',
      status: 'Received',
      receiptNo: autoReceiptNo,
      createdBy: 'Yatan Prajapati'
    });
    setIsDrawerOpen(true);
  };

  // Open drawer for editing receipt
  const handleEdit = (receipt: ReceiptRecord) => {
    setEditingReceipt(receipt);
    setFormData({
      date: receipt.receipt_date,
      customerId: receipt.customer_id?.toString() || '',
      customer: receipt.customer_name,
      customerPhone: receipt.customer_phone || '',
      labourBillId: receipt.labour_bill_id || '',
      labourBillNo: receipt.labour_bill_no || '',
      description: receipt.description,
      amount: Number(receipt.amount),
      paymentMode: receipt.payment_mode as any,
      referenceNo: receipt.reference_no || '',
      bankName: receipt.bank_name || '',
      status: receipt.status as any,
      receiptNo: receipt.receipt_no,
      createdBy: 'Yatan Prajapati' // Placeholder
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string, receiptNo: string) => {
    if (window.confirm(`Are you sure you want to delete receipt "${receiptNo}"?`)) {
      deleteReceipt(id);
      // toast is already called in the context
    }
  };

  // Handle customer selection
  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData({
        ...formData,
        customerId: customer.id,
        customer: customer.name,
        customerPhone: customer.phone
      });
    } else {
      setFormData({
        ...formData,
        customerId: '',
        customer: '',
        customerPhone: ''
      });
    }
  };

  // Handle labour bill selection
  const handleLabourBillChange = (billId: string) => {
    const activeBills = labourBills.filter((b: any) => b.payment_status !== 'Fully Paid');
    const bill = labourBills.find(b => b.id === billId);
    if (bill) {
      setFormData({
        ...formData,
        labourBillId: bill.id,
        labourBillNo: bill.billNo,
        customer: bill.customerName,
        customerPhone: bill.customerPhone,
        amount: bill.grandTotal,
        description: `Payment for Labour Bill ${bill.billNo}`
      });
    } else {
      setFormData({
        ...formData,
        labourBillId: '',
        labourBillNo: '',
        amount: 0,
        description: ''
      });
    }
  };

  // Save receipt
  const handleSave = async () => {
    if (!formData.customer.trim()) {
      toast.error('Please select a customer');
      return;
    }
    if (formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const payload = {
      receipt_date: formData.date,
      customer_id: formData.customerId || null,
      customer_name: formData.customer,
      customer_phone: formData.customerPhone,
      labour_bill_id: formData.labourBillId || null,
      labour_bill_no: formData.labourBillNo,
      description: formData.description,
      amount: formData.amount,
      payment_mode: formData.paymentMode,
      reference_no: formData.referenceNo,
      bank_name: formData.bankName,
      status: formData.status,
      receipt_no: formData.receiptNo || undefined
    };

    try {
      if (editingReceipt) {
        await updateReceipt(editingReceipt.id, payload);
        setIsDrawerOpen(false);
      } else {
        await addReceipt(payload);
        
        // Reset form to add another one automatically, rather than closing drawer
        const nextNo = await getNextReceiptNo();
        setFormData({
          date: new Date().toISOString().split('T')[0],
          customerId: '',
          customer: '',
          customerPhone: '',
          labourBillId: '',
          labourBillNo: '',
          description: '',
          amount: 0,
          paymentMode: 'Cash',
          referenceNo: '',
          bankName: '',
          status: 'Received',
          receiptNo: nextNo || '',
          createdBy: 'Yatan Prajapati'
        });
      }
    } catch (error) {
    }
  };

  // Handle individual receipt print
  const handlePrint = (receipt: ReceiptRecord) => {
    setPrintData(receipt);
    setIsPrintModalOpen(true);
    toast.success('Opening print preview...');
  };

  // Close drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingReceipt(null);
  };

  // Calculate statistics
  const stats = {
    total: receipts.length,
    received: receipts.filter((r: ReceiptRecord) => r.status === 'Received').length,
    pending: receipts.filter((r: ReceiptRecord) => r.status === 'Pending').length,
    totalAmount: getTotalReceived()
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Receipt Management</h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Record and manage customer payments and receipts</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Integration Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            isDarkMode 
              ? 'bg-blue-600/10 border-green-500/30 text-blue-400' 
              : 'bg-blue-50 border-green-200 text-blue-700'
          }`}>
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-medium">Synced with Receipt Register</span>
          </div>
          {canCreate('Receipt') && (
            <button 
              onClick={handleAddNew}
              className={`${primaryButtonClass} flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              New Receipt
            </button>
          )}
        </div>
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
                  Total Receipts
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{stats.total}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <ReceiptIcon className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
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
                  Received
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>{stats.received}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'
              }`}>
                <TrendingUp className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
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
                <DollarSign className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
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
                placeholder="Search by customer, receipt number, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className={selectClass}
              >
                <option value="All">All Status</option>
                <option value="Received">Received</option>
                <option value="Pending">Pending</option>
              </select>

              <select
                value={filterPaymentMode}
                onChange={(e) => setFilterPaymentMode(e.target.value as any)}
                className={selectClass}
              >
                <option value="All">All Modes</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>

              <button className={secondaryButtonClass}>
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
              <button 
                onClick={() => {
                  if (filteredReceipts.length > 0) {
                    toast.info('Printing register...');
                    window.print();
                  } else {
                    toast.error('No data to print');
                  }
                }}
                className={secondaryButtonClass}
              >
                <Printer className="w-4 h-4" />
                <span className="hidden md:inline">Print</span>
              </button>
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
                    }`}>Receipt No</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Date</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Customer</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Labour Bill</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Description</th>
                    <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Amount</th>
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
                      transition={{ delay: index * 0.05 }}
                      className={`transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`py-3 px-4 text-sm font-medium ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>{receipt.receipt_no}</td>
                      <td className={`py-3 px-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{new Date(receipt.receipt_date).toLocaleDateString('en-IN')}</td>
                      <td className={`py-3 px-4 text-sm font-medium ${
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
                      }`}>{receipt.description}</td>
                      <td className={`py-3 px-4 text-sm font-semibold text-right ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>₹{Number(receipt.amount).toLocaleString('en-IN')}</td>
                      <td className={`py-3 px-4 text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{receipt.payment_mode}</td>
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
                          {canEdit('Receipt') && (
                            <button 
                              onClick={() => handleEdit(receipt)}
                              className="p-1 hover:text-blue-500 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          
                          {canPrint('Receipt') && (
                            <button 
                              onClick={() => handlePrint(receipt)}
                              className="p-1 hover:text-blue-600 transition-colors"
                              title="Print Receipt"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}
                          
                          {canDelete('Receipt') && (
                            <button 
                              onClick={() => handleDelete(receipt.id, receipt.receipt_no)}
                              className="p-1 hover:text-blue-700 transition-colors"
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
                  <ReceiptIcon className={`w-12 h-12 mx-auto mb-3 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>No receipts found</p>
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
                        isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <ReceiptIcon className={`w-5 h-5 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {editingReceipt ? 'Edit Receipt' : 'New Receipt'}
                        </h2>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {editingReceipt ? 'Update receipt details' : 'Create a new receipt'}
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
                  {/* Link to Labour Bill (Optional) */}
                  <div className="mb-6">
                    <h3 className={`text-sm font-semibold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Link to Labour Bill (Optional)</h3>
                    
                    <div>
                      <label className={labelClass}>Select Labour Bill</label>
                      <select
                        value={formData.labourBillId}
                        onChange={(e) => handleLabourBillChange(e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Not linked to any bill</option>
                        {labourBills.map(bill => (
                          <option key={bill.id} value={bill.id}>
                            {bill.billNo} - {bill.customerName} - ₹{bill.grandTotal.toLocaleString('en-IN')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div>
                    <h3 className={`text-sm font-semibold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Receipt Details</h3>
                    
                    <div className={`${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.FIELD_GAP}`}>
                      <div>
                        <label className={labelClass}>
                          Receipt No
                        </label>
                        <input
                          type="text"
                          value={formData.receiptNo}
                          readOnly
                          className={`${inputClass} bg-gray-50`}
                          placeholder="Auto-generated"
                        />
                      </div>

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
                          Customer <span className="text-blue-700">*</span>
                        </label>
                        <select
                          value={formData.customerId}
                          onChange={(e) => handleCustomerChange(e.target.value)}
                          className={selectClass}
                          disabled={!!formData.labourBillId}
                        >
                          <option value="">Select Customer</option>
                          {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="lg:col-span-2">
                        <label className={labelClass}>Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className={inputClass}
                          rows={3}
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
                        <label className={labelClass}>Payment Mode</label>
                        <select
                          value={formData.paymentMode}
                          onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
                          className={selectClass}
                        >
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>

                      {formData.paymentMode !== 'Cash' && (
                        <>
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

                          {(formData.paymentMode === 'Bank Transfer' || formData.paymentMode === 'Cheque') && (
                            <div>
                              <label className={labelClass}>Bank Name</label>
                              <input
                                type="text"
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                className={inputClass}
                                placeholder="Bank name"
                              />
                            </div>
                          )}
                        </>
                      )}

                      <div>
                        <label className={labelClass}>Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className={selectClass}
                        >
                          <option value="Received">Received</option>
                          <option value="Pending">Pending</option>
                        </select>
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
                    {(editingReceipt ? canEdit('Receipt') : canCreate('Receipt')) && (
                      <button
                        onClick={handleSave}
                        className={primaryButtonClass}
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
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