import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { UnifiedPrintPreview } from '@/components/print/UnifiedPrintPreview';
import { api, endpoints } from '@/services/api';

interface EstimationHistoryScreenProps {
  isDarkMode: boolean;
  onNavigate?: (screen: string, data?: any) => void;
}

export function EstimationHistoryScreen({ isDarkMode, onNavigate }: EstimationHistoryScreenProps) {
  const [estimations, setEstimations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Completed' | 'Pending' | 'Cancelled'>('all');
  const [billToView, setBillToView] = useState<any>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  const fetchEstimations = async () => {
    try {
      const response = await api.get(endpoints.billing.estimation.list);

      if (response.success && response.data) {
        setEstimations(response.data.data || response.data);
      } else {
        toast.error('Failed to load estimations');
      }
    } catch (error) {
      toast.error('Error connecting to backend API');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEstimations();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchEstimations, 60000);
    return () => clearInterval(interval);
  }, []);

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
  const filteredEstimations = estimations.filter(bill => {
    const matchesSearch = 
      (bill.bill_no && bill.bill_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.customer_name && bill.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.vehicle_number && bill.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handlePrint = (bill: any) => {
    const formattedBill = {
      ...bill,
      billNo: bill.bill_no,
      date: bill.created_at,
      customerName: bill.customer_name,
      customerPhone: bill.customer_phone,
      vehicleNumber: bill.vehicle_number,
      vehicleModel: bill.vehicle_model,
      totalAmount: bill.total_amount,
      items: bill.items || [{
        name: 'Estimated standard charges',
        quantity: 1,
        rate: bill.total_amount,
        gst: 0,
        amount: bill.total_amount
      }]
    };
    setPrintData(formattedBill);
    setIsPrintModalOpen(true);
    toast.success('Opening print preview...');
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
        return 'bg-green-500/20 text-green-500';
      case 'Pending':
        return 'bg-orange-500/20 text-orange-500';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Estimation History</h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>View all estimation records from PostgreSQL</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate?.('estimation')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            <FileText className="w-4 h-4" />
            New Estimation
          </button>
        </div>
      </div>

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
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bill No.</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customer</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vehicle</th>
                  <th className={`text-right py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amount</th>
                  <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                  <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEstimations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No estimation bills found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredEstimations.map((bill, index) => (
                    <tr
                      key={bill.id || index}
                      className={`border-b ${
                        isDarkMode ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <td className={`py-4 px-4 text-sm font-medium ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {bill.bill_no}
                      </td>
                      <td className={`py-4 px-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {new Date(bill.created_at).toLocaleDateString()}
                      </td>
                      <td className={`py-4 px-4 text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {bill.customer_name}
                      </td>
                      <td className={`py-4 px-4`}>
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {bill.vehicle_model}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {bill.vehicle_number}
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-sm font-semibold text-right ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ₹{parseFloat(bill.total_amount).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          getStatusColor(bill.status)
                        }`}>
                          {getStatusIcon(bill.status)}
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 gap-2">
                          <button
                            onClick={() => handlePrint(bill)}
                            className={`p-2 rounded-lg transition-all hover:scale-110 ${
                              isDarkMode
                                ? 'hover:bg-gray-500/20 text-gray-400 hover:text-gray-300'
                                : 'hover:bg-gray-50 text-gray-600 hover:text-gray-700'
                            }`}
                            title="Print Bill"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
      <UnifiedPrintPreview
        type="bill"
        data={printData}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
