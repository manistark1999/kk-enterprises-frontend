import React from 'react';
import { BillingScreenEnhanced } from '@/pages/billing/BillingPage';

interface PurchaseScreenProps {
  isDarkMode: boolean;
  onNavigate?: (screen: string, data?: any) => void;
}

export function PurchaseScreen({ isDarkMode, onNavigate }: PurchaseScreenProps) {
  return (
    <BillingScreenEnhanced
      isDarkMode={isDarkMode}
      billType="purchase"
      title="Purchase"
      billPrefix="PUR"
      onNavigate={onNavigate}
    />
  );
}