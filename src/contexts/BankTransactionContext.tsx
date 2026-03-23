import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, endpoints } from '@/services/api';
import { toast } from 'sonner';

interface BankTransaction {
  id: string;
  transaction_date: string;
  transaction_time: string;
  bank_account_id?: number;
  bank_name: string;
  account_no: string;
  type: 'Credit' | 'Debit';
  category: string;
  description: string;
  amount: number;
  transaction_mode: string;
  reference_no: string;
  cheque_no?: string;
  received_from?: string;
  paid_to?: string;
  balance: number;
}

interface BankTransactionContextType {
  transactions: BankTransaction[];
  summary: { totalCredit: number; totalDebit: number; balance: number };
  loading: boolean;
  fetchTransactions: () => Promise<void>;
  addTransaction: (data: any) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
}

const BankTransactionContext = createContext<BankTransactionContextType | undefined>(undefined);

export function BankTransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [summary, setSummary] = useState({ totalCredit: 0, totalDebit: 0, balance: 0 });
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/bank-transactions');
      if (response.success) {
        setTransactions(response.data);
      }
      const summaryRes = await api.get('/bank-transactions/summary');
      if (summaryRes.success) {
        setSummary(summaryRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch bank transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (data: any) => {
    try {
      const response = await api.post('/bank-transactions', data);
      if (response.success) {
        toast.success('Transaction saved successfully');
        await fetchTransactions();
        return true;
      }
      toast.error(response.message || 'Failed to save transaction');
      return false;
    } catch (error) {
      toast.error('Network error while saving transaction');
      return false;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const response = await api.delete(`/bank-transactions/${id}`);
      if (response.success) {
        toast.success('Transaction deleted');
        await fetchTransactions();
        return true;
      }
      toast.error(response.message || 'Failed to delete transaction');
      return false;
    } catch (error) {
      toast.error('Network error during deletion');
      return false;
    }
  };

  return (
    <BankTransactionContext.Provider value={{ 
      transactions, summary, loading, fetchTransactions, addTransaction, deleteTransaction 
    }}>
      {children}
    </BankTransactionContext.Provider>
  );
}

export function useBankTransactions() {
  const context = useContext(BankTransactionContext);
  if (context === undefined) {
    throw new Error('useBankTransactions must be used within a BankTransactionProvider');
  }
  return context;
}
