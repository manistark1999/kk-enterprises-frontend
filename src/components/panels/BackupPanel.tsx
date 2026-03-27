import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X,
  Download,
  Database,
  HardDrive,
  Cloud,
  CheckCircle,
  AlertCircle,
  FileArchive,
  Calendar,
  Clock,
  FolderOpen,
  Settings,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface BackupPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

interface BackupHistory {
  id: string;
  name: string;
  date: string;
  time: string;
  size: string;
  type: 'local' | 'cloud';
  status: 'success' | 'failed';
}

export function BackupPanel({ isOpen, onClose, isDarkMode }: BackupPanelProps) {
  const [backupType, setBackupType] = useState<'local' | 'cloud'>('local');
  const [backupMode, setBackupMode] = useState<'full' | 'incremental'>('full');
  const [isBackingUp, setIsBackingUp] = useState(false);

  const backupHistory: BackupHistory[] = [
    {
      id: 'backup-1',
      name: 'Full_Backup_2024_03_03.db',
      date: '2024-03-03',
      time: '10:30 AM',
      size: '245 MB',
      type: 'local',
      status: 'success'
    },
    {
      id: 'backup-2',
      name: 'Daily_Backup_2024_03_02.db',
      date: '2024-03-02',
      time: '11:45 PM',
      size: '238 MB',
      type: 'cloud',
      status: 'success'
    },
    {
      id: 'backup-3',
      name: 'Incremental_Backup_2024_03_01.db',
      date: '2024-03-01',
      time: '06:30 PM',
      size: '42 MB',
      type: 'local',
      status: 'success'
    },
    {
      id: 'backup-4',
      name: 'Full_Backup_2024_02_25.db',
      date: '2024-02-25',
      time: '09:00 AM',
      size: '210 MB',
      type: 'cloud',
      status: 'success'
    }
  ];

  const handleBackup = async () => {
    setIsBackingUp(true);

    // Simulate backup process
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const fileName = `${backupMode === 'full' ? 'Full' : 'Incremental'}_Backup_${new Date().toISOString().split('T')[0]}.db`;
      toast.success(`Backup created successfully: ${fileName}`);
      onClose();
    } catch (error) {
      toast.error('Backup failed. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              mass: 0.8
            }}
            className={`fixed right-0 top-0 bottom-0 w-full md:w-[600px] z-50 shadow-2xl overflow-hidden backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-gray-900/95 border-l border-gray-800' 
                : 'bg-white/95 border-l border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`px-6 py-5 border-b backdrop-blur-xl sticky top-0 z-10 ${
              isDarkMode ? 'border-gray-800 bg-gray-900/80' : 'border-gray-200 bg-white/80'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Backup Database</h2>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Create a backup of your workshop data</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isBackingUp}
                  className={`p-2 rounded-lg transition-all ${
                    isDarkMode 
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  } ${isBackingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto h-[calc(100vh-180px)]">
              {/* Backup Mode Selection */}
              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Backup Mode</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setBackupMode('full')}
                    disabled={isBackingUp}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      backupMode === 'full'
                        ? isDarkMode
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-blue-500 bg-blue-50'
                        : isDarkMode
                          ? 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${isBackingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Database className={`w-6 h-6 mb-2 ${
                      backupMode === 'full' ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <div className={`font-bold mb-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Full Backup</div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Complete database backup</div>
                  </button>

                  <button
                    onClick={() => setBackupMode('incremental')}
                    disabled={isBackingUp}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      backupMode === 'incremental'
                        ? isDarkMode
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-blue-500 bg-blue-50'
                        : isDarkMode
                          ? 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${isBackingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <FileArchive className={`w-6 h-6 mb-2 ${
                      backupMode === 'incremental' ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <div className={`font-bold mb-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Incremental</div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Only changed data</div>
                  </button>
                </div>
              </div>

              {/* Backup Location */}
              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Backup Location</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setBackupType('local')}
                    disabled={isBackingUp}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      backupType === 'local'
                        ? isDarkMode
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-blue-500 bg-blue-50'
                        : isDarkMode
                          ? 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${isBackingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <HardDrive className={`w-6 h-6 mb-2 ${
                      backupType === 'local' ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <div className={`font-bold mb-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Local Storage</div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Save to your computer</div>
                  </button>

                  <button
                    onClick={() => setBackupType('cloud')}
                    disabled={isBackingUp}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      backupType === 'cloud'
                        ? isDarkMode
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-blue-500 bg-blue-50'
                        : isDarkMode
                          ? 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${isBackingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Cloud className={`w-6 h-6 mb-2 ${
                      backupType === 'cloud' ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <div className={`font-bold mb-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Cloud Storage</div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Save to cloud server</div>
                  </button>
                </div>
              </div>

              {/* Backup Summary */}
              <div className={`p-4 rounded-xl mb-6 ${
                isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Settings className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm mb-2 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-700'
                    }`}>Backup Configuration</h4>
                    <div className={`text-sm space-y-1 ${
                      isDarkMode ? 'text-blue-300/80' : 'text-blue-700'
                    }`}>
                      <div className="flex justify-between">
                        <span>Mode:</span>
                        <span className="font-medium capitalize">{backupMode} Backup</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-medium capitalize">{backupType} Storage</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Size:</span>
                        <span className="font-medium">{backupMode === 'full' ? '~245 MB' : '~45 MB'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Backup History */}
              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Recent Backups</h3>
                <div className="space-y-3">
                  {backupHistory.map((backup) => (
                    <div
                      key={backup.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isDarkMode
                          ? 'border-gray-700 bg-gray-800/40'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            backup.type === 'cloud'
                              ? 'bg-blue-500/10'
                              : 'bg-blue-500/10'
                          }`}>
                            {backup.type === 'cloud' ? (
                              <Cloud className="w-5 h-5 text-blue-500" />
                            ) : (
                              <HardDrive className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-bold text-sm ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{backup.name}</h4>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                backup.status === 'success'
                                  ? isDarkMode
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-green-100 text-green-700'
                                  : isDarkMode
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-red-100 text-red-700'
                              }`}>
                                {backup.status === 'success' ? 'Success' : 'Failed'}
                              </span>
                            </div>
                            <div className={`flex items-center gap-4 text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {backup.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {backup.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <FileArchive className="w-3.5 h-3.5" />
                                {backup.size}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          className={`p-2 rounded-lg transition-all ${
                            isDarkMode
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                          }`}
                          title="Download backup"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Message */}
              <div className={`p-4 rounded-xl flex items-start gap-3 ${
                isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
              }`}>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-bold text-sm mb-1 ${
                    isDarkMode ? 'text-green-400' : 'text-green-700'
                  }`}>Backup Best Practice</h4>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-green-300/80' : 'text-green-700'
                  }`}>
                    Regular backups ensure your data is safe. We recommend creating a full backup daily and incremental backups throughout the day.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t backdrop-blur-xl sticky bottom-0 ${
              isDarkMode ? 'border-gray-800 bg-gray-900/80' : 'border-gray-200 bg-white/80'
            }`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackup}
                  disabled={isBackingUp}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all text-white ${
                    isBackingUp
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isBackingUp ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isBackingUp}
                  className={`px-6 py-3 rounded-lg border font-medium transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  } ${isBackingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
