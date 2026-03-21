import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  TrendingUp,
  BarChart3,
  Package,
  AlertCircle,
  Download,
  Printer,
  RefreshCw,
  Grid3x3,
  List,
  Filter,
  UserCheck,
  Wrench,
  User,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { useMasters } from '@/contexts/MastersContext';

interface WorkGroupScreenProps {
  isDarkMode: boolean;
}

interface WorkGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  activeJobs: number;
  category: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export function WorkGroupScreen({ isDarkMode }: WorkGroupScreenProps) {
  const { workGroups, addWorkGroup, updateWorkGroup, deleteWorkGroup, refreshAllMasters } = useMasters();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingGroup, setEditingGroup] = useState<WorkGroup | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Mechanical',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [errors, setErrors] = useState({
    name: false,
    description: false
  });

  const cardClass = `rounded-xl ${
    isDarkMode 
      ? 'bg-gray-800/40 border-gray-700/50' 
      : 'bg-white/60'
  } backdrop-blur-xl border border-white/20 shadow-lg`;

  const inputClass = `px-4 py-2.5 rounded-lg border transition-all outline-none text-sm ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
  }`;

  const primaryButtonClass = `px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2`;

  const categories = ['Mechanical', 'Electrical', 'Body Shop', 'Paint Shop', 'Detailing', 'General'];

  const handleOpenDrawer = (group?: any) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        description: group.description,
        category: group.category || 'Mechanical',
        status: group.status as 'Active' | 'Inactive'
      });
    } else {
      setEditingGroup(null);
      setFormData({
        name: '',
        description: '',
        category: 'Mechanical',
        status: 'Active'
      });
    }
    setErrors({ name: false, description: false });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingGroup(null);
    setFormData({
      name: '',
      description: '',
      category: 'Mechanical',
      status: 'Active'
    });
    setErrors({ name: false, description: false });
  };

  const handleSave = async () => {
    console.log("Work Group Form Data:", formData);
    const newErrors = {
      name: !formData.name.trim(),
      description: !formData.description.trim()
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSaving(true);
    try {
      if (editingGroup) {
        await updateWorkGroup(editingGroup.id, { ...editingGroup, ...formData } as any);
        toast.success('Work group updated successfully');
      } else {
        await addWorkGroup({ id: '', createdAt: '', ...formData, workTypes: [] } as any);
        toast.success('Work group added successfully');
      }
      handleCloseDrawer();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save work group');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this work group?')) {
      try {
        await deleteWorkGroup(id);
        toast.success('Work group deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete work group');
      }
    }
  };

  const filteredGroups = workGroups.filter(group => {
    const matchesSearch = (group.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (group.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || group.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || group.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalMembers = 0; // We don't have this in DB yet
  const totalActiveJobs = 0; // We don't have this in DB yet
  const activeGroups = workGroups.filter(g => g.status === 'Active').length;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Mechanical': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'Electrical': isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600',
      'Body Shop': isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600',
      'Paint Shop': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'Detailing': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'General': isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-50 text-gray-600'
    };
    return colors[category] || colors['General'];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
          }`}>
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Work Group Dashboard</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Manage workshop teams and work groups</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
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
            onClick={() => handleOpenDrawer()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Group
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
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Groups</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{workGroups.length}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>{activeGroups} active teams</p>
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
                isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
              }`}>
                <UserCheck className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +8%
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Members</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{totalMembers}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Across all groups</p>
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
                isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50'
              }`}>
                <Wrench className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex items-center gap-1 text-orange-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +12%
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Active Jobs</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{totalActiveJobs}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>In progress now</p>
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
                isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
              }`}>
                <Target className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Avg. per Group</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{Math.round(totalMembers / workGroups.length)}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Members per team</p>
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
                  placeholder="Search by group name or description..."
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

      {/* Work Groups List */}
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
            }`}>Work Groups</h2>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{filteredGroups.length} results</span>
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
                      }`}>Group Name</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Description</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Category</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Members</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Active Jobs</th>
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
                    {filteredGroups.map((group) => (
                      <tr
                        key={group.id}
                        className={`transition-colors ${
                          isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
                            }`}>
                              <Users className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{group.name}</p>
                              <p className={`text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>Created {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-sm max-w-xs ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <p className="line-clamp-2">{group.description}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            getCategoryColor(group.category)
                          }`}>
                            {group.category}
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
                          <span className={`inline-flex items-center justify-center w-16 h-8 rounded-lg font-bold text-sm ${
                            isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'
                          }`}>
                            0
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            group.status === 'Active'
                              ? isDarkMode
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-green-50 text-green-600'
                              : isDarkMode
                              ? 'bg-gray-500/20 text-gray-400'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {group.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenDrawer(group)}
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
                              onClick={() => handleDelete(group.id)}
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
              {filteredGroups.map((group) => (
                <motion.div
                  key={group.id}
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
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      group.status === 'Active'
                        ? isDarkMode
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-green-50 text-green-600'
                        : isDarkMode
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {group.status}
                    </span>
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{group.name}</h3>
                  <p className={`text-sm mb-3 line-clamp-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{group.description}</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-4 ${
                    getCategoryColor(group.category)
                  }`}>
                    {group.category}
                  </span>
                  <div className="flex items-center justify-between pt-4 border-t ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }">
                    <div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className={`text-xs ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>Members</p>
                          <p className={`text-lg font-bold ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}>0</p>
                        </div>
                        <div>
                          <p className={`text-xs ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>Active Jobs</p>
                          <p className={`text-lg font-bold ${
                            isDarkMode ? 'text-orange-400' : 'text-orange-600'
                          }`}>0</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenDrawer(group)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(group.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Add/Edit Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
            >
              {/* Modal */}
              <motion.div
                className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
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
                        <Users className={`w-5 h-5 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {editingGroup ? 'Edit Work Group' : 'Add New Work Group'}
                        </h2>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {editingGroup ? 'Update group information' : 'Enter new group details'}
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

                {/* Modal Body with Form - Scrollable */}
                <div className="px-6 py-6 max-h-[calc(90vh-180px)] overflow-y-auto">
                  <div className="space-y-5">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Group Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, name: e.target.value }));
                          if (e.target.value.trim()) setErrors(prev => ({ ...prev, name: false }));
                        }}
                        className={`${inputClass} w-full ${errors.name ? '!border-red-500' : ''}`}
                        placeholder="e.g., Engine Specialists"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">Group Name is required</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => {
                          setFormData({ ...formData, description: e.target.value });
                          if (e.target.value.trim()) setErrors(prev => ({ ...prev, description: false }));
                        }}
                        className={`${inputClass} min-h-[100px] resize-none w-full ${errors.description ? '!border-red-500' : ''}`}
                        placeholder="Brief description of the work group"
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">Description is required</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={inputClass}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Status *
                      </label>
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
                  isDarkMode 
                    ? 'bg-gray-800/80 border-gray-700' 
                    : 'bg-white/80 border-gray-200'
                } backdrop-blur-xl`}>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={handleCloseDrawer}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`${primaryButtonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSaving ? 'Saving...' : editingGroup ? 'Update Work Group' : 'Save Work Group'}
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