import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Plus, 
  Trash2, 
  FileText,
  Search,
  Filter,
  Download,
  Users,
  Calculator,
  Calendar,
  DollarSign,
  CheckCircle,
  X
} from 'lucide-react';

interface SalaryScreenProps {
  isDarkMode: boolean;
}

interface StaffSalary {
  id: string;
  staffName: string;
  designation: string;
  basicSalary: number;
  hra: number;
  allowances: number;
  overtime: number;
  advance: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Pending' | 'Processing';
}

export function SalaryScreen({ isDarkMode }: SalaryScreenProps) {
  const [salaryMonth, setSalaryMonth] = useState('2024-02');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDesignation, setFilterDesignation] = useState<string>('all');
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<StaffSalary | null>(null);
  
  const [staffSalaries] = useState<StaffSalary[]>([
    { id: 'EMP-001', staffName: 'Ramesh Singh', designation: 'Senior Mechanic', basicSalary: 25000, hra: 5000, allowances: 3000, overtime: 2000, advance: 5000, deductions: 1000, netSalary: 29000, status: 'Paid' },
    { id: 'EMP-002', staffName: 'Priya Sharma', designation: 'Accountant', basicSalary: 30000, hra: 6000, allowances: 4000, overtime: 0, advance: 10000, deductions: 1500, netSalary: 28500, status: 'Paid' },
    { id: 'EMP-003', staffName: 'Vijay Kumar', designation: 'Helper', basicSalary: 15000, hra: 3000, allowances: 2000, overtime: 1500, advance: 0, deductions: 500, netSalary: 21000, status: 'Processing' },
    { id: 'EMP-004', staffName: 'Anita Desai', designation: 'Workshop Manager', basicSalary: 40000, hra: 8000, allowances: 5000, overtime: 0, advance: 12000, deductions: 2000, netSalary: 39000, status: 'Paid' },
    { id: 'EMP-005', staffName: 'Suresh Patel', designation: 'Supervisor', basicSalary: 28000, hra: 5600, allowances: 3500, overtime: 1000, advance: 15000, deductions: 1200, netSalary: 21900, status: 'Pending' },
    { id: 'EMP-006', staffName: 'Karthik Reddy', designation: 'Mechanic', basicSalary: 22000, hra: 4400, allowances: 2500, overtime: 1800, advance: 0, deductions: 800, netSalary: 29900, status: 'Paid' },
    { id: 'EMP-007', staffName: 'Neha Gupta', designation: 'Receptionist', basicSalary: 18000, hra: 3600, allowances: 2000, overtime: 500, advance: 0, deductions: 600, netSalary: 23500, status: 'Processing' },
    { id: 'EMP-008', staffName: 'Arun Kumar', designation: 'Helper', basicSalary: 14000, hra: 2800, allowances: 1500, overtime: 2000, advance: 8000, deductions: 400, netSalary: 11900, status: 'Pending' },
  ]);

  const cardClass = `rounded-xl ${
    isDarkMode 
      ? 'bg-gray-800/40 border-gray-700/50' 
      : 'bg-white/60'
  } backdrop-blur-xl border border-white/20 shadow-lg`;

  const calculateTotals = () => {
    return {
      totalBasic: staffSalaries.reduce((sum, s) => sum + s.basicSalary, 0),
      totalHRA: staffSalaries.reduce((sum, s) => sum + s.hra, 0),
      totalAllowances: staffSalaries.reduce((sum, s) => sum + s.allowances, 0),
      totalOvertime: staffSalaries.reduce((sum, s) => sum + s.overtime, 0),
      totalAdvance: staffSalaries.reduce((sum, s) => sum + s.advance, 0),
      totalDeductions: staffSalaries.reduce((sum, s) => sum + s.deductions, 0),
      totalNet: staffSalaries.reduce((sum, s) => sum + s.netSalary, 0),
    };
  };

  const totals = calculateTotals();

  // Filter salaries based on selected filters
  const filteredSalaries = staffSalaries.filter(salary => {
    const statusMatch = filterStatus === 'all' || salary.status === filterStatus;
    const designationMatch = filterDesignation === 'all' || salary.designation === filterDesignation;
    return statusMatch && designationMatch;
  });

  // Calculate totals for filtered data
  const filteredTotals = {
    totalBasic: filteredSalaries.reduce((sum, s) => sum + s.basicSalary, 0),
    totalHRA: filteredSalaries.reduce((sum, s) => sum + s.hra, 0),
    totalAllowances: filteredSalaries.reduce((sum, s) => sum + s.allowances, 0),
    totalOvertime: filteredSalaries.reduce((sum, s) => sum + s.overtime, 0),
    totalAdvance: filteredSalaries.reduce((sum, s) => sum + s.advance, 0),
    totalDeductions: filteredSalaries.reduce((sum, s) => sum + s.deductions, 0),
    totalNet: filteredSalaries.reduce((sum, s) => sum + s.netSalary, 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Salary Management</h1>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Process and manage staff salaries</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Total Staff</p>
                <p className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{staffSalaries.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Paid</p>
                <p className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{staffSalaries.filter(s => s.status === 'Paid').length}</p>
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
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Pending</p>
                <p className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>{staffSalaries.filter(s => s.status === 'Pending').length}</p>
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
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Total Payroll</p>
                <p className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>₹{totals.totalNet.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Salary Table with Filters */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calculator className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Monthly Salary Sheet</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-700/50 border-gray-600' 
                  : 'bg-white border-gray-200'
              }`}>
                <Calendar className={`w-4 h-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="month"
                  value={salaryMonth}
                  onChange={(e) => setSalaryMonth(e.target.value)}
                  className={`bg-transparent outline-none text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                />
              </div>
              <button 
                onClick={() => setFilterModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter</span>
              </button>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isDarkMode 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}>
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export Excel</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl">
                <Plus className="w-4 h-4" />
                <span className="text-sm">Process All</span>
              </button>
            </div>
          </div>

          {/* Scrollable Table Container with Fixed Header */}
          <div className={`border rounded-lg overflow-hidden ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  {/* Fixed Header */}
                  <thead className={`sticky top-0 z-10 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <tr className={`border-b ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <th className={`text-left py-3 px-4 text-xs font-semibold whitespace-nowrap ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Staff ID</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold whitespace-nowrap ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Name</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold whitespace-nowrap ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Designation</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold whitespace-nowrap ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Basic</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold whitespace-nowrap ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>HRA</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold whitespace-nowrap ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Allowances</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold whitespace-nowrap ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Overtime</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold whitespace-nowrap ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Advance</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold whitespace-nowrap ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Deductions</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold whitespace-nowrap ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Net Salary</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold whitespace-nowrap ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Status</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold whitespace-nowrap ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Actions</th>
                    </tr>
                  </thead>
                  {/* Scrollable Body */}
                  <tbody>
                    {filteredSalaries.map((staff, index) => (
                      <tr 
                        key={staff.id}
                        className={`border-b ${
                          isDarkMode ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <td className={`py-3 px-4 text-sm font-medium whitespace-nowrap ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>{staff.id}</td>
                        <td className={`py-3 px-4 text-sm font-medium whitespace-nowrap ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{staff.staffName}</td>
                        <td className={`py-3 px-4 text-sm whitespace-nowrap ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{staff.designation}</td>
                        <td className={`py-3 px-4 text-sm text-right whitespace-nowrap ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>₹{staff.basicSalary.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-sm text-right whitespace-nowrap ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>₹{staff.hra.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-sm text-right whitespace-nowrap ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>₹{staff.allowances.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-sm text-right whitespace-nowrap ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>₹{staff.overtime.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-sm text-right whitespace-nowrap ${
                          isDarkMode ? 'text-orange-400' : 'text-orange-600'
                        }`}>₹{staff.advance.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-sm text-right whitespace-nowrap ${
                          isDarkMode ? 'text-red-400' : 'text-red-600'
                        }`}>₹{staff.deductions.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-sm font-bold text-right whitespace-nowrap ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>₹{staff.netSalary.toLocaleString()}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            staff.status === 'Paid'
                              ? 'bg-green-500/20 text-green-500'
                              : staff.status === 'Processing'
                              ? 'bg-blue-500/20 text-blue-500'
                              : 'bg-orange-500/20 text-orange-500'
                          }`}>
                            {staff.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button className={`p-1.5 rounded-lg transition-all ${
                              isDarkMode 
                                ? 'hover:bg-green-500/20 text-green-400' 
                                : 'hover:bg-green-50 text-green-600'
                            }`} title="Process Salary">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button className={`p-1.5 rounded-lg transition-all ${
                              isDarkMode 
                                ? 'hover:bg-blue-500/20 text-blue-400' 
                                : 'hover:bg-blue-50 text-blue-600'
                            }`} title="View Details" onClick={() => { setSelectedSalary(staff); setViewDetailsModalOpen(true); }}>
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className={`${
                      isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50 border-gray-300'
                    } border-t-2 font-bold`}>
                      <td colSpan={3} className={`py-3 px-4 text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>TOTAL</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>₹{filteredTotals.totalBasic.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>₹{filteredTotals.totalHRA.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>₹{filteredTotals.totalAllowances.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>₹{filteredTotals.totalOvertime.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-orange-400' : 'text-orange-600'
                      }`}>₹{filteredTotals.totalAdvance.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-red-400' : 'text-red-600'
                      }`}>₹{filteredTotals.totalDeductions.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-sm text-right ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>₹{filteredTotals.totalNet.toLocaleString()}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Modal */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-md rounded-2xl shadow-2xl ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div>
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Filter Salary Records</h2>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Filter by status and designation</p>
              </div>
              <button
                onClick={() => setFilterModalOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Payment Status</label>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`w-full px-4 py-2.5 h-12 rounded-lg border transition-all outline-none text-sm ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/20'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Designation</label>
                <select 
                  value={filterDesignation}
                  onChange={(e) => setFilterDesignation(e.target.value)}
                  className={`w-full px-4 py-2.5 h-12 rounded-lg border transition-all outline-none text-sm ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:bg-gray-700 focus:ring-2 focus:ring-blue-500/20'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
                  }`}
                >
                  <option value="all">All Designations</option>
                  <option value="Senior Mechanic">Senior Mechanic</option>
                  <option value="Mechanic">Mechanic</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Helper">Helper</option>
                  <option value="Workshop Manager">Workshop Manager</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-between p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterDesignation('all');
                }}
                className={`flex items-center gap-2 px-6 py-2.5 h-12 rounded-xl border text-sm font-medium transition-all ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                Clear Filters
              </button>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="flex items-center gap-2 px-6 py-2.5 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsModalOpen && selectedSalary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div>
                <h2 className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Salary Details for {selectedSalary.staffName}</h2>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Month: {salaryMonth}</p>
              </div>
              <button
                onClick={() => setViewDetailsModalOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Basic Salary</label>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>₹{selectedSalary.basicSalary.toLocaleString()}</p>
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>HRA</label>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>₹{selectedSalary.hra.toLocaleString()}</p>
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Allowances</label>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>₹{selectedSalary.allowances.toLocaleString()}</p>
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Overtime</label>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>₹{selectedSalary.overtime.toLocaleString()}</p>
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Advance</label>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>₹{selectedSalary.advance.toLocaleString()}</p>
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Deductions</label>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>₹{selectedSalary.deductions.toLocaleString()}</p>
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Net Salary</label>
                  <p className={`text-sm font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>₹{selectedSalary.netSalary.toLocaleString()}</p>
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Status</label>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    selectedSalary.status === 'Paid'
                      ? 'bg-green-500/20 text-green-500'
                      : selectedSalary.status === 'Processing'
                      ? 'bg-blue-500/20 text-blue-500'
                      : 'bg-orange-500/20 text-orange-500'
                  }`}>
                    {selectedSalary.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-between p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setViewDetailsModalOpen(false)}
                className="flex items-center gap-2 px-6 py-2.5 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
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