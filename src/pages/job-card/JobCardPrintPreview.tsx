import React, { useState, useEffect } from 'react';
import { PrintActionModal } from '@/components/print/PrintActionModal';
import JobCardPrintView from './JobCardPrintView';

interface JobCardPrintPreviewProps {
  data: any;
  onClose: () => void;
  isDarkMode?: boolean;
}

export default function JobCardPrintPreview({ data, onClose, isDarkMode = false }: JobCardPrintPreviewProps) {
  const [companyData, setCompanyData] = useState<any>({
    companyName: 'KK Enterprises',
    address: 'Main Road, City',
    phone: '+91 9876543210',
    email: 'info@kkenterprises.com',
    website: 'www.kkenterprises.com',
    bankName: 'State Bank of India',
    accountNo: '1234567890',
    ifscCode: 'SBIN0001234'
  });

  useEffect(() => {
    const savedCompanyData = localStorage.getItem('companyData');
    if (savedCompanyData) {
      setCompanyData(JSON.parse(savedCompanyData));
    }
  }, []);

  return (
    <PrintActionModal
      isOpen={true}
      onClose={onClose}
      title="Job Card"
      isDarkMode={isDarkMode}
    >
      <JobCardPrintView data={data} company={companyData} />
    </PrintActionModal>
  );
}
