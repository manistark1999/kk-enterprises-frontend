import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  TrendingUp,
  BarChart3,
  DollarSign,
  AlertCircle,
  Download,
  Printer,
  RefreshCw,
  Grid3x3,
  List,
  Filter,
  Clock,
  Target,
  Activity,
  Settings,
  Save
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
import { useMasters, WorkType } from '@/contexts/MastersContext';

interface WorkTypeScreenProps {
  isDarkMode: boolean;
}

export function WorkTypeScreen({ isDarkMode }: WorkTypeScreenProps) {
  const { workTypes, addWorkType, updateWorkType, deleteWorkType } = useMasters();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingType, setEditingType] = useState<WorkType | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Mechanical',
    duration: '',
    avgPrice: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [errors, setErrors] = useState({
    name: false,
    duration: false,
    description: false,
    category: false,
    avgPrice: false,
    status: false
  });

  const cardClass = getCardClass(isDarkMode);
  const inputClass = getInputClass(isDarkMode);
  const labelClass = getLabelClass(isDarkMode);
  const primaryButtonClass = getPrimaryButtonClass();
  const secondaryButtonClass = getSecondaryButtonClass(isDarkMode);

  const categories = ['Mechanical', 'Electrical', 'Body Work', 'Paint Work', 'Detailing', 'Diagnostics', 'General'];

  const handleOpenDrawer = (type?: any) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.workTypeName || type.name || '',
        description: type.description || '',
        category: type.category || 'Mechanical',
        duration: type.avgDuration || type.duration || '',
        avgPrice: (type.avgPrice || 0).toString(),
        status: (type.status as any) || 'Active'
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        description: '',
        category: 'Mechanical',
        duration: '',
        avgPrice: '',
        status: 'Active'
      });
    }
    setErrors({ 
      name: false, 
      duration: false, 
      description: false, 
      category: false, 
      avgPrice: false, 
      status: false 
    });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      category: 'Mechanical',
      duration: '',
      avgPrice: '',
      status: 'Active'
    });
    setErrors({ 
      name: false, 
      duration: false, 
      description: false, 
      category: false, 
      avgPrice: false, 
      status: false 
    });
  };

  const handleSave = async () => {
    // Debugging current form state
    console.log("Work Type formData:", formData);

    const newErrors = {
      name: !formData.name.trim(),
      description: !formData.description.trim(),
      category: !formData.category,
      duration: !String(formData.duration).trim(),
      avgPrice: !String(formData.avgPrice).trim(),
      status: !formData.status
    };
    
    setErrors(newErrors as any);
    
    // Check if any required field is missing
    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSaving(true);
    try {
      // Construction of payload matching WorkType interface
      const typeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        duration: formData.duration, 
        avgPrice: parseFloat(formData.avgPrice) || 0,
        status: formData.status
      };

      console.log("Work Type payload sent to context:", typeData);

      if (editingType) {
        await updateWorkType(editingType.id, { ...typeData, id: editingType.id } as any);
        toast.success('Work type updated successfully!');
      } else {
        await addWorkType(typeData as any);
        toast.success('New work type added successfully!');
      }
      handleCloseDrawer();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save work type');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this work type?')) {
      try {
        await deleteWorkType(id);
        toast.success('Work type deleted successfully!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete work type');
      }
    }
  };

  const filteredTypes = workTypes.filter(type => {
    const fieldName = type.workTypeName || type.name || '';
    const fieldDesc = type.description || '';
    const matchesSearch = fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fieldDesc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || type.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || type.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalJobsCompleted = 0; // Not in DB yet
  const avgPopularity = 0; // Not in DB yet
  const activeTypes = workTypes.filter(t => t.status === 'Active').length;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Mechanical': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'Electrical': isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600',
      'Body Work': isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600',
      'Paint Work': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'Detailing': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'Diagnostics': isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600',
      'General': isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-50 text-gray-600'
    };
    return colors[category] || colors['General'];
  };

  const getPopularityColor = (score: number) => {
    if (score >= 85) return isDarkMode ? 'text-green-400' : 'text-green-600';
    if (score >= 70) return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
    return isDarkMode ? 'text-orange-400' : 'text-orange-600';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Convert work types data to CSV format
    const headers = ['Work Type Name', 'Description', 'Category', 'Avg Duration', 'Avg Price', 'Popularity Score', 'Jobs Completed', 'Status', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...filteredTypes.map(type => [
        `"${type.workTypeName || type.name || ''}"`,
        `"${(type.description || '').replace(/"/g, '""')}"`,
        `"${type.category}"`,
        `"${type.avgDuration || type.duration || ''}"`,
        type.avgPrice || 0,
        0,
        0,
        type.status,
        type.createdAt ? new Date(type.createdAt).toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `work-types-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Work types data exported successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
          }`}>
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Work Type Dashboard</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Manage service types and job categories</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
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
          <button
            onClick={handleExport}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => handleOpenDrawer()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Work Type
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
              }`}>
                <Settings className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Work Types</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{workTypes.length}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>{activeTypes} active services</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
              }`}>
                <Target className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +15%
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Jobs Completed</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{totalJobsCompleted}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Across all types</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
              }`}>
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Avg. Popularity</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{avgPopularity}%</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Customer demand score</p>
          </div>
        </motion.div>

        <motion.div
          className={cardClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50'
              }`}>
                <DollarSign className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Top Service</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Oil Change</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>320 jobs completed</p>
          </div>
        </motion.div>
      </div>

      {/* Search & Filter Bar */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search by work type name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10 w-full`}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={inputClass}
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={inputClass}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Work Types List */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Work Types</h2>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{filteredTypes.length} results</span>
          </div>

          {viewMode === 'table' ? (
            <div className={`border rounded-lg overflow-hidden ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <tr className={`border-b ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Work Type</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Category</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Duration</th>
                      <th className={`text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Avg. Price</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Popularity</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Jobs Done</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Status</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                  }`}>
                    {filteredTypes.map((type) => (
                      <tr
                        key={type.id}
                        className={`transition-colors ${
                          isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
                            }`}>
                              <Wrench className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{type.workTypeName || type.name}</p>
                              <p className={`text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>{type.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            getCategoryColor(type.category)
                          }`}>
                            {type.category}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-center text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4" />
                            {type.avgDuration || type.duration}
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-right text-sm font-semibold ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>₹{type.avgPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold text-sm ${0 >= 85 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-yellow-400' : 'text-yellow-600')}`}>
                            0%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-16 h-8 rounded-lg font-bold text-sm ${
                            isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                          }`}>
                            0
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            type.status === 'Active'
                              ? isDarkMode
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-green-50 text-green-600'
                              : isDarkMode
                              ? 'bg-gray-500/20 text-gray-400'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {type.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenDrawer(type)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode
                                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              }`}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(type.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTypes.map((type) => (
                <motion.div
                  key={type.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isDarkMode
                      ? 'bg-gray-700/30 border-gray-600 hover:border-blue-500'
                      : 'bg-white border-gray-200 hover:border-blue-500'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
                    }`}>
                      <Wrench className="w-6 h-6 text-blue-500" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      type.status === 'Active'
                        ? isDarkMode
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-green-50 text-green-600'
                        : isDarkMode
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {type.status}
                    </span>
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{type.workTypeName || type.name}</h3>
                  <p className={`text-sm mb-3 line-clamp-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{type.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      getCategoryColor(type.category)
                    }`}>
                      {type.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Clock className="w-3 h-3 inline mr-1" />
                      {type.avgDuration || type.duration}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between pt-4 border-t ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>Avg. Price</p>
                      <p className={`text-lg font-bold ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>₹{type.avgPrice.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>Jobs: 0</p>
                      <p className={`font-bold ${0 >= 85 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-yellow-400' : 'text-yellow-600')}`}>
                        0%
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleOpenDrawer(type)}
                      className={`flex-1 p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <Edit2 className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      className={`flex-1 p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit/Add Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
            >
              {/* Modal */}
              <motion.div
                className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
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
                        <Wrench className={`w-5 h-5 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {editingType ? 'Edit Work Type' : 'Add New Work Type'}
                        </h2>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {editingType ? 'Update service information' : 'Enter new service details'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseDrawer}
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
                      <label className={labelClass}>
                        Work Type Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (e.target.value.trim()) setErrors(prev => ({ ...prev, name: false }));
                        }}
                        className={`${inputClass} ${errors.name ? '!border-red-500' : ''}`}
                        placeholder="e.g., Oil Change, Brake Service"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">Work Type Name is required</p>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <label className={labelClass}>Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={`${inputClass} min-h-[100px] resize-none`}
                        rows={3}
                        placeholder="Brief description of the service"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={inputClass}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Average Duration <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => {
                          setFormData({ ...formData, duration: e.target.value });
                          if (e.target.value.trim()) setErrors(prev => ({ ...prev, duration: false }));
                        }}
                        className={`${inputClass} ${errors.duration ? '!border-red-500' : ''}`}
                        placeholder="e.g., 2-3 hrs, 30 mins"
                      />
                      {errors.duration && (
                        <p className="text-red-500 text-sm mt-1">Average Duration is required</p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>Average Price (₹) *</label>
                      <input
                        type="number"
                        value={formData.avgPrice}
                        onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                        className={inputClass}
                        placeholder="e.g., 1200"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Status *</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                        className={inputClass}
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
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={handleCloseDrawer}
                      className={secondaryButtonClass}
                    >
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`${primaryButtonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : editingType ? 'Update Work Type' : 'Save Work Type'}
                    </button>
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
