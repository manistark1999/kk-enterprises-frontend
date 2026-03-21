import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car,
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
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  FORM_CONSTANTS,
  getCardClass,
  getInputClass,
  getInputClassWithValidation,
  getLabelClass,
  renderLabel,
  getPrimaryButtonClass,
  getSecondaryButtonClass,
  isFieldEmpty
} from '@/utils/formStyles';
import { useMasters, VehicleMake as VehicleMakeType } from '@/contexts/MastersContext';

interface VehicleMakeScreenProps {
  isDarkMode: boolean;
}

// Local interface for screen display (extends context type)
interface VehicleMake extends VehicleMakeType {
  vehicleCount?: number;
  addedDate?: string;
}

export function VehicleMakeScreenEnhanced({ isDarkMode }: VehicleMakeScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMake, setEditingMake] = useState<VehicleMake | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  
  // Model management state
  const [models, setModels] = useState<string[]>([]);
  const [newModelName, setNewModelName] = useState('');
  const [editingModelIndex, setEditingModelIndex] = useState<number | null>(null);
  const [editingModelValue, setEditingModelValue] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const cardClass = getCardClass(isDarkMode);
  const inputClass = getInputClass(isDarkMode);
  const labelClass = getLabelClass(isDarkMode);
  const primaryButtonClass = getPrimaryButtonClass();
  const secondaryButtonClass = getSecondaryButtonClass(isDarkMode);

  const { vehicleMakes, addVehicleMake, updateVehicleMake, deleteVehicleMake, refreshAllMasters, isLoading } = useMasters();

  const handleOpenDrawer = (make?: VehicleMake) => {
    if (make) {
      setEditingMake(make);
      setFormData({
        name: make.name, // make.name comes from context/API
        country: make.country || '',
        status: (make.status === 'Active' ? 'Active' : 'Inactive') as 'Active' | 'Inactive'
      });
      setModels([...make.models]); // Copy models array
    } else {
      setEditingMake(null);
      setFormData({
        name: '',
        country: '',
        status: 'Active'
      });
      setModels([]);
    }
    setNewModelName('');
    setEditingModelIndex(null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingMake(null);
    setFormData({
      name: '',
      country: '',
      status: 'Active'
    });
    setModels([]);
    setNewModelName('');
    setEditingModelIndex(null);
  };

  // Add new model to the list
  const handleAddModel = () => {
    if (!newModelName.trim()) {
      toast.error('Please enter a model name');
      return;
    }

    // Check for duplicate model names
    if (models.some(model => model.toLowerCase() === newModelName.trim().toLowerCase())) {
      toast.error('This model already exists');
      return;
    }

    setModels([...models, newModelName.trim()]);
    setNewModelName('');
    toast.success('Model added successfully');
  };

  // Start editing a model
  const handleStartEditModel = (index: number) => {
    setEditingModelIndex(index);
    setEditingModelValue(models[index]);
  };

  // Save edited model
  const handleSaveEditedModel = (index: number) => {
    if (!editingModelValue.trim()) {
      toast.error('Model name cannot be empty');
      return;
    }

    // Check for duplicate (excluding current)
    if (models.some((model, i) => 
      i !== index && model.toLowerCase() === editingModelValue.trim().toLowerCase()
    )) {
      toast.error('This model already exists');
      return;
    }

    const updatedModels = [...models];
    updatedModels[index] = editingModelValue.trim();
    setModels(updatedModels);
    setEditingModelIndex(null);
    setEditingModelValue('');
    toast.success('Model updated successfully');
  };

  // Cancel editing model
  const handleCancelEditModel = () => {
    setEditingModelIndex(null);
    setEditingModelValue('');
  };

  // Remove model from the list
  const handleRemoveModel = (index: number) => {
    setModels(models.filter((_, i) => i !== index));
    toast.success('Model removed successfully');
  };

  const handleSave = () => {
    console.log("FORM DATA BEFORE SAVE:", formData);
    console.log("MODELS BEFORE SAVE:", models);

    if (!formData.name.trim()) {
      toast.error('Make name is required');
      return;
    }
    
    if (!formData.country.trim()) {
      toast.error('Country is required');
      return;
    }

    if (models.length === 0) {
      toast.error('Please add at least one vehicle model');
      return;
    }

    const savePromise = editingMake 
      ? updateVehicleMake(editingMake.id, {
          ...editingMake,
          name: formData.name.trim(),
          country: formData.country.trim(),
          status: formData.status,
          models: models
        })
      : addVehicleMake({
          id: '',
          name: formData.name.trim(),
          country: formData.country.trim(),
          models: models,
          status: formData.status,
          createdAt: ''
        });

    toast.promise(savePromise, {
      loading: editingMake ? 'Updating vehicle make...' : 'Adding vehicle make...',
      success: () => {
        handleCloseDrawer();
        return editingMake 
          ? 'Vehicle make and models updated successfully!' 
          : 'Vehicle make and models added successfully!';
      },
      error: (err) => err.message || 'Failed to save vehicle make'
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle make?')) {
      toast.promise(deleteVehicleMake(id), {
        loading: 'Deleting vehicle make...',
        success: 'Vehicle make deleted successfully!',
        error: 'Failed to delete vehicle make'
      });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const headers = ['Make Name', 'Country', 'Models', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredMakes.map(make => [
        `"${make.name}"`,
        `"${make.country}"`,
        `"${make.models.join(', ')}"`,
        make.status,
        make.createdAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vehicle-makes-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Vehicle makes data exported successfully!');
  };

  const filteredMakes = vehicleMakes.filter(make => {
    const matchesSearch = (make.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (make.country || '').toLowerCase().includes(searchTerm.toLowerCase());
    const makeStatus = make.status;
    const matchesStatus = filterStatus === 'All' || makeStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalVehicles = 0;
  const activeMakes = vehicleMakes.filter(m => m.status === 'Active').length;
  const totalModels = vehicleMakes.reduce((sum, make) => sum + make.models.length, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
          }`}>
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Vehicle Make & Model Management</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Manage vehicle manufacturers and their models</p>
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
            Add Vehicle Make
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
                <Car className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Makes</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{vehicleMakes.length}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>{activeMakes} active brands</p>
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
                <Package className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Models</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{totalModels}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Across all makes</p>
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
                isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
              }`}>
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Avg. Models per Make</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{vehicleMakes.length > 0 ? Math.round(totalModels / vehicleMakes.length) : 0}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Models per brand</p>
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
                <BarChart3 className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Top Make</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{vehicleMakes.length > 0 ? vehicleMakes.reduce((max, make) => 
              make.models.length > max.models.length ? make : max
            ).name.substring(0, 10) : 'N/A'}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Most models</p>
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
                  placeholder="Search by make name or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10 w-full`}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className={`w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className={inputClass}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

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

      {/* Vehicle Makes Table */}
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
            }`}>Vehicle Makes & Models</h2>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{filteredMakes.length} results</span>
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
                      }`}>Make Name</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Country</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Vehicle Models</th>
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
                    {filteredMakes.map((make) => (
                      <tr
                        key={make.id}
                        className={`transition-colors ${
                          isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
                            }`}>
                              <Car className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{make.name}</p>
                              <p className={`text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>{make.models.length} models</p>
                            </div>
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{make.country || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {make.models.slice(0, 4).map((model, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded-full text-xs ${
                                  isDarkMode
                                    ? 'bg-gray-700 text-gray-300'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {model}
                              </span>
                            ))}
                            {make.models.length > 4 && (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                isDarkMode
                                  ? 'bg-gray-700 text-gray-400'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                +{make.models.length - 4}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            make.status === 'Active'
                              ? isDarkMode
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-green-50 text-green-600'
                              : isDarkMode
                              ? 'bg-gray-500/20 text-gray-400'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {make.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenDrawer(make)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode
                                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              }`}
                              title="Edit Make & Models"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(make.id)}
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
              {filteredMakes.map((make) => (
                <motion.div
                  key={make.id}
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
                      <Car className="w-6 h-6 text-blue-500" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      make.status === 'Active'
                        ? isDarkMode
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-green-50 text-green-600'
                        : isDarkMode
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {make.status}
                    </span>
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{make.name}</h3>
                  <p className={`text-sm mb-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{make.country || 'N/A'} • {make.models.length} models</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {make.models.slice(0, 4).map((model, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-full text-xs ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {model}
                      </span>
                    ))}
                    {make.models.length > 4 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        isDarkMode
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        +{make.models.length - 4} more
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center justify-end gap-2 pt-4 border-t ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <button
                      onClick={() => handleOpenDrawer(make)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(make.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
            />

            {/* Drawer */}
            <motion.div
              className={`fixed right-0 top-0 h-full w-full md:w-[600px] z-50 shadow-2xl overflow-y-auto ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Drawer Header */}
              <div className={`sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {editingMake ? 'Edit Vehicle Make' : 'Add Vehicle Make'}
                    </h2>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {editingMake ? 'Update make and model information' : 'Create new vehicle make and add models'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseDrawer}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6">
                {/* Make Information Section */}
                <div>
                  <h3 className={`text-lg font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Make Information</h3>

                  <div className="space-y-4">
                    {/* Make Name */}
                    <div>
                      {renderLabel('Make Name', true, isDarkMode, isFieldEmpty(formData.name))}
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={getInputClassWithValidation(isDarkMode, isFieldEmpty(formData.name))}
                        placeholder="e.g., Tata Motors"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      {renderLabel('Country of Origin', true, isDarkMode, isFieldEmpty(formData.country))}
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className={getInputClassWithValidation(isDarkMode, isFieldEmpty(formData.country))}
                        placeholder="e.g., India"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className={labelClass}>
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className={inputClass}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />

                {/* Vehicle Models Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Vehicle Models <span className="text-red-500">*</span></h3>
                    <span className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{models.length} models</span>
                  </div>

                  {/* Add New Model */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddModel()}
                      className={`${inputClass} flex-1`}
                      placeholder="Enter model name (e.g., 407, 1613, Signa 2823)"
                    />
                    <button
                      onClick={handleAddModel}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {/* Models List */}
                  {models.length > 0 ? (
                    <div className={`border rounded-lg p-4 space-y-2 max-h-[400px] overflow-y-auto ${
                      isDarkMode ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'
                    }`}>
                      {models.map((model, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 p-3 rounded-lg ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                          }`}
                        >
                          {editingModelIndex === index ? (
                            <>
                              <input
                                type="text"
                                value={editingModelValue}
                                onChange={(e) => setEditingModelValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSaveEditedModel(index)}
                                className={`${inputClass} flex-1`}
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveEditedModel(index)}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEditModel}
                                className={`p-2 rounded-lg ${
                                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                }`}
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className={`flex-1 text-sm font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {model}
                              </span>
                              <button
                                onClick={() => handleStartEditModel(index)}
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
                                onClick={() => handleRemoveModel(index)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDarkMode
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                }`}
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-300'
                    }`}>
                      <Package className={`w-12 h-12 mx-auto mb-3 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        No models added yet. Add at least one model to continue.
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCloseDrawer}
                    className={secondaryButtonClass}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className={primaryButtonClass}
                  >
                    <Save className="w-4 h-4" />
                    {editingMake ? 'Update Make & Models' : 'Create Make & Models'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
