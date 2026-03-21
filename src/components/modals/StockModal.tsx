import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  Filter,
  Download,
  Upload
} from 'lucide-react';

interface StockItem {
  id: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  price: number;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export function StockModal({ isOpen, onClose, isDarkMode }: StockModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  // Sample stock data
  const [stockItems, setStockItems] = useState<StockItem[]>([
    {
      id: 1,
      code: 'ITM-001',
      name: 'Engine Oil 5W-30',
      category: 'Lubricants',
      unit: 'Liters',
      quantity: 150,
      reorderLevel: 50,
      price: 450,
      supplier: 'Shell India',
      status: 'In Stock'
    },
    {
      id: 2,
      code: 'ITM-002',
      name: 'Brake Pads',
      category: 'Brake Parts',
      unit: 'Sets',
      quantity: 25,
      reorderLevel: 30,
      price: 1200,
      supplier: 'Bosch Auto',
      status: 'Low Stock'
    },
    {
      id: 3,
      code: 'ITM-003',
      name: 'Air Filter',
      category: 'Filters',
      unit: 'Pieces',
      quantity: 80,
      reorderLevel: 20,
      price: 350,
      supplier: 'Mann Filter',
      status: 'In Stock'
    },
    {
      id: 4,
      code: 'ITM-004',
      name: 'Spark Plugs',
      category: 'Engine Parts',
      unit: 'Pieces',
      quantity: 5,
      reorderLevel: 15,
      price: 180,
      supplier: 'NGK India',
      status: 'Low Stock'
    },
    {
      id: 5,
      code: 'ITM-005',
      name: 'Battery 12V',
      category: 'Electrical',
      unit: 'Pieces',
      quantity: 0,
      reorderLevel: 10,
      price: 4500,
      supplier: 'Exide',
      status: 'Out of Stock'
    },
    {
      id: 6,
      code: 'ITM-006',
      name: 'Coolant',
      category: 'Lubricants',
      unit: 'Liters',
      quantity: 200,
      reorderLevel: 40,
      price: 280,
      supplier: 'Castrol',
      status: 'In Stock'
    },
    {
      id: 7,
      code: 'ITM-007',
      name: 'Wiper Blades',
      category: 'Accessories',
      unit: 'Pairs',
      quantity: 45,
      reorderLevel: 20,
      price: 320,
      supplier: 'Bosch Auto',
      status: 'In Stock'
    },
    {
      id: 8,
      code: 'ITM-008',
      name: 'Transmission Oil',
      category: 'Lubricants',
      unit: 'Liters',
      quantity: 12,
      reorderLevel: 25,
      price: 650,
      supplier: 'Mobil India',
      status: 'Low Stock'
    }
  ]);

  const categories = ['All Categories', 'Lubricants', 'Brake Parts', 'Filters', 'Engine Parts', 'Electrical', 'Accessories'];

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'Low Stock':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Out of Stock':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setStockItems(stockItems.filter(item => item.id !== id));
    }
  };

  // Calculate statistics
  const totalItems = stockItems.length;
  const lowStockItems = stockItems.filter(item => item.status === 'Low Stock').length;
  const outOfStockItems = stockItems.filter(item => item.status === 'Out of Stock').length;
  const totalValue = stockItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
                isDarkMode 
                  ? 'bg-gray-900 border border-gray-800' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between ${
                isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
                  }`}>
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Stock Management</h2>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Manage inventory and stock levels</p>
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
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Statistics Bar */}
              <div className={`px-6 py-4 border-b ${
                isDarkMode ? 'border-gray-800 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'
              }`}>
                <div className="grid grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Items</p>
                    <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalItems}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Low Stock</p>
                    <p className="text-2xl font-bold mt-1 text-yellow-600">{lowStockItems}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Out of Stock</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">{outOfStockItems}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Value</p>
                    <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₹{totalValue.toLocaleString()}</p>
                  </motion.div>
                </div>
              </div>

              {/* Toolbar */}
              <div className={`px-6 py-4 border-b flex items-center justify-between gap-4 ${
                isDarkMode ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or code..."
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`px-4 py-2.5 rounded-lg border transition-all ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {/* Export Button */}
                  <button
                    className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      isDarkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>

                  {/* Add New Button */}
                  <button
                    onClick={() => setIsAddDrawerOpen(true)}
                    className="px-4 py-2.5 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 340px)' }}>
                <table className="w-full">
                  <thead className={`sticky top-0 ${
                    isDarkMode ? 'bg-gray-800/95' : 'bg-gray-50/95'
                  } backdrop-blur-sm`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Code</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Item Name</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Category</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Quantity</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Unit</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Price</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Supplier</th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Status</th>
                      <th className={`px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDarkMode ? 'divide-gray-800' : 'divide-gray-200'
                  }`}>
                    {filteredItems.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`transition-colors ${
                          isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>{item.code}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{item.name}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>{item.category}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                          item.quantity === 0 ? 'text-red-600' :
                          item.quantity < item.reorderLevel ? 'text-yellow-600' :
                          isDarkMode ? 'text-gray-300' : 'text-gray-900'
                        }`}>{item.quantity}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{item.unit}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-900'
                        }`}>₹{item.price.toLocaleString()}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>{item.supplier}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingItem(item)}
                              className={`p-2 rounded-lg transition-all ${
                                isDarkMode
                                  ? 'hover:bg-gray-700 text-blue-400'
                                  : 'hover:bg-blue-50 text-blue-600'
                              }`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className={`p-2 rounded-lg transition-all ${
                                isDarkMode
                                  ? 'hover:bg-gray-700 text-red-400'
                                  : 'hover:bg-red-50 text-red-600'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {filteredItems.length === 0 && (
                  <div className={`text-center py-12 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No items found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
