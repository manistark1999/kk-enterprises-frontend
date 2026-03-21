import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, FileText } from 'lucide-react';
import { 
  getCardClass, 
  getPrimaryButtonClass, 
  getSecondaryButtonClass 
} from '@/utils/formStyles';

interface PrintActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isDarkMode: boolean;
  children: React.ReactNode;
}

export const PrintActionModal: React.FC<PrintActionModalProps> = ({
  isOpen,
  onClose,
  title,
  isDarkMode,
  children
}) => {
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`${getCardClass(isDarkMode)} w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          {/* Modal Header */}
          <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <Printer className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {title} Print Preview
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Review document layout before printing or exporting
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className={`${getPrimaryButtonClass()} flex items-center gap-2`}
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Close"
              >
                <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>

          {/* Modal Content (Document Wrapper) */}
          <div className="flex-1 overflow-auto p-8 bg-gray-100 dark:bg-gray-900/50">
            <div className="mx-auto" style={{ width: 'fit-content' }}>
              {children}
            </div>
          </div>

          {/* Modal Footer */}
          <div className={`px-6 py-4 border-t flex justify-center gap-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
             <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
               Powered by KK Enterprises Document System • Pro Design Engine
             </p>
          </div>
        </motion.div>
      </div>

      {/* Actual content for printing (outside modal styles) */}
      <div className="hidden print:block absolute inset-0 bg-white">
        {children}
      </div>
    </AnimatePresence>
  );
};
