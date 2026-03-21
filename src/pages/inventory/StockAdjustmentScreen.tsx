import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save,
  X,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileText,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useStock, type StockAdjustment } from '@/contexts/StockContext';

interface StockAdjustmentScreenProps {
  isDarkMode: boolean;
}

export function StockAdjustmentScreen({ isDarkMode }: StockAdjustmentScreenProps) {
  const { stockItems, adjustments, adjustStock, updateAdjustment, deleteAdjustment } = useStock();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    itemId: '',
    adjustmentType: 'Add' as 'Add' | 'Remove',
    quantity: '',
    reason: '',
    remarks: '',
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingAdjustment, setViewingAdjustment] = useState<StockAdjustment | null>(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!formData.date) newErrors.date = true;
    if (!formData.itemId) newErrors.itemId = true;
    if (!formData.quantity || Number(formData.quantity) <= 0) newErrors.quantity = true;
    if (!formData.reason.trim()) newErrors.reason = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedItem = stockItems.find(item => item.id === formData.itemId);
    if (!selectedItem) {
      toast.error('Selected item not found');
      return;
    }

    try {
      if (editingId) {
        await updateAdjustment(editingId, {
          adjustmentNo: adjustments.find(adj => adj.id === editingId)?.adjustmentNo || '',
          date: formData.date,
          itemId: formData.itemId,
          itemCode: selectedItem.itemCode,
          itemName: selectedItem.itemName,
          adjustmentType: formData.adjustmentType,
          quantity: Number(formData.quantity),
          previousStock: selectedItem.currentStock,
          newStock:
            formData.adjustmentType === 'Add'
              ? selectedItem.currentStock + Number(formData.quantity)
              : selectedItem.currentStock - Number(formData.quantity),
          reason: formData.reason,
          remarks: formData.remarks || '',
          createdAt: new Date().toISOString(),
        });
        toast.success('Stock adjustment updated successfully');
      } else {
        await adjustStock(
          formData.itemId,
          formData.adjustmentType,
          Number(formData.quantity),
          formData.reason,
          formData.remarks || '',
          formData.date
        );
        toast.success('Stock adjustment created successfully');
      }

      handleReset();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save stock adjustment');
    }
  };

  const handleReset = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      itemId: '',
      adjustmentType: 'Add',
      quantity: '',
      reason: '',
      remarks: '',
    });
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (adjustment: StockAdjustment) => {
    setFormData({
      date: adjustment.date,
      itemId: adjustment.itemId,
      adjustmentType: adjustment.adjustmentType,
      quantity: adjustment.quantity.toString(),
      reason: adjustment.reason,
      remarks: adjustment.remarks || '',
    });
    setEditingId(adjustment.id);
    setIsFormCollapsed(false);
    toast.info('Edit mode activated');
  };

  const handleDelete = async (adjustment: StockAdjustment) => {
    if (window.confirm('Are you sure you want to delete this adjustment? The stock will be reverted.')) {
      try {
        await deleteAdjustment(adjustment.id);
        toast.success('Adjustment deleted and stock reverted');
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete adjustment');
      }
    }
  };

  const handleView = (adjustment: StockAdjustment) => {
    setViewingAdjustment(adjustment);
  };

  const selectedItem = stockItems.find(item => item.id === formData.itemId);

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Stock Adjustment
            </h1>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage stock additions and removals
            </p>
          </div>
          
          <button
            onClick={() => setIsFormCollapsed(!isFormCollapsed)}
            className={`px-4 py-2 rounded-lg transition-all ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isFormCollapsed ? 'Show Form' : 'Hide Form'}
          </button>
        </div>
      </motion.div>

      {/* Form Card - Collapsible */}
      {!isFormCollapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`rounded-xl border backdrop-blur-sm p-6 mb-6 ${
            isDarkMode
              ? 'bg-gray-800/50 border-gray-700/50'
              : 'bg-white/50 border-gray-200/50'
          }`}
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date {errors.date && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    setErrors({ ...errors, date: false });
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                    errors.date
                      ? 'border-red-500'
                      : isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {/* Item Selection */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select Item {errors.itemId && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={formData.itemId}
                  onChange={(e) => {
                    setFormData({ ...formData, itemId: e.target.value });
                    setErrors({ ...errors, itemId: false });
                  }}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                    errors.itemId
                      ? 'border-red-500'
                      : isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">-- Select Item --</option>
                  {stockItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.itemCode} - {item.itemName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Stock (Read-only) */}
              {selectedItem && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Current Stock
                  </label>
                  <div className={`px-4 py-2.5 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700/30 border-gray-600 text-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-600'
                  }`}>
                    {selectedItem.currentStock} {selectedItem.unit}
                  </div>
                </div>
              )}

              {/* Adjustment Type */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Adjustment Type
                </label>
                <div className="flex gap-3">
                  <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                    formData.adjustmentType === 'Add'
                      ? 'border-green-500 bg-green-500/10'
                      : isDarkMode
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="Add"
                      checked={formData.adjustmentType === 'Add'}
                      onChange={(e) => setFormData({ ...formData, adjustmentType: 'Add' })}
                      className="text-green-500"
                    />
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Add Stock</span>
                  </label>
                  
                  <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                    formData.adjustmentType === 'Remove'
                      ? 'border-red-500 bg-red-500/10'
                      : isDarkMode
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="Remove"
                      checked={formData.adjustmentType === 'Remove'}
                      onChange={(e) => setFormData({ ...formData, adjustmentType: 'Remove' })}
                      className="text-red-500"
                    />
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Remove Stock</span>
                  </label>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Quantity {errors.quantity && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => {
                    setFormData({ ...formData, quantity: e.target.value });
                    setErrors({ ...errors, quantity: false });
                  }}
                  placeholder="Enter quantity"
                  min="1"
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                    errors.quantity
                      ? 'border-red-500'
                      : isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {/* Reference */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Optional reference"
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {/* Reason - Full Width */}
              <div className="col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Reason {errors.reason && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => {
                    setFormData({ ...formData, reason: e.target.value });
                    setErrors({ ...errors, reason: false });
                  }}
                  placeholder="Enter reason for adjustment"
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                    errors.reason
                      ? 'border-red-500'
                      : isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleReset}
                className={`px-6 py-2.5 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'border-gray-600 hover:bg-gray-700 text-white'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-900'
                }`}
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
              
              <button
                type="submit"
                className="ml-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                <Save className="w-4 h-4 inline mr-2" />
                {editingId ? 'Update Adjustment' : 'Save Adjustment'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Adjustments Table */}
      <div className={`flex-1 rounded-xl border backdrop-blur-sm overflow-hidden flex flex-col ${
        isDarkMode
          ? 'bg-gray-800/50 border-gray-700/50'
          : 'bg-white/50 border-gray-200/50'
      }`}>
        <div className="p-4 border-b border-gray-700/50">
          <h2 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Adjustment History
          </h2>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className={`sticky top-0 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Date</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Item Code</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Item Name</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Type</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Quantity</th>
                <th className={`px-4 py-3 text-left text-xs font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Reason</th>
                <th className={`px-4 py-3 text-center text-xs font-semibold ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <Package className={`w-12 h-12 mx-auto mb-3 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No adjustments recorded yet
                    </p>
                  </td>
                </tr>
              ) : (
                adjustments.map((adjustment) => (
                  <tr
                    key={adjustment.id}
                    className={`border-t transition-colors ${
                      isDarkMode
                        ? 'border-gray-700/50 hover:bg-gray-700/30'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <td className={`px-4 py-3 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {new Date(adjustment.date).toLocaleDateString()}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {adjustment.itemCode}
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {adjustment.itemName}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        adjustment.adjustmentType === 'Add'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {adjustment.adjustmentType === 'Add' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {adjustment.adjustmentType}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${
                      adjustment.adjustmentType === 'Add'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}>
                      {adjustment.adjustmentType === 'Add' ? '+' : '-'}{adjustment.quantity}
                    </td>
                    <td className={`px-4 py-3 text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {adjustment.reason.length > 30 
                        ? adjustment.reason.substring(0, 30) + '...' 
                        : adjustment.reason}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(adjustment)}
                          className="p-1.5 rounded-lg transition-all hover:bg-blue-500/10 text-blue-500"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(adjustment)}
                          className="p-1.5 rounded-lg transition-all hover:bg-yellow-500/10 text-yellow-500"
                          title="Edit Adjustment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(adjustment)}
                          className="p-1.5 rounded-lg transition-all hover:bg-red-500/10 text-red-500"
                          title="Delete Adjustment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewingAdjustment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`max-w-2xl w-full rounded-xl border p-6 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Adjustment Details
              </h3>
              <button
                onClick={() => setViewingAdjustment(null)}
                className={`p-2 rounded-lg transition-all ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Adjustment ID</label>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{viewingAdjustment.id}</p>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Date</label>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{new Date(viewingAdjustment.date).toLocaleDateString()}</p>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Adjustment Type</label>
                <p className={`text-sm font-bold ${
                  viewingAdjustment.adjustmentType === 'Add' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {viewingAdjustment.adjustmentType}
                </p>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Quantity Adjusted</label>
                <p className={`text-sm font-bold ${
                  viewingAdjustment.adjustmentType === 'Add' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {`${viewingAdjustment.adjustmentType === 'Add' ? '+' : '-'}${viewingAdjustment.quantity}`}
                </p>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Item Code</label>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{viewingAdjustment.itemCode}</p>
              </div>

              <div className="col-span-2">
                <label className={`block text-xs font-semibold mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Item Name</label>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{viewingAdjustment.itemName}</p>
              </div>

              {viewingAdjustment.remarks && (
                <div className="col-span-2">
                  <label className={`block text-xs font-semibold mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Reference Number</label>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{viewingAdjustment.remarks}</p>
                </div>
              )}

              <div className="col-span-2">
                <label className={`block text-xs font-semibold mb-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Reason</label>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>{viewingAdjustment.reason}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingAdjustment(null)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
