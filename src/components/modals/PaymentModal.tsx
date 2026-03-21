import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save,
  Plus,
  FileText,
  Receipt,
  CreditCard,
  FileCheck,
  Building2
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  selectedPaymentMethod?: string;
}

export function PaymentModal({ isOpen, onClose, isDarkMode }: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState('sales-purchase');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    voucherType: 'Payment',
    receiptNo: 'Auto / Manual',
    customer: '',
    amount: '',
    paymentMode: 'Cash',
    referenceNo: '',
    bankName: ''
  });

  const tabs = [
    { id: 'sales-purchase', label: 'Sales & Purchase Journal', icon: FileText },
    { id: 'payments-vouchers', label: 'Payments & Vouchers', icon: Receipt },
    { id: 'sundry-creditors', label: 'Sundry Creditors Payment', icon: CreditCard },
    { id: 'invoices', label: 'Invoices', icon: FileCheck }
  ];

  const inputClass = `w-full px-4 py-3 rounded-lg border transition-all outline-none text-base ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${
    isDarkMode ? 'text-gray-200' : 'text-gray-700'
  }`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
                isDarkMode 
                  ? 'bg-gray-900 border border-gray-800' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between ${
                isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
                  }`}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Accounts Department</h2>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Manage payments, vouchers, and journals</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-all ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className={`border-b ${
                isDarkMode ? 'border-gray-800 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'
              }`}>
                <div className="flex overflow-x-auto">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all relative ${
                          isActive
                            ? isDarkMode
                              ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                              : 'border-blue-600 bg-blue-50 text-blue-600'
                            : isDarkMode
                            ? 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                <div className="p-6">
                  {activeTab === 'sales-purchase' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={`mb-6 pb-4 border-b ${
                        isDarkMode ? 'border-gray-800' : 'border-gray-200'
                      }`}>
                        <h3 className={`text-lg font-bold ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>Sales Receipt Entry</h3>
                      </div>

                      <form onSubmit={handleSubmit}>
                        {/* Row 1: Date, Voucher Type, Receipt No */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div>
                            <label className={labelClass}>Date</label>
                            <input
                              type="date"
                              value={formData.date}
                              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>Voucher Type</label>
                            <select
                              value={formData.voucherType}
                              onChange={(e) => setFormData({ ...formData, voucherType: e.target.value })}
                              className={inputClass}
                            >
                              <option value="Payment">Payment</option>
                              <option value="Receipt">Receipt</option>
                              <option value="Contra">Contra</option>
                              <option value="Journal">Journal</option>
                            </select>
                          </div>

                          <div>
                            <label className={labelClass}>Receipt No</label>
                            <input
                              type="text"
                              value={formData.receiptNo}
                              onChange={(e) => setFormData({ ...formData, receiptNo: e.target.value })}
                              placeholder="Auto / Manual"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        {/* Row 2: Sundry Debtors & Amount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className={labelClass}>Sundry Debtors (Customer)</label>
                            <div className="flex gap-2">
                              <select
                                value={formData.customer}
                                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                className={inputClass}
                              >
                                <option value="">Select Customer...</option>
                                <option value="rajesh-motors">Rajesh Motors</option>
                                <option value="sharma-auto">Sharma Auto Parts</option>
                                <option value="kumar-garage">Kumar Garage</option>
                                <option value="patel-workshop">Patel Workshop</option>
                                <option value="reddy-auto">Reddy Auto Service</option>
                              </select>
                              <button
                                type="button"
                                className="flex items-center gap-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all whitespace-nowrap"
                              >
                                <Plus className="w-4 h-4" />
                                Add
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className={labelClass}>Amount Received (₹)</label>
                            <input
                              type="number"
                              value={formData.amount}
                              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        {/* Row 3: Payment Mode & Reference No */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className={labelClass}>Payment Mode</label>
                            <select
                              value={formData.paymentMode}
                              onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                              className={inputClass}
                            >
                              <option value="Cash">Cash</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="UPI">UPI</option>
                              <option value="Card">Card</option>
                              <option value="Cheque">Cheque</option>
                              <option value="NEFT/RTGS">NEFT/RTGS</option>
                            </select>
                          </div>

                          <div>
                            <label className={labelClass}>Reference No / Cheque No</label>
                            <input
                              type="text"
                              value={formData.referenceNo}
                              onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                              placeholder="Transaction ID or Cheque No"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        {/* Row 4: Bank Name */}
                        <div className="grid grid-cols-1 mb-6">
                          <div>
                            <label className={labelClass}>Bank Name (if applicable)</label>
                            <input
                              type="text"
                              value={formData.bankName}
                              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                              placeholder="Enter bank name"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                          <button
                            type="button"
                            onClick={onClose}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${
                              isDarkMode
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 transition-all"
                          >
                            <Save className="w-4 h-4" />
                            Save Receipt
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {activeTab === 'payments-vouchers' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`text-center py-12 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Payments & Vouchers</h3>
                      <p>Payment voucher entry form coming soon</p>
                    </motion.div>
                  )}

                  {activeTab === 'sundry-creditors' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`text-center py-12 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Sundry Creditors Payment</h3>
                      <p>Creditor payment form coming soon</p>
                    </motion.div>
                  )}

                  {activeTab === 'invoices' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`text-center py-12 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      <FileCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>Invoices</h3>
                      <p>Invoice management form coming soon</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
