import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Calendar, Car, User, DollarSign, Settings, Eye, Printer, Download, CheckCircle, Save, Edit, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAlignment } from '@/contexts/AlignmentContext';
import { UnifiedPrintPreview } from '@/components/print/UnifiedPrintPreview';
import { handlePrintWithTemplate, PrintData } from '@/utils/printUtils';

interface AlignmentRegisterScreenProps {
  isDarkMode: boolean;
}

interface AlignmentRecord {
  id: string;
  date: string;
  billNo: string;
  vehicleNo: string;
  vehicleMake: string;
  customerName: string;
  alignmentType: 'Front' | 'Rear' | 'Both';
  technician: string;
  charges: number;
  status: 'Completed' | 'Pending' | 'In Progress';
}

export function AlignmentRegisterScreen({ isDarkMode }: AlignmentRegisterScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('2025-01-01'); // Changed to start of year
  const [dateTo, setDateTo] = useState('2026-12-31'); // Changed to end of next year for wider range
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [recordToView, setRecordToView] = useState<AlignmentRecord | null>(null);

  // Get alignment entries from context
  const { alignmentEntries, saveAlignmentHistory } = useAlignment();
  
  // Track changes to alignment entries
  useEffect(() => {
  }, [alignmentEntries]);
  

  // Convert context entries to records format
  const records: AlignmentRecord[] = alignmentEntries.map(entry => ({
    id: entry.id,
    date: entry.date,
    billNo: entry.billNo,
    vehicleNo: entry.vehicleNo,
    vehicleMake: entry.vehicleMake || 'N/A',
    customerName: entry.customerName,
    alignmentType: entry.alignmentType,
    technician: entry.technician || 'N/A',
    charges: entry.amount || entry.charges || 0,
    status: entry.status
  }));

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.vehicleMake.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || record.status === filterStatus;
    const matchesType = filterType === 'All' || record.alignmentType === filterType;
    
    const recordDate = new Date(record.date);
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const matchesDateRange = recordDate >= fromDate && recordDate <= toDate;
    
    return matchesSearch && matchesStatus && matchesType && matchesDateRange;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'In Progress': return isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'Pending': return isDarkMode ? 'bg-blue-400/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      default: return isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Both': return isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'Front': return isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'Rear': return isDarkMode ? 'bg-blue-800/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      default: return isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  // Calculate summary statistics
  const totalRecords = filteredRecords.length;
  const totalCharges = filteredRecords.reduce((sum, record) => sum + record.charges, 0);
  const completedCount = filteredRecords.filter(r => r.status === 'Completed').length;
  const pendingCount = filteredRecords.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  const handlePrint = (record: AlignmentRecord) => {
    setPrintData(record);
    setIsPrintModalOpen(true);
    toast.success('Opening print preview...');
  };

  const handleEdit = (record: AlignmentRecord) => {
    // This would navigate to edit screen if onNavigate was available
    toast.info(`Edit functionality for ${record.billNo} - Opening edit form...`);
  };

  const handleView = (record: AlignmentRecord) => {
    setRecordToView(record);
    setViewModalOpen(true);
  };

  const handleSaveHistory = async () => {
    // Save the current filter state and records to history with complete column data
    const historyData = {
      timestamp: new Date().toISOString(),
      savedDate: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      filters: {
        searchQuery,
        dateFrom,
        dateTo,
        filterStatus,
        filterType
      },
      records: filteredRecords.map(record => ({
        // Store all columns exactly as shown in the table
        date: record.date,
        billNo: record.billNo,
        vehicleDetails: {
          vehicleNo: record.vehicleNo,
          vehicleMake: record.vehicleMake
        },
        customerName: record.customerName,
        alignmentType: record.alignmentType,
        technician: record.technician,
        charges: record.charges,
        status: record.status,
        id: record.id
      })),
      summary: {
        totalRecords,
        totalCharges,
        completedCount,
        pendingCount,
        averageCharge: totalRecords > 0 ? Math.round(totalCharges / totalRecords) : 0
      },
      metadata: {
        savedBy: 'KK Enterprises',
        reportType: 'Alignment Register',
        dateRange: `${dateFrom} to ${dateTo}`
      }
    };
    
    // Save to PostgreSQL backend via Context
    try {
      await saveAlignmentHistory(historyData);
      
      // Still allow auto-download as JSON for user's local backup if they want
      const dataStr = JSON.stringify(historyData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alignment-register-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Alignment history successfully stored in PostgreSQL and downloaded.`);
    } catch (err) {
      // Fallback or just let context toast error
    }
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl border backdrop-blur-xl p-6 ${
            isDarkMode
              ? 'bg-gray-800/40 border-gray-700'
              : 'bg-white/40 border-gray-200'
          }`}
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
                  Alignment Register
                </h1>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Track and manage vehicle alignment services
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveHistory}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                <Save className="w-5 h-5" />
                Save History
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`rounded-2xl border backdrop-blur-xl p-6 ${
            isDarkMode
              ? 'bg-gray-800/40 border-gray-700'
              : 'bg-white/40 border-gray-200'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
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

            {/* Date From */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-700 text-white'
                    : 'bg-white/50 border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Date To */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-700 text-white'
                    : 'bg-white/50 border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Alignment Type Filter */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Alignment Type
              </label>
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

            {/* Status Filter */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Status
              </label>
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
          </div>
        </motion.div>

        {/* Records Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`rounded-2xl border backdrop-blur-xl overflow-hidden ${
            isDarkMode
              ? 'bg-gray-800/40 border-gray-700'
              : 'bg-white/40 border-gray-200'
          }`}
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
                    Alignment Type
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Technician
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Charges
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
                {filteredRecords.map((record, index) => (
                  <motion.tr
                    key={record.id}
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
                      {new Date(record.date).toLocaleDateString('en-IN', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {record.billNo}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Car className={`w-4 h-4 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                        <div>
                          <div className="font-semibold text-sm">{record.vehicleNo}</div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {record.vehicleMake}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {record.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(record.alignmentType)}`}>
                        {record.alignmentType}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {record.technician}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      ₹{record.charges.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(record.status)}`}>
                        {record.status === 'Completed' && <CheckCircle className="w-3 h-3" />}
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(record)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-blue-500/20 text-blue-400'
                              : 'hover:bg-blue-100 text-blue-600'
                          }`}
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(record)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-gray-500/20 text-gray-400'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(record)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-blue-600/20 text-blue-400'
                              : 'hover:bg-blue-100 text-blue-600'
                          }`}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`rounded-2xl border backdrop-blur-xl p-6 ${
            isDarkMode
              ? 'bg-gray-800/40 border-gray-700'
              : 'bg-white/40 border-gray-200'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Records
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {totalRecords}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Charges
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                ₹{totalCharges.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {completedCount}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                {pendingCount}
              </p>
            </div>
          </div>
        </motion.div>

        {/* View Modal */}
        {viewModalOpen && recordToView && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              className={`rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              } border shadow-2xl`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {/* Modal Header */}
              <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div>
                  <h2 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Alignment Service Details</h2>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Bill No: {recordToView.billNo}</p>
                </div>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Service Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Service Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Bill No:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {recordToView.billNo}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Date:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(recordToView.date).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Alignment Type:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(recordToView.alignmentType)}`}>
                          {recordToView.alignmentType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(recordToView.status)}`}>
                          {recordToView.status === 'Completed' && <CheckCircle className="w-3 h-3" />}
                          {recordToView.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Vehicle Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Vehicle No:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {recordToView.vehicleNo}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Make/Model:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {recordToView.vehicleMake}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Customer:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {recordToView.customerName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Service Provider</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Technician:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          <User className="w-4 h-4 inline mr-1" />
                          {recordToView.technician}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Charges</h3>
                    <div className={`rounded-lg p-4 ${
                      isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Total Amount:
                        </span>
                        <span className="font-bold text-2xl text-blue-600">
                          ₹{recordToView.charges.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={() => {
                    handlePrint(recordToView);
                    setViewModalOpen(false);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all font-medium ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Printer className="w-4 h-4 inline mr-2" />
                  Print
                </button>
                <button
                  onClick={() => {
                    handleEdit(recordToView);
                    setViewModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  <Edit className="w-4 h-4 inline mr-2" />
                  Edit Record
                </button>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className={`px-4 py-2 rounded-lg border transition-all font-medium ${
                    isDarkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
        <UnifiedPrintPreview
          type="alignment"
          data={printData}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
}