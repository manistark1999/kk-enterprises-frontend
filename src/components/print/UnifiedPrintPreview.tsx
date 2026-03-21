import React, { useState, useEffect } from 'react';
import { PrintActionModal } from './PrintActionModal';
import JobCardPrintView from '@/pages/job-card/JobCardPrintView';
import BillPrintView from './BillPrintView';
import ReceiptPrintView from './ReceiptPrintView';
import ReportPrintView from './ReportPrintView';
import CustomerPrintView from './CustomerPrintView';

export type DocType = 'jobcard' | 'bill' | 'receipt' | 'report' | 'customer';

interface UnifiedPrintPreviewProps {
  type: DocType;
  data: any;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  title?: string;
}

export const UnifiedPrintPreview: React.FC<UnifiedPrintPreviewProps> = ({
  type,
  data,
  isOpen,
  onClose,
  isDarkMode = false,
  title
}) => {
  const [companyData, setCompanyData] = useState<any>({
    companyName: 'KK Enterprises',
    address: 'Main Road, City',
    phone: '+91 9876543210',
    email: 'info@kkenterprises.com',
    website: 'www.kkenterprises.com',
    bankName: 'State Bank of India',
    accountNo: '1234567890',
    ifscCode: 'SBIN0001234',
    gstNo: '29XXXXX'
  });

  useEffect(() => {
    const savedCompanyData = localStorage.getItem('companyData');
    if (savedCompanyData) {
      setCompanyData(JSON.parse(savedCompanyData));
    }
  }, []);

  const renderContent = () => {
    if (!data) return null;

    switch (type) {
      case 'jobcard':
        return <JobCardPrintView data={data} company={companyData} />;
      case 'bill':
        return <BillPrintView data={data} company={companyData} title={type.toUpperCase()} />;
      case 'receipt':
        return <ReceiptPrintView data={data} company={companyData} />;
      case 'report':
        return <ReportPrintView data={data} company={companyData} title={title || 'REPORT'} />;
      case 'customer':
        return <CustomerPrintView data={data} company={companyData} />;
      default:
        return <div>Invalid Document Type</div>;
    }
  };

  return (
    <PrintActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={type.charAt(0).toUpperCase() + type.slice(1)}
      isDarkMode={isDarkMode}
    >
      {renderContent()}
    </PrintActionModal>
  );
};
