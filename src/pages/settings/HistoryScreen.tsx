import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  RefreshCw, 
  History as HistoryIcon, 
  Calendar,
  User,
  Activity,
  Filter,
  ArrowRight,
  Info,
  Clock,
  ArrowUpRight,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { api, endpoints } from '@/services/api';

interface AuditLog {
  id: number;
  module_name: string;
  action_type: string;
  record_id: string | null;
  title: string;
  description: string;
  user_name: string;
  created_at: string;
  changed_data: any;
}

const ACTION_COLORS: Record<string, string> = {
  'CREATE': 'bg-green-100 text-green-700 border-green-200',
  'UPDATE': 'bg-blue-100 text-blue-700 border-blue-200',
  'DELETE': 'bg-red-100 text-red-700 border-red-200',
  'LOGIN': 'bg-purple-100 text-purple-700 border-purple-200',
  'RESTORE': 'bg-amber-100 text-amber-700 border-amber-200',
  'BACKUP': 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

const MODULE_ICONS: Record<string, any> = {
  'Labour Bill': Activity,
  'Job Card': Activity,
  'Inventory': Activity,
  'System': Info,
  'Stock': Activity
};

export function HistoryScreen({ isDarkMode }: { isDarkMode: boolean }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = endpoints.audit.logs;
      const params = new URLSearchParams();
      if (selectedModule !== 'all') params.append('module_name', selectedModule);
      if (selectedAction !== 'all') params.append('action_type', selectedAction);
      
      const res = await api.get(`${url}?${params.toString()}`);
      if (res.success) {
        setLogs(res.data?.data || res.data || []);
      }
    } catch (e: any) {
      toast.error(`Failed to fetch history: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedModule, selectedAction]);

  const filteredLogs = logs.filter(log => 
    log.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const modules = ['all', ...Array.from(new Set(logs.map(l => l.module_name)))].filter(Boolean);
  const actions = ['all', ...Array.from(new Set(logs.map(l => l.action_type)))].filter(Boolean);

  const cardClass = isDarkMode ? 'bg-slate-800/50 border-slate-700/50 text-white' : 'bg-white border-slate-200 text-slate-900';
  const inputClass = isDarkMode 
    ? 'bg-slate-900/50 border-slate-700 focus:border-blue-500 text-white placeholder-slate-500' 
    : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900 placeholder-slate-400';

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <HistoryIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              System History
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Complete audit trail of all system actions and modifications
            </p>
          </div>
        </div>
        
        <button
          onClick={fetchLogs}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm
            ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-white hover:bg-slate-50 border-slate-200'}
            border active:scale-95 disabled:opacity-50`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      {/* Filters Area */}
      <div className={`${cardClass} border rounded-3xl p-6 shadow-xl backdrop-blur-sm overflow-visible`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description, or user..."
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all ${inputClass}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-all appearance-none cursor-pointer ${inputClass}`}
            >
              {modules.map(m => <option key={m} value={m}>{m === 'all' ? 'All Modules' : m}</option>)}
            </select>
          </div>

          <div className="relative group">
            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-all appearance-none cursor-pointer ${inputClass}`}
            >
              {actions.map(a => <option key={a} value={a}>{a === 'all' ? 'All Actions' : a}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
            <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Fetching activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <Info className="w-16 h-16" />
            <p className="text-xl font-medium">No audit logs found matching your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredLogs.map((log, idx) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`${cardClass} border rounded-2xl p-5 hover:border-blue-500/50 transition-all group relative overflow-hidden`}
              >
                {/* Accent line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  log.action_type === 'DELETE' ? 'bg-red-500' : 
                  log.action_type === 'CREATE' ? 'bg-green-500' : 
                  'bg-blue-500'
                }`} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${isDarkMode ? 'bg-slate-900 group-hover:bg-slate-800' : 'bg-slate-50 group-hover:bg-slate-100'} transition-colors`}>
                      {React.createElement(MODULE_ICONS[log.module_name] || Activity, {
                        className: `w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`
                      })}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border tracking-wider ${ACTION_COLORS[log.action_type] || 'bg-slate-100 text-slate-600'}`}>
                          {log.action_type}
                        </span>
                        <h3 className="font-bold text-base">{log.title}</h3>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{log.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
                        <div className="flex items-center gap-1.5 text-xs opacity-70">
                          <User className="w-3.5 h-3.5" />
                          <span className="font-medium">{log.user_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs opacity-70">
                          <Tag className="w-3.5 h-3.5" />
                          <span className="font-medium uppercase tracking-tight">{log.module_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs opacity-70">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-medium">
                            {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {log.record_id && (
                      <div className={`px-4 py-2 rounded-xl text-xs font-semibold ${isDarkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                        REF: #{log.record_id}
                      </div>
                    )}
                    <button className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                      <ArrowUpRight className="w-5 h-5 text-blue-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
