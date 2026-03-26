import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  X
} from 'lucide-react';
import { useLabourBills } from '@/contexts/LabourBillContext';
import { toast } from 'sonner';
import { UnifiedPrintPreview } from '@/components/print/UnifiedPrintPreview';

interface LabourBillHistoryScreenProps {
  isDarkMode: boolean;
  onNavigate?: (screen: string, data?: any) => void;
}

export function LabourBillHistoryScreen({ isDarkMode, onNavigate }: LabourBillHistoryScreenProps) {
  const { labourBills, deleteLabourBill } = useLabourBills();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Completed' | 'Pending' | 'Cancelled'>('all');
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [billToView, setBillToView] = useState<any>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);
  const { refreshLabourBills } = useLabourBills();

  React.useEffect(() => {
    // Initial fetch handled by context, but we can call it just in case
    refreshLabourBills();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(refreshLabourBills, 60000);
    return () => clearInterval(interval);
  }, [refreshLabourBills]);

  const cardClass = `rounded-xl ${
    isDarkMode 
      ? 'bg-gray-800/40 border-gray-700/50' 
      : 'bg-white/60'
  } backdrop-blur-xl border border-white/20 shadow-lg`;

  const inputClass = `w-full px-4 py-2 rounded-lg border transition-all outline-none text-sm ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white'
  }`;

  // Filter and search bills
  const filteredBills = labourBills.filter(bill => {
    const matchesSearch = 
      bill.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this labour bill? All remaining bills will be automatically renumbered.')) {
      deleteLabourBill(id);
      toast.success('Labour bill deleted and remaining bills renumbered successfully');
    }
  };

  const handleView = (bill: any) => {
    setBillToView(bill);
    setViewModalOpen(true);
  };

  const handlePrint = (bill: any) => {
    // Transform bill items to standard format if needed
    const formattedBill = {
      ...bill,
      items: bill.items.map((item: any) => ({
        name: item.itemName,
        quantity: item.quantity,
        rate: item.rate,
        gst: item.gst,
        amount: item.amount
      })),
      subTotal: bill.subtotal,
      taxAmount: bill.totalGST,
      totalAmount: bill.grandTotal
    };
    setPrintData(formattedBill);
    setIsPrintModalOpen(true);
    toast.success('Opening print preview...');
  };

  const handleEdit = (bill: any) => {
    // Navigate to Labour Bill screen with the bill data for editing
    if (onNavigate) {
      onNavigate('labour', { editBill: bill });
      toast.info(`Editing bill ${bill.billNo}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-blue-600 text-white shadow-sm';
      case 'Pending':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Calculate statistics
  const stats = {
    total: labourBills.length,
    completed: labourBills.filter(b => b.status === 'Completed').length,
    pending: labourBills.filter(b => b.status === 'Pending').length,
    totalRevenue: labourBills
      .filter(b => b.status === 'Completed')
      .reduce((sum, b) => sum + b.grandTotal, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Labour Bill History</h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>View and manage all labour bills</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.info('Exporting data...')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => onNavigate?.('labour')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            <FileText className="w-4 h-4" />
            New Bill
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Bills
              </p>
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.total}
            </p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Completed
              </p>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.completed}
            </p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending
              </p>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.pending}
            </p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Revenue
              </p>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ₹{stats.totalRevenue.toLocaleString()}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search by bill no, customer, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className={inputClass}
              >
                <option value="all">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bills Table */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Bill No.</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Date & Time</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Customer</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Vehicle</th>
                  <th className={`text-right py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Amount</th>
                  <th className={`text-center py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Status</th>
                  <th className={`text-center py-3 px-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No labour bills found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill, index) => (
                    <tr
                      key={bill.id}
                      className={`border-b ${
                        isDarkMode ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <td className={`py-4 px-4 text-sm font-medium ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {bill.billNo}
                      </td>
                      <td className={`py-4 px-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {bill.date} • {bill.time}
                      </td>
                      <td className={`py-4 px-4 text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {bill.customerName.split(' - ')[0]}
                      </td>
                      <td className={`py-4 px-4`}>
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {bill.vehicleMake} {bill.vehicleModel}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {bill.vehicleNumber}
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-sm font-semibold text-right ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ₹{bill.grandTotal.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          getStatusColor(bill.status)
                        }`}>
                          {getStatusIcon(bill.status)}
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(bill)}
                            className={`p-2 rounded-lg transition-all hover:scale-110 ${
                              isDarkMode
                                ? 'hover:bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10'
                                : 'hover:bg-blue-50 text-blue-600 shadow-sm'
                            }`}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrint(bill)}
                            className={`p-2 rounded-lg transition-all hover:scale-110 ${
                              isDarkMode
                                ? 'hover:bg-blue-500/10 text-blue-400'
                                : 'hover:bg-blue-50 text-blue-600'
                            }`}
                            title="Print Bill"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(bill)}
                            className={`p-2 rounded-lg transition-all hover:scale-110 ${
                              isDarkMode
                                ? 'hover:bg-blue-600/20 text-blue-400'
                                : 'hover:bg-blue-600 hover:text-white text-blue-600'
                            }`}
                            title="Edit Bill"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bill.id)}
                            className={`p-2 rounded-lg transition-all hover:scale-110 ${
                              isDarkMode
                                ? 'hover:bg-blue-900/40 text-blue-300'
                                : 'hover:bg-blue-100 text-blue-700'
                            }`}
                            title="Delete Bill"
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
      </motion.div>

      {/* View Modal */}
      <AnimatePresence>
        {viewModalOpen && billToView && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
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
                  }`}>Labour Bill Details</h2>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Bill No: {billToView.billNo}</p>
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
                {/* Bill Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Bill Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Bill No:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {billToView.billNo}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Date & Time:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {billToView.date} • {billToView.time}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          getStatusColor(billToView.status)
                        }`}>
                          {getStatusIcon(billToView.status)}
                          {billToView.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Customer Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Name:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {billToView.customerName.split(' - ')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Phone:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {billToView.customerPhone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Address:</span>
                        <span className={`font-semibold text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {billToView.customerAddress}
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
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Vehicle Number:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {billToView.vehicleNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Model:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {billToView.vehicleModel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>KM Reading:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {billToView.kmReading}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Fuel Level:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {billToView.fuelLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h3 className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Service Items</h3>
                  <div className={`border rounded-lg overflow-hidden ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <table className="w-full">
                      <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                        <tr>
                          <th className={`text-left py-3 px-4 text-xs font-semibold ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>Item Name</th>
                          <th className={`text-center py-3 px-4 text-xs font-semibold ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>Quantity</th>
                          <th className={`text-right py-3 px-4 text-xs font-semibold ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>Rate</th>
                          <th className={`text-center py-3 px-4 text-xs font-semibold ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>GST %</th>
                          <th className={`text-right py-3 px-4 text-xs font-semibold ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>Amount</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${
                        isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                      }`}>
                        {billToView.items.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className={`py-3 px-4 text-sm ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{item.itemName}</td>
                            <td className={`py-3 px-4 text-sm text-center ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>{item.quantity}</td>
                            <td className={`py-3 px-4 text-sm text-right ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>₹{item.rate.toLocaleString()}</td>
                            <td className={`py-3 px-4 text-sm text-center ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>{item.gst}%</td>
                            <td className={`py-3 px-4 text-sm text-right font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>₹{item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className={`rounded-lg p-4 ${
                  isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'
                }`}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Subtotal:</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{billToView.subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total GST:</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{billToView.totalGST.toLocaleString()}
                      </span>
                    </div>
                    {billToView.discount > 0 && (
                      <div className="flex justify-between">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Discount:</span>
                        <span className="font-semibold text-blue-700">
                          -₹{billToView.discount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className={`flex justify-between pt-2 border-t ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Grand Total:
                      </span>
                      <span className="font-bold text-lg text-blue-500">
                        ₹{billToView.grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`sticky bottom-0 flex items-center justify-between gap-3 p-6 border-t ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={() => {
                    handleDelete(billToView.id);
                    setViewModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all font-medium"
                >
                  Delete Bill
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      handlePrint(billToView);
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
                      handleEdit(billToView);
                      setViewModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit Bill
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <UnifiedPrintPreview
        type="labour"
        data={printData}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}