import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X,
  Save,
  Trash2,
  FileText,
  Receipt as ReceiptIcon,
  Calendar,
  User,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { Dropdown, DropdownOption } from '@/components/ui/Dropdown';
import { useCustomers } from '@/contexts/CustomerContext';
import { api, endpoints } from '@/services/api';

interface ReceiptPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export function ReceiptPanel({ isOpen, onClose, isDarkMode }: ReceiptPanelProps) {
  const { customers } = useCustomers();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customer: '',
    description: '',
    amount: '',
    paymentMode: 'Cash',
    billNo: '',
    receiptNo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentModes = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'];

  // Customer dropdown options
  const customerOptions: DropdownOption[] = customers.map(customer => ({
    value: customer.name, // Use name since backend expects customer_name
    label: `${customer.name} - ${customer.phone}`
  }));

  const handleReset = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      customer: '',
      description: '',
      amount: '',
      paymentMode: 'Cash',
      billNo: '',
      receiptNo: ''
    });
  };

  const handleSave = async () => {
    if (!formData.customer || !formData.amount || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        receipt_no: formData.receiptNo || `REC-${Date.now()}`,
        receipt_date: formData.date,
        customer_name: formData.customer,
        description: formData.description,
        amount: parseFloat(formData.amount),
        payment_mode: formData.paymentMode,
        status: 'received'
      };

      console.log('📤 Submitting receipt payload:', payload);
      const response = await api.post(endpoints.billing.receipt.create, payload);
      
      if (response.success) {
        toast.success(response.message || 'Receipt saved successfully!');
        
        // Reset form
        handleReset();
        onClose();
      } else {
        throw new Error(response.error || 'Failed to save receipt');
      }
    } catch (error) {
      console.error('❌ Error saving receipt:', error);
      
      // Fallback is still useful during transition
      const receiptId = `REC-${Date.now()}`;
      const receiptData = {
        id: receiptId,
        ...formData,
        timestamp: new Date().toISOString()
      };
      
      const existingReceipts = JSON.parse(localStorage.getItem('receipts') || '[]');
      existingReceipts.unshift(receiptData);
      localStorage.setItem('receipts', JSON.stringify(existingReceipts));
      
      toast.info('Saved locally - backend connection failed');
      
      handleReset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-lg border transition-all outline-none text-base ${
    isDarkMode
      ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${
    isDarkMode ? 'text-gray-200' : 'text-gray-700'
  }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />

          {/* Centered Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30
            }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[700px] z-[60] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              isDarkMode 
                ? 'bg-gray-900/95 border border-gray-800' 
                : 'bg-white/95 border border-gray-200'
            } backdrop-blur-xl`}
          >
            {/* Header */}
            <div className={`px-6 py-5 border-b flex-shrink-0 ${
              isDarkMode ? 'border-gray-800 bg-gray-900/80' : 'border-gray-200 bg-white/80'
            } backdrop-blur-xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                    <ReceiptIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>New Receipt</h2>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Create a new receipt voucher</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className={`p-2 rounded-lg transition-all ${
                    isDarkMode 
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Form Card */}
              <div className={`rounded-xl border p-6 ${
                isDarkMode 
                  ? 'bg-gray-800/40 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="space-y-6">
                  {/* Row 1: Date and Receipt No */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        disabled={isSubmitting}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        <FileText className="w-4 h-4 inline mr-2" />
                        Receipt No
                      </label>
                      <input
                        type="text"
                        value={formData.receiptNo}
                        onChange={(e) => setFormData({ ...formData, receiptNo: e.target.value })}
                        placeholder="Auto-generated"
                        disabled={isSubmitting}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Row 2: Customer */}
                  <div>
                    <label className={labelClass}>
                      <User className="w-4 h-4 inline mr-2" />
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                      options={customerOptions}
                      value={formData.customer}
                      onChange={(value) => setFormData({ ...formData, customer: value })}
                      placeholder="Select customer"
                      isDarkMode={isDarkMode}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Row 3: Bill No and Amount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        <FileText className="w-4 h-4 inline mr-2" />
                        Bill No
                      </label>
                      <input
                        type="text"
                        value={formData.billNo}
                        onChange={(e) => setFormData({ ...formData, billNo: e.target.value })}
                        placeholder="Enter bill number"
                        disabled={isSubmitting}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        disabled={isSubmitting}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Row 4: Payment Mode */}
                  <div>
                    <label className={labelClass}>
                      <CreditCard className="w-4 h-4 inline mr-2" />
                      Payment Mode
                    </label>
                    <select
                      value={formData.paymentMode}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                      disabled={isSubmitting}
                      className={inputClass}
                    >
                      {paymentModes.map((mode) => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 5: Description */}
                  <div>
                    <label className={labelClass}>
                      <FileText className="w-4 h-4 inline mr-2" />
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter payment description or remarks"
                      rows={3}
                      disabled={isSubmitting}
                      className={inputClass}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSave}
                      disabled={isSubmitting}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Save className="w-5 h-5" />
                      {isSubmitting ? 'Saving...' : 'Save Receipt'}
                    </button>
                    <button
                      onClick={handleReset}
                      disabled={isSubmitting}
                      className={`px-6 py-3 rounded-lg border font-medium transition-all ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                          : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
