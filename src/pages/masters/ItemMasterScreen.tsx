import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Package,
  Edit2
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

interface ItemMasterScreenProps {
  isDarkMode: boolean;
}

// Use ItemService interface from context instead of local Item interface

export function ItemMasterScreen({ isDarkMode }: ItemMasterScreenProps) {
  const { itemsServices, addItemService, updateItemService, deleteItemService, isLoading } = useItemsServices();
  const itemData = itemsServices.filter(i => i.type === 'Item');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Partial<ItemService> | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close modal
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
      // Ctrl/Cmd + N to add new
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !isModalOpen) {
        e.preventDefault();
        handleAddNew();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleRowClick = (item: ItemService) => {
    setSelectedItem(item);
    setIsNewItem(false);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedItem({
      name: '',
      category: '',
      brand: '',
      unit: 'Piece',
      hsnCode: '',
      gstPercentage: 18,
      purchasePrice: 0,
      defaultRate: 0,
      currentStock: 0,
      minStockLevel: 0,
      status: 'Active',
      type: 'Item'
    });
    setIsNewItem(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setIsNewItem(false);
  };

  const handleSave = async () => {
    if (!selectedItem?.name || !selectedItem?.category || (selectedItem.purchasePrice || 0) <= 0 || (selectedItem.defaultRate || 0) <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (isNewItem) {
        await addItemService({
          ...selectedItem,
          type: 'Item'
        });
        toast.success('Item added successfully!');
      } else if (selectedItem.id) {
        await updateItemService(selectedItem.id, selectedItem);
        toast.success('Item updated successfully!');
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save item');
    }
  };

  const handleDelete = async () => {
    if (selectedItem && selectedItem.id) {
      if (confirm('Are you sure you want to delete this item?')) {
        try {
          await deleteItemService(selectedItem.id);
          toast.success('Item deleted successfully!');
          handleCloseModal();
        } catch (err: any) {
          toast.error(err.message || 'Failed to delete item');
        }
      }
    }
  };

  const handleFormChange = (field: keyof ItemService, value: any) => {
    if (selectedItem) {
      setSelectedItem({
        ...selectedItem,
        [field]: value
      });
    }
  };

  return (
    <div className={`p-6 ${FORM_CONSTANTS.SECTION_SPACING}`}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Item Master</h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Manage inventory items and spare parts</p>
        </div>
        <button 
          onClick={handleAddNew}
          className={getPrimaryButtonClass()}
        >
          <Plus className="w-5 h-5" />
          <span>Add New Item</span>
        </button>
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
              <Package className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>All Items</h2>
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
                placeholder="Search items..."
                className={`bg-transparent outline-none text-sm w-64 ${
                  isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Item Code</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Item Name</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Category</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Brand</th>
                  <th className={`text-right py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Sale Price</th>
                  <th className={`text-right py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Stock</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {itemData.map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className={`border-b cursor-pointer ${
                      isDarkMode ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-blue-50'
                    } transition-colors`}
                  >
                    <td className={`py-4 px-4 text-sm font-medium ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>{item.id}</td>
                    <td className={`py-4 px-4 text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{item.name}</td>
                    <td className={`py-4 px-4 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{item.category}</td>
                    <td className={`py-4 px-4 text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{item.brand}</td>
                    <td className={`py-4 px-4 text-sm font-semibold text-right ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>₹{(item.defaultRate || 0).toLocaleString()}</td>
                    <td className={`py-4 px-4 text-sm font-semibold text-right ${
                      (item.currentStock || 0) < (item.minStockLevel || 0) 
                        ? 'text-red-500' 
                        : isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>{item.currentStock || 0} {item.unit}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Active'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Centered Modal Form */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            >
              {/* Modal */}
              <motion.div
                className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden ${
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
                        <Edit2 className={`w-5 h-5 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {isNewItem ? 'Add New Item' : 'Edit Item'}
                        </h2>
                        {!isNewItem && (
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>{selectedItem.id}</p>
                        )}
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

                {/* Modal Body with Form */}
                <div className="px-6 py-6 max-h-[calc(100vh-280px)] overflow-y-auto">
                  <div className={`${FORM_CONSTANTS.TWO_COLUMN_GRID} ${FORM_CONSTANTS.FIELD_GAP}`}>
                    <div className="lg:col-span-2">
                      <label className={getLabelClass(isDarkMode)}>Item Name *</label>
                      <input 
                        type="text" 
                        className={getInputClass(isDarkMode)}
                        value={selectedItem.name}
                        placeholder="Enter item name"
                        onChange={(e) => handleFormChange('name', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className={getLabelClass(isDarkMode)}>Category *</label>
                      <select 
                        className={getInputClass(isDarkMode)}
                        value={selectedItem.category}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                      >
                        <option value="">Select Category</option>
                        <option value="Lubricants">Lubricants</option>
                        <option value="Spare Parts">Spare Parts</option>
                        <option value="Filters">Filters</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Tyres">Tyres</option>
                        <option value="Batteries">Batteries</option>
                        <option value="Tools">Tools</option>
                      </select>
                    </div>

                    <div>
                      <label className={getLabelClass(isDarkMode)}>Brand</label>
                      <input 
                        type="text" 
                        className={getInputClass(isDarkMode)}
                        value={selectedItem.brand}
                        placeholder="Enter brand name"
                        onChange={(e) => handleFormChange('brand', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className={getLabelClass(isDarkMode)}>Unit *</label>
                      <select 
                        className={getInputClass(isDarkMode)}
                        value={selectedItem.unit}
                        onChange={(e) => handleFormChange('unit', e.target.value)}
                      >
                        <option value="Piece">Piece</option>
                        <option value="Set">Set</option>
                        <option value="Litre">Litre</option>
                        <option value="Kg">Kilogram</option>
                        <option value="Meter">Meter</option>
                        <option value="Box">Box</option>
                      </select>
                    </div>

                    <div>
                      <label className={getLabelClass(isDarkMode)}>HSN Code</label>
                      <input 
                        type="text" 
                        className={getInputClass(isDarkMode)}
                        value={selectedItem.hsnCode}
                        placeholder="Enter HSN code"
                        onChange={(e) => handleFormChange('hsnCode', e.target.value)}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className={getLabelClass(isDarkMode)}>GST Rate (%) *</label>
                      <select 
                        className={getInputClass(isDarkMode)}
                        value={selectedItem.gstPercentage}
                        onChange={(e) => handleFormChange('gstPercentage', parseFloat(e.target.value))}
                      >
                        <option value="0">0% - Nil Rated</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>

                    <div>
                      <label className={getLabelClass(isDarkMode)}>Purchase Price (₹) *</label>
                      <input 
                        type="number" 
                        className={getInputClass(isDarkMode)}
                        value={selectedItem.purchasePrice}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        onChange={(e) => handleFormChange('purchasePrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <label className={getLabelClass(isDarkMode)}>Sale Price (₹) *</label>
                      <input 
                        type="number" 
                        className={getInputClass(isDarkMode)}
                        value={selectedItem.defaultRate}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        onChange={(e) => handleFormChange('defaultRate', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <label className={getLabelClass(isDarkMode)}>Opening Stock</label>
                      <input 
                        type="number" 
                        className={getInputClass(isDarkMode)}
                        value={selectedItem.currentStock}
                        placeholder="0"
                        min="0"
                        onChange={(e) => handleFormChange('currentStock', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <label className={getLabelClass(isDarkMode)}>Min. Stock Level</label>
                      <input 
                        type="number" 
                        className={getInputClass(isDarkMode)}
                        value={selectedItem.minStockLevel}
                        placeholder="0"
                        min="0"
                        onChange={(e) => handleFormChange('minStockLevel', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className={getLabelClass(isDarkMode)}>Status *</label>
                      <select 
                        className={getInputClass(isDarkMode)}
                        value={selectedItem.status}
                        onChange={(e) => handleFormChange('status', e.target.value as 'Active' | 'Inactive')}
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
                  <div className="flex items-center justify-between">
                    {!isNewItem && (
                      <button 
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                          isDarkMode 
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`} 
                        onClick={handleDelete}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Delete</span>
                      </button>
                    )}
                    {isNewItem && <div></div>}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleCloseModal}
                        className={getSecondaryButtonClass(isDarkMode)}
                      >
                        <span>Cancel</span>
                      </button>
                      <button 
                        onClick={handleSave}
                        className={getPrimaryButtonClass()}
                      >
                        <Save className="w-4 h-4" />
                        <span>{isNewItem ? 'Add Item' : 'Save Changes'}</span>
                      </button>
                    </div>
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