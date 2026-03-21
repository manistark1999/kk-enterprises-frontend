import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Save,
  Download,
  Printer,
  RefreshCw,
  Filter,
  Settings,
  TrendingUp,
  AlertTriangle,
  Box,
  Wrench
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
import { useItemsServices, ItemService } from '@/contexts/ItemsServicesContext';
import { useMasters } from '@/contexts/MastersContext';

interface ItemsServicesScreenProps {
  isDarkMode: boolean;
}

export function ItemsServicesScreen({ isDarkMode }: ItemsServicesScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemService | null>(null);
  const [filterType, setFilterType] = useState<'All' | 'Item' | 'Service'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');

  const [formData, setFormData] = useState({
    name: '',
    type: 'Item' as 'Item' | 'Service',
    category: '',
    workGroup: '',
    defaultRate: 0,
    gstPercentage: 18,
    unit: 'Piece',
    description: '',
    status: 'Active' as 'Active' | 'Inactive',
    hsnCode: '',
    brand: '',
    partNumber: '',
    purchasePrice: 0,
    currentStock: 0,
    minStockLevel: 0
  });

  const cardClass = getCardClass(isDarkMode);
  const inputClass = getInputClass(isDarkMode);
  const labelClass = getLabelClass(isDarkMode);
  const primaryButtonClass = getPrimaryButtonClass();
  const secondaryButtonClass = getSecondaryButtonClass(isDarkMode);

  const { 
    itemsServices, 
    addItemService, 
    updateItemService, 
    deleteItemService,
    getActiveItems,
    getActiveServices
  } = useItemsServices();
  
  const { workGroups } = useMasters();

  const handleOpenDrawer = (item?: ItemService) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        type: item.type,
        category: item.category || '',
        workGroup: item.workGroup || '',
        defaultRate: item.defaultRate,
        gstPercentage: item.gstPercentage,
        unit: item.unit,
        description: item.description || '',
        status: item.status,
        hsnCode: item.hsnCode || '',
        brand: item.brand || '',
        partNumber: item.partNumber || '',
        purchasePrice: item.purchasePrice || 0,
        currentStock: item.currentStock || 0,
        minStockLevel: item.minStockLevel || 0
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        type: 'Item',
        category: '',
        workGroup: '',
        defaultRate: 0,
        gstPercentage: 18,
        unit: 'Piece',
        description: '',
        status: 'Active',
        hsnCode: '',
        brand: '',
        partNumber: '',
        purchasePrice: 0,
        currentStock: 0,
        minStockLevel: 0
      });
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter item/service name');
      return;
    }

    if (formData.defaultRate <= 0) {
      toast.error('Rate must be greater than zero');
      return;
    }

    if (formData.gstPercentage < 0 || formData.gstPercentage > 100) {
      toast.error('GST percentage must be between 0 and 100');
      return;
    }

    // Work Group validation for Services
    if (formData.type === 'Service' && !formData.workGroup) {
      toast.error('Please select a Work Group for services');
      return;
    }

    // Check for duplicates
    const duplicate = itemsServices.find(
      item => item.name.toLowerCase() === formData.name.toLowerCase() && 
              item.id !== editingItem?.id
    );

    if (duplicate) {
      toast.error('An item/service with this name already exists');
      return;
    }

    try {
      if (editingItem) {
        await updateItemService(editingItem.id, {
          name: formData.name,
          type: formData.type,
          category: formData.category,
          workGroup: formData.workGroup,
          defaultRate: formData.defaultRate,
          purchasePrice: formData.purchasePrice,
          gstPercentage: formData.gstPercentage,
          unit: formData.unit,
          description: formData.description,
          status: formData.status,
          hsnCode: formData.hsnCode,
          brand: formData.brand,
          partNumber: formData.partNumber,
          currentStock: formData.currentStock,
          minStockLevel: formData.minStockLevel
        });
        toast.success('Item/Service updated successfully!');
      } else {
        await addItemService({
          name: formData.name,
          type: formData.type,
          category: formData.category,
          workGroup: formData.workGroup,
          defaultRate: formData.defaultRate,
          purchasePrice: formData.purchasePrice,
          gstPercentage: formData.gstPercentage,
          unit: formData.unit,
          description: formData.description,
          status: formData.status,
          hsnCode: formData.hsnCode,
          brand: formData.brand,
          partNumber: formData.partNumber,
          currentStock: formData.currentStock,
          minStockLevel: formData.minStockLevel
        });
        toast.success('Item/Service added successfully!');
      }
      handleCloseDrawer();
    } catch (error: any) {
      console.error('[Frontend] Save error:', error);
      toast.error(error.message || 'Failed to save item/service');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item/service?')) {
      deleteItemService(id);
      toast.success('Item/Service deleted successfully!');
    }
  };

  const handleExport = () => {
    const headers = ['Type', 'Name', 'Category', 'Work Group', 'Rate', 'GST %', 'Unit', 'Stock', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredItems.map(item => [
        item.type,
        `"${item.name}"`,
        `"${item.category || ''}"`,
        `"${item.workGroup || ''}"`,
        item.defaultRate,
        item.gstPercentage,
        item.unit,
        item.type === 'Item' ? (item.currentStock || 0) : 'N/A',
        item.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `items-services-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Data exported successfully!');
  };

  const filteredItems = itemsServices.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.workGroup || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalItems = itemsServices.filter(i => i.type === 'Item').length;
  const totalServices = itemsServices.filter(i => i.type === 'Service').length;
  const lowStockItems = itemsServices.filter(
    i => i.type === 'Item' && (i.currentStock || 0) < (i.minStockLevel || 0)
  ).length;
  const totalValue = itemsServices
    .filter(i => i.type === 'Item' && i.status === 'Active')
    .reduce((sum, item) => sum + (item.defaultRate * (item.currentStock || 0)), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Items & Services Master</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Manage workshop services and spare parts inventory</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
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
            onClick={() => window.print()}
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
            Add Item
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
                <Box className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Items</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{totalItems}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Spare parts in stock</p>
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
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
              }`}>
                <Wrench className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Services</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{totalServices}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Workshop services</p>
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
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Low Stock Alert</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{lowStockItems}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Items below minimum</p>
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
                isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
              }`}>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Stock Value</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>₹{totalValue.toLocaleString('en-IN')}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Current inventory value</p>
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
                  placeholder="Search by name, category, or work group..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10 w-full`}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className={inputClass}
              >
                <option value="All">All Types</option>
                <option value="Item">Items</option>
                <option value="Service">Services</option>
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
          </div>
        </div>
      </motion.div>

      {/* Items & Services Table */}
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
            }`}>Items & Services List</h2>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{filteredItems.length} results</span>
          </div>

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
                    }`}>Type</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Name</th>
                    <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Category</th>
                    <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Rate</th>
                    <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>GST %</th>
                    <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Stock</th>
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
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.type === 'Item'
                            ? isDarkMode
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-blue-50 text-blue-600'
                            : isDarkMode
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          {item.type === 'Item' ? <Box className="w-3 h-3 mr-1" /> : <Wrench className="w-3 h-3 mr-1" />}
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className={`text-sm font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{item.name}</p>
                          {item.brand && (
                            <p className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>{item.brand}</p>
                          )}
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{item.category || 'N/A'}</td>
                      <td className={`py-3 px-4 text-right text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>₹{item.defaultRate.toLocaleString('en-IN')}</td>
                      <td className={`py-3 px-4 text-center text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{item.gstPercentage}%</td>
                      <td className="py-3 px-4 text-center">
                        {item.type === 'Item' ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            (item.currentStock || 0) < (item.minStockLevel || 0)
                              ? isDarkMode
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-red-50 text-red-600'
                              : isDarkMode
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-green-50 text-green-600'
                          }`}>
                            {item.currentStock || 0}
                          </span>
                        ) : (
                          <span className={`text-xs ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Active'
                            ? isDarkMode
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-green-50 text-green-600'
                            : isDarkMode
                            ? 'bg-gray-500/20 text-gray-400'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenDrawer(item)}
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
                            onClick={() => handleDelete(item.id)}
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
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {editingItem ? 'Edit Item/Service' : 'Add Item/Service'}
                        </h2>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {editingItem ? 'Update details' : 'Create new entry'}
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
                  <div className="space-y-6">
                    {/* Type Selection */}
                    <div>
                      <label className={labelClass}>
                        Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: 'Item' })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.type === 'Item'
                              ? 'border-blue-500 bg-blue-500/10'
                              : isDarkMode
                              ? 'border-gray-700 hover:border-gray-600'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Box className={`w-6 h-6 mx-auto mb-2 ${
                            formData.type === 'Item' ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`} />
                          <p className={`text-sm font-medium ${
                            formData.type === 'Item'
                              ? 'text-blue-500'
                              : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>Item</p>
                          <p className={`text-xs mt-1 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>Spare parts</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: 'Service' })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.type === 'Service'
                              ? 'border-blue-500 bg-blue-500/10'
                              : isDarkMode
                              ? 'border-gray-700 hover:border-gray-600'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Wrench className={`w-6 h-6 mx-auto mb-2 ${
                            formData.type === 'Service' ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`} />
                          <p className={`text-sm font-medium ${
                            formData.type === 'Service'
                              ? 'text-blue-500'
                              : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>Service</p>
                          <p className={`text-xs mt-1 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>Workshop service</p>
                        </button>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className={labelClass}>
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={inputClass}
                          placeholder={formData.type === 'Item' ? 'e.g., Engine Oil 5W-30' : 'e.g., Wheel Alignment'}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Category</label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className={inputClass}
                          placeholder={formData.type === 'Item' ? 'e.g., Lubricants' : 'e.g., Maintenance'}
                        />
                      </div>

                      {formData.type === 'Item' && (
                        <div>
                          <label className={labelClass}>Part Number</label>
                          <input
                            type="text"
                            value={formData.partNumber}
                            onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                            className={inputClass}
                            placeholder="e.g., PN-12345"
                          />
                        </div>
                      )}

                      {/* Work Group - Only show for Services */}
                      {formData.type === 'Service' && (
                        <div>
                          <label className={labelClass}>
                            Work Group <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.workGroup}
                            onChange={(e) => setFormData({ ...formData, workGroup: e.target.value })}
                            className={inputClass}
                          >
                            <option value="" disabled>
                              {workGroups.filter(wg => wg.status === 'Active').length > 0 
                                ? 'Select Work Group' 
                                : 'No Work Groups Available'}
                            </option>
                            {workGroups.filter(wg => wg.status === 'Active').map(wg => (
                              <option key={wg.id} value={wg.name}>{wg.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className={labelClass}>
                          Selling Rate (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.defaultRate}
                          onChange={(e) => setFormData({ ...formData, defaultRate: parseFloat(e.target.value) || 0 })}
                          className={inputClass}
                          placeholder="0.00"
                        />
                      </div>

                      {formData.type === 'Item' && (
                        <div>
                          <label className={labelClass}>Purchase Rate (₹)</label>
                          <input
                            type="number"
                            value={formData.purchasePrice}
                            onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                            className={inputClass}
                            placeholder="0.00"
                          />
                        </div>
                      )}

                      <div>
                        <label className={labelClass}>
                          GST % <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.gstPercentage}
                          onChange={(e) => setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) })}
                          className={inputClass}
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Unit <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          className={inputClass}
                        >
                          <option value="Piece">Piece</option>
                          <option value="Litre">Litre</option>
                          <option value="Kilogram">Kilogram</option>
                          <option value="Box">Box</option>
                          <option value="Set">Set</option>
                          <option value="Service">Service</option>
                          <option value="Meter">Meter</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className={inputClass}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* Item-Specific Fields */}
                    {formData.type === 'Item' && (
                      <>
                        <div className={`border-t pt-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <h3 className={`text-sm font-bold mb-4 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>Item Details</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>HSN Code</label>
                              <input
                                type="text"
                                value={formData.hsnCode}
                                onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                                className={inputClass}
                                placeholder="e.g., 27101980"
                              />
                            </div>

                            <div>
                              <label className={labelClass}>Brand</label>
                              <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                className={inputClass}
                                placeholder="e.g., Castrol"
                              />
                            </div>

                            <div>
                              <label className={labelClass}>Current Stock</label>
                              <input
                                type="number"
                                value={formData.currentStock}
                                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                                className={inputClass}
                                placeholder="0"
                              />
                            </div>

                            <div>
                              <label className={labelClass}>Min Stock Level</label>
                              <input
                                type="number"
                                value={formData.minStockLevel}
                                onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                                className={inputClass}
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Description */}
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={inputClass}
                        rows={3}
                        placeholder="Enter description..."
                      />
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
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className={primaryButtonClass}
                    >
                      <Save className="w-4 h-4" />
                      {editingItem ? 'Update' : 'Save'}
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