import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download,
  Printer,
  FileText,
  Calendar,
  Filter,
  Search,
  DollarSign,
  Receipt,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface GSTReportScreenProps {
  isDarkMode: boolean;
}

interface GSTRecord {
  id: string;
  date: string;
  type: 'Sale' | 'Purchase';
  partyName: string;
  invoiceNo: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  totalAmount: number;
}

export function GSTReportScreen({ isDarkMode }: GSTReportScreenProps) {
  const [gstData] = useState<GSTRecord[]>([
    { id: 'GST-001', date: '2024-02-20', type: 'Sale', partyName: 'Rajesh Kumar', invoiceNo: 'SAL-2024-045', taxableAmount: 10593, cgst: 953, sgst: 953, igst: 0, totalGST: 1907, totalAmount: 12500 },
    { id: 'GST-002', date: '2024-02-19', type: 'Purchase', partyName: 'ABC Suppliers', invoiceNo: 'PUR-2024-123', taxableAmount: 50000, cgst: 4500, sgst: 4500, igst: 0, totalGST: 9000, totalAmount: 59000 },
    { id: 'GST-003', date: '2024-02-18', type: 'Sale', partyName: 'Priya Sharma', invoiceNo: 'SAL-2024-044', taxableAmount: 23729, cgst: 2136, sgst: 2136, igst: 0, totalGST: 4271, totalAmount: 28000 },
    { id: 'GST-004', date: '2024-02-17', type: 'Purchase', partyName: 'XYZ Parts Ltd', invoiceNo: 'PUR-2024-122', taxableAmount: 35000, cgst: 0, sgst: 0, igst: 6300, totalGST: 6300, totalAmount: 41300 },
    { id: 'GST-005', date: '2024-02-16', type: 'Sale', partyName: 'Vijay Patel', invoiceNo: 'SAL-2024-043', taxableAmount: 7203, cgst: 648, sgst: 648, igst: 0, totalGST: 1297, totalAmount: 8500 },
    { id: 'GST-006', date: '2024-02-15', type: 'Sale', partyName: 'Anjali Reddy', invoiceNo: 'SAL-2024-042', taxableAmount: 12881, cgst: 1159, sgst: 1159, igst: 0, totalGST: 2319, totalAmount: 15200 },
    { id: 'GST-007', date: '2024-02-14', type: 'Purchase', partyName: 'DEF Industries', invoiceNo: 'PUR-2024-121', taxableAmount: 28000, cgst: 2520, sgst: 2520, igst: 0, totalGST: 5040, totalAmount: 33040 },
    { id: 'GST-008', date: '2024-02-13', type: 'Sale', partyName: 'Suresh Kumar', invoiceNo: 'SAL-2024-041', taxableAmount: 16949, cgst: 1525, sgst: 1525, igst: 0, totalGST: 3051, totalAmount: 20000 },
  ]);

  const calculateTotals = () => {
    return {
      totalTaxable: gstData.reduce((sum, item) => sum + item.taxableAmount, 0),
      totalCGST: gstData.reduce((sum, item) => sum + item.cgst, 0),
      totalSGST: gstData.reduce((sum, item) => sum + item.sgst, 0),
      totalIGST: gstData.reduce((sum, item) => sum + item.igst, 0),
      totalGST: gstData.reduce((sum, item) => sum + item.totalGST, 0),
      totalAmount: gstData.reduce((sum, item) => sum + item.totalAmount, 0),
    };
  };

  const totals = calculateTotals();

  const cardClass = `rounded-xl ${
    isDarkMode 
      ? 'bg-gray-800/40 border-gray-700/50' 
      : 'bg-white/60'
  } backdrop-blur-xl border border-white/20 shadow-lg`;

  const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all outline-none ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
  }`;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>GST Report</h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Complete GST filing report with CGST, SGST, and IGST breakdown</p>
        </div>
      </div>

      {/* Main Layout: Left Filter Panel + Right Report Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Filter Panel */}
        <div className="lg:col-span-3">
          <motion.div
            className={cardClass}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Filters</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Date Range</label>
                  <div className="space-y-2">
                    <input 
                      type="date" 
                      className={inputClass}
                      defaultValue="2024-02-01"
                    />
                    <input 
                      type="date" 
                      className={inputClass}
                      defaultValue="2024-02-29"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Transaction Type</label>
                  <select className={inputClass}>
                    <option value="">All Types</option>
                    <option value="sale">Sales</option>
                    <option value="purchase">Purchases</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>GST Type</label>
                  <select className={inputClass}>
                    <option value="">All GST Types</option>
                    <option value="cgst-sgst">CGST + SGST</option>
                    <option value="igst">IGST</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Search</label>
                  <div className="relative">
                    <Search className={`absolute left-3 top-3 w-4 h-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input 
                      type="text" 
                      placeholder="Party or invoice..."
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg">
                  <Filter className="w-4 h-4" />
                  Apply Filters
                </button>

                <button className={`w-full px-4 py-2.5 rounded-lg border font-medium transition-all ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}>
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Report Table */}
        <div className="col-span-9 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              className={cardClass}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Total Taxable</p>
                    <p className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>₹{totals.totalTaxable.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={cardClass}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Total GST</p>
                    <p className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>₹{totals.totalGST.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className={cardClass}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Total Amount</p>
                    <p className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>₹{totals.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Report Table */}
          <motion.div
            className={cardClass}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileCheck className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h2 className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>GST Returns Report</h2>
                </div>
                <div className="flex items-center gap-3">
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isDarkMode 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}>
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Export PDF</span>
                  </button>
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isDarkMode 
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}>
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export Excel</span>
                  </button>
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isDarkMode 
                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}>
                    <Printer className="w-4 h-4" />
                    <span className="text-sm font-medium">Print</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <th className={`text-left py-3 px-4 text-sm font-semibold ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>ID</th>
                      <th className={`text-left py-3 px-4 text-sm font-semibold ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Date</th>
                      <th className={`text-left py-3 px-4 text-sm font-semibold ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Type</th>
                      <th className={`text-left py-3 px-4 text-sm font-semibold ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Party Name</th>
                      <th className={`text-left py-3 px-4 text-sm font-semibold ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Invoice No.</th>
                      <th className={`text-right py-3 px-4 text-sm font-semibold ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Taxable</th>
                      <th className={`text-right py-3 px-4 text-sm font-semibold ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>CGST</th>
                      <th className={`text-right py-3 px-4 text-sm font-semibold ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>SGST</th>
                      <th className={`text-right py-3 px-4 text-sm font-semibold ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>IGST</th>
                      <th className={`text-right py-3 px-4 text-sm font-semibold ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Total GST</th>
                      <th className={`text-right py-3 px-4 text-sm font-semibold ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstData.map((record) => (
                      <tr 
                        key={record.id}
                        className={`border-b ${
                          isDarkMode ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <td className={`py-3 px-4 text-sm font-medium ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>{record.id}</td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{record.date}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            record.type === 'Sale'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            {record.type}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{record.partyName}</td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{record.invoiceNo}</td>
                        <td className={`py-3 px-4 text-sm text-right ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>₹{record.taxableAmount.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-sm text-right ${
                          isDarkMode ? 'text-orange-400' : 'text-orange-600'
                        }`}>₹{record.cgst.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-sm text-right ${
                          isDarkMode ? 'text-orange-400' : 'text-orange-600'
                        }`}>₹{record.sgst.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-sm text-right ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>₹{record.igst.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-sm font-semibold text-right ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>₹{record.totalGST.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-sm font-bold text-right ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>₹{record.totalAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className={`${
                      isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50 border-gray-300'
                    } border-t-2 font-bold`}>
                      <td colSpan={5} className={`py-3 px-4 text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>TOTAL</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>₹{totals.totalTaxable.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-orange-400' : 'text-orange-600'
                      }`}>₹{totals.totalCGST.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-orange-400' : 'text-orange-600'
                      }`}>₹{totals.totalSGST.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>₹{totals.totalIGST.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>₹{totals.totalGST.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>₹{totals.totalAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}