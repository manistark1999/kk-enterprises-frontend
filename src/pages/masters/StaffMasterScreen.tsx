import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Users,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  FORM_CONSTANTS,
  getCardClass,
  getInputClassWithValidation,
  getLabelClass,
  renderLabel,
  getPrimaryButtonClass,
  getSecondaryButtonClass,
  isFieldEmpty
} from '@/utils/formStyles';
import { useStaff, Staff } from '@/contexts/StaffContext';
import { useAuth } from '@/contexts/AuthContext';

interface StaffMasterScreenProps {
  isDarkMode: boolean;
}

export function StaffMasterScreen({ isDarkMode }: StaffMasterScreenProps) {
  const { canCreate, canEdit, canDelete } = useAuth();
  const { staff, isLoading, addStaff, updateStaff, deleteStaff, refreshStaff } = useStaff();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Partial<Staff> | null>(null);
  const [isNewStaff, setIsNewStaff] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({ name: false, designation: false, mobile: false, joiningDate: false });

  const handleRowClick = (s: Staff) => {
    setSelectedStaff({ ...s });
    setIsNewStaff(false);
    setErrors({ name: false, designation: false, mobile: false, joiningDate: false });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedStaff({
      name: '',
      designation: '',
      mobile: '',
      email: '',
      address: '',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 0,
      bankAccount: '',
      ifscCode: '',
      status: 'Active'
    });
    setIsNewStaff(true);
    setErrors({ name: false, designation: false, mobile: false, joiningDate: false });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
    setIsNewStaff(false);
    setErrors({ name: false, designation: false, mobile: false, joiningDate: false });
  };

  const handleSave = async () => {
    const newErrors = {
      name: !selectedStaff?.name?.trim(),
      designation: !selectedStaff?.designation?.trim(),
      mobile: !selectedStaff?.mobile?.trim(),
      joiningDate: !selectedStaff?.joiningDate?.trim()
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      
      if (isNewStaff) {
        await addStaff(selectedStaff as Staff);
        toast.success('Staff member added successfully!');
      } else if (selectedStaff && selectedStaff.id) {
        await updateStaff(selectedStaff.id, selectedStaff as Staff);
        toast.success('Staff member updated successfully!');
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save staff data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedStaff && selectedStaff.id) {
      if (window.confirm('Are you sure you want to delete this staff member?')) {
        try {
          await deleteStaff(selectedStaff.id);
          toast.success('Staff member deleted successfully!');
          handleCloseModal();
        } catch (error: any) {
          toast.error(error.message || 'Failed to delete staff');
        }
      }
    }
  };

  const handleFormChange = (field: keyof Staff, value: any) => {
    if (selectedStaff) {
      setSelectedStaff({ ...selectedStaff, [field]: value });
      // Clear error for this field
      if (value && String(value).trim()) {
        setErrors(prev => ({ ...prev, [field]: false }));
      }
    }
  };

  const filteredStaff = staff.filter(s => 
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.designation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.mobile || '').includes(searchTerm)
  );

  const cardClass = getCardClass(isDarkMode);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Staff Master</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage employees and technicians</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => refreshStaff()}
            className={getSecondaryButtonClass(isDarkMode)}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {canCreate('Staff') && (
            <button 
              onClick={handleAddNew}
              className={getPrimaryButtonClass()}
            >
              <Plus className="w-5 h-5" />
              <span>Add New Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Employee Records</h2>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'
            }`}>
              <Search className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none text-sm w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>ID</th>
                  <th className={`text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</th>
                  <th className={`text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Designation</th>
                  <th className={`text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mobile</th>
                  <th className={`text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Joining Date</th>
                  <th className={`text-right py-4 px-6 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Salary</th>
                  <th className={`text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                </tr>
              </thead>
              <tbody className={isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Fetching staff data...</p>
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-20" />
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No staff records found</p>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((s) => (
                    <tr 
                      key={s.id}
                      onClick={() => handleRowClick(s)}
                      className={`cursor-pointer transition-colors ${
                        isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-blue-50'
                      }`}
                    >
                      <td className="py-4 px-6 font-medium text-blue-500">#{s.id}</td>
                      <td className={`py-4 px-6 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{s.name}</td>
                      <td className={`py-4 px-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{s.designation}</td>
                      <td className={`py-4 px-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{s.mobile}</td>
                      <td className={`py-4 px-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{s.joiningDate}</td>
                      <td className={`py-4 px-6 text-right font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{s.salary.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          s.status === 'Active' ? 'bg-blue-600/20 text-blue-600' : 'bg-blue-700/20 text-blue-700'
                        }`}>{s.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && selectedStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600/20 text-blue-500">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {isNewStaff ? 'Add New Staff' : 'Edit Staff Member'}
                  </h2>
                </div>
                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    {renderLabel('Full Name', true, isDarkMode, errors.name)}
                    <input 
                      type="text" 
                      className={getInputClassWithValidation(isDarkMode, errors.name)}
                      value={selectedStaff.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="Enter staff member's full name"
                    />
                    {errors.name && (
                      <p className="text-blue-700 text-sm mt-1">Staff Name is required</p>
                    )}
                  </div>
                  
                  <div>
                    {renderLabel('Designation', true, isDarkMode, errors.designation)}
                    <select 
                      className={getInputClassWithValidation(isDarkMode, errors.designation)}
                      value={selectedStaff.designation}
                      onChange={(e) => handleFormChange('designation', e.target.value)}
                    >
                      <option value="">Select Designation</option>
                      <option value="Senior Mechanic">Senior Mechanic</option>
                      <option value="Mechanic">Mechanic</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Helper">Helper</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Workshop Manager">Workshop Manager</option>
                    </select>
                    {errors.designation && (
                      <p className="text-blue-700 text-sm mt-1">Designation is required</p>
                    )}
                  </div>

                  <div>
                    {renderLabel('Mobile Number', true, isDarkMode, errors.mobile)}
                    <input 
                      type="tel" 
                      className={getInputClassWithValidation(isDarkMode, errors.mobile)}
                      value={selectedStaff.mobile}
                      onChange={(e) => handleFormChange('mobile', e.target.value)}
                      placeholder="10-digit mobile number"
                    />
                    {errors.mobile && (
                      <p className="text-blue-700 text-sm mt-1">Mobile Number is required</p>
                    )}
                  </div>

                  <div>
                    {renderLabel('Email Address', false, isDarkMode)}
                    <input 
                      type="email" 
                      className={getInputClassWithValidation(isDarkMode, false)}
                      value={selectedStaff.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className={getLabelClass(isDarkMode)}>Monthly Salary (₹) *</label>
                    <input 
                      type="number" 
                      className={getInputClassWithValidation(isDarkMode, false)}
                      value={selectedStaff.salary}
                      onChange={(e) => handleFormChange('salary', Number(e.target.value))}
                      placeholder="Enter salary amount"
                    />
                  </div>

                  <div>
                    {renderLabel('Date of Joining', true, isDarkMode, errors.joiningDate)}
                    <input 
                      type="date" 
                      className={getInputClassWithValidation(isDarkMode, errors.joiningDate)}
                      value={selectedStaff.joiningDate}
                      onChange={(e) => handleFormChange('joiningDate', e.target.value)}
                    />
                    {errors.joiningDate && (
                      <p className="text-blue-700 text-sm mt-1">Date of Joining is required</p>
                    )}
                  </div>

                  <div>
                    <label className={getLabelClass(isDarkMode)}>Status *</label>
                    <select 
                      className={getInputClassWithValidation(isDarkMode, false)}
                      value={selectedStaff.status}
                      onChange={(e) => handleFormChange('status', e.target.value as 'Active' | 'Inactive')}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className={getLabelClass(isDarkMode)}>Bank Account No.</label>
                    <input 
                      type="text" 
                      className={getInputClassWithValidation(isDarkMode, false)}
                      value={selectedStaff.bankAccount || ''}
                      onChange={(e) => handleFormChange('bankAccount', e.target.value)}
                      placeholder="Enter account number"
                    />
                  </div>
                  
                  <div>
                    <label className={getLabelClass(isDarkMode)}>IFSC Code</label>
                    <input 
                      type="text" 
                      className={getInputClassWithValidation(isDarkMode, false)}
                      value={selectedStaff.ifscCode || ''}
                      onChange={(e) => handleFormChange('ifscCode', e.target.value)}
                      placeholder="BANK0123456"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={getLabelClass(isDarkMode)}>Address</label>
                    <textarea 
                      className={getInputClassWithValidation(isDarkMode, false)}
                      value={selectedStaff.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      placeholder="Complete residential address"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 flex items-center justify-between">
                {!isNewStaff && canDelete('Staff') ? (
                  <button 
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700/10 text-blue-700 hover:bg-blue-700/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Record</span>
                  </button>
                ) : <div />}
                
                <div className="flex gap-3">
                  <button onClick={handleCloseModal} className={getSecondaryButtonClass(isDarkMode)}>Cancel</button>
                  {(isNewStaff ? canCreate('Staff') : canEdit('Staff')) && (
                    <button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className={`${getPrimaryButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSaving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          <span>{isNewStaff ? 'Create Staff' : 'Save Changes'}</span>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}