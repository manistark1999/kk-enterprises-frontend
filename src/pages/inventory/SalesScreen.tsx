import React from 'react';
import { BillingScreenEnhanced } from '@/pages/billing/BillingPage';

interface SalesScreenProps {
  isDarkMode: boolean;
  onNavigate?: (screen: string, data?: any) => void;
}

export function SalesScreen({ isDarkMode, onNavigate }: SalesScreenProps) {
  return (
    <BillingScreenEnhanced 
      isDarkMode={isDarkMode}
      billType="sales"
      title="Sales"
      billPrefix="SAL"
      onNavigate={onNavigate}
    />
  );
}