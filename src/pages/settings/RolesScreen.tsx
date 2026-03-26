import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ShieldCheck, ShieldAlert, Plus, Search, 
  Edit2, Trash2, Check, X, RefreshCw, Key,
  ChevronRight, Lock, Unlock, Database
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Permission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_print: boolean;
  can_export: boolean;
}

interface Role {
  id: number;
  role_name: string;
  description: string;
  permissions: Permission[];
  is_active: boolean;
}

const DEFAULT_MODULES = [
  'Dashboard', 'Customer', 'Transport', 'Vehicle Make', 'Vehicle Register', 
  'Work Group', 'Work Type', 'Supplier', 'Staff', 'Brand', 'Item', 'Bank Accounts',
  'Job Card', 'Estimation', 'Labour Bill',
  'Receipt', 'Payment', 'Purchase', 'Sales', 'Expense Entry', 'Staff Advance', 
  'Salary Entry', 'Bank Ledger', 'Stock Adjustment', 'Stock List', 'Cash Entry',
  'Alignment Register', 'Expense Register', 'Receipt Register', 'Cash Register', 
  'Stock Adjustments Register', 'Stock Report', 'Stock Register', 'GST Report', 'MIS Report',
  'Company', 'Financial Year', 'User Management', 'Role Management', 'History'
];

