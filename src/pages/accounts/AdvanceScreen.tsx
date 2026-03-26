import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Trash2, 
  FileText,
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  Banknote,
  X
} from 'lucide-react';
import { 
  FORM_CONSTANTS,
  getCardClass,
  getInputClass,
  getTextareaClass,
  getLabelClass,
  getPrimaryButtonClass,
  getSecondaryButtonClass,
  getInputClassWithValidation,
  isFieldEmpty
} from '@/utils/formStyles';
import { toast } from 'react-toastify';
import { api, endpoints } from '@/services/api';
import { useMasters } from '@/contexts/MastersContext';

interface AdvanceScreenProps {
  isDarkMode: boolean;
}

interface AdvanceRecord {
  id: string;
  date: string;
  staffName: string;
  staffId?: string;
  purpose: string;
  amount: number;
  paymentMode: string;
  referenceNo?: string;
  repaymentType?: string;
  installments?: number;
  remarks?: string;
  status: 'Paid' | 'Pending' | 'Adjusted';
  adjustedAmount: number;
}

export function AdvanceScreen({ isDarkMode }: AdvanceScreenProps) {
  const { staff } = useMasters();
  const [advanceHistory, setAdvanceHistory] = useState<AdvanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch advances from backend
  const fetchAdvances = async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoints.accounts.advance.list);
      if (response.success && response.data) {
        // Map from backend snake_case to frontend camelCase
        const mapped = (response.data.data || response.data).map((r: any) => ({
          id: r.id,
          advanceNo: r.advance_no,
          date: r.advance_date?.split('T')[0] || '',
          staffId: r.staff_id,
          staffName: r.staff_name,
          purpose: r.purpose,
          amount: parseFloat(r.advance_amount || 0),
          paymentMode: r.payment_mode,
          repaymentType: r.repayment_type,
          installments: r.no_of_installments,
          remarks: r.remarks,
          status: r.status,
          adjustedAmount: 0 // Default for now
        }));
        setAdvanceHistory(mapped);
      }
    } catch (err) {
      toast.error('Error loading advances');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAdvances();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    staffName: '',
    staffId: '',
    purpose: '',
    amount: '',
    paymentMode: 'cash',
    referenceNo: '',
    repaymentType: 'salary',
    installments: '1',
    remarks: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-fill Staff ID when Staff Name is selected
    if (name === 'staffName') {
      const selectedStaff = staff.find(s => s.name === value);
      setFormData(prev => ({ 
        ...prev, 
        staffName: value,
        staffId: selectedStaff ? selectedStaff.id : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleClear = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      staffName: '',
      staffId: '',
      purpose: '',
      amount: '',
      paymentMode: 'cash',
      referenceNo: '',
      repaymentType: 'salary',
      installments: '1',
      remarks: ''
    });
  };

  const handleSave = async () => {
    // Validation
    if (!formData.staffName || !formData.purpose || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      advance_no: `ADV-${new Date().getFullYear()}-${String(advanceHistory.length + 1).padStart(3, '0')}`,
      advance_date: formData.date,
      staff_id: formData.staffId,
      staff_name: formData.staffName,
      purpose: formData.purpose,
      advance_amount: parseFloat(formData.amount),
      payment_mode: formData.paymentMode,
      repayment_type: formData.repaymentType,
      no_of_installments: parseInt(formData.installments),
      remarks: formData.remarks,
      status: 'Paid'
    };

    try {
      if (isEditing && editingId) {
        const response = await api.put(endpoints.accounts.advance.update(editingId), payload);
        if (response.success) {
          toast.success('Advance updated successfully!');
          fetchAdvances();
        }
      } else {
        const response = await api.post(endpoints.accounts.advance.create, payload);
        if (response.success) {
          toast.success('Staff advance saved successfully!');
          fetchAdvances();
        }
      }
      setIsEditing(false);
      setEditingId(null);
      handleClear();
    } catch (err: any) {
      toast.error(err.message || 'Error saving advance');
    }
  };

  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [recordToView, setRecordToView] = useState<AdvanceRecord | null>(null);
  const [recordToEdit, setRecordToEdit] = useState<AdvanceRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<AdvanceRecord | null>(null);

  // Action handlers
  const handleView = (advance: AdvanceRecord) => {
    setRecordToView(advance);
    setViewModalOpen(true);
  };

  const handleEdit = (advance: AdvanceRecord) => {
    setFormData({
      date: advance.date,
      staffName: advance.staffName,
      staffId: advance.staffId || '',
      purpose: advance.purpose,
      amount: advance.amount.toString(),
      paymentMode: advance.paymentMode,
      referenceNo: advance.referenceNo || '',
      repaymentType: advance.repaymentType || 'salary',
      installments: advance.installments ? advance.installments.toString() : '1',
      remarks: advance.remarks || ''
    });
    setIsEditing(true);
    setEditingId(advance.id);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info(`Editing advance: ${advance.id}`);
  };

  const handleDelete = (advance: AdvanceRecord) => {
    setRecordToDelete(advance);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (recordToDelete) {
      try {
        const response = await api.delete(endpoints.accounts.advance.delete(recordToDelete.id));
        if (response.success) {
          toast.success('Advance deleted successfully');
          fetchAdvances();
        }
      } catch (err: any) {
        toast.error(err.message || 'Delete failed');
      } finally {
        setDeleteModalOpen(false);
        setRecordToDelete(null);
      }
    }
  };

  const handleSaveEdit = () => {
    // Validation
    if (!formData.staffName || !formData.purpose || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!recordToEdit) return;

    // Update the record
    const updatedRecord: AdvanceRecord = {
      ...recordToEdit,
      date: formData.date,
      staffName: formData.staffName,
      staffId: formData.staffId,
      purpose: formData.purpose,
      amount: parseFloat(formData.amount),
      paymentMode: formData.paymentMode,
      referenceNo: formData.referenceNo,
      repaymentType: formData.repaymentType,
      installments: parseInt(formData.installments),
      remarks: formData.remarks
    };

    // Update in the list
    setAdvanceHistory(prevHistory =>
      prevHistory.map(item => item.id === recordToEdit.id ? updatedRecord : item)
    );

    // Close modal
    setEditModalOpen(false);
    setRecordToEdit(null);

    // Clear form
    handleClear();

    // Show success message
    toast.success('Advance updated successfully!');
  };

  return (
    <div className={`p-6 ${FORM_CONSTANTS.SECTION_SPACING}`}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Staff Advance Management</h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Manage staff advances and adjustments</p>
        </div>
      </div>

      {/* Center Card Layout for Advance Form */}
      <div className={`${FORM_CONSTANTS.FORM_MAX_WIDTH} ${FORM_CONSTANTS.FORM_MARGIN}`}>
        <motion.div
          className={getCardClass(isDarkMode)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={FORM_CONSTANTS.FORM_PADDING}>
            <div className="flex items-center gap-2 mb-6">
              <Banknote className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Add Staff Advance</h2>
            </div>

            {/* Two Column Form */}
            <div className={`${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.FIELD_GAP} mb-6`}>
              <div>
                <label className={getLabelClass(isDarkMode)}>Advance No.</label>
                <input 
                  type="text" 
                  className={getInputClass(isDarkMode)}
                  value={`ADV-2024-${String(advanceHistory.length + 1).padStart(3, '0')}`}
                  readOnly
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>Advance Date *</label>
                <input 
                  type="date" 
                  className={getInputClass(isDarkMode)}
                  value={formData.date}
                  onChange={handleInputChange}
                  name="date"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>Staff Name *</label>
                <select className={getInputClass(isDarkMode)}
                  value={formData.staffName}
                  onChange={handleInputChange}
                  name="staffName"
                >
                  <option value="">Select Staff Member</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.name}>{s.name} - {s.designation}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>Staff ID</label>
                <input 
                  type="text" 
                  placeholder="Auto-filled"
                  className={getInputClass(isDarkMode)}
                  value={formData.staffId}
                  readOnly
                />
              </div>

              <div className="lg:col-span-2">
                <label className={getLabelClass(isDarkMode)}>Purpose *</label>
                <input 
                  type="text" 
                  placeholder="Reason for advance"
                  className={getInputClass(isDarkMode)}
                  value={formData.purpose}
                  onChange={handleInputChange}
                  name="purpose"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>Advance Amount (₹) *</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className={getInputClassWithValidation(isDarkMode, isFieldEmpty(formData.amount))}
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  name="amount"
                />
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>Payment Mode *</label>
                <select className={getInputClass(isDarkMode)}
                  value={formData.paymentMode}
                  onChange={handleInputChange}
                  name="paymentMode"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>Repayment Type</label>
                <select className={getInputClass(isDarkMode)}
                  value={formData.repaymentType}
                  onChange={handleInputChange}
                  name="repaymentType"
                >
                  <option value="salary">Deduct from Salary</option>
                  <option value="lumpsum">Lumpsum Payment</option>
                  <option value="installment">Monthly Installments</option>
                </select>
              </div>

              <div>
                <label className={getLabelClass(isDarkMode)}>No. of Installments</label>
                <input 
                  type="number" 
                  placeholder="Monthly installments"
                  className={getInputClass(isDarkMode)}
                  min="1"
                  value={formData.installments}
                  onChange={handleInputChange}
                  name="installments"
                />
              </div>

              <div className="lg:col-span-2">
                <label className={getLabelClass(isDarkMode)}>Remarks</label>
                <textarea 
                  rows={3}
                  placeholder="Additional notes..."
                  className={getTextareaClass(isDarkMode)}
                  value={formData.remarks}
                  onChange={handleInputChange}
                  name="remarks"
                ></textarea>
              </div>
            </div>

            {/* Action Buttons - Save button at bottom right */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button className={getPrimaryButtonClass()} onClick={handleSave}>
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Advance History Table */}
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
              }`}>Advance History</h2>
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
                  placeholder="Search advances..."
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
                  }`}>Advance ID</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Date</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Staff Name</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Purpose</th>
                  <th className={`text-right py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Amount</th>
                  <th className={`text-right py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Adjusted</th>
                  <th className={`text-right py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Balance</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Status</th>
                  <th className={`text-center py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {advanceHistory.map((advance) => (
                  <tr 
                    key={advance.id}
                    className={`border-b ${
                      isDarkMode ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <td className={`py-4 px-4 text-sm font-medium ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>{advance.id}</td>
                    <td className={`py-4 px-4 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{advance.date}</td>
                    <td className={`py-4 px-4 text-sm ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{advance.staffName}</td>
                    <td className={`py-4 px-4 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{advance.purpose}</td>
                    <td className={`py-4 px-4 text-sm font-semibold text-right ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>₹{advance.amount.toLocaleString()}</td>
                    <td className={`py-4 px-4 text-sm font-semibold text-right ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>₹{advance.adjustedAmount.toLocaleString()}</td>
                    <td className={`py-4 px-4 text-sm font-semibold text-right ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-800'
                    }`}>₹{(advance.amount - advance.adjustedAmount).toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        advance.status === 'Adjusted'
                          ? 'bg-blue-600/20 text-blue-600'
                          : advance.status === 'Paid'
                          ? 'bg-blue-500/20 text-blue-500'
                          : 'bg-blue-800/20 text-blue-800'
                      }`}>
                        {advance.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className={`p-1.5 rounded-lg transition-all ${
                          isDarkMode 
                            ? 'hover:bg-blue-500/20 text-blue-400' 
                            : 'hover:bg-blue-50 text-blue-600'
                        }`} onClick={() => handleView(advance)}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className={`p-1.5 rounded-lg transition-all ${
                          isDarkMode 
                            ? 'hover:bg-gray-600 text-gray-400' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`} onClick={() => handleEdit(advance)}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className={`p-1.5 rounded-lg transition-all ${
                          isDarkMode 
                            ? 'hover:bg-blue-700/20 text-blue-400' 
                            : 'hover:bg-blue-50 text-blue-700'
                        }`} onClick={() => handleDelete(advance)}>
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
          <div className={`flex items-center justify-between mt-6 pt-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Showing 1 to 5 of 28 advances</p>
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
              }`}>Next</button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* View Details Modal */}
      {viewModalOpen && recordToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div>
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Advance Details</h2>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Complete information about the advance</p>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Advance No.</label>
                  <p className={`text-base font-medium ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>{recordToView.id}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Advance Date</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{new Date(recordToView.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Staff Name</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{recordToView.staffName}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Staff ID</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{recordToView.staffId || 'N/A'}</p>
                </div>

                <div className="col-span-2">
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Purpose</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{recordToView.purpose}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Advance Amount (₹)</label>
                  <p className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>₹{recordToView.amount.toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Payment Mode</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{recordToView.paymentMode}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Repayment Type</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{recordToView.repaymentType || 'N/A'}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>No. of Installments</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{recordToView.installments || 'N/A'}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Adjusted Amount</label>
                  <p className={`text-xl font-bold ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>₹{recordToView.adjustedAmount.toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Balance Amount</label>
                  <p className={`text-xl font-bold ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-800'
                  }`}>₹{(recordToView.amount - recordToView.adjustedAmount).toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    recordToView.status === 'Adjusted'
                      ? 'bg-blue-600/20 text-blue-600'
                      : recordToView.status === 'Paid'
                      ? 'bg-blue-500/20 text-blue-500'
                      : 'bg-blue-800/20 text-blue-800'
                  }`}>
                    {recordToView.status}
                  </span>
                </div>

                {recordToView.remarks && (
                  <div className="col-span-2">
                    <label className={`text-sm font-semibold mb-1 block ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Remarks</label>
                    <p className={`text-base ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{recordToView.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-end gap-3 p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setViewModalOpen(false)}
                className={getSecondaryButtonClass(isDarkMode)}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Details Modal */}
      {editModalOpen && recordToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div>
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Edit Advance Details</h2>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Update information about the advance</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Advance No.</label>
                  <p className={`text-base font-medium ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>{recordToEdit.id}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Advance Date</label>
                  <input 
                    type="date" 
                    className={getInputClass(isDarkMode)}
                    value={formData.date}
                    onChange={handleInputChange}
                    name="date"
                  />
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Staff Name</label>
                  <select className={getInputClass(isDarkMode)}
                    value={formData.staffName}
                    onChange={handleInputChange}
                    name="staffName"
                  >
                    <option value="">Select Staff Member</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.name}>{s.name} - {s.designation}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Staff ID</label>
                  <input 
                    type="text" 
                    placeholder="Auto-filled"
                    className={getInputClass(isDarkMode)}
                    value={formData.staffId}
                    readOnly
                  />
                </div>

                <div className="col-span-2">
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Purpose</label>
                  <input 
                    type="text" 
                    placeholder="Reason for advance"
                    className={getInputClass(isDarkMode)}
                    value={formData.purpose}
                    onChange={handleInputChange}
                    name="purpose"
                  />
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Advance Amount (₹)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className={getInputClassWithValidation(isDarkMode, isFieldEmpty(formData.amount))}
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    name="amount"
                  />
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Payment Mode</label>
                  <select className={getInputClass(isDarkMode)}
                    value={formData.paymentMode}
                    onChange={handleInputChange}
                    name="paymentMode"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Repayment Type</label>
                  <select className={getInputClass(isDarkMode)}
                    value={formData.repaymentType}
                    onChange={handleInputChange}
                    name="repaymentType"
                  >
                    <option value="salary">Deduct from Salary</option>
                    <option value="lumpsum">Lumpsum Payment</option>
                    <option value="installment">Monthly Installments</option>
                  </select>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>No. of Installments</label>
                  <input 
                    type="number" 
                    placeholder="Monthly installments"
                    className={getInputClass(isDarkMode)}
                    min="1"
                    value={formData.installments}
                    onChange={handleInputChange}
                    name="installments"
                  />
                </div>

                <div className="col-span-2">
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Remarks</label>
                  <textarea 
                    rows={3}
                    placeholder="Additional notes..."
                    className={getTextareaClass(isDarkMode)}
                    value={formData.remarks}
                    onChange={handleInputChange}
                    name="remarks"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-end p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button className={getPrimaryButtonClass()} onClick={handleSaveEdit}>
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div>
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Delete Advance</h2>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Are you sure you want to delete this advance?</p>
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Advance No.</label>
                  <p className={`text-base font-medium ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>{recordToDelete.id}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Advance Date</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{new Date(recordToDelete.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Staff Name</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{recordToDelete.staffName}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Staff ID</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{recordToDelete.staffId || 'N/A'}</p>
                </div>

                <div className="col-span-2">
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Purpose</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{recordToDelete.purpose}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Advance Amount (₹)</label>
                  <p className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>₹{recordToDelete.amount.toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Payment Mode</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{recordToDelete.paymentMode}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Repayment Type</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{recordToDelete.repaymentType || 'N/A'}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>No. of Installments</label>
                  <p className={`text-base ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{recordToDelete.installments || 'N/A'}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Adjusted Amount</label>
                  <p className={`text-xl font-bold ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>₹{recordToDelete.adjustedAmount.toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Balance Amount</label>
                  <p className={`text-xl font-bold ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-800'
                  }`}>₹{(recordToDelete.amount - recordToDelete.adjustedAmount).toLocaleString('en-IN')}</p>
                </div>

                <div>
                  <label className={`text-sm font-semibold mb-1 block ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    recordToDelete.status === 'Adjusted'
                      ? 'bg-blue-600/20 text-blue-600'
                      : recordToDelete.status === 'Paid'
                      ? 'bg-blue-500/20 text-blue-500'
                      : 'bg-blue-800/20 text-blue-800'
                  }`}>
                    {recordToDelete.status}
                  </span>
                </div>

                {recordToDelete.remarks && (
                  <div className="col-span-2">
                    <label className={`text-sm font-semibold mb-1 block ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Remarks</label>
                    <p className={`text-base ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{recordToDelete.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-end p-6 border-t ${
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
                    ? 'bg-blue-700/20 text-blue-400 hover:bg-blue-700/30 border border-red-500/30'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-red-200'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}