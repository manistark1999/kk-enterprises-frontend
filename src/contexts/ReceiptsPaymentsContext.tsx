import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { toast } from 'sonner';
import { useDashboardRefresh } from './DashboardRefreshContext';

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
  processed_by?: string;
  processed_by_id?: number | string;
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
  const { addNotification } = useNotifications();

  const { isAuthenticated, user } = useAuth();
  const { triggerDashboardRefresh } = useDashboardRefresh();

  const fetchReceipts = async () => {
    if (!isAuthenticated) {
      setReceipts([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get('/receipts');
      if (response.success && response.data) {
        const rawData = response.data.data || response.data;
        if (Array.isArray(rawData)) {
          setReceipts(rawData);
        } else {
          setReceipts([]);
        }
      }
    } catch (error: any) {
      console.error('[ACC-RECEIPT] fetchReceipts error:', error);
      toast.error(error.message || 'Failed to fetch receipts');
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
      
      if (response.success && response.data) {
        const rawData = response.data.data || response.data;
        if (Array.isArray(rawData)) {
          const mapped = rawData.map((row: any) => ({
            ...row,
            id: row.id?.toString() || row.payment_no 
          }));
          setPayments(mapped);
        } else {
          setPayments([]);
        }
      }
    } catch (error: any) {
      console.error('[ACC-PAYMENT] fetchPayments error:', error);
      toast.error(error.message || 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
    fetchPayments();
  }, [isAuthenticated]);

  const addReceipt = async (receiptData: Partial<ReceiptRecord>) => {
    try {
      const payload = {
        ...receiptData,
        processed_by: user?.username || receiptData.processed_by || 'admin',
        processed_by_id: user?.id || receiptData.processed_by_id
      };
      const response = await api.post('/receipts', payload);
      if (response.success) {
        await fetchReceipts();
        triggerDashboardRefresh();
        toast.success('Receipt created successfully');

        // ADD NOTIFICATION
        addNotification(
          'Saved', 
          receiptData.receipt_no || 'New Receipt', 
          'Receipt', 
          `Payment received from ${receiptData.customer_name} for invoice ${receiptData.labour_bill_no || 'N/A'}`,
          { totalAmount: receiptData.amount }
        );
      } else {
        throw new Error(response.message || response.error || 'Failed to create receipt');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create receipt');
      throw error;
    }
  };

  const updateReceipt = async (id: string, receiptData: Partial<ReceiptRecord>) => {
    try {
      const existing = receipts.find(r => r.id === id);
      const merged = { 
        ...existing, 
        ...receiptData,
        processed_by: user?.username || receiptData.processed_by || 'admin',
        processed_by_id: user?.id || receiptData.processed_by_id
      } as any;

      const response = await api.put(`/receipts/${id}`, merged);
      if (response.success) {
        await fetchReceipts();
        triggerDashboardRefresh();
        toast.success('Receipt updated successfully');

        // ADD NOTIFICATION
        addNotification(
          'Updated', 
          merged.receipt_no, 
          'Receipt', 
          `Receipt ${merged.receipt_no} for ${merged.customer_name} updated`,
          { totalAmount: merged.amount }
        );
      } else {
        throw new Error(response.message || response.error || 'Failed to update receipt');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update receipt');
      throw error;
    }
  };

  const deleteReceipt = async (id: string) => {
    try {
      const existing = receipts.find(r => r.id === id);
      const response = await api.delete(`/receipts/${id}`);
      if (response.success) {
        await fetchReceipts();
        triggerDashboardRefresh();
        toast.success('Receipt deleted successfully');

        // ADD NOTIFICATION
        if (existing) {
          addNotification(
            'Deleted', 
            existing.receipt_no, 
            'Receipt', 
            `Removed receipt record ${existing.receipt_no}`
          );
        }
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
      return null;
    }
  };

  const addPayment = async (paymentData: Partial<PaymentRecord>) => {
    try {
      const payload = {
        ...paymentData,
        processed_by: user?.username || (paymentData as any).processed_by || 'admin',
        processed_by_id: user?.id || (paymentData as any).processed_by_id
      };
      const response = await api.post('/payments', payload);
      if (response.success) {
        await fetchPayments();
        triggerDashboardRefresh();
        toast.success('Payment recorded successfully');

        // ADD NOTIFICATION
        addNotification(
          'Saved', 
          paymentData.payment_no || 'New Payment', 
          'Payment', 
          `Outgoing payment ${paymentData.payment_no} recorded for ${paymentData.customer_name || 'N/A'}`,
          { totalAmount: paymentData.amount }
        );
      } else {
        throw new Error(response.message || response.error || 'Failed to record payment');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
      throw error;
    }
  };

  const updatePayment = async (id: string, paymentData: Partial<PaymentRecord>) => {
    try {
      const existing = payments.find(p => p.id === id);
      const merged = { 
        ...existing, 
        ...paymentData,
        processed_by: user?.username || (paymentData as any).processed_by || 'admin',
        processed_by_id: user?.id || (paymentData as any).processed_by_id
      } as any;

      const response = await api.put(`/payments/${id}`, merged);
      if (response.success) {
        await fetchPayments();
        triggerDashboardRefresh();
        toast.success('Payment updated successfully');

        // ADD NOTIFICATION
        addNotification(
          'Updated', 
          merged.payment_no, 
          'Payment', 
          `Payment record ${merged.payment_no} modified`,
          { totalAmount: merged.amount }
        );
      } else {
        throw new Error(response.message || response.error || 'Failed to update payment');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment');
      throw error;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      const existing = payments.find(p => p.id === id);
      const response = await api.delete(`/payments/${id}`);
      if (response.success) {
        await fetchPayments();
        triggerDashboardRefresh();
        toast.success('Payment deleted successfully');

        // ADD NOTIFICATION
        if (existing) {
          addNotification(
            'Deleted', 
            existing.payment_no, 
            'Payment', 
            `Removed payment record ${existing.payment_no}`
          );
        }
      } else {
        throw new Error(response.message || response.error || 'Failed to delete payment');
      }
    } catch (error: any) {
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
