import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Shield, ShieldCheck, ShieldAlert,
  UserPlus, Users, X, CheckCircle, Lock, Edit2, Trash2,
  Mail, Key, Eye, EyeOff, Check, Settings, ChevronRight, Unlock
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: number;
  email: string;
  role: string;
  must_change_password: boolean;
  created_at: string;
}

interface ModulePermission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_print: boolean;
  can_export: boolean;
}

const ALL_MODULES = [
  'Dashboard', 'Customer', 'Transport', 'Vehicle Make', 'Vehicle Register',
  'Work Group', 'Work Type', 'Supplier', 'Staff', 'Brand', 'Item', 'Bank Accounts',
  'Job Card', 'Estimation', 'Labour Bill',
  'Receipt', 'Payment', 'Purchase', 'Sales', 'Expense Entry', 'Staff Advance',
  'Salary Entry', 'Bank Ledger', 'Stock Adjustment', 'Stock List', 'Cash Entry',
  'Alignment Register', 'Expense Register', 'Receipt Register', 'Cash Register',
  'Stock Adjustments Register', 'Stock Report', 'Stock Register', 'GST Report', 'MIS Report', 'Reports',
  'Company', 'Financial Year', 'User Management', 'Role Management', 'History'
];

const ACTIONS = ['view', 'create', 'edit', 'delete', 'print', 'export'] as const;
type Action = typeof ACTIONS[number];

const ACTION_COLORS: Record<Action, string> = {
  view: 'bg-blue-600',
  create: 'bg-blue-500',
  edit: 'bg-blue-400',
  delete: 'bg-blue-700',
  print: 'bg-blue-300',
  export: 'bg-blue-800',
};

