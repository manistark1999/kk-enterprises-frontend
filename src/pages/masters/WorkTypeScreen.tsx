import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Clock,
  Shield,
  History,
  Eye,
  Tag,
  Activity,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getCardClass,
  getInputClass,
  getPrimaryButtonClass,
} from '@/utils/formStyles';
import { useMasters, WorkType } from '@/contexts/MastersContext';
import { useAuth } from '@/contexts/AuthContext';

interface WorkTypeScreenProps {
  isDarkMode: boolean;
}

const THEME_FONT = "'Outfit', sans-serif";
const ROW_TEXT_STYLE = "px-6 py-4 text-[13px] font-semibold text-gray-700 dark:text-gray-300";
const HEADER_STYLE = "px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]";

export function WorkTypeScreen({ isDarkMode }: WorkTypeScreenProps) {
  const { 
    workTypes, 
    addWorkType, 
    updateWorkType, 
    deleteWorkType, 
    refreshAllMasters,
    mastersHistory,
    isLoading 
  } = useMasters();
  const { canCreate, canEdit, canDelete } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingType, setEditingType] = useState<WorkType | null>(null);
  const [viewingType, setViewingType] = useState<WorkType | null>(null);
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
    avgPrice: false
  });

  const cardClass = getCardClass(isDarkMode);
  const inputClass = getInputClass(isDarkMode);
  const primaryButtonClass = getPrimaryButtonClass();

  const categories = ['Mechanical', 'Electrical', 'Body Work', 'Paint Work', 'Detailing', 'Diagnostics', 'General'];

  const handleOpenModal = (type?: WorkType) => {
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
    setErrors({ name: false, duration: false, avgPrice: false });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (type: WorkType) => {
    setViewingType(type);
    setIsViewModalOpen(true);
  };

  const handleSave = async () => {
    const newErrors = {
      name: !formData.name.trim(),
      duration: !String(formData.duration).trim(),
      avgPrice: !String(formData.avgPrice).trim()
    };
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(Boolean)) {
      toast.error('Required fields missing');
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        duration: formData.duration, 
        avgPrice: parseFloat(formData.avgPrice) || 0,
        status: formData.status
      };

      if (editingType) {
        await updateWorkType(editingType.id, { ...editingType, ...payload } as any);
        toast.success('Work type adjusted successfully');
      } else {
        await addWorkType({ id: '', createdAt: '', ...payload } as any);
        toast.success('New work type committed');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently decommission this work type?')) {
      try {
        await deleteWorkType(id);
        toast.success('Work type removed');
      } catch (error: any) {
        toast.error(error.message || 'Delete failed');
      }
    }
  };

  const filteredTypes = workTypes.filter(type => {
    const name = type.workTypeName || type.name || '';
    const desc = type.description || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || type.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || type.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredHistory = mastersHistory.filter(h => 
    h.title?.toLowerCase().includes('work type') || 
    h.description?.toLowerCase().includes('work type')
  );

  const formatWTId = (id: string) => `WT-${id.toString().padStart(4, '0')}`;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-4 md:p-8" style={{ fontFamily: THEME_FONT }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/30 ring-4 ring-blue-600/10">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">Service Matrix</h1>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">Alpha v4</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Master Job Definition Control</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refreshAllMasters()}
              className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                isDarkMode 
                  ? "bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white" 
                  : "bg-white border-gray-200 text-gray-400 hover:text-gray-900 shadow-sm"
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            {canCreate('Work Type') && (
              <button
                onClick={() => handleOpenModal()}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-[0.1em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Initialize Service
              </button>
            )}
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className={`rounded-2xl p-4 border transition-all ${isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-white shadow-sm border-gray-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Scan nomenclature or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-2.5 rounded-xl border outline-none text-[13px] font-medium transition-all ${
                  isDarkMode 
                    ? 'bg-gray-950/50 border-gray-800 text-white focus:border-blue-500/50' 
                    : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-blue-600/30 shadow-inner'
                }`}
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border outline-none text-[11px] font-bold uppercase tracking-wider ${
                isDarkMode 
                  ? 'bg-gray-950 border-gray-800 text-gray-400' 
                  : 'bg-gray-50 border-gray-100 text-gray-600 shadow-inner'
              }`}
            >
              <option value="All">All Classifications</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`px-4 py-2.5 rounded-xl border outline-none text-[11px] font-bold uppercase tracking-wider ${
                isDarkMode 
                  ? 'bg-gray-950 border-gray-800 text-gray-400' 
                  : 'bg-gray-50 border-gray-100 text-gray-600 shadow-inner'
              }`}
            >
              <option value="All">All Operations</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-white shadow-xl shadow-black/5 border-gray-100'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDarkMode ? 'bg-gray-950/50' : 'bg-gray-50/50'}>
                  <th className={HEADER_STYLE}>Prot. ID</th>
                  <th className={HEADER_STYLE}>Service Nomenclature</th>
                  <th className={HEADER_STYLE}>Classification</th>
                  <th className={HEADER_STYLE}>Unit Duration</th>
                  <th className={HEADER_STYLE}>Rate Protocol</th>
                  <th className={HEADER_STYLE}>Status</th>
                  <th className={HEADER_STYLE + " text-center"}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/5 dark:divide-gray-800/10">
                {filteredTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-blue-500/5 transition-all group">
                    <td className={ROW_TEXT_STYLE + " font-mono text-[11px] text-blue-500 whitespace-nowrap"}>
                      {formatWTId(type.id)}
                    </td>
                    <td className={ROW_TEXT_STYLE}>
                      <div className="flex flex-col">
                        <span className="font-bold">{type.workTypeName || type.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">{type.description}</span>
                      </div>
                    </td>
                    <td className={ROW_TEXT_STYLE}>
                      <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-500/10">
                        {type.category}
                      </span>
                    </td>
                    <td className={ROW_TEXT_STYLE}>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={12} className="text-blue-500/50" />
                        <span className="text-[12px] font-bold">{type.avgDuration || type.duration}</span>
                      </div>
                    </td>
                    <td className={ROW_TEXT_STYLE}>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400 text-[11px] font-bold">₹</span>
                        <span className="text-gray-950 dark:text-white font-black text-sm">{(type.avgPrice || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className={ROW_TEXT_STYLE}>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        type.status === 'Active' ? 'bg-blue-600/10 text-blue-600' : 'bg-blue-700/10 text-blue-700'
                      }`}>
                        {type.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenViewModal(type)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all dark:bg-blue-500/5"><Eye size={14} /></button>
                        {canEdit('Work Type') && (
                          <button onClick={() => handleOpenModal(type)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all dark:bg-blue-500/5"><Edit2 size={14} /></button>
                        )}
                        {canDelete('Work Type') && (
                          <button onClick={() => handleDelete(type.id)} className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white transition-all dark:bg-blue-700/5"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {/* FORM MODAL */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm" />
              <motion.div
                initial={{ scale: 0.98, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.98, opacity: 0, y: 20 }}
                className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'}`}
              >
                <div className="p-8 pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {editingType ? 'Mutate Service Protocol' : 'Initialize Service'}
                      </h3>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Registry Input Interface</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-blue-50 hover:text-blue-700 transition-all rounded-lg text-gray-400"><X size={20} /></button>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Service Nomenclature</label>
                    <div className="relative">
                      <Tag className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${errors.name ? 'text-blue-400' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`${inputClass} !pl-12 !py-3`}
                        placeholder="e.g. Engine Overhaul"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Classification</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={`${inputClass} !py-3 appearance-none cursor-pointer`}
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Op. Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className={`${inputClass} !py-3 appearance-none cursor-pointer`}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Decommisioned</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Time Vector (Dur.)</label>
                      <div className="relative">
                        <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${errors.duration ? 'text-blue-400' : 'text-gray-400'}`} />
                        <input
                          type="text"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className={`${inputClass} !pl-12 !py-3`}
                          placeholder="e.g. 120 Mins"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Standard Rate (₹)</label>
                      <div className="relative">
                        <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${errors.avgPrice ? 'text-blue-400' : 'text-gray-400'}`} />
                        <input
                          type="number"
                          value={formData.avgPrice}
                          onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                          className={`${inputClass} !pl-12 !py-3`}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Technical Specification</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`${inputClass} !py-3 min-h-[80px] resize-none`}
                      placeholder="Specify operative parameters..."
                    />
                  </div>
                </div>

                <div className="p-6 bg-gray-500/5 flex items-center justify-between gap-4 border-t dark:border-gray-800">
                  <button onClick={() => setIsModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-4 hover:text-gray-900 transition-colors">Cancel</button>
                  {(editingType ? canEdit('Work Type') : canCreate('Work Type')) && (
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl disabled:opacity-50 transition-all active:scale-95"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* VIEW MODAL */}
        <AnimatePresence>
          {isViewModalOpen && viewingType && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsViewModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`relative w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-blue-950/20 border-white/5' : 'bg-white border-gray-100'}`}>
                <div className="h-32 bg-gradient-to-br from-blue-600 to-blue-400 p-8 flex items-end">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-2xl flex items-center justify-center translate-y-8 ring-[10px] ring-blue-600/10"><Wrench className="w-10 h-10 text-blue-600" /></div>
                </div>
                <div className="p-8 pt-12 space-y-8">
                  <div>
                    <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{viewingType.workTypeName || viewingType.name}</h2>
                    <p className="text-[12px] font-medium text-gray-400 mt-2">{viewingType.description || 'No exhaustive specification provided.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Rate Protocol</label>
                      <span className="text-xl font-black text-blue-600">₹{(viewingType.avgPrice || 0).toLocaleString()}</span>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Time Vector</label>
                      <span className="text-xl font-black text-gray-700 dark:text-gray-300">{viewingType.avgDuration || viewingType.duration}</span>
                    </div>
                  </div>
                  <button onClick={() => setIsViewModalOpen(false)} className="w-full py-4 rounded-xl bg-gray-950 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-all">Acknowledge Specification</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
