import React, { useState, useEffect } from 'react';
import { PrintActionModal } from './PrintActionModal';
import { JobCardPrint } from './JobCardPrint';
import { CustomerPrint } from './CustomerPrint';
import { ReceiptPrint } from './ReceiptPrint';
import { EstimationPrint } from './EstimationPrint';
import { LabourBillPrint } from './LabourBillPrint';
import { PaymentVoucherPrint } from './PaymentVoucherPrint';
import { AlignmentPrint } from './AlignmentPrint';
import ReportPrintView from './ReportPrintView';

export type DocType = 'jobcard' | 'bill' | 'receipt' | 'report' | 'customer' | 'estimation' | 'labour' | 'voucher' | 'alignment';

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
    phone: '+91 7558130111',
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

    // Use common data mappings for our new components
    switch (type) {
      case 'jobcard':
        return <JobCardPrint data={data} company={companyData} />;
      case 'customer':
        return <CustomerPrint data={data} company={companyData} />;
      case 'receipt':
        return <ReceiptPrint data={data} company={companyData} />;
      case 'estimation':
        return <EstimationPrint data={data} company={companyData} />;
      case 'bill':
      case 'labour':
        return <LabourBillPrint data={data} company={companyData} />;
      case 'voucher':
        return <PaymentVoucherPrint data={data} company={companyData} />;
      case 'alignment':
        return <AlignmentPrint data={data} company={companyData} />;
      case 'report':
        return <ReportPrintView data={data} company={companyData} title={title || 'REPORT'} />;
      default:
        return <div>Invalid Document Type</div>;
    }
  };

  return (
    <PrintActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={title || type.charAt(0).toUpperCase() + type.slice(1)}
      isDarkMode={isDarkMode}
    >
      {renderContent()}
    </PrintActionModal>
  );
};
