import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Edit2, Trash2, CheckCircle, XCircle, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

interface FinancialYearScreenProps {
  isDarkMode: boolean;
}

interface FinancialYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Closed' | 'Future';
  isCurrent: boolean;
}

export function FinancialYearScreen({ isDarkMode }: FinancialYearScreenProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<FinancialYear | null>(null);

  // Sample financial years data
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([
    {
      id: 'FY-001',
      year: '2025-26',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      status: 'Active',
      isCurrent: true
    },
    {
      id: 'FY-002',
      year: '2024-25',
      startDate: '2024-04-01',
      endDate: '2025-03-31',
      status: 'Closed',
      isCurrent: false
    },
    {
      id: 'FY-003',
      year: '2023-24',
      startDate: '2023-04-01',
      endDate: '2024-03-31',
      status: 'Closed',
      isCurrent: false
    },
    {
      id: 'FY-004',
      year: '2026-27',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      status: 'Future',
      isCurrent: false
    }
  ]);

  const [formData, setFormData] = useState({
    year: '',
    startDate: '',
    endDate: '',
    status: 'Future'
  });

  const handleAddYear = () => {
    if (!formData.year || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all required fields');
      return;
    }

    const newYear: FinancialYear = {
      id: `FY-${String(financialYears.length + 1).padStart(3, '0')}`,
      year: formData.year,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status as FinancialYear['status'],
      isCurrent: false
    };

    setFinancialYears([...financialYears, newYear]);
    toast.success('Financial year added successfully!');
    setShowAddModal(false);
    setFormData({ year: '', startDate: '', endDate: '', status: 'Future' });
  };

  const handleEditYear = (year: FinancialYear) => {
    setSelectedYear(year);
    setFormData({
      year: year.year,
      startDate: year.startDate,
      endDate: year.endDate,
      status: year.status
    });
    setShowAddModal(true);
  };

  const handleUpdateYear = () => {
    if (!selectedYear) return;

    const updatedYears = financialYears.map(year =>
      year.id === selectedYear.id
        ? { ...year, ...formData }
        : year
    );
    setFinancialYears(updatedYears);
    toast.success('Financial year updated successfully!');
    setShowAddModal(false);
    setSelectedYear(null);
    setFormData({ year: '', startDate: '', endDate: '', status: 'Future' });
  };

  const handleDeleteYear = (yearId: string) => {
    const yearToDelete = financialYears.find(y => y.id === yearId);
    if (yearToDelete?.isCurrent) {
      toast.error('Cannot delete the current financial year');
      return;
    }

    if (confirm('Are you sure you want to delete this financial year?')) {
      setFinancialYears(financialYears.filter(year => year.id !== yearId));
      toast.success('Financial year deleted successfully!');
    }
  };

  const handleSetCurrent = (yearId: string) => {
    const updatedYears = financialYears.map(year => ({
      ...year,
      isCurrent: year.id === yearId,
      status: year.id === yearId ? 'Active' as const : year.status
    }));
    setFinancialYears(updatedYears);
    toast.success('Current financial year updated!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
      case 'Closed': return isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700';
      case 'Future': return isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      default: return isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  const currentYear = financialYears.find(y => y.isCurrent);

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Calendar className={`w-8 h-8 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Financial Year Management
                </h1>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Configure and manage financial years for your business
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedYear(null);
                setFormData({ year: '', startDate: '', endDate: '', status: 'Future' });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Financial Year
            </motion.button>
          </div>
        </motion.div>

        {/* Current Financial Year Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`rounded-2xl border backdrop-blur-xl p-6 ${
            isDarkMode
              ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-700'
              : 'bg-gradient-to-br from-blue-50/80 to-blue-100/80 border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className={`w-5 h-5 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} />
                <span className={`text-sm font-semibold ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  Current Financial Year
                </span>
              </div>
              <h2 className={`text-4xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                FY {currentYear?.year || '2025-26'}
              </h2>
              <p className={`text-sm mt-2 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                {currentYear ? `${new Date(currentYear.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} - ${new Date(currentYear.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'April 1, 2025 - March 31, 2026'}
              </p>
            </div>
            <div className={`p-4 rounded-full ${
              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-200'
            }`}>
              <Calendar className={`w-12 h-12 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
        </motion.div>

        {/* Financial Years Table */}
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
                    Year ID
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Financial Year
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Start Date
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    End Date
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Current
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {financialYears.map((year, index) => (
                  <motion.tr
                    key={year.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`transition-colors ${
                      isDarkMode
                        ? 'hover:bg-gray-700/30'
                        : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {year.id}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      FY {year.year}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {new Date(year.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {new Date(year.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusColor(year.status)}`}>
                        {year.status === 'Active' && <CheckCircle className="w-3 h-3" />}
                        {year.status === 'Closed' && <Lock className="w-3 h-3" />}
                        {year.status === 'Future' && <Calendar className="w-3 h-3" />}
                        {year.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {year.isCurrent ? (
                        <span className={`flex items-center gap-1 text-sm font-semibold ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>
                          <CheckCircle className="w-4 h-4" />
                          Yes
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetCurrent(year.id)}
                          className={`text-sm font-medium transition-colors ${
                            isDarkMode
                              ? 'text-blue-400 hover:text-blue-300'
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          Set as Current
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditYear(year)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-blue-500/20 text-blue-400'
                              : 'hover:bg-blue-100 text-blue-600'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteYear(year.id)}
                          disabled={year.isCurrent}
                          className={`p-2 rounded-lg transition-colors ${
                            year.isCurrent
                              ? 'opacity-50 cursor-not-allowed'
                              : isDarkMode
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
                Total Financial Years
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {financialYears.length}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Year
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {financialYears.filter(y => y.status === 'Active').length}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Closed Years
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {financialYears.filter(y => y.status === 'Closed').length}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Future Years
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {financialYears.filter(y => y.status === 'Future').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddModal(false);
              setSelectedYear(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl border backdrop-blur-xl p-6 w-full max-w-2xl ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedYear ? 'Edit Financial Year' : 'Add Financial Year'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedYear(null);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Financial Year */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Financial Year *
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="e.g., 2025-26"
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      isDarkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      isDarkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="Future">Future</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      isDarkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      isDarkMode
                        ? 'bg-gray-900/50 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedYear(null);
                  }}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={selectedYear ? handleUpdateYear : handleAddYear}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {selectedYear ? 'Update' : 'Add'} Financial Year
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
