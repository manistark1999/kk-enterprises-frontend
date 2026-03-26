import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Shield,
  History,
  Eye,
  Tag,
  Activity,
  Briefcase,
  Globe,
  Contact2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getCardClass,
  getInputClass,
  getPrimaryButtonClass,
} from '@/utils/formStyles';
import { useMasters, Supplier } from '@/contexts/MastersContext';
import { useAuth } from '@/contexts/AuthContext';

interface SupplierScreenProps {
  isDarkMode: boolean;
}

const THEME_FONT = "'Outfit', sans-serif";
const ROW_TEXT_STYLE = "px-6 py-4 text-[13px] font-semibold text-gray-700 dark:text-gray-300";
const HEADER_STYLE = "px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]";

export function SupplierScreen({ isDarkMode }: SupplierScreenProps) {
  const { 
    suppliers, 
    addSupplier, 
    updateSupplier, 
    deleteSupplier, 
    refreshAllMasters,
    mastersHistory,
    isLoading 
  } = useMasters();
  const { canCreate, canEdit, canDelete } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    gst: '',
    category: 'Parts & Spares',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [errors, setErrors] = useState({
    name: false,
    contactPerson: false,
    phone: false,
    address: false
  });

  const cardClass = getCardClass(isDarkMode);
  const inputClass = getInputClass(isDarkMode);
  const primaryButtonClass = getPrimaryButtonClass();

  const categories = ['Parts & Spares', 'Oils & Lubricants', 'Tyres & Wheels', 'Electrical', 'Body Parts', 'Tools & Equipment', 'Chemicals', 'General'];

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        gst: supplier.gst,
        category: supplier.category,
        status: (supplier.status as any) || 'Active'
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        gst: '',
        category: 'Parts & Spares',
        status: 'Active'
      });
    }
    setErrors({ name: false, contactPerson: false, phone: false, address: false });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setIsViewModalOpen(true);
  };

  const handleSave = async () => {
    const newErrors = {
      name: !formData.name.trim(),
      contactPerson: !formData.contactPerson.trim(),
      phone: !formData.phone.trim(),
      address: !formData.address.trim()
    };
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(Boolean)) {
      toast.error('Required fields missing');
      return;
    }
    
    setIsSaving(true);
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, { ...editingSupplier, ...formData } as any);
        toast.success('Supplier record updated');
      } else {
        await addSupplier({ id: '', createdAt: '', ...formData } as any);
        toast.success('New supplier registered');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently remove this supplier?')) {
      try {
        await deleteSupplier(id);
        toast.success('Supplier deleted');
      } catch (error: any) {
        toast.error(error.message || 'Delete failed');
      }
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.phone?.includes(searchTerm);
    const matchesStatus = filterStatus === 'All' || supplier.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || supplier.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredHistory = mastersHistory.filter(h => 
    h.title?.toLowerCase().includes('supplier') || 
    h.description?.toLowerCase().includes('supplier')
  );

  const formatSupId = (id: string) => `SUP-${id.toString().padStart(4, '0')}`;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-4 md:p-8" style={{ fontFamily: THEME_FONT }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/30 ring-4 ring-blue-600/10">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">Supplier Registry</h1>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">Certified</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Procurement and Vendor Control</p>
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
            {canCreate('Suppliers') && (
              <button
                onClick={() => handleOpenModal()}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-[0.1em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Register Supplier
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
                placeholder="Scan nomenclature or contact metrics..."
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
              <option value="All">All Categories</option>
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
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
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
                  <th className={HEADER_STYLE}>Vendor Nomenclature</th>
                  <th className={HEADER_STYLE}>Contact Liaison</th>
                  <th className={HEADER_STYLE}>Classification</th>
                  <th className={HEADER_STYLE}>Status</th>
                  <th className={HEADER_STYLE + " text-center"}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/5 dark:divide-gray-800/10">
                {filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-blue-500/5 transition-all group">
                    <td className={ROW_TEXT_STYLE + " font-mono text-[11px] text-blue-500"}>
                      {formatSupId(sup.id)}
                    </td>
                    <td className={ROW_TEXT_STYLE}>
                      <div className="flex flex-col">
                        <span className="font-bold">{sup.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">{sup.gst || "N/A"}</span>
                      </div>
                    </td>
                    <td className={ROW_TEXT_STYLE}>
                       <div className="flex flex-col">
                        <span className="font-bold">{sup.contactPerson}</span>
                        <span className="text-[10px] text-blue-600 font-bold">{sup.phone}</span>
                      </div>
                    </td>
                    <td className={ROW_TEXT_STYLE}>
                      <span className="px-2 py-1 rounded-lg bg-gray-500/10 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        {sup.category}
                      </span>
                    </td>
                    <td className={ROW_TEXT_STYLE}>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        sup.status === 'Active' ? 'bg-blue-600/10 text-blue-600' : 'bg-blue-700/10 text-blue-700'
                      }`}>
                        {sup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenViewModal(sup)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all dark:bg-blue-500/5"><Eye size={14} /></button>
                        {canEdit('Suppliers') && (
                          <button onClick={() => handleOpenModal(sup)} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all dark:bg-blue-500/5"><Edit2 size={14} /></button>
                        )}
                        {canDelete('Suppliers') && (
                          <button onClick={() => handleDelete(sup.id)} className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white transition-all dark:bg-blue-700/5"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AUDIT TRAIL */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 px-4 pt-12">
            <History className="w-4 h-4 text-blue-500" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">Registry Operational History</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-800" />
          </div>

          <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-white shadow-sm border-gray-100'}`}>
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-100/5 dark:divide-gray-800/10">
                  {filteredHistory.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-blue-500/5 transition-all">
                      <td className="p-4">
                        <div className="flex items-start gap-4">
                          <Activity className={`shrink-0 w-8 h-8 p-2 rounded-lg ${
                            entry.action_type === 'CREATE' ? 'bg-blue-600/10 text-blue-600' : 'bg-blue-500/10 text-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300 truncate">{entry.title}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{entry.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-2 justify-end text-[11px] font-mono text-gray-400">
                              <span className="text-blue-500/40 font-bold uppercase tracking-widest text-[9px]">{entry.user_name}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full" />
                              {new Date(entry.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MUTATION MODAL */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm" />
              <motion.div
                initial={{ scale: 0.98, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.98, opacity: 0, y: 20 }}
                className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'}`}
              >
                <div className="p-8 pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {editingSupplier ? 'Mutate Vendor Entity' : 'New Vendor Registration'}
                      </h3>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Registry Mutation Interface</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-blue-50 hover:text-blue-700 transition-all rounded-lg text-gray-400"><X size={20} /></button>
                </div>

                <div className="p-8 grid grid-cols-2 gap-x-8 gap-y-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Vendor Nomenclature</label>
                      <div className="relative">
                        <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${errors.name ? 'text-blue-400' : 'text-gray-400'}`} />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`${inputClass} !pl-12 !py-3`}
                          placeholder="Legal Business Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Primary Liaison</label>
                       <div className="relative">
                        <Contact2 className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${errors.contactPerson ? 'text-blue-400' : 'text-gray-400'}`} />
                        <input
                          type="text"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                          className={`${inputClass} !pl-12 !py-3`}
                          placeholder="Contact Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Communication Matrix</label>
                      <div className="grid grid-cols-1 gap-3">
                         <div className="relative">
                          <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${errors.phone ? 'text-blue-400' : 'text-gray-400'}`} />
                          <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`${inputClass} !pl-12 !py-3`}
                            placeholder="Mobile Vector"
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`${inputClass} !pl-12 !py-3`}
                            placeholder="Data Link (Email)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Category & Tax Protocol</label>
                       <div className="grid grid-cols-1 gap-3">
                         <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className={`${inputClass} !py-3 appearance-none cursor-pointer`}
                          >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                          <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                            <input
                              type="text"
                              value={formData.gst}
                              onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                              className={`${inputClass} !pl-12 !py-3`}
                              placeholder="GST Identifier"
                            />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Geospatial Address</label>
                      <div className="relative">
                        <MapPin className={`absolute left-4 top-4 w-4.5 h-4.5 ${errors.address ? 'text-blue-400' : 'text-gray-400'}`} />
                        <textarea
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className={`${inputClass} !pl-12 !pt-3 min-h-[100px] resize-none`}
                          placeholder="Specify physical coordinates..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Operational Protocol</label>
                       <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className={`${inputClass} !py-3 appearance-none cursor-pointer`}
                      >
                        <option value="Active">Authorized</option>
                        <option value="Inactive">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-500/5 flex items-center justify-between gap-4 border-t dark:border-gray-800">
                  <button onClick={() => setIsModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-4">Void Entry</button>
                  {(editingSupplier ? canEdit('Suppliers') : canCreate('Suppliers')) && (
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl disabled:opacity-50 transition-all active:scale-95"
                    >
                      {isSaving ? 'Processing...' : editingSupplier ? 'Commit Mutation' : 'Register Vendor'}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* VIEW MODAL */}
        <AnimatePresence>
          {isViewModalOpen && viewingSupplier && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsViewModalOpen(false)} className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`relative w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden ${isDarkMode ? 'bg-blue-950/20 border-white/5' : 'bg-white border-gray-100'}`}>
                <div className="h-32 bg-gradient-to-br from-blue-600 to-blue-400 p-8 flex items-end relative overflow-hidden">
                   <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl opacity-20" />
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-2xl flex items-center justify-center translate-y-8 ring-[10px] ring-blue-600/10"><Truck className="w-10 h-10 text-blue-600" /></div>
                </div>
                <div className="p-8 pt-12 space-y-8">
                  <div>
                    <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{viewingSupplier.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[9px] font-bold uppercase tracking-widest border border-blue-500/20">Authorized Vendor</span>
                      <span className="text-[10px] text-gray-400 font-mono">{formatSupId(viewingSupplier.id)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Business Liaison</label>
                      <span className="text-sm font-bold block">{viewingSupplier.contactPerson}</span>
                      <span className="text-xs text-blue-600 font-bold">{viewingSupplier.phone}</span>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Status Protocol</label>
                      <span className={`text-sm font-bold ${viewingSupplier.status === 'Active' ? 'text-blue-600' : 'text-blue-700'}`}>{viewingSupplier.status}</span>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Location Matrix</label>
                    <p className="text-[12px] font-medium leading-relaxed">{viewingSupplier.address}</p>
                    {viewingSupplier.email && (
                       <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 w-fit">
                        <Mail size={12} className="text-blue-500" />
                        <span className="text-[11px] font-bold text-blue-600">{viewingSupplier.email}</span>
                      </div>
                    )}
                  </div>

                  <button onClick={() => setIsViewModalOpen(false)} className="w-full py-4 rounded-xl bg-gray-950 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl shadow-black/20">Acknowledge Specification</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}