export function RolesScreen({ isDarkMode }: { isDarkMode: boolean }) {
  const { user, canView, refreshPermissions } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    role_name: '',
    description: '',
    permissions: DEFAULT_MODULES.map(m => ({
      module: m, 
      can_view: false, can_create: false, can_edit: false, 
      can_delete: false, can_print: false, can_export: false
    }))
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/roles');
      if (response.success) {
        setRoles(response.data.data || response.data || []);
      }
    } catch (error: any) {
      toast.error(`Sync Failure: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView('Role Management')) {
      fetchRoles();
    }
  }, [canView]);

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      const rolePerms = [...(role.permissions || [])];
      DEFAULT_MODULES.forEach(m => {
        if (!rolePerms.find(p => p.module === m)) {
          rolePerms.push({ 
            module: m, 
            can_view: false, can_create: false, can_edit: false, 
            can_delete: false, can_print: false, can_export: false 
          });
        }
      });
      setFormData({ 
        role_name: role.role_name, 
        description: role.description || '', 
        permissions: rolePerms 
      });
    } else {
      setEditingRole(null);
      setFormData({ 
        role_name: '', 
        description: '', 
        permissions: DEFAULT_MODULES.map(m => ({
          module: m, 
          can_view: false, can_create: false, can_edit: false, 
          can_delete: false, can_print: false, can_export: false
        }))
      });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (moduleIndex: number, action: keyof Omit<Permission, 'module'>) => {
    const updatedPermissions = [...formData.permissions];
    updatedPermissions[moduleIndex] = {
      ...updatedPermissions[moduleIndex],
      [action]: !updatedPermissions[moduleIndex][action]
    };
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const handleGrantAll = () => {
    const updatedPermissions = formData.permissions.map(p => ({
      ...p, can_view: true, can_create: true, can_edit: true, can_delete: true, can_print: true, can_export: true
    }));
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const handleRevokeAll = () => {
    const updatedPermissions = formData.permissions.map(p => ({
      ...p, can_view: false, can_create: false, can_edit: false, can_delete: false, can_print: false, can_export: false
    }));
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const handleSave = async () => {
    if (!formData.role_name) return toast.error('Role Identity Required');

    try {
      let response;
      if (editingRole) {
        response = await api.put(`/roles/${editingRole.id}`, formData);
      } else {
        response = await api.post('/roles', formData);
      }

      if (response.success) {
        toast.success(editingRole ? 'Identity Reconfigured' : 'New Identity Registered');
        setIsModalOpen(false);
        fetchRoles();
        if (user?.role === (editingRole?.role_name || formData.role_name)) {
          await refreshPermissions();
        }
      }
    } catch (error: any) {
      toast.error(`Transmission Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Initiate Identity Purge? This action is irreversible.')) {
      try {
        const response = await api.delete(`/roles/${id}`);
        if (response.success) {
          toast.success('Identity Neutralized');
          fetchRoles();
        }
      } catch (error: any) {
        toast.error(`Purge Failure: ${error.message}`);
      }
    }
  };

  const filteredRoles = Array.isArray(roles) ? roles.filter(role => 
    role.role_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} p-10 luxury-scroll overflow-y-auto`}>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all ${
              isDarkMode ? 'bg-blue-600/10 text-blue-500' : 'bg-blue-50 text-blue-600 shadow-xl shadow-blue-500/10'
            }`}>
              <ShieldAlert className="w-10 h-10 drop-shadow-sm" />
            </div>
            <div>
              <h1 className={`text-4xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Authority Matrix</h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600/80">Role-Based Access Control System</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchRoles}
              className={`w-16 h-16 flex items-center justify-center rounded-2xl border transition-all hover:rotate-180 duration-500 ${
                isDarkMode 
                  ? 'bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white' 
                  : 'bg-white border-gray-200 text-gray-400 hover:text-gray-900 shadow-sm'
              }`}
            >
              <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all text-xs flex items-center gap-3"
            >
              <Plus className="w-5 h-5" />
              Define Role
            </button>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {loading && roles.length === 0 ? (
              [1, 2, 3].map(i => (
                <div key={i} className={`h-64 rounded-[2.5rem] animate-pulse ${isDarkMode ? 'bg-gray-900/40' : 'bg-white shadow-lg shadow-gray-200/50'}`} />
              ))
            ) : filteredRoles.map((role) => (
              <motion.div
                key={role.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`group relative p-10 rounded-[2.5rem] border transition-all hover:translate-y-[-8px] ${
                  role.role_name === 'super_admin' 
                    ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/30' : 'bg-blue-50/50 border-blue-100 shadow-xl shadow-blue-500/5')
                    : role.role_name === 'manager'
                      ? (isDarkMode ? 'bg-blue-950/20 border-blue-500/30' : 'bg-blue-50/50 border-blue-100 shadow-xl shadow-blue-500/5')
                      : (isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-gray-100 shadow-2xl shadow-gray-200/50')
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-2xl ${
                    role.role_name === 'super_admin' ? 'bg-blue-600/10 text-blue-600' : 'bg-blue-400/10 text-blue-400'
                  }`}>
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(role)} className="p-3 hover:bg-blue-500/10 hover:text-blue-500 transition-all rounded-xl text-gray-400">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    {!['super_admin', 'manager', 'staff', 'admin'].includes(role.role_name) && (
                      <button onClick={() => handleDelete(role.id)} className="p-3 hover:bg-blue-700/10 hover:text-blue-700 transition-all rounded-xl text-gray-400">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{role.role_name}</h3>
                  <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {role.description || 'System access protocol level'}
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-500/10">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
                    <span className="text-gray-400">Defined Modules</span>
                    <span className="text-blue-600">{(role.permissions || []).length} Points</span>
                  </div>
                </div>

                {/* Status Decorator */}
                <div className={`absolute bottom-10 right-10 w-3 h-3 rounded-full ${role.is_active ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-gray-500'} animate-pulse`} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Luxury Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 30 }} 
              className={`relative w-full max-w-5xl h-[90vh] rounded-[3rem] shadow-3xl flex flex-col overflow-hidden border ${
                isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-white shadow-blue-900/10'
              }`}
            >
              {/* Modal Header */}
              <div className="p-12 pb-8 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                    <Database className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">
                      {editingRole ? 'Update Protocol' : 'Formulate Access'}
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mt-2">Authority Specification Module</p>
                  </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={handleGrantAll} className="px-6 py-3 rounded-xl bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Grant Full</button>
                   <button onClick={handleRevokeAll} className="px-6 py-3 rounded-xl bg-blue-900/10 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 hover:text-white transition-all">Revoke All</button>
                   <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-blue-50 hover:text-blue-700 transition-all rounded-xl text-gray-400"><X className="w-6 h-6" /></button>
                </div>
              </div>

              {/* Modal Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-12 pt-0 space-y-12 luxury-scroll">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600/80 ml-1">Identity Designation (Name)</label>
                    <div className="relative group">
                      <Shield className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        value={formData.role_name}
                        onChange={(e) => setFormData({...formData, role_name: e.target.value})}
                        className={`w-full pl-16 pr-6 py-6 rounded-3xl text-sm font-bold border transition-all ${
                          isDarkMode 
                            ? 'bg-gray-900/50 border-gray-800 text-white focus:border-red-500/50' 
                            : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-red-500/20'
                        }`}
                        placeholder="e.g. Master Control"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600/80 ml-1">Contextual Brief (Description)</label>
                    <div className="relative group">
                      <Edit2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className={`w-full pl-16 pr-6 py-6 rounded-3xl text-sm font-bold border transition-all ${
                          isDarkMode 
                            ? 'bg-gray-900/50 border-gray-800 text-white focus:border-blue-500/50' 
                            : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-blue-500/20'
                        }`}
                        placeholder="Define operational boundaries"
                      />
                    </div>
                  </div>
                </div>

                {/* Permission Matrix */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-blue-500" />
                    <h3 className={`text-base font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Access Permission Matrix</h3>
                  </div>

                  <div className={`rounded-2xl border overflow-hidden ${
                    isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-white shadow-md'
                  }`}>
                    {/* Matrix Header */}
                    <div className={`grid grid-cols-7 border-b text-center ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'
                    }`}>
                      <div className={`col-span-1 px-4 py-3 text-left text-xs font-black uppercase tracking-widest ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Module</div>
                      {[
                        { label: 'View', color: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
                        { label: 'Create', color: isDarkMode ? 'text-blue-500' : 'text-blue-500' },
                        { label: 'Edit', color: isDarkMode ? 'text-blue-300' : 'text-blue-700' },
                        { label: 'Delete', color: isDarkMode ? 'text-blue-200' : 'text-blue-800' },
                        { label: 'Print', color: isDarkMode ? 'text-blue-400' : 'text-blue-600' },
                        { label: 'Export', color: isDarkMode ? 'text-blue-500' : 'text-blue-500' },
                      ].map(({ label, color }) => (
                        <div key={label} className={`px-2 py-3 text-xs font-black uppercase tracking-wider ${color}`}>{label}</div>
                      ))}
                    </div>

                    {/* Matrix Rows */}
                    <div className="divide-y" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                      {formData.permissions.map((p, idx) => (
                        <div
                          key={p.module}
                          className={`grid grid-cols-7 items-center text-center transition-colors ${
                            idx % 2 === 0
                              ? isDarkMode ? 'bg-gray-950/80' : 'bg-white'
                              : isDarkMode ? 'bg-gray-800/60' : 'bg-gray-50'
                          } ${
                            isDarkMode ? 'divide-gray-700/60 border-gray-700/60' : 'divide-gray-200 border-gray-200'
                          } hover:${isDarkMode ? 'bg-gray-700/40' : 'bg-blue-50/40'}`}
                        >
                          <div className={`col-span-1 px-4 py-3 text-left text-xs font-bold ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>{p.module}</div>

                          {(['can_view', 'can_create', 'can_edit', 'can_delete', 'can_print', 'can_export'] as const).map((action) => {
                            const isGranted = p[action];
                            const label = action.replace('can_', '');
                            const colorMap: Record<string, string> = {
                              can_view: 'bg-blue-600',
                              can_create: 'bg-blue-500',
                              can_edit: 'bg-blue-400',
                              can_delete: 'bg-blue-700',
                              can_print: 'bg-blue-300',
                              can_export: 'bg-blue-800',
                            };
                            return (
                              <div key={action} className="px-2 py-3 flex items-center justify-center">
                                <button
                                  onClick={() => handleTogglePermission(idx, action)}
                                  title={`${isGranted ? 'Revoke' : 'Grant'} ${label}`}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all hover:scale-110 active:scale-95 ${
                                    isGranted
                                      ? `${colorMap[action]} border-transparent text-white shadow-md`
                                      : isDarkMode
                                      ? 'border-gray-600 bg-gray-800 text-gray-600 hover:border-gray-400'
                                      : 'border-gray-300 bg-white text-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {isGranted ? <Check className="w-4 h-4" /> : <X className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`p-10 bg-gray-500/5 flex items-center justify-between border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-[12px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
                >
                   Discard Changes
                </button>
                <button 
                  onClick={handleSave}
                  className="px-16 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-4"
                >
                  <Unlock className="w-5 h-5" />
                  Apply Matrix
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
