import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Shield, User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, XCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

interface UserManagementScreenProps {
  isDarkMode: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Manager' | 'Staff' | 'Accountant';
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

export function UserManagementScreen({ isDarkMode }: UserManagementScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Sample user data
  const [users, setUsers] = useState<User[]>([
    {
      id: 'USR-001',
      name: 'Yatan Prajapati',
      email: 'yatan@kkenterprises.com',
      phone: '+91 98765 43210',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2025-02-27 10:30 AM'
    },
    {
      id: 'USR-002',
      name: 'Rajesh Kumar',
      email: 'rajesh@kkenterprises.com',
      phone: '+91 98765 43211',
      role: 'Manager',
      status: 'Active',
      lastLogin: '2025-02-27 09:15 AM'
    },
    {
      id: 'USR-003',
      name: 'Priya Sharma',
      email: 'priya@kkenterprises.com',
      phone: '+91 98765 43212',
      role: 'Accountant',
      status: 'Active',
      lastLogin: '2025-02-26 05:45 PM'
    },
    {
      id: 'USR-004',
      name: 'Amit Verma',
      email: 'amit@kkenterprises.com',
      phone: '+91 98765 43213',
      role: 'Staff',
      status: 'Inactive',
      lastLogin: '2025-02-20 11:20 AM'
    }
  ]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Staff',
    status: 'Active'
  });

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }

    const newUser: User = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role as User['role'],
      status: formData.status as User['status'],
      lastLogin: 'Never'
    };

    setUsers([...users, newUser]);
    toast.success('User added successfully!');
    setShowAddUserModal(false);
    setFormData({ name: '', email: '', phone: '', password: '', role: 'Staff', status: 'Active' });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role,
      status: user.status
    });
    setShowAddUserModal(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    const updatedUsers = users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, ...formData, password: undefined }
        : user
    );
    setUsers(updatedUsers);
    toast.success('User updated successfully!');
    setShowAddUserModal(false);
    setSelectedUser(null);
    setFormData({ name: '', email: '', phone: '', password: '', role: 'Staff', status: 'Active' });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully!');
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700';
      case 'Manager': return isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'Accountant': return isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'Staff': return isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700';
      default: return isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

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
                <Users className={`w-8 h-8 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  User Management
                </h1>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Manage system users, roles, and permissions
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedUser(null);
                setFormData({ name: '', email: '', phone: '', password: '', role: 'Staff', status: 'Active' });
                setShowAddUserModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Add New User
            </motion.button>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`rounded-2xl border backdrop-blur-xl p-6 ${
            isDarkMode
              ? 'bg-gray-800/40 border-gray-700'
              : 'bg-white/40 border-gray-200'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-700 text-white'
                    : 'bg-white/50 border-gray-300 text-gray-900'
                }`}
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Accountant">Accountant</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-700 text-white'
                    : 'bg-white/50 border-gray-300 text-gray-900'
                }`}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
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
                    User ID
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Name
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Email
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Phone
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Role
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Last Login
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
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
                      {user.id}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {user.email}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {user.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.status === 'Active' ? (
                        <span className={`flex items-center gap-1 text-sm ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className={`flex items-center gap-1 text-sm ${
                          isDarkMode ? 'text-red-400' : 'text-red-600'
                        }`}>
                          <XCircle className="w-4 h-4" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'hover:bg-blue-500/20 text-blue-400'
                              : 'hover:bg-blue-100 text-blue-600'
                          }`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDarkMode
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
                Total Users
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {users.length}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Users
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {users.filter(u => u.status === 'Active').length}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Admins
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {users.filter(u => u.role === 'Admin').length}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Inactive Users
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {users.filter(u => u.status === 'Inactive').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddUserModal(false);
              setSelectedUser(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl border backdrop-blur-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedUser ? 'Edit User' : 'Add New User'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddUserModal(false);
                    setSelectedUser(null);
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
                {/* Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                        isDarkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                        isDarkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                        isDarkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Password {selectedUser ? '(Leave blank to keep current)' : '*'}
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      className={`w-full pl-10 pr-12 py-3 rounded-xl border transition-all ${
                        isDarkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Role *
                  </label>
                  <div className="relative">
                    <Shield className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all ${
                        isDarkMode
                          ? 'bg-gray-900/50 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="Staff">Staff</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddUserModal(false);
                    setSelectedUser(null);
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
                  onClick={selectedUser ? handleUpdateUser : handleAddUser}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {selectedUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
