import React from 'react';
import { BillingScreenEnhanced } from '@/pages/billing/BillingPage';

interface EstimationScreenProps {
  isDarkMode: boolean;
  onNavigate?: (screen: string, data?: any) => void;
}

export function EstimationScreen({ isDarkMode, onNavigate }: EstimationScreenProps) {
  return (
    <BillingScreenEnhanced 
      isDarkMode={isDarkMode}
      billType="estimation"
      title="Estimation"
      billPrefix="EST"
      onNavigate={onNavigate}
    />
  );
}