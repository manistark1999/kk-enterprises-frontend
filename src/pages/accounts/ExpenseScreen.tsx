import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Plus, 
  Trash2, 
  Calendar,
  DollarSign,
  FileText,
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  X,
  Printer
} from 'lucide-react';
import { getCurrentDate } from '@/utils/formatting/dateTimeUtils';
import { 
  FORM_CONSTANTS,
  getCardClass,
  getInputClass,
  getTextareaClass,
  getLabelClass,
  getPrimaryButtonClass,
  getSecondaryButtonClass,
  getInputClassWithValidation,
  getSelectClassWithValidation,
  isFieldEmpty
} from '@/utils/formStyles';
import { toast } from 'react-toastify';
import { useTransactions } from '@/contexts/TransactionsContext';

interface ExpenseScreenProps {
  isDarkMode: boolean;
}

interface ExpenseRecord {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMode: string;
  referenceNo?: string;
  status: 'Paid' | 'Pending';
}

export function ExpenseScreen({ isDarkMode }: ExpenseScreenProps) {
  const { expenses, addExpense, updateExpense, deleteExpense } = useTransactions();
  
  // Form state
  const [formData, setFormData] = useState({
    date: getCurrentDate(),
    category: '',
    description: '',
    amount: '',
    paymentMode: 'Cash',
    referenceNo: '',
    paidTo: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      date: getCurrentDate(),
      category: '',
      description: '',
      amount: '',
      paymentMode: 'Cash',
      referenceNo: '',
      paidTo: '',
      notes: ''
    });
  };

  const handleSave = () => {
    // Check for empty required fields
    const errors: {[key: string]: boolean} = {
      category: isFieldEmpty(formData.category),
      description: isFieldEmpty(formData.description),
      amount: isFieldEmpty(formData.amount),
    };
    
    setValidationErrors(errors);
    
    // If any required field is empty, don't save
    if (errors.category || errors.description || errors.amount) {
      toast.error('Please fill in all required fields marked with *');
      return;
    }

    if (isEditing && editingId) {
      // Update existing expense
      const existingExpense = expenses.find(exp => exp.id === editingId);
      if (existingExpense) {
        const updatedExpense = {
          ...existingExpense,
          expenseDate: formData.date,
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount),
          paymentMode: formData.paymentMode,
          referenceNo: formData.referenceNo || 'N/A',
        };

        // Update in TransactionsContext
        updateExpense(editingId, updatedExpense);

        // Reset editing state
        setIsEditing(false);
        setEditingId(null);

        // Show success message
        toast.success('Expense updated successfully!');
      }
    } else {
      // Create new expense
      const expenseNo = `EXP-${String(expenses.length + 1).padStart(3, '0')}`;
      const newId = `expense_${Date.now()}`;

      const newExpense = {
        id: newId,
        expenseNo: expenseNo,
        expenseDate: formData.date,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        paymentMode: formData.paymentMode,
        referenceNo: formData.referenceNo || 'N/A',
        status: 'Paid',
        createdAt: new Date().toISOString()
      };

      // Add to TransactionsContext
      addExpense(newExpense);

      // Show success message
      toast.success('Expense saved successfully and added to Expense Register!');
    }

    // Clear form and validation errors
    handleClear();
    setValidationErrors({});
  };

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [recordToView, setRecordToView] = useState<ExpenseRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});

  // Action handlers
  const handleView = (expense: any) => {
    // Map the expense data to the correct structure for viewing
    const mappedRecord: ExpenseRecord = {
      id: expense.expenseNo || expense.id,
      date: expense.expenseDate || expense.date || '',
      category: expense.category || '',
      description: expense.description || '',
      amount: expense.amount || 0,
      paymentMode: expense.paymentMode || '',
      referenceNo: expense.referenceNo || 'N/A',
      status: expense.status || 'Paid'
    };
    setRecordToView(mappedRecord);
    setViewModalOpen(true);
  };

  const handlePrint = (expense: any) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Expense Receipt - ${expense.expenseNo || expense.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #2563EB; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              td { padding: 10px; border-bottom: 1px solid #ddd; }
              .label { font-weight: bold; width: 200px; }
              .total { font-size: 24px; color: #059669; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>KK Enterprises</h1>
            <h2>Expense Receipt</h2>
            <table>
              <tr><td class="label">Expense ID:</td><td>${expense.expenseNo || expense.id}</td></tr>
              <tr><td class="label">Date:</td><td>${new Date(expense.expenseDate || expense.date).toLocaleDateString('en-IN')}</td></tr>
              <tr><td class="label">Category:</td><td>${expense.category}</td></tr>
              <tr><td class="label">Description:</td><td>${expense.description}</td></tr>
              <tr><td class="label">Payment Mode:</td><td>${expense.paymentMode}</td></tr>
              <tr><td class="label">Reference No:</td><td>${expense.referenceNo || 'N/A'}</td></tr>
              <tr><td class="label">Status:</td><td>${expense.status}</td></tr>
              <tr><td class="label">Amount:</td><td class="total">₹${expense.amount.toLocaleString('en-IN')}</td></tr>
            </table>
            <script>window.print(); window.onafterprint = () => window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    toast.success('Opening print preview...');
  };

  const handleEdit = (expense: any) => {
    setFormData({
      date: expense.expenseDate || expense.date || '',
      category: expense.category || '',
      description: expense.description || '',
      amount: expense.amount ? expense.amount.toString() : '',
      paymentMode: expense.paymentMode || 'Cash',
      referenceNo: expense.referenceNo || '',
      paidTo: '',
      notes: ''
    });
    setIsEditing(true);
    setEditingId(expense.id);
    toast.info(`Editing expense: ${expense.expenseNo || expense.id}`);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
      setRecordToDelete(expense);
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      deleteExpense(recordToDelete.id);
      toast.success('Expense deleted successfully');
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className={`p-6 ${FORM_CONSTANTS.SECTION_SPACING}`}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Expense Management</h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Record and track business expenses</p>
        </div>
      </div>

      {/* Center Card Layout for Expense Form */}
      <div className={`${FORM_CONSTANTS.FORM_MAX_WIDTH} ${FORM_CONSTANTS.FORM_MARGIN}`}>
        <motion.div
          className={getCardClass(isDarkMode)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={FORM_CONSTANTS.FORM_PADDING}>
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Add New Expense</h2>
            </div>

            {/* Two Column Form */}
            <div className={`${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.FIELD_GAP} mb-6`}>
              <div>
                <label className={`${getLabelClass(isDarkMode)} flex items-center gap-1`}>
                  Expense Date {!formData.date && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="date" 
                  className={getInputClass(isDarkMode)}
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className={`${getLabelClass(isDarkMode)} flex items-center gap-1`}>
                  Expense Category {!formData.category && <span className="text-red-500">*</span>}
                </label>
                <select 
                  className={getSelectClassWithValidation(isDarkMode, validationErrors.category)}
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  <option value="rent">Rent</option>
                  <option value="utilities">Utilities</option>
                  <option value="supplies">Supplies</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="transport">Transport</option>
                  <option value="salary">Salary</option>
                  <option value="other">Other</option>
                </select>
                {validationErrors.category && (
                  <p className="text-red-500 text-xs mt-1">Please select a category</p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className={`${getLabelClass(isDarkMode)} flex items-center gap-1`}>
                  Description {!formData.description && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="text" 
                  placeholder="Enter expense description"
                  className={getInputClassWithValidation(isDarkMode, validationErrors.description)}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
                {validationErrors.description && (
                  <p className="text-red-500 text-xs mt-1">Please enter a description</p>
                )}
              </div>

              <div>
                <label className={`${getLabelClass(isDarkMode)} flex items-center gap-1`}>
                  Amount (₹) {!formData.amount && <span className="text-red-500">*</span>}
                </label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className={getInputClassWithValidation(isDarkMode, validationErrors.amount)}
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
                {validationErrors.amount && (
                  <p className="text-red-500 text-xs mt-1">Please enter an amount</p>
                )}
              </div>

              <div>
                <label className={`${getLabelClass(isDarkMode)} flex items-center gap-1`}>
                  Payment Mode {!formData.paymentMode && <span className="text-red-500">*</span>}
                </label>
                <select className={getInputClass(isDarkMode)}
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleInputChange}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>Reference No.</label>
                <input 
                  type="text" 
                  placeholder="Transaction/Receipt reference"
                  className={getInputClass(isDarkMode)}
                  name="referenceNo"
                  value={formData.referenceNo}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>Paid To</label>
                <input 
                  type="text" 
                  placeholder="Vendor/Party name"
                  className={getInputClass(isDarkMode)}
                  name="paidTo"
                  value={formData.paidTo}
                  onChange={handleInputChange}
                />
              </div>

              <div className="lg:col-span-2">
                <label className={getLabelClass(isDarkMode)}>Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Additional notes or remarks..."
                  className={getTextareaClass(isDarkMode)}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button className={getSecondaryButtonClass(isDarkMode)} onClick={handleClear}>
                <span className="text-sm font-medium">Clear</span>
              </button>
              <button className={getPrimaryButtonClass()} onClick={handleSave}>
                <Save className="w-4 h-4" />
                <span>Save Expense</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Expense History Table */}
      <motion.div
        className={getCardClass(isDarkMode)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={FORM_CONSTANTS.FORM_PADDING}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Expense History</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700/50 border-gray-600' 
                  : 'bg-white border-gray-200'
              }`}>
                <Search className={`w-4 h-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  className={`bg-transparent outline-none text-sm w-48 ${
                    isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter</span>
              </button>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isDarkMode 
                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}>
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Expense ID</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Date</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Category</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Description</th>
                  <th className={`text-right py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Amount</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Payment Mode</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Status</th>
                  <th className={`text-center py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr 
                    key={expense.id}
                    className={`border-b ${
                      isDarkMode ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <td className={`py-4 px-4 text-sm font-medium ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>{expense.expenseNo || expense.id}</td>
                    <td className={`py-4 px-4 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{new Date(expense.expenseDate).toLocaleDateString('en-IN')}</td>
                    <td className={`py-4 px-4 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{expense.category}</td>
                    <td className={`py-4 px-4 text-sm ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{expense.description}</td>
                    <td className={`py-4 px-4 text-sm font-semibold text-right ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>₹{expense.amount.toLocaleString()}</td>
                    <td className={`py-4 px-4 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{expense.paymentMode}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        expense.status === 'Paid'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-orange-500/20 text-orange-500'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleView(expense as any)}
                          className={`p-1.5 rounded-lg transition-all ${
                            isDarkMode 
                              ? 'hover:bg-blue-500/20 text-blue-400' 
                              : 'hover:bg-blue-50 text-blue-600'
                          }`}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handlePrint(expense as any)}
                          className={`p-1.5 rounded-lg transition-all ${
                            isDarkMode 
                              ? 'hover:bg-green-500/20 text-green-400' 
                              : 'hover:bg-green-50 text-green-600'
                          }`}
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(expense as any)}
                          className={`p-1.5 rounded-lg transition-all ${
                            isDarkMode 
                              ? 'hover:bg-gray-600 text-gray-400' 
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            isDarkMode 
                              ? 'hover:bg-red-500/20 text-red-400' 
                              : 'hover:bg-red-50 text-red-600'
                          }`}
                          title="Delete"
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }">
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Showing 1 to 5 of 45 expenses</p>
            <div className="flex items-center gap-2">
              <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>Previous</button>
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500 text-white">1</button>
              <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>2</button>
              <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>3</button>
              <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>Next</button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* View Modal */}
      {viewModalOpen && recordToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
          <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expense Details</h2>
              <button className="p-1.5 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setViewModalOpen(false)}>
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Expense ID:</label>
                <p className="text-sm text-gray-900 dark:text-white">{recordToView.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date:</label>
                <p className="text-sm text-gray-900 dark:text-white">{new Date(recordToView.date).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category:</label>
                <p className="text-sm text-gray-900 dark:text-white">{recordToView.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description:</label>
                <p className="text-sm text-gray-900 dark:text-white">{recordToView.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Mode:</label>
                <p className="text-sm text-gray-900 dark:text-white">{recordToView.paymentMode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference No:</label>
                <p className="text-sm text-gray-900 dark:text-white">{recordToView.referenceNo || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</label>
                <p className="text-sm text-gray-900 dark:text-white">{recordToView.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount:</label>
                <p className="text-sm text-gray-900 dark:text-white">₹{recordToView.amount.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="flex items-center justify-end mt-4">
              <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>Close</button>
              <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isDarkMode 
                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`} onClick={() => handlePrint(recordToView)}>
                <Printer className="w-4 h-4" />
                <span className="text-sm font-medium">Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
          <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Delete</h2>
              <button className="p-1.5 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setDeleteModalOpen(false)}>
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Expense ID:</label>
                <p className="text-sm text-gray-900 dark:text-white">{recordToDelete.expenseNo || recordToDelete.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date:</label>
                <p className="text-sm text-gray-900 dark:text-white">{new Date(recordToDelete.expenseDate).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category:</label>
                <p className="text-sm text-gray-900 dark:text-white">{recordToDelete.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description:</label>
                <p className="text-sm text-gray-900 dark:text-white">{recordToDelete.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Mode:</label>
                <p className="text-sm text-gray-900 dark:text-white">{recordToDelete.paymentMode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference No:</label>
                <p className="text-sm text-gray-900 dark:text-white">{recordToDelete.referenceNo || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</label>
                <p className="text-sm text-gray-900 dark:text-white">{recordToDelete.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount:</label>
                <p className="text-sm text-gray-900 dark:text-white">₹{recordToDelete.amount.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className={`flex items-center justify-end gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className={getSecondaryButtonClass(isDarkMode)}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                  isDarkMode
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}