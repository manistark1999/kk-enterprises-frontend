import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  TrendingUp,
  BarChart3,
  DollarSign,
  AlertCircle,
  Download,
  Printer,
  RefreshCw,
  Grid3x3,
  List,
  Filter,
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  Package,
  Star,
  Save
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
import { useMasters, Supplier } from '@/contexts/MastersContext';

interface SupplierScreenProps {
  isDarkMode: boolean;
}

export function SupplierScreen({ isDarkMode }: SupplierScreenProps) {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useMasters();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    gst: '',
    category: 'Parts & Spares',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [errors, setErrors] = useState({
    name: false,
    contactPerson: false,
    phone: false,
    address: false
  });

  const cardClass = getCardClass(isDarkMode);
  const inputClass = getInputClass(isDarkMode);
  const labelClass = getLabelClass(isDarkMode);
  const primaryButtonClass = getPrimaryButtonClass();
  const secondaryButtonClass = getSecondaryButtonClass(isDarkMode);

  const categories = ['Parts & Spares', 'Oils & Lubricants', 'Tyres & Wheels', 'Electrical', 'Body Parts', 'Tools & Equipment', 'Chemicals', 'General'];

  const handleOpenDrawer = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        gst: supplier.gst,
        category: supplier.category,
        status: (supplier.status as any) || 'Active'
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        gst: '',
        category: 'Parts & Spares',
        status: 'Active'
      });
    }
    setErrors({ name: false, contactPerson: false, phone: false, address: false });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      gst: '',
      category: 'Parts & Spares',
      status: 'Active'
    });
    setErrors({ name: false, contactPerson: false, phone: false, address: false });
  };

  const handleSave = async () => {
    const newErrors = {
      name: !formData.name.trim(),
      contactPerson: !formData.contactPerson.trim(),
      phone: !formData.phone.trim(),
      address: !formData.address.trim()
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const payload = {
        ...formData,
        id: editingSupplier?.id || '',
        createdAt: editingSupplier?.createdAt || ''
      };

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, payload);
        toast.success('Supplier updated successfully!');
      } else {
        await addSupplier(payload);
        toast.success('Supplier added successfully!');
      }
      handleCloseDrawer();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save supplier');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
        toast.success('Supplier deleted successfully!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete supplier');
      }
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'All' || supplier.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || supplier.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalSuppliers = suppliers.length;
  const totalOrders = 0; // Not in DB yet
  const totalOutstanding = 0; // Not in DB yet
  const activeSuppliers = suppliers.filter(s => s.status === 'Active').length;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Parts & Spares': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'Oils & Lubricants': isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600',
      'Tyres & Wheels': isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600',
      'Electrical': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'Body Parts': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'Tools & Equipment': isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600',
      'Chemicals': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'General': isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-50 text-gray-600'
    };
    return colors[category] || colors['General'];
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Convert suppliers data to CSV format
    const headers = ['Supplier Name', 'Contact Person', 'Phone', 'Email', 'Address', 'GST', 'Category', 'Total Orders', 'Total Amount', 'Outstanding', 'Rating', 'Status', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...filteredSuppliers.map(supplier => [
        `"${supplier.name}"`,
        `"${supplier.contactPerson}"`,
        `"${supplier.phone}"`,
        `"${supplier.email}"`,
        `"${supplier.address.replace(/"/g, '""')}"`,
        `"${supplier.gst}"`,
        `"${supplier.category}"`,
        0,
        0,
        0,
        0,
        supplier.status,
        supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `suppliers-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Suppliers data exported successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
          }`}>
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Supplier Dashboard</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Manage suppliers and vendor relationships</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handlePrint}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleExport}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => handleOpenDrawer()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
              }`}>
                <Truck className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Suppliers</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{totalSuppliers}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>{activeSuppliers} active vendors</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
              }`}>
                <ShoppingCart className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +18%
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Orders</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{totalOrders}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Across all suppliers</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50'
              }`}>
                <DollarSign className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Outstanding</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>₹{(totalOutstanding / 1000).toFixed(0)}K</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Pending payments</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
              }`}>
                <Star className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Avg. Rating</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>4.6</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Supplier performance</p>
          </div>
        </motion.div>
      </div>

      {/* Search & Filter Bar */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search by supplier name, contact, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10 w-full`}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={inputClass}
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={inputClass}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Suppliers List */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Suppliers</h2>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{filteredSuppliers.length} results</span>
          </div>

          {viewMode === 'table' ? (
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
                      }`}>Supplier</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Contact</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Category</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Orders</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Outstanding</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Rating</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
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
                    {filteredSuppliers.map((supplier) => (
                      <tr
                        key={supplier.id}
                        className={`transition-colors ${
                          isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
                            }`}>
                              <Truck className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{supplier.name}</p>
                              <p className={`text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>GST: {supplier.gst}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className={`text-sm font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{supplier.contactPerson}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3 text-gray-500" />
                              <p className={`text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>{supplier.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            getCategoryColor(supplier.category)
                          }`}>
                            {supplier.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-16 h-8 rounded-lg font-bold text-sm ${
                            isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                          }`}>
                            0
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right text-sm font-semibold ${
                          isDarkMode ? 'text-orange-400' : 'text-orange-600'
                        }`}>₹0K</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className={`font-bold text-sm ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>0</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            supplier.status === 'Active'
                              ? isDarkMode
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-green-50 text-green-600'
                              : isDarkMode
                              ? 'bg-gray-500/20 text-gray-400'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {supplier.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenDrawer(supplier)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode
                                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              }`}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(supplier.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100'
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuppliers.map((supplier) => (
                <motion.div
                  key={supplier.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isDarkMode
                      ? 'bg-gray-700/30 border-gray-600 hover:border-blue-500'
                      : 'bg-white border-gray-200 hover:border-blue-500'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
                    }`}>
                      <Truck className="w-6 h-6 text-blue-500" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      supplier.status === 'Active'
                        ? isDarkMode
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-green-50 text-green-600'
                        : isDarkMode
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {supplier.status}
                    </span>
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{supplier.name}</h3>
                  <p className={`text-sm mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{supplier.contactPerson}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{supplier.phone}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-4 ${
                    getCategoryColor(supplier.category)
                  }`}>
                    {supplier.category}
                  </span>
                  <div className={`flex items-center justify-between pt-4 border-t ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>Orders: 0</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <p className={`text-sm font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>0</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>Outstanding</p>
                      <p className={`text-lg font-bold ${
                        isDarkMode ? 'text-orange-400' : 'text-orange-600'
                      }`}>₹0K</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleOpenDrawer(supplier)}
                      className={`flex-1 p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <Edit2 className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className={`flex-1 p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit/Add Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
            >
              {/* Modal */}
              <motion.div
                className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
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
                        <Truck className={`w-5 h-5 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                        </h2>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {editingSupplier ? 'Update supplier information' : 'Enter new supplier details'}
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

                {/* Modal Body with Form */}
                <div className="px-6 py-6 max-h-[calc(100vh-280px)] overflow-y-auto">
                  <div className={`${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.FIELD_GAP}`}>
                    <div className="lg:col-span-2">
                      <label className={labelClass}>
                        Supplier Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (e.target.value.trim()) setErrors(prev => ({ ...prev, name: false }));
                        }}
                        className={`${inputClass} ${errors.name ? '!border-red-500' : ''}`}
                        placeholder="e.g., AutoParts India Pvt Ltd"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">Supplier Name is required</p>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <label className={labelClass}>
                        Contact Person <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => {
                          setFormData({ ...formData, contactPerson: e.target.value });
                          if (e.target.value.trim()) setErrors(prev => ({ ...prev, contactPerson: false }));
                        }}
                        className={`${inputClass} ${errors.contactPerson ? '!border-red-500' : ''}`}
                        placeholder="e.g., Rajesh Kumar"
                      />
                      {errors.contactPerson && (
                        <p className="text-red-500 text-sm mt-1">Contact Person is required</p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (e.target.value.trim()) setErrors(prev => ({ ...prev, phone: false }));
                        }}
                        className={`${inputClass} ${errors.phone ? '!border-red-500' : ''}`}
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">Phone is required</p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>GST No *</label>
                      <input
                        type="text"
                        value={formData.gst}
                        onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                        className={inputClass}
                        placeholder="07AABCU9603R1ZV"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className={labelClass}>
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => {
                          setFormData({ ...formData, address: e.target.value });
                          if (e.target.value.trim()) setErrors(prev => ({ ...prev, address: false }));
                        }}
                        className={`${inputClass} min-h-[80px] resize-none ${errors.address ? '!border-red-500' : ''}`}
                        rows={3}
                        placeholder="Full address"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">Address is required</p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={inputClass}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Status *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                        className={inputClass}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className={`px-6 py-4 border-t ${
                  isDarkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-white/80'
                } backdrop-blur-xl`}>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={handleCloseDrawer}
                      className={secondaryButtonClass}
                    >
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className={primaryButtonClass}
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingSupplier ? 'Update Supplier' : 'Add Supplier'}</span>
                    </button>
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