import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  Eye,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Archive,
  RefreshCw,
  Printer,
  FileText,
  Grid,
  List as ListIcon,
  SlidersHorizontal,
  X,
  Save
} from 'lucide-react';
import { StockListModal } from '@/components/modals/StockListModal';
import { useStock } from '@/contexts/StockContext';
import { UnifiedPrintPreview } from '@/components/print/UnifiedPrintPreview';

interface StockListScreenProps {
  isDarkMode: boolean;
}

interface StockItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  brand: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  unitPrice: number;
  totalValue: number;
  supplier: string;
  location: string;
  lastPurchaseDate: string;
  lastSaleDate: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked';
}

export function StockListScreen({ isDarkMode }: StockListScreenProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  // Form state for new item
  const [newItemForm, setNewItemForm] = useState({
    itemCode: '',
    itemName: '',
    category: '',
    brand: '',
    unit: 'Pieces',
    currentStock: '',
    minStock: '',
    maxStock: '',
    reorderLevel: '',
    unitPrice: '',
    supplier: '',
    location: '',
  });

  const { stockItems, addStockItem, updateStockItem, deleteStockItem } = useStock();

  const cardClass = `rounded-xl ${
    isDarkMode 
      ? 'bg-gray-800/40 border-gray-700/50' 
      : 'bg-white/60'
  } backdrop-blur-xl border border-white/20 shadow-lg`;

  const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all outline-none text-sm ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
  }`;

  // Calculate statistics
  const totalItems = stockItems.length;
  const inStockCount = stockItems.filter(item => item.status === 'In Stock' || item.status === 'Overstocked').length;
  const lowStockCount = stockItems.filter(item => item.status === 'Low Stock').length;
  const outOfStockCount = stockItems.filter(item => item.status === 'Out of Stock').length;
  const totalValue = stockItems.reduce((sum, item) => sum + item.totalValue, 0);

  // Filter items
  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-500/20 text-green-500';
      case 'Low Stock':
        return 'bg-orange-500/20 text-orange-500';
      case 'Out of Stock':
        return 'bg-red-500/20 text-red-500';
      case 'Overstocked':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  // Function to determine stock status based on levels
  const determineStatus = (currentStock: number, minStock: number, maxStock: number): StockItem['status'] => {
    if (currentStock === 0) return 'Out of Stock';
    if (currentStock < minStock) return 'Low Stock';
    if (currentStock > maxStock) return 'Overstocked';
    return 'In Stock';
  };

  // Function to handle saving new item
  const handleSaveNewItem = () => {
    // Validate required fields
    if (!newItemForm.itemCode || !newItemForm.itemName || !newItemForm.category || 
        !newItemForm.currentStock || !newItemForm.minStock || !newItemForm.maxStock || 
        !newItemForm.reorderLevel || !newItemForm.unitPrice) {
      alert('Please fill in all required fields');
      return;
    }

    // Parse numeric values
    const currentStock = parseInt(newItemForm.currentStock);
    const minStock = parseInt(newItemForm.minStock);
    const maxStock = parseInt(newItemForm.maxStock);
    const reorderLevel = parseInt(newItemForm.reorderLevel);
    const unitPrice = parseFloat(newItemForm.unitPrice);

    // Calculate total value
    const totalValue = currentStock * unitPrice;

    // Determine status
    const status = determineStatus(currentStock, minStock, maxStock);

    if (isEditMode && editingItemId) {
      // Update existing item
      updateStockItem(editingItemId, {
        itemCode: newItemForm.itemCode,
        itemName: newItemForm.itemName,
        category: newItemForm.category,
        brand: newItemForm.brand || 'N/A',
        unit: newItemForm.unit,
        currentStock,
        minStock,
        maxStock,
        reorderLevel,
        unitPrice,
        totalValue,
        supplier: newItemForm.supplier || 'N/A',
        location: newItemForm.location || 'N/A',
        lastPurchaseDate: selectedItem?.lastPurchaseDate || new Date().toISOString().split('T')[0],
        lastSaleDate: selectedItem?.lastSaleDate || '-',
        status
      });
      console.log('Item updated successfully');
    } else {
      // Generate new ID
      const newId = `ITM-${String(stockItems.length + 1).padStart(3, '0')}`;

      // Get current date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      // Create new item
      const newItem: StockItem = {
        id: newId,
        itemCode: newItemForm.itemCode,
        itemName: newItemForm.itemName,
        category: newItemForm.category,
        brand: newItemForm.brand || 'N/A',
        unit: newItemForm.unit,
        currentStock,
        minStock,
        maxStock,
        reorderLevel,
        unitPrice,
        totalValue,
        supplier: newItemForm.supplier || 'N/A',
        location: newItemForm.location || 'N/A',
        lastPurchaseDate: today,
        lastSaleDate: '-',
        status
      };

      // Add to stock items (add at the beginning to show it at the top)
      addStockItem(newItem);
      console.log('New item added successfully:', newItem);
    }

    // Reset form
    setNewItemForm({
      itemCode: '',
      itemName: '',
      category: '',
      brand: '',
      unit: 'Pieces',
      currentStock: '',
      minStock: '',
      maxStock: '',
      reorderLevel: '',
      unitPrice: '',
      supplier: '',
      location: '',
    });

    // Close modal and reset edit mode
    setIsAddModalOpen(false);
    setIsEditMode(false);
    setEditingItemId(null);
  };

  // Function to handle edit button click
  const handleEditClick = (item: StockItem) => {
    setSelectedItem(item);
    setEditingItemId(item.id);
    setIsEditMode(true);
    setNewItemForm({
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,
      brand: item.brand,
      unit: item.unit,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      maxStock: item.maxStock.toString(),
      reorderLevel: item.reorderLevel.toString(),
      unitPrice: item.unitPrice.toString(),
      supplier: item.supplier,
      location: item.location,
    });
    setIsAddModalOpen(true);
  };

  // Function to handle print
  const handlePrint = () => {
    // Format data for ReportPrintView
    const formattedData = {
      reportNo: `STK-${new Date().getTime().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-IN'),
      headers: ['Code', 'Item Name', 'Category', 'Stock', 'Unit', 'Price', 'Value', 'Status'],
      keys: ['itemCode', 'itemName', 'category', 'currentStock', 'unit', 'unitPrice', 'totalValue', 'status'],
      items: filteredItems,
      metaDetails: [
        { label: 'Total Items', value: totalItems.toString() },
        { label: 'Categories', value: 'All' },
        { label: 'Filtered items', value: filteredItems.length.toString() }
      ],
      summary: {
        totals: [
          { label: 'Total Stock Quantity', value: filteredItems.reduce((sum, item) => sum + item.currentStock, 0).toString() },
          { label: 'Grand Total Value', value: `₹${totalValue.toLocaleString()}`, isTotal: true }
        ],
        info: [
          { label: 'Generated By', content: 'Admin' },
          { label: 'Time', content: new Date().toLocaleTimeString() }
        ]
      }
    };
    
    setPrintData(formattedData);
    setIsPrintModalOpen(true);
  };

  // Function to handle delete
  const handleDelete = (itemId: string) => {
    deleteStockItem(itemId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
          }`}>
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Manage Stock Items List</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Complete inventory overview and stock management</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
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
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Items</span>
              <Package className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{totalItems}</div>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>In Stock</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-500">{inStockCount}</div>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Low Stock</span>
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-500">{lowStockCount}</div>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Out of Stock</span>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-500">{outOfStockCount}</div>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Value</span>
              <FileText className={`w-5 h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>₹{totalValue.toLocaleString()}</div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search by item name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={inputClass}
              >
                <option value="All">All Categories</option>
                <option value="Lubricants">Lubricants</option>
                <option value="Filters">Filters</option>
                <option value="Brake Parts">Brake Parts</option>
                <option value="Engine Parts">Engine Parts</option>
                <option value="Electrical">Electrical</option>
                <option value="Fluids">Fluids</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={inputClass}
              >
                <option value="All">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Overstocked">Overstocked</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className={`flex items-center gap-1 p-1 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 shadow'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 shadow'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stock Items Table/Grid */}
      <motion.div
        className={`${cardClass} flex flex-col overflow-hidden`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className={`p-6 border-b ${ isDarkMode ? 'border-gray-700' : 'border-gray-200' }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg font-bold ${ isDarkMode ? 'text-white' : 'text-gray-900' }`}>
                Stock Items ({filteredItems.length})
              </h2>
            </div>
            <div className={`text-sm ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
              Last updated: {new Date().toLocaleString('en-IN', { 
                day: '2-digit', 
                month: 'numeric', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          /* Table View */
          <>
            <div className="flex-1 overflow-auto">
              <div className="min-w-full inline-block align-middle">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '7%' }} />
                  </colgroup>
                  <thead className={`sticky top-0 ${ isDarkMode ? 'bg-gray-800/95' : 'bg-gray-50/95' } backdrop-blur-sm z-10`}>
                    <tr className={`border-b ${ isDarkMode ? 'border-gray-700' : 'border-gray-200' }`}>
                      <th className={`text-left py-3 px-3 text-xs font-semibold ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                        Item Code
                      </th>
                      <th className={`text-left py-3 px-3 text-xs font-semibold ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                        Item Name
                      </th>
                      <th className={`text-left py-3 px-3 text-xs font-semibold ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                        Category
                      </th>
                      <th className={`text-left py-3 px-3 text-xs font-semibold ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                        Brand
                      </th>
                      <th className={`text-right py-3 px-3 text-xs font-semibold ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                        Current Stock
                      </th>
                      <th className={`text-right py-3 px-3 text-xs font-semibold ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                        Min/Max
                      </th>
                      <th className={`text-right py-3 px-3 text-xs font-semibold ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                        Unit Price
                      </th>
                      <th className={`text-right py-3 px-3 text-xs font-semibold ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                        Total Value
                      </th>
                      <th className={`text-center py-3 px-3 text-xs font-semibold ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                        Status
                      </th>
                      <th className={`text-center py-3 px-3 text-xs font-semibold ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${ isDarkMode ? 'divide-gray-700' : 'divide-gray-200' }`}>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-12">
                          <Package className={`w-12 h-12 mx-auto mb-4 ${ isDarkMode ? 'text-gray-600' : 'text-gray-400' }`} />
                          <p className={`text-sm ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                            No stock items found
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={`transition-colors ${ isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50' }`}
                        >
                          <td className={`py-3 px-3 text-sm font-medium truncate ${ isDarkMode ? 'text-blue-400' : 'text-blue-600' }`}
                            title={item.itemCode}>
                            {item.itemCode}
                          </td>
                          <td className={`py-3 px-3 text-sm font-medium truncate ${ isDarkMode ? 'text-white' : 'text-gray-900' }`}
                            title={item.itemName}>
                            {item.itemName}
                          </td>
                          <td className={`py-3 px-3 text-sm truncate ${ isDarkMode ? 'text-gray-300' : 'text-gray-700' }`}
                            title={item.category}>
                            {item.category}
                          </td>
                          <td className={`py-3 px-3 text-sm truncate ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}
                            title={item.brand}>
                            {item.brand}
                          </td>
                          <td className={`py-3 px-3 text-sm font-semibold text-right truncate ${
                            item.status === 'Out of Stock' 
                              ? isDarkMode ? 'text-red-400' : 'text-red-600'
                              : item.status === 'Low Stock'
                              ? isDarkMode ? 'text-orange-400' : 'text-orange-600'
                              : isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}
                            title={`${item.currentStock} ${item.unit}`}>
                            {item.currentStock} <span className="text-xs opacity-70">{item.unit}</span>
                          </td>
                          <td className={`py-3 px-3 text-sm text-right truncate ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}
                            title={`Min: ${item.minStock}, Max: ${item.maxStock}`}>
                            {item.minStock}/{item.maxStock}
                          </td>
                          <td className={`py-3 px-3 text-sm font-medium text-right truncate ${ isDarkMode ? 'text-gray-300' : 'text-gray-700' }`}
                            title={`₹${item.unitPrice.toLocaleString()}`}>
                            ₹{item.unitPrice.toLocaleString()}
                          </td>
                          <td className={`py-3 px-3 text-sm font-semibold text-right truncate ${ isDarkMode ? 'text-blue-400' : 'text-blue-600' }`}
                            title={`₹${item.totalValue.toLocaleString()}`}>
                            ₹{item.totalValue.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${ getStatusColor(item.status) }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1">
                              <button className={`p-1 rounded-lg transition-all ${ isDarkMode ? 'hover:bg-blue-500/20 text-blue-400' : 'hover:bg-blue-50 text-blue-600' }`}
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsViewModalOpen(true);
                                }}
                                title="View">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button className={`p-1 rounded-lg transition-all ${ isDarkMode ? 'hover:bg-green-500/20 text-green-400' : 'hover:bg-green-50 text-green-600' }`}
                                title="Edit"
                                onClick={() => handleEditClick(item)}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button className={`p-1 rounded-lg transition-all ${ isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600' }`}
                                title="Delete"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Footer */}
            <div className={`p-6 border-t ${ isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50' }`}>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className={`text-xs font-medium ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                    Total Items Displayed
                  </p>
                  <p className={`text-xl font-bold mt-1 ${ isDarkMode ? 'text-white' : 'text-gray-900' }`}>
                    {filteredItems.length}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-medium ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                    Total Quantity
                  </p>
                  <p className={`text-xl font-bold mt-1 ${ isDarkMode ? 'text-white' : 'text-gray-900' }`}>
                    {filteredItems.reduce((sum, item) => sum + item.currentStock, 0)} Units
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-medium ${ isDarkMode ? 'text-gray-400' : 'text-gray-600' }`}>
                    Total Stock Value
                  </p>
                  <p className={`text-xl font-bold mt-1 ${ isDarkMode ? 'text-white' : 'text-gray-900' }`}>
                    ₹{filteredItems.reduce((sum, item) => sum + item.totalValue, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Grid View */
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className={`p-4 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500' 
                      : 'bg-white border-gray-200 hover:border-blue-400'
                  } transition-all cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
                    }`}>
                      <Package className={`w-5 h-5 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(item.status)
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <h3 className={`font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{item.itemName}</h3>
                  
                  <p className={`text-xs mb-3 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>{item.itemCode}</p>
                  
                  <div className={`space-y-2 mb-3 pb-3 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Stock:</span>
                      <span className={`font-semibold ${
                        item.status === 'Out of Stock' 
                          ? isDarkMode ? 'text-red-400' : 'text-red-600'
                          : item.status === 'Low Stock'
                          ? isDarkMode ? 'text-orange-400' : 'text-orange-600'
                          : isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>{item.currentStock} {item.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Value:</span>
                      <span className={`font-semibold ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>₹{item.totalValue.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      isDarkMode 
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                      onClick={() => handleEditClick(item)}
                    >
                      <Edit className="w-3 h-3 inline mr-1" />
                      Edit
                    </button>
                    <button className={`p-2 rounded-lg transition-all ${
                      isDarkMode 
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                      onClick={() => {
                        setSelectedItem(item);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Add New Item Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <StockListModal
            isDarkMode={isDarkMode}
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              setIsEditMode(false);
              setEditingItemId(null);
            }}
            formData={newItemForm}
            onFormChange={setNewItemForm}
            onSave={handleSaveNewItem}
            isEditMode={isEditMode}
          />
        )}
      </AnimatePresence>

      {/* View Item Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedItem && (
          <StockListModal
            isDarkMode={isDarkMode}
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            formData={selectedItem}
            onFormChange={() => {}}
            onSave={() => {}}
            isViewMode={true}
          />
        )}
      </AnimatePresence>

      <UnifiedPrintPreview
        type="report"
        title="STOCK INVENTORY REPORT"
        data={printData}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}