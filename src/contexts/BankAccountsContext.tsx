import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

export interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  branchName: string;
  accountType: 'Savings' | 'Current' | 'CC/OD';
  openingBalance: number;
  currentBalance: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

interface BankAccountsContextType {
  bankAccounts: BankAccount[];
  isLoading: boolean;
  addBankAccount: (account: Omit<BankAccount, 'id' | 'createdAt'>) => Promise<void>;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  getActiveBankAccounts: () => BankAccount[];
  getBankAccountById: (id: string) => BankAccount | undefined;
  updateBalance: (id: string, amount: number, type: 'credit' | 'debit') => void;
  refreshBankAccounts: () => Promise<void>;
}

const BankAccountsContext = createContext<BankAccountsContextType | undefined>(undefined);

const mapRow = (row: any): BankAccount => ({
  id: row.id.toString(),
  accountName: row.account_name || row.bank_name || '',
  bankName: row.bank_name || '',
  accountNumber: row.account_number || '',
  accountHolderName: row.account_holder_name || '',
  ifscCode: row.ifsc_code || '',
  branchName: row.branch_name || row.branch || '',
  accountType: (row.account_type as 'Savings' | 'Current' | 'CC/OD') || 'Current',
  openingBalance: row.opening_balance ? parseFloat(row.opening_balance) : 0,
  currentBalance: row.current_balance ? parseFloat(row.current_balance) : 0,
  status: (row.status as 'Active' | 'Inactive') || 'Active',
  createdAt: row.created_at
});

export function BankAccountsProvider({ children }: { children: ReactNode }) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  
  const fetchBankAccounts = async () => {
    if (!isAuthenticated) {
      setBankAccounts([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get('/bank-accounts');
      if (res.success && res.data) {
        setBankAccounts((res.data.data || res.data).map(mapRow));
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBankAccounts(); }, [isAuthenticated]);

  const addBankAccount = async (data: Omit<BankAccount, 'id' | 'createdAt'>) => {
    const res = await api.post('/bank-accounts', {
      account_name: data.accountName,
      bank_name: data.bankName,
      account_number: data.accountNumber,
      account_holder_name: data.accountHolderName,
      ifsc_code: data.ifscCode,
      branch_name: data.branchName,
      account_type: data.accountType,
      opening_balance: data.openingBalance,
      current_balance: data.currentBalance || data.openingBalance,
      status: data.status
    });
    if (res.success) await fetchBankAccounts();
    else throw new Error(res.error || 'Failed to add bank account');
  };

  const updateBankAccount = async (id: string, data: Partial<BankAccount>) => {
    const existing = bankAccounts.find(b => b.id === id);
    const merged = { ...existing, ...data };
    const res = await api.put(`/bank-accounts/${id}`, {
      account_name: merged.accountName,
      bank_name: merged.bankName,
      account_number: merged.accountNumber,
      account_holder_name: merged.accountHolderName,
      ifsc_code: merged.ifscCode,
      branch_name: merged.branchName,
      account_type: merged.accountType,
      opening_balance: merged.openingBalance,
      current_balance: merged.currentBalance,
      status: merged.status
    });
    if (res.success) await fetchBankAccounts();
    else throw new Error(res.error || 'Failed to update bank account');
  };

  const deleteBankAccount = async (id: string) => {
    const res = await api.delete(`/bank-accounts/${id}`);
    if (res.success) setBankAccounts(prev => prev.filter(b => b.id !== id));
    else throw new Error(res.error || 'Failed to delete bank account');
  };

  const getActiveBankAccounts = () => bankAccounts.filter(b => b.status === 'Active');
  const getBankAccountById = (id: string) => bankAccounts.find(b => b.id === id);

  // Local balance update (can make API call too)
  const updateBalance = (id: string, amount: number, type: 'credit' | 'debit') => {
    setBankAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        const newBalance = type === 'credit' ? acc.currentBalance + amount : acc.currentBalance - amount;
        return { ...acc, currentBalance: newBalance };
      }
      return acc;
    }));
  };

  return (
    <BankAccountsContext.Provider value={{ bankAccounts, isLoading, addBankAccount, updateBankAccount, deleteBankAccount, getActiveBankAccounts, getBankAccountById, updateBalance, refreshBankAccounts: fetchBankAccounts }}>
      {children}
    </BankAccountsContext.Provider>
  );
}

export function useBankAccounts() {
  const context = useContext(BankAccountsContext);
  if (!context) throw new Error('useBankAccounts must be used within BankAccountsProvider');
  return context;
}
