import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Eye, RefreshCw,
  Filter, Car, ChevronRight, X, History,
  Clock, AlertCircle, Pencil, Tag, Globe, XCircle, Settings, Shield, User, Activity, ListFilter
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getCardClass,
  getInputClass,
  getLabelClass,
  getPrimaryButtonClass
} from '@/utils/formStyles';
import { useMasters, VehicleMake } from '@/contexts/MastersContext';
import { useAuth } from '@/contexts/AuthContext';

interface VehicleMakeScreenProps {
  isDarkMode: boolean;
}

export function VehicleMakeScreenEnhanced({ isDarkMode }: VehicleMakeScreenProps) {
  // --- STATE ---
  const { canCreate, canEdit, canDelete } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'active' | 'inactive'>('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingMake, setViewingMake] = useState<VehicleMake | null>(null);
  const [editingMake, setEditingMake] = useState<VehicleMake | null>(null);

  const [formData, setFormData] = useState({
    make_name: '',
    country: '',
    status: 'active' as 'active' | 'inactive'
  });

  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({
    make_name: false,
    country: false
  });

  const {
    vehicleMakes,
    addVehicleMake,
    updateVehicleMake,
    deleteVehicleMake,
    vehicleMakeHistory,
    refreshVehicleMakeHistory,
    refreshAllMasters,
    isLoading
  } = useMasters();

  const cardClass = getCardClass(isDarkMode);

  // --- UTILS ---
  const formatVMId = (id: string | number) => {
    const numericId = id.toString().replace(/\D/g, '');
    return `VM-${numericId.padStart(4, '0')}`;
  };

  const getCustomInputClass = (hasError: boolean) => {
    const baseClass = `w-full px-4 py-2.5 rounded-xl border transition-all outline-none text-sm font-medium ${isDarkMode
      ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10'
      }`;
    if (hasError) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500/10 shadow-sm shadow-red-500/5`;
    }
    return baseClass;
  };

  // --- DATA FILTERING ---
  const applySearch = (items: any[], filterValue: string, statusValue: string) => {
    return items.filter(item => {
      const data = item.changed_data || item;
      const name = (data.make_name || data.name || '').toLowerCase();
      const country = (data.country || '').toLowerCase();
      const vmId = formatVMId(data.id || '').toLowerCase();
      const status = (data.status || '').toLowerCase();

      const matchesSearch = !filterValue ||
        name.includes(filterValue.toLowerCase()) ||
        country.includes(filterValue.toLowerCase()) ||
        vmId.includes(filterValue.toLowerCase());

      const matchesStatus = statusValue === 'All' || status === statusValue.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  };

  const filteredMakes = useMemo(() =>
    applySearch(vehicleMakes, searchTerm, filterStatus),
    [vehicleMakes, searchTerm, filterStatus]
  );

  const filteredHistory = useMemo(() =>
    applySearch(vehicleMakeHistory, searchTerm, filterStatus),
    [vehicleMakeHistory, searchTerm, filterStatus]
  );

  const findMakeByHistoryId = (historyDataId: string | number) => {
    return vehicleMakes.find(m => m.id.toString() === historyDataId.toString());
  };

  // --- HANDLERS ---
  const handleOpenModal = (make?: VehicleMake) => {
    setFormErrors({ make_name: false, country: false });
    if (make) {
      setEditingMake(make);
      setFormData({
        make_name: make.make_name || '',
        country: make.country || '',
        status: (make.status?.toLowerCase() === 'active' ? 'active' : 'inactive') as 'active' | 'inactive'
      });
    } else {
      setEditingMake(null);
      setFormData({ make_name: '', country: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (make: VehicleMake) => {
    setViewingMake(make);
    setIsViewModalOpen(true);
  };

  const handleSave = async () => {
    const errors = {
      make_name: !formData.make_name.trim(),
      country: !formData.country.trim()
    };
    setFormErrors(errors);

    if (errors.make_name || errors.country) {
      toast.error('Required metadata missing. Please verify all mandatory fields.');
      return;
    }

    try {
      if (editingMake) {
        await updateVehicleMake(editingMake.id, { ...editingMake, name: formData.make_name.trim(), make_name: formData.make_name.trim(), country: formData.country.trim(), status: formData.status });
        toast.success(`Registry entry synchronized successfully`);
      } else {
        await addVehicleMake({ id: '', name: formData.make_name.trim(), make_name: formData.make_name.trim(), country: formData.country.trim(), status: formData.status, createdAt: '' });
        toast.success(`Identity registered in system database`);
      }
      setIsModalOpen(false);
      await refreshAllMasters();
      await refreshVehicleMakeHistory();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Identity synchronization failed';
      toast.error(`Commit failed: ${errMsg}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Purge this record from system? This action cannot be undone.')) {
      try {
        await deleteVehicleMake(id);
        toast.success('Record purged from primary datastore');
        await refreshAllMasters();
        await refreshVehicleMakeHistory();
      } catch (error) {
        toast.error('Purge operation failed');
      }
    }
  };

  const manualRefresh = async () => {
    await Promise.all([refreshAllMasters(), refreshVehicleMakeHistory()]);
    toast.info('Datastreams synced');
  };

  // --- TYPOGRAPHY CONSTANTS ---
  const THEME_FONT = "'Inter', sans-serif";
  const HEADER_STYLE = "px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500/80";
  const ROW_TEXT_STYLE = "px-6 py-3 text-[13px] font-semibold text-gray-900 dark:text-gray-100";

  return (
    <div className="p-6 space-y-6 pb-20 h-full overflow-auto luxury-scroll" style={{ fontFamily: THEME_FONT }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER SECTION - NO LONGER DARK/HEAVY */}
        <div className={`p-6 rounded-2xl border transition-all duration-500 ${isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white shadow-lg shadow-blue-500/5 border-gray-100'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/10 to-blue-500/20 flex items-center justify-center text-blue-600 group hover:rotate-6 transition-transform">
                <Car className="w-7 h-7 drop-shadow-sm" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Vehicle Authority Registry</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600/80">Manufacturer Master Interface Control</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={manualRefresh}
                className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white"
                    : "bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-900"
                }`}
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              {canCreate('Vehicle Make') && (
                <button
                  onClick={() => handleOpenModal()}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-[0.1em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-[11px] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Manufacturer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH SYSTEM */}
        <div className={`rounded-2xl p-6 border transition-all ${isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-white shadow-lg shadow-black/5 border-gray-100'}`}>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[300px] relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Scan by Name, Country, or Master ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-14 pr-6 py-3.5 rounded-xl border outline-none text-sm font-medium transition-all ${isDarkMode
                  ? 'bg-gray-950/50 border-gray-800 text-white placeholder:text-gray-600 focus:border-blue-500/50'
                  : 'bg-gray-50/50 border-gray-100 placeholder:text-gray-400 focus:bg-white focus:border-blue-600/30'
                  }`}
              />
            </div>
            <div className={`flex items-center gap-3 p-1.5 rounded-xl ${isDarkMode ? 'bg-gray-800/40' : 'bg-gray-50 border border-gray-100'}`}>
              <ListFilter className="w-4 h-4 ml-3 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-transparent border-0 px-3 py-2 font-bold text-[9px] uppercase tracking-widest outline-none cursor-pointer text-gray-600"
              >
                <option value="All">All Operations</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* OPERATIONAL AUDIT TRAIL */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 px-4">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500/80">Operational Audit Trail</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-200/50 to-transparent dark:from-gray-800/50" />
          </div>

          <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-white shadow-lg shadow-black/5 border-gray-100'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={isDarkMode ? 'bg-gray-950/50' : 'bg-gray-50/30'}>
                    <th className={HEADER_STYLE}>Sequence</th>
                    <th className={HEADER_STYLE}>Authority ID</th>
                    <th className={HEADER_STYLE}>Manufacturer</th>
                    <th className={HEADER_STYLE}>Region</th>
                    <th className={HEADER_STYLE}>Status</th>
                    <th className={HEADER_STYLE}>Time Vector</th>
                    <th className={HEADER_STYLE + " text-center"}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/5 dark:divide-gray-800/5">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((entry, idx) => {
                      const data = entry.changed_data || {};
                      const source = findMakeByHistoryId(data.id);
                      return (
                        <tr key={idx} className="hover:bg-blue-500/5 transition-all group">
                          <td className={ROW_TEXT_STYLE + " !text-gray-400 font-mono"}>{filteredHistory.length - idx}</td>
                          <td className={ROW_TEXT_STYLE}>
                            <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 dark:bg-blue-500/5 dark:border-blue-500/20 text-xs">
                              {data.id ? formatVMId(data.id) : 'N/A'}
                            </span>
                          </td>
                          <td className={ROW_TEXT_STYLE}>{data.make_name || data.name || 'N/A'}</td>
                          <td className={ROW_TEXT_STYLE + " !text-gray-500 font-medium"}>{data.country || 'Global'}</td>
                          <td className={ROW_TEXT_STYLE}>
                            <span className={`${data.status?.toLowerCase() === 'active' ? 'bg-blue-600/10 text-blue-600' : 'bg-blue-700/10 text-blue-700'} px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest`}>
                              {data.status || 'Active'}
                            </span>
                          </td>
                          <td className={ROW_TEXT_STYLE + " !text-gray-400 text-xs"}>
                            <div className="flex items-center gap-2">
                              <Clock size={12} className="text-blue-500/50" />
                              {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-center gap-2">
                              {source ? (
                                <>
                                  <button onClick={() => handleOpenViewModal(source)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all dark:bg-blue-500/5"><Eye size={14} /></button>
                                  {canEdit('Vehicle Make') && (
                                    <button onClick={() => handleOpenModal(source)} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all dark:bg-blue-500/5"><Edit2 size={14} /></button>
                                  )}
                                  {canDelete('Vehicle Make') && (
                                    <button onClick={() => handleDelete(source.id)} className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white transition-all dark:bg-blue-700/5"><Trash2 size={14} /></button>
                                  )}
                                </>
                              ) : (
                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-lg dark:bg-gray-800">Archive Only</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan={7} className="p-16 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">Registry Sequence Manifest Void</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* INSPECTION VIEW MODAL */}
        <AnimatePresence>
          {isViewModalOpen && viewingMake && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsViewModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`relative w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-950 border-white/5' : 'bg-white border-gray-100'}`}>
                <div className="h-32 bg-gradient-to-br from-blue-600 to-blue-400 p-8 flex items-end relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-2xl flex items-center justify-center translate-y-8 ring-[10px] ring-blue-600/10"><Car className="w-10 h-10 text-blue-600" /></div>
                </div>
                <div className="p-8 pt-12 space-y-8">
                  <div>
                    <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{viewingMake.make_name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-4 h-1 bg-blue-600 rounded-full" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">Identity Spec Alpha</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'} text-left`}>
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Country Matrix</label>
                      <span className="text-lg font-bold text-blue-600">{viewingMake.country || 'Global Origin'}</span>
                    </div>
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'} text-left`}>
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Operating Status</label>
                      <span className={`text-lg font-bold ${viewingMake.status?.toLowerCase() === 'active' ? 'text-blue-600' : 'text-blue-700'}`}>{viewingMake.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-500/5 font-mono text-[10px] border border-dashed border-gray-200 dark:border-gray-800">
                    <span className="text-gray-400">UNIQUE_PROTOCOL_HASH</span>
                    <span className="font-bold text-blue-600">{formatVMId(viewingMake.id)}</span>
                  </div>
                  <button onClick={() => setIsViewModalOpen(false)} className="w-full py-4 rounded-xl bg-gray-950 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl active:scale-95">Acknowledge Specification</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MUTATION MODAL (CREATE/UPDATE) - CLEANER & CENTERED */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm" />
              <motion.div
                initial={{ scale: 0.98, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.98, opacity: 0, y: 20 }}
                className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'}`}
                style={{ fontFamily: THEME_FONT }}
              >
                {/* Modal Header */}
                <div className="p-8 pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {editingMake ? 'Mutate Manufacturer' : 'New Manufacturer Entry'}
                      </h3>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Master Registry Interface</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2.5 hover:bg-blue-50 hover:text-blue-700 transition-all rounded-lg text-gray-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form Content */}
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Manufacturer Nomenclature {formErrors.make_name && <span className="text-blue-700">*</span>}</span>
                      {formErrors.make_name && <span className="text-[9px] text-blue-700 font-bold uppercase tracking-widest">Compulsory</span>}
                    </label>
                    <div className="relative">
                      <Tag className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${formErrors.make_name ? 'text-blue-400' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={formData.make_name}
                        onChange={(e) => setFormData({ ...formData, make_name: e.target.value })}
                        className={`${getCustomInputClass(formErrors.make_name)} !pl-12`}
                        placeholder="e.g. Scania"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Origin Region {formErrors.country && <span className="text-blue-700">*</span>}</span>
                      </label>
                      <div className="relative">
                        <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${formErrors.country ? 'text-blue-400' : 'text-gray-400'}`} />
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className={`${getCustomInputClass(formErrors.country)} !pl-12`}
                          placeholder="e.g. Sweden"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Operational Protocol</label>
                      <div className="relative text-xs">
                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className={`${getCustomInputClass(false)} !pl-12 appearance-none cursor-pointer`}
                        >
                          <option value="active">Active Authority</option>
                          <option value="inactive">Inactive Status</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-6 bg-gray-500/5 flex items-center justify-between gap-4 border-t ${isDarkMode ? "border-gray-800" : "border-gray-100"}`}>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors px-4 py-2"
                  >
                    Cancel Registry
                  </button>
                  {(editingMake ? canEdit('Vehicle Make') : canCreate('Vehicle Make')) && (
                    <button
                      onClick={handleSave}
                      className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                    >
                      {editingMake ? "Confirm Mutation" : "Commit Registry"}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
