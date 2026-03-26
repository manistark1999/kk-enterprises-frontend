import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  CreditCard, 
  Hash, 
  User, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  ShieldCheck, 
  History, 
  Download, 
  Settings, 
  X, 
  Check, 
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  PieChart
} from 'lucide-react';
import { useBankAccounts } from '@/contexts/BankAccountsContext';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';

interface BankAccountsScreenProps {
  isDarkMode: boolean;
}

export function BankAccountsScreen({ isDarkMode }: BankAccountsScreenProps) {
  const { canCreate, canEdit, canDelete } = useAuth();
  const { bankAccounts, isLoading, addBankAccount, updateBankAccount, deleteBankAccount, refreshBankAccounts } = useBankAccounts();
  const { addNotification } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [showBalances, setShowBalances] = useState(true);

  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    accountType: 'Savings' as 'Savings' | 'Current' | 'CC/OD',
    branchName: '',
    openingBalance: 0,
    status: 'Active' as 'Active' | 'Inactive'
  });

  const accountTypes = ['Savings', 'Current', 'CC/OD'];

  const handleOpenDrawer = (account?: any) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        accountName: account.accountName,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountHolderName: account.accountHolderName,
        ifscCode: account.ifscCode,
        accountType: account.accountType as 'Savings' | 'Current' | 'CC/OD',
        branchName: account.branchName || '',
        openingBalance: account.openingBalance,
        status: account.status
      });
    } else {
      setEditingAccount(null);
      setFormData({
        accountName: '',
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        ifscCode: '',
        accountType: 'Savings',
        branchName: '',
        openingBalance: 0,
        status: 'Active'
      });
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingAccount(null);
  };

  const handleSave = async () => {
    try {
      if (editingAccount) {
        await updateBankAccount(editingAccount.id, formData);
        toast.success('Bank account updated successfully');
        addNotification('Edited', formData.accountName, 'Bank Account', 'Updated bank account details');
      } else {
        await addBankAccount({ ...formData, currentBalance: formData.openingBalance });
        toast.success('Bank account added successfully');
        addNotification('Added', formData.accountName, 'Bank Account', 'Registered new bank account');
      }
      handleCloseDrawer();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save bank account');
    }
  };

  const handleDelete = async (id: string) => {
    const acc = bankAccounts.find(a => a.id === id);
    if (!acc) return;
    if (confirm('Are you sure you want to delete this bank account?')) {
      try {
        await deleteBankAccount(id);
        toast.success('Bank account deleted successfully');
        addNotification('Deleted', acc.accountName, 'Bank Account', 'Removed bank account');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete bank account');
      }
    }
  };

  const filteredAccounts = bankAccounts.filter(account => {
    const matchesSearch = account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.accountNumber.includes(searchTerm);
    const matchesStatus = filterStatus === 'All' || account.status === filterStatus;
    const matchesType = filterType === 'All' || account.accountType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalAccounts = bankAccounts.length;
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
  const activeAccounts = bankAccounts.filter(a => a.status === 'Active').length;

  const getAccountTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Savings': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
      'Current': 'bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-400',
      'Cash Credit': 'bg-blue-100 text-blue-700 dark:bg-blue-800/20 dark:text-blue-400',
      'CC/OD': 'bg-blue-100 text-blue-700 dark:bg-blue-800/20 dark:text-blue-400',
      'Fixed Deposit': 'bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-400',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400';
  };

  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Bank Accounts
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
            Manage company bank accounts and financial institutions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => refreshBankAccounts()}
            className={`p-2.5 rounded-xl border transition-all ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-white border-slate-200 text-gray-500 hover:text-gray-900 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={() => setShowBalances(!showBalances)}
            className={`p-2.5 rounded-xl border transition-all ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-white border-slate-200 text-gray-500 hover:text-gray-900 hover:bg-slate-50'
            }`}
          >
            {showBalances ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          {canCreate('Bank Accounts') && (
            <button
              onClick={() => handleOpenDrawer()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 translate-y-0"
            >
              <Plus className="w-5 h-5" />
              Add Account
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Accounts', value: totalAccounts, icon: Building2, color: 'blue' },
          { 
            label: 'Total Balance', 
            value: showBalances ? `₹${totalBalance.toLocaleString('en-IN')}` : '••••••', 
            icon: DollarSign, 
            color: 'blue' 
          },
          { label: 'Active Accounts', value: activeAccounts, icon: ShieldCheck, color: 'blue' },
          { label: 'Avg Monthly Txns', value: '458', icon: Activity, color: 'purple' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-5 rounded-2xl border ${
              isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
              </div>
              <Activity className="w-4 h-4 text-gray-500 opacity-30" />
            </div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
            <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Control Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col lg:flex-row gap-4 lg:items-center justify-between ${
        isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search bank name, account number or nickname..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all ${
                isDarkMode 
                  ? 'bg-gray-900/50 border-gray-700 text-white focus:border-primary' 
                  : 'bg-slate-50 border-slate-200 text-gray-900 focus:border-primary focus:bg-white'
              }`}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`px-3 py-2.5 rounded-xl border bg-transparent ${isDarkMode ? 'border-gray-700 text-slate-300' : 'border-slate-200 text-gray-700'}`}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-3 py-2.5 rounded-xl border bg-transparent ${isDarkMode ? 'border-gray-700 text-slate-300' : 'border-slate-200 text-gray-700'}`}
            >
              <option value="All">All Types</option>
              {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-gray-900/50 rounded-xl">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'table' 
                ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'grid' 
                ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Main Content View */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
             <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Fetching accounts...</p>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className={`h-full flex flex-col items-center justify-center space-y-4 rounded-3xl border-2 border-dashed ${
            isDarkMode ? 'border-gray-800 bg-gray-800/10' : 'border-slate-100 bg-slate-50/50'
          }`}>
            <div className="p-4 rounded-full bg-slate-200 dark:bg-gray-800">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <div className="text-center">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Accounts Found</h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Try adjusting your search or filters</p>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <div className={`h-full overflow-hidden rounded-2xl border ${
            isDarkMode ? 'bg-gray-800/20 border-gray-700' : 'bg-white border-slate-200'
          }`}>
            <div className="h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-700">
              <table className="w-full text-left border-collapse">
                <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-slate-50'}`}>
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Bank Details</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Account Type</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Balance</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {filteredAccounts.map((account) => (
                    <motion.tr 
                      layout
                      key={account.id}
                      className={`group transition-colors ${isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                            isDarkMode ? 'bg-gray-700 text-white' : 'bg-slate-100 text-gray-700'
                          }`}>
                            {account.bankName[0]}
                          </div>
                          <div>
                            <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {account.accountName}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-2 mt-1`}>
                              <span className="font-medium">{account.bankName}</span>
                              <span className="opacity-30">•</span>
                              <span className="font-mono">{account.accountNumber.replace(/\d(?=\d{4})/g, "•")}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getAccountTypeColor(account.accountType)}`}>
                          {account.accountType}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`font-mono font-bold text-lg ${
                          account.currentBalance < 0 
                            ? 'text-blue-700' 
                            : (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                        }`}>
                          {showBalances ? `₹${(account.currentBalance || 0).toLocaleString('en-IN')}` : '••••••••'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`flex items-center gap-2 font-semibold text-xs ${
                          account.status === 'Active' ? 'text-blue-500' : 'text-gray-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${account.status === 'Active' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                          {account.status}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEdit('Bank Accounts') && (
                            <button 
                              onClick={() => handleOpenDrawer(account)}
                              className="p-2 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                          )}
                          {canDelete('Bank Accounts') && (
                            <button 
                              onClick={() => handleDelete(account.id)}
                              className="p-2 rounded-lg hover:bg-blue-700/10 text-gray-400 hover:text-blue-700 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              {filteredAccounts.map((account) => (
                <motion.div
                  layout
                  key={account.id}
                  className={`p-6 rounded-3xl border transition-all hover:scale-[1.02] cursor-pointer group ${
                    isDarkMode ? 'bg-gray-800/40 border-gray-700 hover:border-gray-500' : 'bg-white border-slate-200 shadow-sm hover:shadow-xl'
                  }`}
                  onClick={() => handleOpenDrawer(account)}
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg ring-4 ring-white/10">
                        <Building2 className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{account.accountName}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{account.bankName}</p>
                      </div>
                    </div>
                    <div className="relative group/more">
                      <div className={`p-2 rounded-xl border ${isDarkMode ? 'border-gray-700 text-gray-500' : 'border-slate-100 text-gray-400'}`}>
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl mb-6 ${isDarkMode ? 'bg-gray-900/50' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-bold text-gray-500 tracking-wider">BALANCE</span>
                       <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${getAccountTypeColor(account.accountType)}`}>
                        {account.accountType}
                      </span>
                    </div>
                    <div className={`text-2xl font-mono font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {showBalances ? `₹${(account.currentBalance || 0).toLocaleString('en-IN')}` : '••••••••'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className={`text-sm font-mono truncate ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                        {account.accountNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-xl bg-slate-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 translate-x-2 group-hover:translate-x-0">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className={`relative w-full max-w-lg h-full shadow-2xl flex flex-col ${
                isDarkMode ? 'bg-gray-900' : 'bg-white'
              }`}
            >
              {/* Drawer Header */}
              <div className={`p-6 border-b flex items-center justify-between ${
                isDarkMode ? 'border-gray-800' : 'border-slate-100'
              }`}>
                <div>
                  <h2 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {editingAccount ? 'Edit Account' : 'New Bank Account'}
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Configure your financial connection details
                  </p>
                </div>
                <button 
                  onClick={handleCloseDrawer}
                  className={`p-2.5 rounded-xl transition-colors ${
                    isDarkMode ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-slate-100 text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                <section>
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Building2 className="w-4 h-4" />
                    Core Identity
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Account Nickname *</label>
                      <input 
                        type="text"
                        value={formData.accountName}
                        onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                        placeholder="e.g. KK Enterprises - Primary"
                        className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all ${
                          isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-primary' : 'bg-slate-50 border-slate-200 text-gray-900 focus:border-primary'
                        }`}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bank Name *</label>
                        <input 
                          type="text"
                          value={formData.bankName}
                          onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                          placeholder="HDFC Bank"
                          className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all ${
                            isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-primary' : 'bg-slate-50 border-slate-200 text-gray-900 focus:border-primary'
                          }`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Account Type</label>
                        <select
                          value={formData.accountType}
                          onChange={(e) => setFormData({...formData, accountType: e.target.value as any})}
                          className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all ${
                            isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-primary' : 'bg-slate-50 border-slate-200 text-gray-900 focus:border-primary'
                          }`}
                        >
                          {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Hash className="w-4 h-4" />
                    Technical Details
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Full Account Number *</label>
                      <input 
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                        placeholder="0000 0000 0000 0000"
                        className={`w-full px-4 py-3 rounded-xl border font-mono font-bold outline-none transition-all ${
                          isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-primary' : 'bg-slate-50 border-slate-200 text-gray-900 focus:border-primary'
                        }`}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>IFSC Code *</label>
                        <input 
                          type="text"
                          value={formData.ifscCode}
                          onChange={(e) => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})}
                          placeholder="HDFC0001234"
                          className={`w-full px-4 py-3 rounded-xl border font-mono font-bold outline-none transition-all ${
                            isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-primary' : 'bg-slate-50 border-slate-200 text-gray-900 focus:border-primary'
                          }`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Branch Name</label>
                        <input 
                          type="text"
                          value={formData.branchName}
                          onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                          placeholder="Cyber City, Gurugram"
                          className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all ${
                            isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-primary' : 'bg-slate-50 border-slate-200 text-gray-900 focus:border-primary'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Account Holder Name *</label>
                      <input 
                        type="text"
                        value={formData.accountHolderName}
                        onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                        placeholder="John Doe"
                        className={`w-full px-4 py-3 rounded-xl border font-medium outline-none transition-all ${
                          isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-primary' : 'bg-slate-50 border-slate-200 text-gray-900 focus:border-primary'
                        }`}
                      />
                    </div>
                  </div>
                </section>

                {!editingAccount && (
                  <section>
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <DollarSign className="w-4 h-4" />
                      Opening Balance
                    </h3>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</div>
                      <input 
                        type="number"
                        value={formData.openingBalance}
                        onChange={(e) => setFormData({...formData, openingBalance: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                        className={`w-full pl-8 pr-4 py-4 rounded-3xl border font-black text-2xl outline-none transition-all ${
                          isDarkMode ? 'bg-gray-800 border-gray-700 text-blue-400 focus:border-blue-500' : 'bg-blue-50 border-blue-100 text-blue-700 focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </section>
                )}

                <section className="pt-4">
                  <div className={`p-4 rounded-3xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-gray-800/20 border-gray-700' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${formData.status === 'Active' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Account Status</div>
                        <div className="text-xs text-gray-500">Enable or disable transactions</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        formData.status === 'Active' ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                        formData.status === 'Active' ? 'left-7 shadow-lg' : 'left-1'
                      }`}></div>
                    </button>
                  </div>
                </section>
              </div>

              {/* Drawer Footer */}
              <div className={`p-6 border-t ${
                isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-slate-100 bg-slate-50/30'
              }`}>
                <div className="flex gap-4">
                  <button 
                    onClick={handleCloseDrawer}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                      isDarkMode ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' : 'bg-white border-2 border-slate-100 text-gray-500 hover:bg-slate-50'
                    }`}
                  >
                    Cancel
                  </button>
                  {(editingAccount ? canEdit('Bank Accounts') : canCreate('Bank Accounts')) && (
                    <button 
                      onClick={handleSave}
                      className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/30 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-6 h-6" />
                      {editingAccount ? 'Update Changes' : 'Create Account'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}