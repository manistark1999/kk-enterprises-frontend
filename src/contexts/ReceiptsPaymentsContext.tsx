import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { toast } from 'sonner';

export interface ReceiptRecord {
  id: string;
  receipt_no: string;
  receipt_date: string;
  customer_id?: string | number;
  customer_name: string;
  customer_phone?: string;
  labour_bill_id?: string;
  labour_bill_no?: string;
  description: string;
  amount: number;
  payment_mode: string;
  reference_no?: string;
  bank_name?: string;
  status: string;
  created_at?: string;
}

export interface PaymentRecord {
  id: string;
  payment_no: string;
  payment_date: string;
  customer_id?: string | number;
  customer_name?: string;
  jobcard_id?: string | number;
  jobcard_no?: string;
  bill_id?: string | number;
  bill_no?: string;
  payment_type?: string;
  payment_mode: string;
  bank_account_id?: string | number;
  bank_account_name?: string;
  reference_no?: string;
  amount: number;
  remarks?: string;
  status: string;
  created_at?: string;
  created_by?: string;
}

interface ReceiptsPaymentsContextType {
  receipts: ReceiptRecord[];
  payments: PaymentRecord[];
  isLoading: boolean;
  addReceipt: (receipt: any) => Promise<void>;
  updateReceipt: (id: string, receipt: any) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  refreshReceipts: () => Promise<void>;
  getNextReceiptNo: () => Promise<string | null>;
  
  // Payments placeholder
  addPayment: (payment: any) => Promise<void>;
  updatePayment: (id: string, payment: any) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  refreshPayments: () => Promise<void>;
  getTotalReceived: () => number;
  getTotalPaid: () => number;
  getNextPaymentNo: () => Promise<string | null>;
}

const ReceiptsPaymentsContext = createContext<ReceiptsPaymentsContextType | undefined>(undefined);

