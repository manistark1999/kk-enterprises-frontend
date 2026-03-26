import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Search,
  Trash2,
  X,
  Save,
  Truck,
  Edit2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  FORM_CONSTANTS,
  getCardClass,
  getInputClass,
  getTextareaClass,
  getLabelClass,
  getPrimaryButtonClass,
  getSecondaryButtonClass
} from '@/utils/formStyles';
import { useTransports, Transport } from '@/contexts/TransportContext';
import { useAuth } from '@/contexts/AuthContext';

interface TransportMasterScreenProps {
  isDarkMode: boolean;
}

export function TransportMasterScreen({ isDarkMode }: TransportMasterScreenProps) {
  const { 
    transports, 
    isLoading, 
    addTransport, 
    updateTransport, 
    deleteTransport,
    refreshTransports 
  } = useTransports();
  const { canCreate, canEdit, canDelete } = useAuth();

  const MODULE_NAME = 'Transport';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<Partial<Transport> | null>(null);
  const [isNewTransport, setIsNewTransport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    transportName: '',
    contactPerson: '',
    mobile: '',
    email: '',
    address: '',
    gst: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [errors, setErrors] = useState({
    transportName: false,
    contactPerson: false,
    mobile: false,
    address: false
  });

  const filteredTransports = transports.filter(transport =>
    (transport.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transport.contact_person || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transport.phone || '').includes(searchTerm)
  );

  const handleRowClick = (transport: Transport) => {
    setSelectedTransport(transport);
    setFormData({
      transportName: transport.name || '',
      contactPerson: transport.contact_person || '',
      mobile: transport.phone || '',
      email: transport.email || '',
      address: transport.address || '',
      gst: transport.gst_no || '',
      status: (transport.status as any) || 'Active'
    });
    setErrors({ transportName: false, contactPerson: false, mobile: false, address: false });
    setIsNewTransport(false);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      transportName: '',
      contactPerson: '',
      mobile: '',
      email: '',
      address: '',
      gst: '',
      status: 'Active'
    });
    setSelectedTransport(null);
    setIsNewTransport(true);
    setErrors({ transportName: false, contactPerson: false, mobile: false, address: false });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setSelectedTransport(null);
    setIsNewTransport(false);
    setErrors({ transportName: false, contactPerson: false, mobile: false, address: false });
  };

  const handleSave = async () => {
    const newErrors = {
      transportName: !formData.transportName.trim(),
      contactPerson: !formData.contactPerson.trim(),
      mobile: !formData.mobile.trim(),
      address: !formData.address.trim()
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.transportName,
        contact_person: formData.contactPerson,
        phone: formData.mobile,
        email: formData.email,
        address: formData.address,
        gst_no: formData.gst,
        status: formData.status
      };


      if (isNewTransport) {
        await addTransport(payload as any);
      } else if (selectedTransport?.id) {
        await updateTransport(selectedTransport.id, payload as any);
      }
      handleCloseModal();
      refreshTransports();
    } catch (error: any) {
      // Toast notification is already handled in TransportContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedTransport?.id) {
      if (window.confirm('Are you sure you want to delete this transport?')) {
        setIsSubmitting(true);
        try {
          await deleteTransport(selectedTransport.id);
          handleCloseModal();
          refreshTransports();
        } catch (error) {
          // Error handled in context
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (value.trim() && ['transportName', 'contactPerson', 'mobile', 'address'].includes(field)) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  return (
    <div className={`p-6 ${FORM_CONSTANTS.SECTION_SPACING}`}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Transport Master</h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Manage transport companies and logistics partners</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => refreshTransports()}
            className={getSecondaryButtonClass(isDarkMode)}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          {canCreate(MODULE_NAME) && (
            <button 
              onClick={handleAddNew}
              className={getPrimaryButtonClass()}
            >
              <Plus className="w-5 h-5" />
              <span>Add New Transport</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <motion.div
        className={getCardClass(isDarkMode)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={FORM_CONSTANTS.FORM_PADDING}>
          {/* Search Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Truck className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>All Transports</h2>
            </div>
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
                placeholder="Search transports..."
                className={`bg-transparent outline-none text-sm w-64 ${
                  isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-400'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr className={`border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>ID</th>
                  <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Name</th>
                  <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Contact Person</th>
                  <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Phone</th>
                  <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>GST No.</th>
                  <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-500 mb-2" />
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading from database...</p>
                    </td>
                  </tr>
                ) : filteredTransports.length > 0 ? (
                  filteredTransports.map((transport) => (
                    <tr 
                      key={transport.id}
                      onClick={() => handleRowClick(transport)}
                      className={`cursor-pointer transition-colors ${
                        isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-blue-50/50'
                      }`}
                    >
                      <td className={`py-4 px-4 text-sm font-medium ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>{transport.id}</td>
                      <td className={`py-4 px-4 text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{transport.name}</td>
                      <td className={`py-4 px-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{transport.contact_person}</td>
                      <td className={`py-4 px-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{transport.phone}</td>
                      <td className={`py-4 px-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{transport.gst_no || '-'}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          transport.status === 'Active'
                            ? 'bg-blue-600/20 text-blue-600'
                            : 'bg-blue-700/20 text-blue-700'
                        }`}>
                          {transport.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Truck className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No transports found in database</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            />
            <motion.div
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden z-50 ${
                isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
              } backdrop-blur-xl border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
              style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`px-6 py-5 border-b ${
                isDarkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-white/80'
              } backdrop-blur-xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${
                      isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <Truck className={`w-5 h-5 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {isNewTransport ? 'Add New Transport' : 'Edit Transport'}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
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

              <div className="px-6 py-6 max-h-[calc(100vh-280px)] overflow-y-auto">
                <div className={`${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.FIELD_GAP}`}>
                  <div className="lg:col-span-2">
                    <label className={getLabelClass(isDarkMode)}>
                      Transport Name <span className="text-blue-700">*</span>
                    </label>
                    <input 
                      type="text" 
                      className={`${getInputClass(isDarkMode)} ${errors.transportName ? '!border-red-500' : ''}`}
                      value={formData.transportName}
                      placeholder="Enter transport company name"
                      onChange={(e) => handleFormChange('transportName', e.target.value)}
                    />
                    {errors.transportName && (
                      <p className="text-blue-700 text-sm mt-1">Transport Name is required</p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className={getLabelClass(isDarkMode)}>
                      Contact Person <span className="text-blue-700">*</span>
                    </label>
                    <input 
                      type="text" 
                      className={`${getInputClass(isDarkMode)} ${errors.contactPerson ? '!border-red-500' : ''}`}
                      value={formData.contactPerson}
                      placeholder="Enter contact person name"
                      onChange={(e) => handleFormChange('contactPerson', e.target.value)}
                    />
                    {errors.contactPerson && (
                      <p className="text-blue-700 text-sm mt-1">Contact Person is required</p>
                    )}
                  </div>

                  <div>
                    <label className={getLabelClass(isDarkMode)}>
                      Mobile <span className="text-blue-700">*</span>
                    </label>
                    <input 
                      type="tel" 
                      className={`${getInputClass(isDarkMode)} ${errors.mobile ? '!border-red-500' : ''}`}
                      value={formData.mobile}
                      placeholder="Enter 10-digit mobile number"
                      onChange={(e) => handleFormChange('mobile', e.target.value)}
                    />
                    {errors.mobile && (
                      <p className="text-blue-700 text-sm mt-1">Mobile is required</p>
                    )}
                  </div>

                  <div>
                    <label className={getLabelClass(isDarkMode)}>Email</label>
                    <input 
                      type="email" 
                      className={getInputClass(isDarkMode)}
                      value={formData.email}
                      placeholder="Enter email address"
                      onChange={(e) => handleFormChange('email', e.target.value)}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className={getLabelClass(isDarkMode)}>
                      Address <span className="text-blue-700">*</span>
                    </label>
                    <textarea 
                      rows={3}
                      className={`${getTextareaClass(isDarkMode)} ${errors.address ? '!border-red-500' : ''}`}
                      value={formData.address}
                      placeholder="Enter complete address"
                      onChange={(e) => handleFormChange('address', e.target.value)}
                    />
                    {errors.address && (
                      <p className="text-blue-700 text-sm mt-1">Address is required</p>
                    )}
                  </div>

                  <div>
                    <label className={getLabelClass(isDarkMode)}>GST Number</label>
                    <input 
                      type="text" 
                      className={getInputClass(isDarkMode)}
                      value={formData.gst}
                      placeholder="Enter GST number"
                      onChange={(e) => handleFormChange('gst', e.target.value.toUpperCase())}
                    />
                  </div>

                  <div>
                    <label className={getLabelClass(isDarkMode)}>Status *</label>
                    <select 
                      className={getInputClass(isDarkMode)}
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={`px-6 py-4 border-t ${
                isDarkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-white/80'
              } backdrop-blur-xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!isNewTransport && canDelete(MODULE_NAME) && (
                      <button 
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                          isDarkMode 
                            ? 'bg-blue-700/20 text-blue-400 hover:bg-blue-700/30' 
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`} 
                        onClick={handleDelete}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Delete</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleCloseModal}
                      className={getSecondaryButtonClass(isDarkMode)}
                      disabled={isSubmitting}
                    >
                      <span>Cancel</span>
                    </button>

                    {(isNewTransport ? canCreate(MODULE_NAME) : canEdit(MODULE_NAME)) && (
                      <button 
                        onClick={handleSave}
                        className={`${getPrimaryButtonClass()} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{isSubmitting ? 'Saving...' : isNewTransport ? 'Add Transport' : 'Save Changes'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}