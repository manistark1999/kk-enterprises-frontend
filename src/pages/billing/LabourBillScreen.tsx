import React from 'react';
import { BillingScreenEnhanced } from '@/pages/billing/BillingPage';

interface LabourBillScreenProps {
  isDarkMode: boolean;
  onNavigate?: (screen: string, data?: any) => void;
  editBill?: any;
}

export function LabourBillScreen({ isDarkMode, onNavigate, editBill }: LabourBillScreenProps) {
  return (
    <BillingScreenEnhanced 
      isDarkMode={isDarkMode}
      billType="labour"
      title="Labour Bill"
      billPrefix="LB"
      onNavigate={onNavigate}
      editBill={editBill}
    />
  );
}