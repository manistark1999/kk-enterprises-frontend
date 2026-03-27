import React from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus } from 'lucide-react';

interface StockListModalProps {
  isDarkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  onFormChange: (data: any) => void;
  onSave: () => void;
  isViewMode?: boolean;
  isEditMode?: boolean;
  errors?: Record<string, string>;
}

export function StockListModal({
  isDarkMode,
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSave,
  isViewMode = false,
  isEditMode = false,
  errors = {}
}: StockListModalProps) {
  if (!isOpen) return null;

  const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all outline-none text-sm ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
  }`;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-[101] p-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', duration: 0.3 }}
      >
        <div
          className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl ${
            isDarkMode
              ? 'bg-gray-800/95 border-gray-700'
              : 'bg-white/95'
          } backdrop-blur-xl border shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className={`sticky top-0 z-10 px-6 py-4 border-b ${
            isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
          } backdrop-blur-xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{isViewMode ? 'Stock Item Details' : 'Add New Stock Item'}</h2>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{isViewMode ? `Item Code: ${formData.itemCode || formData.id}` : 'Enter complete item details and initial stock'}</p>
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
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {isViewMode ? (
              /* View Mode - Read Only Display */
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Item Code</label>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>{formData.itemCode || 'N/A'}</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Item Name</label>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{formData.itemName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Category</label>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{formData.category || 'N/A'}</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Brand</label>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{formData.brand || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Stock Information */}
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>Stock Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Unit of Measurement</label>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{formData.unit || 'N/A'}</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Current Stock</label>
                      <p className={`text-sm font-semibold ${
                        formData.status === 'Out of Stock'
                          ? 'text-red-500'
                          : formData.status === 'Low Stock'
                          ? 'text-orange-500'
                          : 'text-green-500'
                      }`}>{formData.currentStock || 0} {formData.unit || 'Units'}</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Minimum Stock</label>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{formData.minStock || 0}</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Maximum Stock</label>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{formData.maxStock || 0}</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Reorder Level</label>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{formData.reorderLevel || 0}</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Unit Price</label>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>₹{(formData.unitPrice || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Total Value</label>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>₹{(formData.totalValue || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Status</label>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        formData.status === 'In Stock'
                          ? 'bg-green-500/20 text-green-500'
                          : formData.status === 'Low Stock'
                          ? 'bg-orange-500/20 text-orange-500'
                          : formData.status === 'Out of Stock'
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {formData.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Supplier</label>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{formData.supplier || 'N/A'}</p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Storage Location</label>
                      <p className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{formData.location || 'N/A'}</p>
                    </div>
                    {formData.lastPurchaseDate && (
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Last Purchase Date</label>
                        <p className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{formData.lastPurchaseDate}</p>
                      </div>
                    )}
                    {formData.lastSaleDate && (
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>Last Sale Date</label>
                        <p className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{formData.lastSaleDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode - Form Inputs */
              <form className="space-y-6">
                {/* Basic Information Section */}
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>Item Code *</label>
                      <input
                        type="text"
                        placeholder="e.g., ENG-OIL-001"
                        value={formData.itemCode}
                        onChange={(e) => onFormChange({ ...formData, itemCode: e.target.value })}
                        className={`${inputClass} ${errors.itemCode ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
                      />
                      {errors.itemCode && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.itemCode}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>Item Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Engine Oil 5W-30"
                        value={formData.itemName}
                        onChange={(e) => onFormChange({ ...formData, itemName: e.target.value })}
                        className={`${inputClass} ${errors.itemName ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
                      />
                      {errors.itemName && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.itemName}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
                        className={`${inputClass} ${errors.category ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
                      >
                        <option value="">Select Category...</option>
                        <option value="Lubricants">Lubricants</option>
                        <option value="Filters">Filters</option>
                        <option value="Brake Parts">Brake Parts</option>
                        <option value="Engine Parts">Engine Parts</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Fluids">Fluids</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                      {errors.category && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.category}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>Brand</label>
                      <input
                        type="text"
                        placeholder="e.g., Castrol"
                        value={formData.brand}
                        onChange={(e) => onFormChange({ ...formData, brand: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Stock Information Section */}
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>Stock Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>Unit of Measurement *</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => onFormChange({ ...formData, unit: e.target.value })}
                        className={`${inputClass} ${errors.unit ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
                      >
                        <option value="Pieces">Pieces</option>
                        <option value="Sets">Sets</option>
                        <option value="Liters">Liters</option>
                        <option value="Kg">Kilograms</option>
                        <option value="Meters">Meters</option>
                        <option value="Boxes">Boxes</option>
                      </select>
                      {errors.unit && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.unit}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>Current Stock *</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.currentStock}
                        onChange={(e) => onFormChange({ ...formData, currentStock: e.target.value })}
                        className={`${inputClass} ${errors.currentStock ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
                        min="0"
                      />
                      {errors.currentStock && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.currentStock}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>Minimum Stock Level *</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.minStock}
                        onChange={(e) => onFormChange({ ...formData, minStock: e.target.value })}
                        className={`${inputClass} ${errors.minStock ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
                        min="0"
                      />
                      {errors.minStock && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.minStock}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>Maximum Stock Level *</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.maxStock}
                        onChange={(e) => onFormChange({ ...formData, maxStock: e.target.value })}
                        className={`${inputClass} ${errors.maxStock ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
                        min="0"
                      />
                      {errors.maxStock && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.maxStock}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>Reorder Level *</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.reorderLevel}
                        onChange={(e) => onFormChange({ ...formData, reorderLevel: e.target.value })}
                        className={`${inputClass} ${errors.reorderLevel ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
                        min="0"
                      />
                      {errors.reorderLevel && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.reorderLevel}</p>}
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>Unit Price (₹) *</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={formData.unitPrice}
                        onChange={(e) => onFormChange({ ...formData, unitPrice: e.target.value })}
                        className={`${inputClass} ${errors.unitPrice ? 'border-red-500 ring-1 ring-red-500/20' : ''}`}
                        min="0"
                        step="0.01"
                      />
                      {errors.unitPrice && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.unitPrice}</p>}
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>Supplier</label>
                      <input
                        type="text"
                        placeholder="e.g., AutoParts India"
                        value={formData.supplier}
                        onChange={(e) => onFormChange({ ...formData, supplier: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>Storage Location</label>
                      <input
                        type="text"
                        placeholder="e.g., Warehouse A"
                        value={formData.location}
                        onChange={(e) => onFormChange({ ...formData, location: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Modal Footer */}
          <div className={`sticky bottom-0 px-6 py-4 border-t ${
            isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
          } backdrop-blur-xl`}>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all text-sm ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isViewMode ? 'Close' : 'Cancel'}
              </button>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={onSave}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 transition-all text-sm"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}