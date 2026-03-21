/**
 * Alignment Screen
 * 
 * Main screen for managing alignment entries
 * Displays all alignment records with add, edit, delete functionality
 * Opened from Inventory → Alignment menu
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Filter,
  Eye,
  RefreshCw,
  Printer,
  Car,
  User,
  DollarSign,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAlignment } from '@/contexts/AlignmentContext';
import { AlignmentEntryPanel } from '@/components/panels/AlignmentEntryPanel';

interface AlignmentScreenProps {
  isDarkMode: boolean;
}

export function AlignmentScreen({ isDarkMode }: AlignmentScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const { alignmentEntries, deleteAlignmentEntry } = useAlignment();

  // Filter entries based on search and filters
  const filteredEntries = alignmentEntries.filter(entry => {
    const matchesSearch = 
      entry.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.billNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || entry.status === filterStatus;
    const matchesType = filterType === 'All' || entry.alignmentType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
      case 'In Progress': return isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'Pending': return isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      default: return isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Both': return isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'Front': return isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'Rear': return isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700';
      default: return isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this alignment entry?')) {
      deleteAlignmentEntry(id);
    }
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setIsAddPanelOpen(true);
  };

  const handleRefresh = () => {
    toast.success('Data refreshed successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    toast.success('Exporting to Excel...');
  };

  // Calculate summary
  const totalEntries = filteredEntries.length;
  const totalAmount = filteredEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  const completedCount = filteredEntries.filter(e => e.status === 'Completed').length;
  const pendingCount = filteredEntries.filter(e => e.status === 'Pending' || e.status === 'In Progress').length;

  const cardClass = `rounded-2xl border backdrop-blur-xl ${
    isDarkMode 
      ? 'bg-gray-800/40 border-gray-700' 
      : 'bg-white/40 border-gray-200'
  }`;

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cardClass + ' p-6'}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Settings className={`w-8 h-8 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Alignment Management
                </h1>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Manage vehicle alignment services and entries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                <Download className="w-5 h-5" />
                Export
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrint}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                <Printer className="w-5 h-5" />
                Print
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingEntry(null);
                  setIsAddPanelOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Entry
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cardClass + ' p-6'}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search by vehicle, customer, bill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-700 text-white'
                    : 'bg-white/50 border-gray-300 text-gray-900'
                }`}
              >
                <option value="All">All Status</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-700 text-white'
                    : 'bg-white/50 border-gray-300 text-gray-900'
                }`}
              >
                <option value="All">All Types</option>
                <option value="Front">Front</option>
                <option value="Rear">Rear</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className={cardClass + ' p-6'}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Entries
            </p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {totalEntries}
            </p>
          </div>
          <div className={cardClass + ' p-6'}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Amount
            </p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              ₹{totalAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <div className={cardClass + ' p-6'}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Completed
            </p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {completedCount}
            </p>
          </div>
          <div className={cardClass + ' p-6'}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Pending
            </p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {pendingCount}
            </p>
          </div>
        </motion.div>

        {/* Entries Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={cardClass + ' overflow-hidden'}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${
                isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'
              }`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Date
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Bill No
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Vehicle Details
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Customer
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Type
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Amount
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEntries.map((entry, index) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`transition-colors ${
                      isDarkMode
                        ? 'hover:bg-gray-700/30'
                        : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {new Date(entry.date).toLocaleDateString('en-IN', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {entry.billNo}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Car className={`w-4 h-4 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                        <div>
                          <div className="font-semibold text-sm">{entry.vehicleNo}</div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {entry.vehicleMake || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {entry.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(entry.alignmentType)}`}>
                        {entry.alignmentType}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      ₹{entry.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(entry.status)}`}>
                        {entry.status === 'Completed' && <CheckCircle className="w-3 h-3" />}
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-blue-500/20 text-blue-400'
                              : 'hover:bg-blue-100 text-blue-600'
                          }`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-red-500/20 text-red-400'
                              : 'hover:bg-red-100 text-red-600'
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
          </div>
        </motion.div>
      </div>

      {/* Alignment Entry Panel */}
      <AlignmentEntryPanel
        isDarkMode={isDarkMode}
        isOpen={isAddPanelOpen}
        onClose={() => {
          setIsAddPanelOpen(false);
          setEditingEntry(null);
        }}
        editingEntry={editingEntry}
      />
    </div>
  );
}