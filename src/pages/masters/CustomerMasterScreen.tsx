import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Download,
  Printer,
  Phone,
  Mail,
  MapPin,
  Car,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  FORM_CONSTANTS,
  getCardClass,
  getInputClass,
  getInputClassWithValidation,
  getLabelClass,
  renderLabel,
  getPrimaryButtonClass,
  getSecondaryButtonClass,
  isFieldEmpty
} from '@/utils/formStyles';
import { useCustomers, Customer } from '@/contexts/CustomerContext';
import { UnifiedPrintPreview } from '@/components/print/UnifiedPrintPreview';

interface CustomerMasterScreenProps {
  isDarkMode: boolean;
}

export function CustomerMasterScreen({ isDarkMode }: CustomerMasterScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [customerToView, setCustomerToView] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    isActive: true
  });

  const { 
    customers, 
    summary, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    isLoading,
    refreshCustomers 
  } = useCustomers();

  const cardClass = getCardClass(isDarkMode);
  const inputClass = getInputClass(isDarkMode);
  const labelClass = getLabelClass(isDarkMode);
  const primaryButtonClass = getPrimaryButtonClass();
  const secondaryButtonClass = getSecondaryButtonClass(isDarkMode);

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone || '').includes(searchTerm) ||
      (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'All' || 
      (filterStatus === 'Active' && customer.isActive) ||
      (filterStatus === 'Inactive' && !customer.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Open drawer for adding new customer
  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      gstNumber: '',
      isActive: true
    });
    setIsDrawerOpen(true);
  };

  // Open drawer for editing customer
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      gstNumber: customer.gstNumber,
      isActive: customer.isActive
    });
    setIsDrawerOpen(true);
  };

  // Delete customer
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete customer "${name}"?`)) {
      try {
        await deleteCustomer(id);
        toast.success('Customer deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete customer');
      }
    }
  };

  // Save customer
  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter phone number');
      return;
    }
    if (formData.phone.length < 10) {
      toast.error('Phone number must be at least 10 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Saving customer with payload:', formData);
      if (editingCustomer) {
        // Update existing customer
        await updateCustomer(editingCustomer.id, formData);
      } else {
        // Add new customer
        await addCustomer({
          ...formData,
          vehicleDetails: []
        });
      }
      setIsDrawerOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print function
  const handlePrint = (customer: Customer) => {
    setPrintData(customer);
    setIsPrintModalOpen(true);
    toast.success('Opening print preview...');
  };

  // Close drawer
  const handleCloseDrawer = () => {
    if (isSubmitting) return;
    setIsDrawerOpen(false);
    setEditingCustomer(null);
  };
  const handlePrintAll = () => {
    // Format list for ReportPrintView
    const formattedData = {
      reportNo: `CUST-${new Date().getTime().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-IN'),
      headers: ['ID', 'Name', 'Phone', 'City', 'GST', 'Status'],
      keys: ['id', 'name', 'phone', 'city', 'gstNumber', 'status_label'],
      items: filteredCustomers.map(c => ({
        ...c,
        status_label: c.isActive ? 'Active' : 'Inactive'
      })),
      metaDetails: [
        { label: 'Total Customers', value: summary.total.toString() },
        { label: 'Active', value: summary.active.toString() },
        { label: 'Inactive', value: summary.inactive.toString() }
      ],
      summary: {
        totals: [
          { label: 'Customers Displayed', value: filteredCustomers.length.toString(), isTotal: true }
        ]
      }
    };
    
    setPrintData(formattedData);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Customer Master</h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Manage customer information and vehicle details</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => refreshCustomers()}
            className={secondaryButtonClass}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleAddNew}
            className={`${primaryButtonClass} flex items-center gap-2`}
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
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
                  Total Customers
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{summary.total}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Users className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
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
                  Active
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>{summary.active}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <Users className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
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
                  Inactive
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`}>{summary.inactive}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-orange-500/20' : 'bg-orange-100'
              }`}>
                <Users className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
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
                  Total Vehicles
                </p>
                <p className={`text-2xl font-bold mt-1 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>{summary.totalVehicles}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Car className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
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
                placeholder="Search by name, phone, email, or city..."
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button className={secondaryButtonClass}>
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
              <button 
                onClick={handlePrintAll}
                className={secondaryButtonClass}
              >
                <Printer className="w-4 h-4" />
                <span className="hidden md:inline">Print List</span>
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
                    }`}>ID</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Name</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Contact</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Location</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>GST Number</th>
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-500 mb-2" />
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading customers from database...</p>
                      </td>
                    </tr>
                  ) : filteredCustomers.map((customer, index) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`py-3 px-4 text-sm font-medium ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>{customer.id}</td>
                      <td className={`py-3 px-4 text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{customer.name}</td>
                      <td className={`py-3 px-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phone}</span>
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />
                              <span>{customer.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5" />
                          <div>
                            <div>{customer.city || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{customer.state || 'N/A'} - {customer.pincode || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {customer.gstNumber ? (
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            <span>{customer.gstNumber}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          customer.isActive
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handlePrint(customer)}
                            className={`p-1.5 rounded-lg transition-all ${
                              isDarkMode 
                                ? 'hover:bg-green-500/20 text-green-400' 
                                : 'hover:bg-green-50 text-green-600'
                            }`}
                            title="View/Print"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(customer)}
                            className={`p-1.5 rounded-lg transition-all ${
                              isDarkMode 
                                ? 'hover:bg-blue-500/20 text-blue-400' 
                                : 'hover:bg-blue-50 text-blue-600'
                            }`}
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(customer.id, customer.name)}
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {!isLoading && filteredCustomers.length === 0 && (
                <div className="py-12 text-center">
                  <Users className={`w-12 h-12 mx-auto mb-3 ${
                    isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>No customers found in database</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
            />
            <motion.div
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden z-50 ${
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
              <div className={`px-6 py-5 border-b ${
                isDarkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-white/80'
              } backdrop-blur-xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${
                      isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <Users className={`w-5 h-5 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                      </h2>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {editingCustomer ? 'Update customer information' : 'Enter customer details'}
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

              <div className="px-6 py-6 max-h-[calc(90vh-180px)] overflow-y-auto">
                <div className="mb-6">
                  <h3 className={`text-sm font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Basic Information</h3>
                  
                  <div className={`${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.FIELD_GAP}`}>
                    <div>
                      {renderLabel('Customer Name', true, isDarkMode, isFieldEmpty(formData.name))}
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={getInputClassWithValidation(isDarkMode, isFieldEmpty(formData.name))}
                        placeholder="Enter customer name"
                      />
                    </div>

                    <div>
                      {renderLabel('Phone Number', true, isDarkMode, isFieldEmpty(formData.phone))}
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={getInputClassWithValidation(isDarkMode, isFieldEmpty(formData.phone))}
                        placeholder="10-digit phone number"
                        maxLength={15}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className={labelClass}>Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                        placeholder="customer@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className={`text-sm font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Address Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Street Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={inputClass}
                        placeholder="Enter complete address"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className={inputClass}
                          placeholder="City"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>State</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className={inputClass}
                          placeholder="State"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Pincode</label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          className={inputClass}
                          placeholder="Pincode"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className={`text-sm font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Business Information (Optional)</h3>
                  
                  <div>
                    <label className={labelClass}>GST Number</label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                      className={inputClass}
                      placeholder="15-character GST number"
                      maxLength={15}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Active Customer</span>
                  </label>
                </div>
              </div>

              <div className={`px-6 py-4 border-t ${
                isDarkMode 
                  ? 'bg-gray-800/80 border-gray-700' 
                  : 'bg-white/80 border-gray-200'
              } backdrop-blur-xl`}>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={handleCloseDrawer}
                    className={secondaryButtonClass}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className={primaryButtonClass}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSubmitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <UnifiedPrintPreview
        type={printData?.items ? "report" : "customer"}
        title={printData?.items ? "CUSTOMER LIST REPORT" : "CUSTOMER PROFILE"}
        data={printData}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}