export function ReceiptsPaymentsProvider({ children }: { children: ReactNode }) {
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchReceipts = async () => {
    if (!isAuthenticated) {
      setReceipts([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get('/receipts');
      if (response.success && response.data) {
        setReceipts(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
      toast.error('Failed to fetch receipts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayments = async () => {
    if (!isAuthenticated) {
      setPayments([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get('/payments');
      console.log('[ReceiptsPaymentsContext] fetchPayments response:', response);
      
      if (response.success && response.data) {
        // Handle both: response.data.data (array) AND response.data (array)
        const rawData = response.data.data || response.data;
        if (Array.isArray(rawData)) {
          const mapped = rawData.map((row: any) => ({
            ...row,
            id: row.id?.toString() || row.payment_no // Ensure ID is a string for UI consistency
          }));
          setPayments(mapped);
        } else {
          console.warn('[ReceiptsPaymentsContext] Unexpected payments data format:', rawData);
          setPayments([]);
        }
      }
    } catch (error: any) {
      console.error('[ReceiptsPaymentsContext] Error fetching payments:', error);
      // Detailed error logging to help diagnose server vs proxy vs client issues
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Stack:', error.stack);
      }
      toast.error('Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
    fetchPayments();
  }, [isAuthenticated]);

  const addReceipt = async (receiptData: Partial<ReceiptRecord>) => {
    console.log('[ReceiptsPaymentsContext] Attempting to add receipt...');
    console.log('[ReceiptsPaymentsContext] Payload:', receiptData);
    try {
      const response = await api.post('/receipts', receiptData);
      if (response.success) {
        await fetchReceipts();
        toast.success('Receipt created successfully');
      } else {
        throw new Error(response.message || response.error || 'Failed to create receipt');
      }
    } catch (error: any) {
      console.error('[ReceiptsPaymentsContext] Error in addReceipt:', error);
      toast.error(error.message || 'Failed to create receipt');
      throw error;
    }
  };

  const updateReceipt = async (id: string, receiptData: Partial<ReceiptRecord>) => {
    console.log(`[ReceiptsPaymentsContext] Attempting to update receipt ${id}...`);
    try {
      const existing = receipts.find(r => r.id === id);
      const merged = { ...existing, ...receiptData };
      console.log('[ReceiptsPaymentsContext] Merged Payload:', merged);

      const response = await api.put(`/receipts/${id}`, merged);
      if (response.success) {
        await fetchReceipts();
        toast.success('Receipt updated successfully');
      } else {
        throw new Error(response.message || response.error || 'Failed to update receipt');
      }
    } catch (error: any) {
      console.error(`[ReceiptsPaymentsContext] Error in updateReceipt (ID: ${id}):`, error);
      toast.error(error.message || 'Failed to update receipt');
      throw error;
    }
  };

  const deleteReceipt = async (id: string) => {
    try {
      const response = await api.delete(`/receipts/${id}`);
      if (response.success) {
        await fetchReceipts();
        toast.success('Receipt deleted successfully');
      } else {
        throw new Error(response.error || 'Failed to delete receipt');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete receipt');
      throw error;
    }
  };

  const getNextReceiptNo = async (): Promise<string | null> => {
    try {
      const response = await api.get('/receipts/next-number');
      if (response.success && response.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get next receipt number:', error);
      return null;
    }
  };

  // Payment implementations
  const addPayment = async (paymentData: Partial<PaymentRecord>) => {
    console.log('[ReceiptsPaymentsContext] Attempting to add payment...');
    console.log('[ReceiptsPaymentsContext] Payload to be sent:', paymentData);
    try {
      const response = await api.post('/payments', paymentData);
      console.log('[ReceiptsPaymentsContext] API response received:', response);
      if (response.success) {
        console.log('[ReceiptsPaymentsContext] API call successful. Refetching payments...');
        await fetchPayments();
        toast.success('Payment recorded successfully');
      } else {
        console.error('[ReceiptsPaymentsContext] API call returned success:false.', response);
        throw new Error(response.message || response.error || 'Failed to record payment');
      }
    } catch (error: any) {
      console.error('[ReceiptsPaymentsContext] Error in addPayment catch block:', error);
      toast.error(error.message || 'Failed to record payment');
      throw error;
    }
  };

  const updatePayment = async (id: string, paymentData: Partial<PaymentRecord>) => {
    console.log(`[ReceiptsPaymentsContext] Attempting to update payment ${id}...`);
    try {
      const existing = payments.find(p => p.id === id);
      const merged = { ...existing, ...paymentData };
      console.log('[ReceiptsPaymentsContext] Merged Payload:', merged);

      const response = await api.put(`/payments/${id}`, merged);
      console.log('[ReceiptsPaymentsContext] API response received:', response);
      if (response.success) {
        console.log('[ReceiptsPaymentsContext] API call successful. Refetching payments...');
        await fetchPayments();
        toast.success('Payment updated successfully');
      } else {
        console.error('[ReceiptsPaymentsContext] API call returned success:false.', response);
        throw new Error(response.message || response.error || 'Failed to update payment');
      }
    } catch (error: any) {
      console.error(`[ReceiptsPaymentsContext] Error in updatePayment catch block (ID: ${id}):`, error);
      toast.error(error.message || 'Failed to update payment');
      throw error;
    }
  };

  const deletePayment = async (id: string) => {
    console.log(`[ReceiptsPaymentsContext] Attempting to delete payment ${id}...`);
    try {
      const response = await api.delete(`/payments/${id}`);
      console.log('[ReceiptsPaymentsContext] API response received:', response);
      if (response.success) {
        console.log('[ReceiptsPaymentsContext] API call successful. Refreshing payments...');
        // No longer need optimistic update, fetchPayments will get the latest state.
        await fetchPayments();
        toast.success('Payment deleted successfully');
      } else {
        console.error('[ReceiptsPaymentsContext] API call returned success:false.', response);
        throw new Error(response.message || response.error || 'Failed to delete payment');
      }
    } catch (error: any) {
      console.error(`[ReceiptsPaymentsContext] Error in deletePayment catch block (ID: ${id}):`, error);
      toast.error(error.message || 'Failed to delete payment');
      throw error;
    }
  };

  const getNextPaymentNo = async (): Promise<string | null> => {
    try {
      const response = await api.get('/payments/next-number');
      if (response.success && response.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to get next payment number:', error);
      return null;
    }
  };

  const getTotalReceived = () => {
    return receipts
      .filter((r: ReceiptRecord) => r.status === 'Received')
      .reduce((sum: number, r: ReceiptRecord) => sum + Number(r.amount), 0);
  };

  const getTotalPaid = () => {
    return payments
      .filter((p: PaymentRecord) => p.status === 'Completed')
      .reduce((sum: number, p: PaymentRecord) => sum + Number(p.amount), 0);
  };

  return (
    <ReceiptsPaymentsContext.Provider
      value={{
        receipts,
        payments,
        isLoading,
        addReceipt,
        updateReceipt,
        deleteReceipt,
        refreshReceipts: fetchReceipts,
        getNextReceiptNo,
        addPayment,
        updatePayment,
        deletePayment,
        refreshPayments: fetchPayments,
        getTotalReceived,
        getTotalPaid,
        getNextPaymentNo
      }}
    >
      {children}
    </ReceiptsPaymentsContext.Provider>
  );
}

export function useReceiptsPayments() {
  const context = useContext(ReceiptsPaymentsContext);
  if (!context) {
    throw new Error('useReceiptsPayments must be used within a ReceiptsPaymentsProvider');
  }
  return context;
}
