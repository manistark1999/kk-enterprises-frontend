import React, { useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download } from 'lucide-react';
import { 
  getCardClass, 
  getPrimaryButtonClass, 
  getSecondaryButtonClass 
} from '@/utils/formStyles';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';

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
  const printRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotifications();

  // Dedicated portal mount point for print isolation
  const portalContainer = useMemo(() => {
    const div = document.createElement('div');
    div.className = 'print-portal-root';
    return div;
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.appendChild(portalContainer);
      return () => {
        if (document.body.contains(portalContainer)) {
          document.body.removeChild(portalContainer);
        }
      };
    }
  }, [isOpen, portalContainer]);

  const handlePrint = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        // Add to existing notification system
        addNotification('Printed', title, 'Document', `Action initiated for ${title}`);
      }, 300);
    });
  };

  const handleDownloadPDF = async () => {
    try {
      const element = printRef.current;
      if (!element) {
        toast.error('Print content not found.');
        return;
      }

      // Dynamic import with robustness check for commonjs/esm interop
      const html2pdfModule = await import('html2pdf.js');
      // @ts-ignore
      const html2pdf = html2pdfModule.default || html2pdfModule;

      if (typeof html2pdf !== 'function') {
        throw new Error('PDF library failed to load correctly.');
      }

      const opt = {
        margin: [0.5, 0.5] as [number, number],
        filename: `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          logging: false,
          onclone: (clonedDoc) => {
            // AGGRESSIVE COLOR POLYFILL for Tailwind CSS v4 / html2canvas compatibility
            const overrideStyle = clonedDoc.createElement('style');
            overrideStyle.innerHTML = `
              :root {
                --background: 255, 255, 255 !important;
                --foreground: 0, 0, 0 !important;
                --primary: 37, 99, 235 !important;
                --secondary: 100, 116, 139 !important;
                --gray-50: 249, 250, 251 !important;
                --gray-100: 243, 244, 246 !important;
                --gray-200: 229, 231, 235 !important;
                --gray-600: 75, 85, 99 !important;
                --gray-900: 17, 24, 39 !important;
                --blue-50: 239, 246, 255 !important;
                --blue-100: 219, 234, 254 !important;
                --blue-600: 37, 99, 235 !important;
                color-scheme: light !important;
              }
              
              /* Force fallback colors for common classes that might use oklch in computed styles */
              #print-area, #print-area * {
                color: rgb(0, 0, 0); /* Default to black if oklch fails */
                border-color: rgb(229, 231, 235) !important;
                background-color: transparent;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              #print-area .bg-white { background-color: rgb(255, 255, 255) !important; }
              #print-area .bg-blue-600 { background-color: rgb(37, 99, 235) !important; }
              #print-area .text-blue-600 { color: rgb(37, 99, 235) !important; }
              #print-area .bg-gray-100 { background-color: rgb(243, 244, 246) !important; }
              #print-area .text-gray-900 { color: rgb(17, 24, 39) !important; }
            `;
            clonedDoc.head.appendChild(overrideStyle);
          }
        },
        jsPDF: { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      toast.info('Generating professional PDF document...');
      
      // Target only the #print-area element
      await (html2pdf as any)().set(opt).from(element).save();
      
      toast.success('PDF downloaded successfully');

      // Add to existing notification system
      addNotification('Downloaded', title, 'PDF Document', `Document ${title} was exported as PDF`);
    } catch (err) {
      console.error('CRITICAL PDF ERROR:', err);
      toast.error('Failed to generate PDF. Use the "Print Now" button to "Save as PDF" instead.');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md shadow-none border-none print:p-0 print:bg-transparent print:backdrop-blur-none print-modal-wrapper modal-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`${getCardClass(isDarkMode)} w-full max-w-5xl h-[95vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-none md:rounded-2xl print:bg-transparent print:shadow-none print:border-none print:h-auto print:overflow-visible`}
        >
          {/* Modal Header (No-Print) */}
          <div className={`no-print print-preview-header px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-100'}`}>
                <Printer className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className={`font-black text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {title} Print Preview
                </h3>
                <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Scale: A4 Standard • High Quality Print Engine
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 print-preview-actions">
              <button
                onClick={handleDownloadPDF}
                className={`${getSecondaryButtonClass(isDarkMode)} flex items-center gap-2 px-4 py-2 hover:bg-blue-500 hover:text-white transition-all`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className={`${getPrimaryButtonClass()} flex items-center gap-2 px-6 py-2 shadow-lg hover:shadow-blue-500/30 transition-all`}
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print Now</span>
              </button>
              
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-700 mx-2"></div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-red-500 hover:text-white rounded-full transition-all group"
                title="Close"
              >
                <X className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} group-hover:text-white`} />
              </button>
            </div>
          </div>

          {/* Modal Content (The Preview Area) - The wrapper needs to NOT be hidden during print but transparent */}
          <div className="flex-1 overflow-auto bg-gray-200 dark:bg-black/40 p-4 sm:p-10 flex justify-center print-body-preview print:p-0 print:bg-transparent print:overflow-visible">
            {/* 
               IMPORTANT: id="print-area" is used by our global CSS /media print
               to ensure only this content is shown during browser printing.
            */}
            <div 
              id="print-area"
              ref={printRef}
              className="bg-white shadow-2xl origin-top transition-transform duration-300 transform mb-10 border border-gray-300 print:shadow-none print:border-none print:m-0 print:transform-none"
            >
               {children}
            </div>
          </div>

          {/* Modal Footer (No-Print) */}
          <div className={`no-print preview-shell-footer px-6 py-3 border-t flex items-center justify-between text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
             <span>KK Enterprises Smart Print v2.0</span>
             <span>© 2026 KK Groups Software</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    portalContainer
  );
};
