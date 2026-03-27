import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X,
  Upload,
  FolderOpen,
  Database,
  HardDrive,
  Cloud,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileArchive,
  Calendar,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface RestorePanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

interface BackupFile {
  id: string;
  name: string;
  date: string;
  time: string;
  size: string;
  type: 'local' | 'cloud';
  status: 'complete' | 'partial';
}

export function RestorePanel({ isOpen, onClose, isDarkMode }: RestorePanelProps) {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [restoreType, setRestoreType] = useState<'full' | 'selective'>('full');
  const [isRestoring, setIsRestoring] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const availableBackups: BackupFile[] = [
    {
      id: 'backup-1',
      name: 'Full_Backup_2024_03_03.db',
      date: '2024-03-03',
      time: '10:30 AM',
      size: '245 MB',
      type: 'local',
      status: 'complete'
    },
    {
      id: 'backup-2',
      name: 'Daily_Backup_2024_03_02.db',
      date: '2024-03-02',
      time: '11:45 PM',
      size: '238 MB',
      type: 'cloud',
      status: 'complete'
    },
    {
      id: 'backup-3',
      name: 'Weekly_Backup_2024_02_25.db',
      date: '2024-02-25',
      time: '09:00 AM',
      size: '210 MB',
      type: 'local',
      status: 'complete'
    },
    {
      id: 'backup-4',
      name: 'Monthly_Backup_2024_02_01.db',
      date: '2024-02-01',
      time: '08:00 AM',
      size: '195 MB',
      type: 'cloud',
      status: 'complete'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.db') || file.name.endsWith('.sql') || file.name.endsWith('.zip')) {
        setUploadedFile(file);
        toast.success(`File "${file.name}" selected for restore`);
      } else {
        toast.error('Please select a valid backup file (.db, .sql, or .zip)');
      }
    }
  };

  const handleRestore = async () => {
    if (!selectedFile && !uploadedFile) {
      toast.error('Please select a backup file to restore');
      return;
    }

    setIsRestoring(true);

    // Simulate restore process
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Database restored successfully!');
      onClose();
    } catch (error) {
      toast.error('Restore failed. Please try again.');
    } finally {
      setIsRestoring(false);
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
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Restore Database</h2>
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Restore your data from a backup file</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isRestoring}
                  className={`p-2 rounded-lg transition-all ${
                    isDarkMode 
                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  } ${isRestoring ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto h-[calc(100vh-180px)]">
              {/* Upload Section */}
              <div className={`rounded-xl border-2 border-dashed p-6 mb-6 transition-all ${
                isDarkMode 
                  ? 'border-gray-700 bg-gray-800/40 hover:border-blue-500/50' 
                  : 'border-gray-300 bg-gray-50/50 hover:border-blue-400'
              }`}>
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-full bg-blue-500/10 mb-4">
                    <FolderOpen className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Upload Backup File</h3>
                  <p className={`text-sm mb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Select a backup file from your computer
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".db,.sql,.zip"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isRestoring}
                    />
                    <span className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium cursor-pointer transition-all ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } ${isRestoring ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Upload className="w-5 h-5" />
                      Choose File
                    </span>
                  </label>
                  {uploadedFile && (
                    <div className={`mt-4 p-3 rounded-lg ${
                      isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
                    }`}>
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className={`text-sm font-medium ${
                          isDarkMode ? 'text-green-400' : 'text-green-700'
                        }`}>{uploadedFile.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`flex-1 h-px ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                }`}></div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>OR</span>
                <div className={`flex-1 h-px ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                }`}></div>
              </div>

              {/* Available Backups */}
              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Available Backups</h3>
                <div className="space-y-3">
                  {availableBackups.map((backup) => (
                    <div
                      key={backup.id}
                      onClick={() => setSelectedFile(backup.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedFile === backup.id
                          ? isDarkMode
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-blue-500 bg-blue-50'
                          : isDarkMode
                            ? 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                            : 'border-gray-200 bg-white hover:border-gray-300'
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
                              <Cloud className={`w-5 h-5 ${
                                backup.type === 'cloud' ? 'text-blue-500' : 'text-blue-500'
                              }`} />
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
                                backup.status === 'complete'
                                  ? isDarkMode
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-green-100 text-green-700'
                                  : isDarkMode
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {backup.status === 'complete' ? 'Complete' : 'Partial'}
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
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedFile === backup.id
                            ? 'border-blue-500 bg-blue-500'
                            : isDarkMode
                              ? 'border-gray-600'
                              : 'border-gray-300'
                        }`}>
                          {selectedFile === backup.id && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restore Type */}
              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Restore Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRestoreType('full')}
                    disabled={isRestoring}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      restoreType === 'full'
                        ? isDarkMode
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-blue-500 bg-blue-50'
                        : isDarkMode
                          ? 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${isRestoring ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Database className={`w-6 h-6 mb-2 ${
                      restoreType === 'full' ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <div className={`font-bold mb-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Full Restore</div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Restore entire database</div>
                  </button>

                  <button
                    onClick={() => setRestoreType('selective')}
                    disabled={isRestoring}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      restoreType === 'selective'
                        ? isDarkMode
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-blue-500 bg-blue-50'
                        : isDarkMode
                          ? 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${isRestoring ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <RefreshCw className={`w-6 h-6 mb-2 ${
                      restoreType === 'selective' ? 'text-blue-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <div className={`font-bold mb-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Selective</div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Choose specific data</div>
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className={`p-4 rounded-xl flex items-start gap-3 ${
                isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'
              }`}>
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-bold text-sm mb-1 ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
                  }`}>Important Warning</h4>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-yellow-300/80' : 'text-yellow-700'
                  }`}>
                    Restoring will overwrite all current data. Please ensure you have a recent backup before proceeding. This action cannot be undone.
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
                  onClick={handleRestore}
                  disabled={(!selectedFile && !uploadedFile) || isRestoring}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all text-white ${
                    (!selectedFile && !uploadedFile) || isRestoring
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isRestoring}
                  className={`px-6 py-3 rounded-lg border font-medium transition-all ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  } ${isRestoring ? 'opacity-50 cursor-not-allowed' : ''}`}
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
