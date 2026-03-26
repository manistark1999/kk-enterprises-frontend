import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CircleDot,
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
  Star,
  Award,
  ShoppingBag,
  Layers
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
import { useMasters, Brand } from '@/contexts/MastersContext';
import { useAuth } from '@/contexts/AuthContext';

interface BrandScreenProps {
  isDarkMode: boolean;
}

export function BrandScreen({ isDarkMode }: BrandScreenProps) {
  const { canCreate, canEdit, canDelete, canPrint, canExport } = useAuth();
  const { brands, addBrand, updateBrand, deleteBrand } = useMasters();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    category: 'Parts & Spares',
    origin: '',
    description: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [errors, setErrors] = useState({
    name: false,
    manufacturer: false
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close modal
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
      // Ctrl/Cmd + N to add new
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !isModalOpen) {
        e.preventDefault();
        handleOpenModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

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

  const categories = [
    'Parts & Spares',
    'Oils & Lubricants',
    'Tyres & Wheels',
    'Electrical',
    'Body Parts',
    'Tools & Equipment',
    'Chemicals',
    'Batteries',
    'Filters',
    'General'
  ];

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        manufacturer: brand.manufacturer,
        category: brand.category,
        origin: brand.origin,
        description: brand.description || '',
        status: (brand.status as any) || 'Active'
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        manufacturer: '',
        category: 'Parts & Spares',
        origin: '',
        description: '',
        status: 'Active'
      });
    }
    setErrors({ name: false, manufacturer: false });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setFormData({
      name: '',
      manufacturer: '',
      category: 'Parts & Spares',
      origin: '',
      description: '',
      status: 'Active'
    });
    setErrors({ name: false, manufacturer: false });
  };

  const handleSave = async () => {
    const newErrors = {
      name: !formData.name.trim(),
      manufacturer: !formData.manufacturer.trim()
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id, formData);
        toast.success('Brand updated successfully!');
      } else {
        await addBrand(formData);
        toast.success('Brand added successfully!');
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save brand');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        await deleteBrand(id);
        toast.success('Brand deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete brand');
      }
    }
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brand.origin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || brand.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || brand.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalBrands = brands.length;
  const totalProducts = 0;
  const avgPopularity = 0;
  const activeBrands = brands.filter(b => b.status === 'Active').length;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Parts & Spares': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'Oils & Lubricants': isDarkMode ? 'bg-blue-400/20 text-blue-400' : 'bg-blue-50 text-blue-500',
      'Tyres & Wheels': isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'Electrical': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'Body Parts': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'Tools & Equipment': isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-slate-50 text-gray-600',
      'Chemicals': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'Batteries': isDarkMode ? 'bg-blue-700/20 text-blue-400' : 'bg-blue-50 text-blue-700',
      'Filters': isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      'General': isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-50 text-gray-600'
    };
    return colors[category] || colors['General'];
  };

  const getPopularityColor = (score: number) => {
    if (score >= 90) return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    if (score >= 85) return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    if (score >= 80) return isDarkMode ? 'text-blue-400' : 'text-blue-500';
    return isDarkMode ? 'text-blue-400' : 'text-blue-700';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Convert brands data to CSV format
    const headers = ['Brand Name', 'Manufacturer', 'Category', 'Products', 'Total Sales', 'Popularity', 'Origin', 'Status', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...filteredBrands.map(brand => [
        `"${brand.name}"`,
        `"${brand.manufacturer}"`,
        `"${brand.category}"`,
        0,
        0,
        0,
        `"${brand.origin}"`,
        brand.status,
        brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `brands-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Brands data exported successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
          }`}>
            <CircleDot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Brand Dashboard</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Manage product brands and manufacturers</p>
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
          {canPrint('Brands') && (
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
          )}
          {canExport('Brands') && (
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
          )}
          {canCreate('Brands') && (
            <button
              onClick={() => handleOpenModal()}
              className={getPrimaryButtonClass()}
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </button>
          )}
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
                <Award className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Brands</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{totalBrands}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>{activeBrands} active brands</p>
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
              <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +22%
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Total Products</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{totalProducts}</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>Across all brands</p>
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
                <Star className="w-6 h-6 text-blue-500" />
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
            }`}>Brand performance</p>
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
                isDarkMode ? 'bg-blue-600/20' : 'bg-blue-50'
              }`}>
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className={`text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Top Brand</h3>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>N/A</p>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>0 popularity score</p>
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
                  placeholder="Search by brand name, manufacturer, or origin..."
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

      {/* Brands List */}
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
            }`}>Brands</h2>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>{filteredBrands.length} results</span>
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
                      }`}>Brand</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Manufacturer</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Category</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Products</th>
                      <th className={`text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Popularity</th>
                      <th className={`text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>Origin</th>
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
                    {filteredBrands.map((brand) => (
                      <tr
                        key={brand.id}
                        className={`transition-colors ${
                          isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
                            }`}>
                            <CircleDot className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{brand.name}</p>
                              <p className={`text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>Since {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{brand.manufacturer}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            getCategoryColor(brand.category)
                          }`}>
                            {brand.category}
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
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-500 text-blue-400" />
                            <span className="font-bold text-sm">0%</span>
                          </div>
                        </td>
                        <td className={`py-3 px-4 text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{brand.origin}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            brand.status === 'Active'
                              ? isDarkMode
                                ? 'bg-blue-600/20 text-blue-400'
                                : 'bg-blue-50 text-blue-600'
                              : isDarkMode
                              ? 'bg-gray-500/20 text-gray-400'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {brand.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {canEdit('Brands') && (
                              <button
                                onClick={() => handleOpenModal(brand)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDarkMode
                                    ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete('Brands') && (
                              <button
                                onClick={() => handleDelete(brand.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDarkMode
                                    ? 'bg-blue-700/20 text-blue-400 hover:bg-blue-700/30'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                }`}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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
              {filteredBrands.map((brand) => (
                <motion.div
                  key={brand.id}
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
                      <CircleDot className="w-6 h-6 text-blue-500" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      brand.status === 'Active'
                        ? isDarkMode
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'bg-blue-50 text-blue-600'
                        : isDarkMode
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {brand.status}
                    </span>
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{brand.name}</h3>
                  <p className={`text-sm mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{brand.manufacturer}</p>
                  <p className={`text-xs mb-3 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>{brand.origin}</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-4 ${
                    getCategoryColor(brand.category)
                  }`}>
                    {brand.category}
                  </span>
                  <div className={`flex items-center justify-between pt-4 border-t ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>Products</p>
                      <p className={`text-lg font-bold ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>0</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>Popularity</p>
                      <div className="flex items-center justify-end gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-blue-400" />
                        <p className="font-bold">0%</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {canEdit('Brands') && (
                      <button
                        onClick={() => handleOpenModal(brand)}
                        className={`flex-1 p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        <Edit2 className="w-4 h-4 mx-auto" />
                      </button>
                    )}
                    {canDelete('Brands') && (
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className={`flex-1 p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'bg-blue-700/20 text-blue-400 hover:bg-blue-700/30'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            >
              {/* Modal */}
              <motion.div
                className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
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
                        <CircleDot className={`w-5 h-5 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                        </h2>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {editingBrand ? 'Update brand information' : 'Enter new brand details'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseModal}
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
                  <div className="space-y-5">
                    <div>
                      <label className={getLabelClass(isDarkMode)}>
                        Brand Name <span className="text-blue-700">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (e.target.value.trim()) setErrors(prev => ({ ...prev, name: false }));
                        }}
                        className={`${getInputClass(isDarkMode)} ${errors.name ? '!border-red-500' : ''}`}
                        placeholder="e.g., Bosch, Castrol, MRF"
                      />
                      {errors.name && (
                        <p className="text-blue-700 text-sm mt-1">Brand Name is required</p>
                      )}
                    </div>

                    <div>
                      <label className={getLabelClass(isDarkMode)}>
                        Manufacturer <span className="text-blue-700">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.manufacturer}
                        onChange={(e) => {
                          setFormData({ ...formData, manufacturer: e.target.value });
                          if (e.target.value.trim()) setErrors(prev => ({ ...prev, manufacturer: false }));
                        }}
                        className={`${getInputClass(isDarkMode)} ${errors.manufacturer ? '!border-red-500' : ''}`}
                        placeholder="e.g., Robert Bosch GmbH"
                      />
                      {errors.manufacturer && (
                        <p className="text-blue-700 text-sm mt-1">Manufacturer is required</p>
                      )}
                    </div>

                    <div>
                      <label className={getLabelClass(isDarkMode)}>
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={getInputClass(isDarkMode)}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={getLabelClass(isDarkMode)}>
                        Country of Origin *
                      </label>
                      <input
                        type="text"
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        className={getInputClass(isDarkMode)}
                        placeholder="e.g., Germany, India, USA"
                      />
                    </div>

                    <div>
                      <label className={getLabelClass(isDarkMode)}>
                        Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                        className={getInputClass(isDarkMode)}
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
                      onClick={handleCloseModal}
                      className={getSecondaryButtonClass(isDarkMode)}
                    >
                      <span>Cancel</span>
                    </button>
                    {(editingBrand ? canEdit('Brands') : canCreate('Brands')) && (
                      <button
                        onClick={handleSave}
                        className={getPrimaryButtonClass()}
                      >
                        <Check className="w-4 h-4" />
                        <span>{editingBrand ? 'Update Brand' : 'Add Brand'}</span>
                      </button>
                    )}
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