const ACTION_HEADER_COLORS: Record<Action, string> = {
  view: 'text-blue-600',
  create: 'text-blue-500',
  edit: 'text-blue-400',
  delete: 'text-blue-700',
  print: 'text-blue-300',
  export: 'text-blue-800',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function UserManagementScreen({ isDarkMode }: { isDarkMode: boolean }) {
  const { canView, hasPermission, refreshPermissions } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Create/Edit user modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forceChange, setForceChange] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'staff' });

  // Permissions modal
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [permTarget, setPermTarget] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [permLoading, setPermLoading] = useState(false);
  const [permSaving, setPermSaving] = useState(false);

  // ── Fetch users ─────────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.success) setUsers(res.data?.data || res.data || []);
    } catch (e: any) {
      toast.error(`Failed to fetch users: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (canView('User Management')) {
      fetchUsers(); 
    }
  }, []);

  // ── Open user modal ──────────────────────────────────────────────────────────
  const openUserModal = (user?: User, resetMode = false) => {
    setEditingUser(user || null);
    setIsResetMode(resetMode);
    setFormData({ email: user?.email || '', password: '', role: user?.role || 'staff' });
    setForceChange(false);
    setShowPassword(false);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.email) return toast.error('Email is required');
    if ((!editingUser && !formData.password) || (isResetMode && !formData.password)) {
      return toast.error('Password is required');
    }
    try {
      const payload: any = { ...formData };
      if (forceChange) payload.must_change_password = true;
      const res = editingUser
        ? await api.put(`/users/${editingUser.id}`, payload)
        : await api.post('/users', payload);
      if (res.success) {
        toast.success(editingUser ? (isResetMode ? 'Password reset' : 'User updated') : 'User created');
        setIsUserModalOpen(false);
        fetchUsers();
      }
    } catch (e: any) {
      toast.error(`Operation failed: ${e.message}`);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      const res = await api.delete(`/users/${id}`);
      if (res.success) { toast.success('User deleted'); fetchUsers(); }
    } catch (e: any) {
      toast.error(`Delete failed: ${e.message}`);
    }
  };

  // ── Permissions modal ────────────────────────────────────────────────────────
  const openPermModal = async (user: User) => {
    setPermTarget(user);
    setIsPermModalOpen(true);
    setPermLoading(true);
    try {
      const res = await api.get(`/user-permissions/${user.id}`);
      if (res.success) {
        const data: any[] = res.data?.data || res.data || [];
        // Merge with ALL_MODULES ensuring all modules appear
        const byModule = new Map(data.map(p => [p.module, p]));
        const merged = ALL_MODULES.map(m => byModule.get(m) || {
          module: m, can_view: false, can_create: false, can_edit: false,
          can_delete: false, can_print: false, can_export: false
        });
        setPermissions(merged);
      }
    } catch (e: any) {
      toast.error(`Failed to load permissions: ${e.message}`);
    } finally {
      setPermLoading(false);
    }
  };

  const togglePermission = (moduleIndex: number, action: Action) => {
    setPermissions(prev => {
      const updated = [...prev];
      const col = `can_${action}` as keyof ModulePermission;
      updated[moduleIndex] = { ...updated[moduleIndex], [col]: !updated[moduleIndex][col] };
      return updated;
    });
  };

  const grantAll = () => setPermissions(prev => prev.map(p => ({
    ...p, can_view: true, can_create: true, can_edit: true,
    can_delete: true, can_print: true, can_export: true
  })));

  const revokeAll = () => setPermissions(prev => prev.map(p => ({
    ...p, can_view: false, can_create: false, can_edit: false,
    can_delete: false, can_print: false, can_export: false
  })));

  const toggleModule = (idx: number) => {
    const allOn = ACTIONS.every(a => permissions[idx][`can_${a}` as keyof ModulePermission]);
    setPermissions(prev => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        can_view: !allOn, can_create: !allOn, can_edit: !allOn,
        can_delete: !allOn, can_print: !allOn, can_export: !allOn
      };
      return updated;
    });
  };

  const handleSavePermissions = async () => {
    if (!permTarget) return;
    setPermSaving(true);
    try {
      const res = await api.put(`/user-permissions/${permTarget.id}`, { permissions });
      if (res.success) {
        toast.success(`Permissions saved for ${permTarget.email}`);
        setIsPermModalOpen(false);
        // Refresh current user's permissions in case admin edited their own
        await refreshPermissions();
      }
    } catch (e: any) {
      toast.error(`Save failed: ${e.message}`);
    } finally {
      setPermSaving(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColor = (role: string) => {
    if (role === 'super_admin') return 'bg-blue-600/10 text-blue-700 border-blue-600/30 font-black';
    if (role === 'manager') return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    return 'bg-gray-500/10 text-gray-500 border-gray-500/10';
  };

  const roleLabel = (role: string) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'manager') return 'Manager';
    return role || 'Staff';
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} p-8 font-sans overflow-y-auto`}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/10 to-blue-500/20 flex items-center justify-center text-blue-600">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                User Management
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600/80">
                  Security & Access Control
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                  : 'bg-white border-gray-200 text-gray-400 hover:text-gray-700 shadow-sm'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {hasPermission('User Management', 'create') && (
              <button
                onClick={() => openUserModal()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4" /> Add User
              </button>
            )}
          </div>
        </div>

        {/* ── Users Table ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border overflow-hidden ${
            isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200 shadow-xl shadow-gray-200/50'
          }`}
        >
          {/* Toolbar */}
          <div className={`p-5 border-b flex flex-col md:flex-row gap-4 items-center justify-between ${
            isDarkMode ? 'border-gray-800' : 'border-gray-100'
          }`}>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm border outline-none transition-all ${
                  isDarkMode ? 'bg-gray-950 border-gray-700 text-white focus:border-blue-500/50'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-300 focus:bg-white'
                }`}
              />
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {filteredUsers.length} Users
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDarkMode ? 'bg-gray-950/40' : 'bg-gray-50'}>
                  {['User', 'Role', 'Created', 'Actions'].map(h => (
                    <th key={h} className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-widest ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    } ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800/50' : 'divide-gray-100'}`}>
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto opacity-30" />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No users found</p>
                    </td>
                  </tr>
                ) : filteredUsers.map(u => (
                  <motion.tr
                    layout key={u.id}
                    className={`transition-colors ${isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-blue-50/30'}`}
                  >
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isDarkMode ? 'bg-gray-800 text-blue-400' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{u.email}</div>
                          {u.must_change_password && (
                            <span className="text-xs text-blue-500 font-medium">⚠ Must change password</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${roleColor(u.role)}`}>
                        {roleLabel(u.role)}
                      </span>
                    </td>

                    {/* Created */}
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Permissions button — always visible for admins */}
                        {hasPermission('User Management', 'edit') && (
                          <button
                            onClick={() => openPermModal(u)}
                            title="Manage Permissions"
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                              isDarkMode ? 'bg-gray-800 hover:bg-blue-600/20 text-blue-400'
                                : 'bg-gray-50 hover:bg-blue-100 text-blue-600'
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission('User Management', 'edit') && (
                          <button
                            onClick={() => openUserModal(u)}
                            title="Edit User"
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                              isDarkMode ? 'bg-gray-800 hover:bg-blue-600/20 text-blue-400'
                                : 'bg-gray-50 hover:bg-blue-100 text-blue-600'
                            }`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission('User Management', 'edit') && (
                          <button
                            onClick={() => openUserModal(u, true)}
                            title="Reset Password"
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                              isDarkMode ? 'bg-gray-800 hover:bg-blue-600/20 text-blue-400'
                                : 'bg-gray-50 hover:bg-blue-100 text-blue-600'
                            }`}
                          >
                            <Key className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission('User Management', 'delete') && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            title="Delete User"
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                              isDarkMode ? 'bg-gray-800 hover:bg-blue-900/40 text-blue-300'
                                : 'bg-gray-50 hover:bg-blue-100 text-blue-700'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* USER CREATE / EDIT MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsUserModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 24 }}
              className={`relative w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden ${
                isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'
              }`}
            >
              {/* Header */}
              <div className="p-8 pb-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {editingUser ? (isResetMode ? 'Reset Password' : 'Edit User') : 'Create User'}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest font-medium">
                      {isResetMode ? 'Password Management' : 'Account Setup'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                {/* Email */}
                {(!editingUser || !isResetMode) && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-blue-600/80">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        disabled={!!editingUser && !isResetMode}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="user@company.com"
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm border outline-none transition-all ${
                          isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-blue-500/50'
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-300 focus:bg-white'
                        } disabled:opacity-60`}
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                {(!editingUser || isResetMode) && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-blue-600/80">
                      {isResetMode ? 'New Password' : 'Password'}
                    </label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className={`w-full pl-11 pr-12 py-3.5 rounded-xl text-sm border outline-none transition-all ${
                          isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-blue-500/50'
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-300 focus:bg-white'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={forceChange}
                        onChange={e => setForceChange(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Force password change on next login
                      </span>
                    </label>
                  </div>
                )}

                {/* Role */}
                {!isResetMode && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-blue-600/80">Access Role</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'staff', label: 'Staff' },
                        { key: 'manager', label: 'Manager' },
                        { key: 'super_admin', label: 'Super Admin' }
                      ].map(r => (
                        <button
                          key={r.key}
                          onClick={() => setFormData({ ...formData, role: r.key })}
                          className={`p-3 rounded-xl border-2 text-xs font-bold uppercase tracking-wider transition-all relative ${
                            formData.role === r.key
                              ? r.key === 'super_admin'
                                ? 'border-blue-600 bg-blue-600/5 text-blue-700 font-black'
                                : 'border-blue-500 bg-blue-500/5 text-blue-600'
                              : isDarkMode
                                ? 'border-gray-700 text-gray-400 hover:border-gray-500'
                                : 'border-gray-200 text-gray-400 hover:border-gray-300'
                          }`}
                        >
                          {r.label}
                          {formData.role === r.key && (
                            <CheckCircle className={`absolute top-1.5 right-1.5 w-3 h-3 ${r.key === 'super_admin' ? 'text-blue-700' : 'text-blue-500'}`} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`p-6 border-t flex justify-between items-center ${isDarkMode ? 'border-gray-800 bg-gray-900/30' : 'border-gray-100 bg-gray-50/50'}`}>
                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PERMISSIONS MATRIX MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isPermModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPermModalOpen(false)}
              className="absolute inset-0 bg-gray-900/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 24 }}
              className={`relative w-full max-w-5xl h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl ${
                isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'
              }`}
            >
              {/* Perm Modal Header */}
              <div className={`px-8 py-6 flex items-center justify-between border-b flex-shrink-0 ${
                isDarkMode ? 'border-gray-800' : 'border-gray-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Permissions — {permTarget?.email}
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600/80 mt-0.5">
                      Per-User Module Access Control
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={grantAll}
                    className="px-4 py-2 rounded-xl bg-blue-600/10 text-blue-600 text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                  >
                    Grant All
                  </button>
                  <button
                    onClick={revokeAll}
                    className="px-4 py-2 rounded-xl bg-blue-700/10 text-blue-700 text-xs font-black uppercase tracking-widest hover:bg-blue-700 hover:text-white transition-all"
                  >
                    Revoke All
                  </button>
                  <button onClick={() => setIsPermModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Matrix */}
              <div className="flex-1 overflow-y-auto">
                {permLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-8 h-8 text-purple-500 animate-spin opacity-40" />
                  </div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                        <th className={`px-5 py-4 text-left text-xs font-black uppercase tracking-widest w-48 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Module
                        </th>
                        {ACTIONS.map(a => (
                          <th key={a} className={`px-3 py-4 text-center text-xs font-black uppercase tracking-wider ${ACTION_HEADER_COLORS[a]}`}>
                            {a}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800/60' : 'divide-gray-100'}`}>
                      {permissions.map((p, idx) => {
                        const allOn = ACTIONS.every(a => p[`can_${a}` as keyof ModulePermission]);
                        const someOn = ACTIONS.some(a => p[`can_${a}` as keyof ModulePermission]);

                        return (
                          <tr
                            key={p.module}
                            className={`transition-colors ${
                              idx % 2 === 0
                                ? isDarkMode ? 'bg-gray-950/60' : 'bg-white'
                                : isDarkMode ? 'bg-gray-900/40' : 'bg-gray-50/50'
                            } hover:${isDarkMode ? 'bg-blue-900/10' : 'bg-blue-50/30'}`}
                          >
                            {/* Module name (click to toggle all) */}
                            <td className="px-5 py-3">
                              <button
                                onClick={() => toggleModule(idx)}
                                className={`flex items-center gap-2 text-left text-sm font-bold transition-colors group ${
                                  allOn
                                    ? 'text-blue-600'
                                    : someOn
                                      ? isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                      : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}
                              >
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${allOn ? 'bg-blue-500' : someOn ? 'bg-blue-400' : 'bg-gray-300'}`} />
                                {p.module}
                              </button>
                            </td>

                            {/* Permission toggles */}
                            {ACTIONS.map(action => {
                              const col = `can_${action}` as keyof ModulePermission;
                              const granted = !!p[col];
                              return (
                                <td key={action} className="px-3 py-3 text-center">
                                  <button
                                    onClick={() => togglePermission(idx, action)}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto border-2 transition-all hover:scale-110 active:scale-95 ${
                                      granted
                                        ? `${ACTION_COLORS[action]} border-transparent text-white shadow-sm`
                                        : isDarkMode
                                          ? 'border-gray-700 bg-gray-800 text-gray-600 hover:border-gray-500'
                                          : 'border-gray-200 bg-white text-gray-300 hover:border-gray-300'
                                    }`}
                                  >
                                    {granted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3 h-3" />}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Perm Modal Footer */}
              <div className={`px-8 py-5 border-t flex justify-between items-center flex-shrink-0 ${
                isDarkMode ? 'border-gray-800 bg-gray-900/30' : 'border-gray-100 bg-gray-50/50'
              }`}>
                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <span className="font-bold text-blue-500">{permissions.filter(p => ACTIONS.some(a => p[`can_${a}` as keyof ModulePermission])).length}</span>
                  /{permissions.length} modules with access · Changes apply immediately
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsPermModalOpen(false)}
                    className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePermissions}
                    disabled={permSaving}
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                  >
                    {permSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                    {permSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
