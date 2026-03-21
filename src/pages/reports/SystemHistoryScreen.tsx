import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Download, 
  RefreshCcw, 
  ChevronLeft, 
  ChevronRight,
  Database,
  User,
  Clock,
  Info,
  AlertCircle,
  CheckCircle2,
  Trash2,
  FileEdit,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { api, endpoints } from '@/services/api';
import { format } from 'date-fns';

interface HistoryLog {
  id: number;
  module_name: string;
  action_type: string;
  record_id: string;
  title: string;
  description: string;
  user_name: string;
  created_at: string;
}

interface SystemHistoryScreenProps {
  isDarkMode: boolean;
}

export function SystemHistoryScreen({ isDarkMode }: SystemHistoryScreenProps) {
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('All');
  const [filterAction, setFilterAction] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoints.dashboard.recentActivity);
      console.log('[SystemHistory] Fetch logs response:', response);
      
      if (response.success && response.data) {
        // Robust unwrap: handle response.data.data (array) fallback to response.data
        const rawLogs = response.data.data || response.data;
        if (Array.isArray(rawLogs)) {
          setLogs(rawLogs);
        } else {
          console.warn('[SystemHistory] Unexpected logs format:', rawLogs);
          setLogs([]);
        }
      }
    } catch (error) {
      console.error('[SystemHistory] Failed to fetch history logs:', error);
      setLogs([]); // Fallback to empty array to prevent Crashes
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <PlusCircle className="w-4 h-4 text-green-500" />;
      case 'UPDATE': return <FileEdit className="w-4 h-4 text-blue-500" />;
      case 'DELETE': return <Trash2 className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    const baseClass = "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider";
    switch (action) {
      case 'CREATE': return `${baseClass} bg-green-500/10 text-green-500 border border-green-500/20`;
      case 'UPDATE': return `${baseClass} bg-blue-500/10 text-blue-500 border border-blue-500/20`;
      case 'DELETE': return `${baseClass} bg-red-500/10 text-red-500 border border-red-500/20`;
      default: return `${baseClass} bg-gray-500/10 text-gray-500 border border-gray-500/20`;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = filterModule === 'All' || log.module_name === filterModule;
    const matchesAction = filterAction === 'All' || log.action_type === filterAction;
    
    return matchesSearch && matchesModule && matchesAction;
  });

  const modules = ['All', ...Array.from(new Set(logs.map(l => l.module_name)))];
  const actions = ['All', 'CREATE', 'UPDATE', 'DELETE'];

  const cardClass = `rounded-2xl ${
    isDarkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-200'
  } border shadow-sm backdrop-blur-xl overflow-hidden`;

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <HistoryIcon className="w-7 h-7 text-blue-500" />
            System Audit Log
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Track all changes and activities across the entire system.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchLogs}
            className={`p-2.5 rounded-xl border transition-all ${
              isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold shadow-lg shadow-blue-500/30 transition-all ${
              'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
            }`}
          >
            <Download className="w-5 h-5" />
            Export Log
          </motion.button>
        </div>
      </div>

      {/* Filters Section */}
      <div className={cardClass}>
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activity, description, or module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-0 transition-all text-sm outline-none focus:ring-2 focus:ring-blue-500/20 ${
                isDarkMode ? 'bg-gray-900/50 text-white' : 'bg-gray-50 text-gray-900'
              }`}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="bg-transparent border-0 text-sm outline-none cursor-pointer p-1"
              >
                {modules.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              <Database className="w-4 h-4 text-gray-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="bg-transparent border-0 text-sm outline-none cursor-pointer p-1"
              >
                {actions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cardClass}>
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading activity history...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-300 dark:border-gray-700">
              <HistoryIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Activities Found</h3>
            <p className={`text-sm mt-1 max-w-xs mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Try adjusting your search filters or check back later for new updates.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${isDarkMode ? 'bg-gray-900/40 text-gray-400' : 'bg-gray-50 text-gray-600'} text-xs font-bold uppercase tracking-wider text-left`}>
                  <th className="px-6 py-4">Action & Time</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Activity Title</th>
                  <th className="px-6 py-4">Performed By</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filteredLogs.map((log) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={log.id}
                    className={`group transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700/20' : 'hover:bg-blue-50/30'
                    }`}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          log.action_type === 'CREATE' ? 'bg-green-500/10' :
                          log.action_type === 'UPDATE' ? 'bg-blue-500/10' :
                          'bg-red-500/10'
                        }`}>
                          {getActionIcon(log.action_type)}
                        </div>
                        <div>
                          <div className={getActionBadge(log.action_type)}>
                            {log.action_type}
                          </div>
                          <div className={`text-[11px] mt-1 font-medium flex items-center gap-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            <Clock className="w-3 h-3" />
                            {format(new Date(log.created_at), 'dd MMM, HH:mm')}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                        isDarkMode ? 'bg-gray-900 text-blue-400 border border-gray-700' : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        {log.module_name}
                      </div>
                    </td>
                    
                    <td className="px-6 py-5">
                      <div className="max-w-md">
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {log.title}
                        </p>
                        <p className={`text-xs mt-0.5 line-clamp-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {log.description}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                          {log.user_name?.substring(0, 2) || 'AD'}
                        </div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {log.user_name || 'Admin'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <button className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                        isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-blue-600'
                      }`}>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className={`p-4 rounded-xl flex items-center gap-3 border border-dashed ${
        isDarkMode ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
      }`}>
        <Info className="w-5 h-5 flex-shrink-0" />
        <p className="text-xs font-medium">
          Detailed audit logs are stored for 180 days for security and compliance. Actions and descriptions are immutable and recorded at the moment of occurrence.
        </p>
      </div>
    </div>
  );
}
