import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Database, 
  ArrowRight, 
  RefreshCw,
  Eye,
  Trash2,
  FileText,
  AlertCircle,
  Tag,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, endpoints } from '@/services/api';
import { format } from 'date-fns';
import { 
  getCardClass, 
  getInputClass
} from '@/utils/formStyles';

interface AuditLog {
  id: number;
  table_name: string;
  record_id: string;
  action: string;
  changed_data: any;
  performed_by: string;
  created_at: string;
}

export function HistoryLogScreen({ isDarkMode }: { isDarkMode: boolean }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('All');
  const [filterAction, setFilterAction] = useState('All');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '100');
      if (filterModule !== 'All') params.append('table_name', filterModule);
      if (filterAction !== 'All') params.append('action', filterAction);
      
      const response = await api.get(`/audit-logs?${params.toString()}`);
      console.log('[HistoryLog] Fetch logs response:', response);
      
      if (response.success && response.data) {
        // Robust unwrap: handle response.data.data (array) fallback to response.data
        const rawLogs = response.data.data || response.data;
        if (Array.isArray(rawLogs)) {
          setLogs(rawLogs);
        } else {
          console.warn('[HistoryLog] Unexpected logs format:', rawLogs);
          setLogs([]);
        }
      }
    } catch (error) {
      console.error('[HistoryLog] Failed to fetch audit logs:', error);
      setLogs([]); // Prevent map/filter crashes on undefined state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterModule, filterAction]);

  const cardClass = getCardClass(isDarkMode);
  const inputClass = getInputClass(isDarkMode);

  const modules = [
    'All',
    'jobcards',
    'customers',
    'labour_bills',
    'estimations',
    'items',
    'suppliers',
    'vehicle_makes',
    'vehicle_register',
    'payments',
    'receipts',
    'staff',
    'transports'
  ];

  const actions = ['All', 'CREATE', 'UPDATE', 'DELETE', 'PRINT'];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performed_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.record_id?.toString().includes(searchTerm);
    return matchesSearch;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'UPDATE': return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'DELETE': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'PRINT': return 'bg-purple-500/20 text-purple-500 border-purple-500/50';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  const formatModuleName = (name: string) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System History Log</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Comprehensive audit trail of all record changes</p>
          </div>
        </div>
        <button 
          onClick={fetchLogs}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by module, user, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-10 w-full`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className={`${inputClass}`}
            >
              {modules.map(m => <option key={m} value={m}>{m === 'All' ? 'All Modules' : formatModuleName(m)}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <select 
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className={`${inputClass}`}
            >
              {actions.map(a => <option key={a} value={a}>{a === 'All' ? 'All Actions' : a}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Module</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Record ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                        <span className="text-gray-500">Loading history logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Database className="w-12 h-12 opacity-20" />
                        <span>No history logs found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-blue-500/5 transition-colors group cursor-pointer`}
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-500">
                          {format(new Date(log.created_at), 'dd MMM yyyy')}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {format(new Date(log.created_at), 'hh:mm:ss a')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {formatModuleName(log.table_name)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                        #{log.record_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {log.performed_by.charAt(0).toUpperCase()}
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {log.performed_by || 'system'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-500 transition-all opacity-0 group-hover:opacity-100">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden`}
            >
              <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActionColor(selectedLog.action)}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Activity Details</h2>
                    <p className="text-xs text-gray-500">Log ID: {selectedLog.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="p-2 rounded-lg hover:bg-gray-500/20 transition-all"
                >
                  <AlertCircle className="rotate-45 w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500 mb-1">Module</p>
                    <p className="font-bold">{formatModuleName(selectedLog.table_name)}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500 mb-1">Action</p>
                    <p className={`font-bold ${selectedLog.action === 'DELETE' ? 'text-red-500' : 'text-blue-500'}`}>{selectedLog.action}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500 mb-1">Performed By</p>
                    <p className="font-bold">{selectedLog.performed_by}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                    <p className="font-bold">{format(new Date(selectedLog.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2 px-1">Changed Data</p>
                  <pre className={`p-4 rounded-xl overflow-x-auto text-xs font-mono ${
                    isDarkMode ? 'bg-black/50 text-blue-400' : 'bg-gray-900 text-green-400'
                  }`}>
                    {JSON.stringify(selectedLog.changed_data, null, 2)}
                  </pre>
                </div>
              </div>

              <div className={`p-6 border-t flex justify-end ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className={`px-6 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
