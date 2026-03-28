import React, { useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, Share2 } from 'lucide-react';
import { 
  getCardClass, 
  getPrimaryButtonClass, 
  getSecondaryButtonClass 
} from '@/utils/formStyles';
import { useNotifications } from '@/contexts/NotificationContext';
import { shareData } from '@/utils/shareUtils';
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

  const generatePDFBlob = async (): Promise<Blob | null> => {
    const element = printRef.current;
    if (!element) {
      toast.error('Print content not found.');
      return null;
    }

    try {
      const html2pdfModule = await import('html2pdf.js');
      // @ts-ignore
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const opt = {
        margin: [0.5, 0.5] as [number, number],
        filename: `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      // Generate PDF as blob
      const pdfWorker = (html2pdf as any)().set(opt).from(element).toPdf().output('blob');
      return await pdfWorker;
    } catch (error) {
      console.error('PDF Generation Error:', error);
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const element = printRef.current;
      if (!element) {
        toast.error('Print content not found.');
        return;
      }

      // Dynamic import 
      const html2pdfModule = await import('html2pdf.js');
      // @ts-ignore
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const opt = {
        margin: [0.5, 0.5] as [number, number],
        filename: `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          logging: false
        },
        jsPDF: { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      toast.info('Generating PDF document...');
      await (html2pdf as any)().set(opt).from(element).save();
      toast.success('PDF downloaded successfully');
      addNotification('Downloaded', title, 'PDF Document', `Document ${title} was exported as PDF`);
    } catch (err) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleShare = async () => {
    toast.info('Preparing document for sharing...');
    const blob = await generatePDFBlob();
    if (!blob) {
      toast.error('Failed to prepare document for sharing');
      return;
    }

    const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    const file = new File([blob], fileName, { type: 'application/pdf' });

    await shareData({
      title: `Transferring ${title}`,
      text: `Please find the attached ${title} from KK Enterprises Workshop System.`,
      files: [file]
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-4 bg-gray-200/90 backdrop-blur-md shadow-none border-none print:p-0 print:bg-transparent print:backdrop-blur-none print-modal-wrapper modal-overlay">
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
              </div>
            </div>
            
            <div className="flex items-center gap-3 print-preview-actions">
              <button
                onClick={handleShare}
                className={`${getSecondaryButtonClass(isDarkMode)} flex items-center gap-2 px-4 py-2 hover:bg-blue-600 hover:text-white transition-all`}
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
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

          {/* Modal Content (The Preview Area) - Centered A4 on neutral background */}
          <div className="flex-1 overflow-auto bg-gray-300/40 dark:bg-gray-800/40 p-4 sm:p-10 flex justify-center print-body-preview print:p-0 print:bg-transparent print:overflow-visible">
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
