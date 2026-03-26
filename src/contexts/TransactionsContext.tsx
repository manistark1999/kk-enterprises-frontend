import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useDashboardRefresh } from './DashboardRefreshContext';

// Type definitions for all transaction data
export interface LabourBill {
  id: string;
  billNo: string;
  billDate: string;
  vehicleNo: string;
  vehicleMake: string;
  vehicleModel: string;
  customerName: string;
  customerMobile: string;
  items: any[];
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface Estimation {
  id: string;
  estimateNo: string;
  estimateDate: string;
  vehicleNo: string;
  customerName: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNo: string;
  receiptDate: string;
  customerName: string;
  amount: number;
  paymentMode: string;
  billReference: string;
  status: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentNo: string;
  paymentDate: string;
  supplierName: string;
  amount: number;
  paymentMode: string;
  purchaseReference: string;
  status: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  purchaseDate: string;
  supplierName: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  saleNo: string;
  saleDate: string;
  customerName: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  expenseNo: string;
  expenseDate: string;
  category: string;
  description: string;
  amount: number;
  paymentMode: string;
  referenceNo?: string;
  status: string;
  createdAt: string;
}

export interface CashEntry {
  id: string;
  entryNo: string;
  date: string;
  time: string;
  transactionType: 'Cash In' | 'Cash Out';
  referenceNo: string;
  description: string;
  amount: number;
  paymentType: string;
  notes?: string;
  handledBy: string;
  createdAt: string;
}

interface TransactionsContextType {
  // Labour Bills
  labourBills: LabourBill[];
  addLabourBill: (bill: any) => Promise<void>;
  updateLabourBill: (id: string, bill: any) => Promise<void>;
  deleteLabourBill: (id: string) => Promise<void>;
  
  // Estimations
  estimations: Estimation[];
  addEstimation: (estimation: any) => Promise<void>;
  updateEstimation: (id: string, estimation: any) => Promise<void>;
  deleteEstimation: (id: string) => Promise<void>;
  
  // Receipts
  receipts: Receipt[];
  addReceipt: (receipt: any) => Promise<void>;
  updateReceipt: (id: string, receipt: any) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  
  // Payments
  payments: Payment[];
  addPayment: (payment: any) => Promise<void>;
  updatePayment: (id: string, payment: any) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  
  // Purchases
  purchases: Purchase[];
  addPurchase: (purchase: any) => Promise<void>;
  updatePurchase: (id: string, purchase: any) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  
  // Sales
  sales: Sale[];
  addSale: (sale: any) => Promise<void>;
  updateSale: (id: string, sale: any) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  
  // Expenses
  expenses: Expense[];
  addExpense: (expense: any) => Promise<void>;
  updateExpense: (id: string, expense: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Cash Entries
  cashEntries: CashEntry[];
  addCashEntry: (entry: any) => Promise<void>;
  updateCashEntry: (id: string, entry: any) => Promise<void>;
  deleteCashEntry: (id: string) => Promise<void>;
  
  // Utility functions
  refreshAllTransactions: () => Promise<void>;
  refreshExpenses: () => Promise<void>;
  refreshCashEntries: () => Promise<void>;
  getTotalRevenue: () => number;
  getTotalExpenses: () => number;
  getCashBalance: () => number;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [labourBills, setLabourBills] = useState<LabourBill[]>([]);
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cashEntries, setCashEntries] = useState<CashEntry[]>([]);
  
  const { isAuthenticated, hasPermission } = useAuth();
  const { triggerDashboardRefresh } = useDashboardRefresh();

  const fetchExpenses = useCallback(async () => {
    if (!isAuthenticated || !hasPermission('Expense Entry', 'view')) {
      if (!isAuthenticated) setExpenses([]);
      return;
    }
    try {
      const res = await api.get('/expenses');
      if (res.success && res.data) {
        const rows = res.data.data || res.data;
        if (Array.isArray(rows)) {
          setExpenses(rows.map((row: any) => ({
            id: row.id.toString(),
            expenseNo: row.expense_no || '',
            expenseDate: row.expense_date || '',
            category: row.category || '',
            description: row.description || '',
            amount: parseFloat(row.amount || 0),
            paymentMode: row.payment_mode || 'Cash',
            referenceNo: row.reference_no,
            status: row.status || 'Paid',
            createdAt: row.created_at
          })));
        }
      }
    } catch (error) {
    }
  }, [isAuthenticated, hasPermission]);

  const fetchCashEntries = useCallback(async () => {
    if (!isAuthenticated || !hasPermission('Cash Entry', 'view')) {
      if (!isAuthenticated) setCashEntries([]);
      return;
    }
    try {
      const res = await api.get('/inventory/cash');
      if (res.success && res.data) {
        const rows = res.data.data || res.data;
        if (Array.isArray(rows)) {
          setCashEntries(rows.map((row: any) => ({
            id: row.id.toString(),
            entryNo: row.entry_no || '',
            date: row.entry_date || '',
            time: row.entry_time || '',
            transactionType: row.transaction_type || 'Cash In',
            referenceNo: row.reference_no || '',
            description: row.description || '',
            amount: parseFloat(row.amount || 0),
            paymentType: row.payment_type || 'Cash',
            notes: row.notes || '',
            handledBy: row.handled_by || '',
            createdAt: row.created_at
          })));
        }
      }
    } catch (error) {
    }
  }, [isAuthenticated, hasPermission]);

  const fetchOthers = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const tasks = [];
      if (hasPermission('Labour Bill', 'view')) tasks.push(api.get('/labour-bills'));
      else tasks.push(Promise.resolve({ success: true, data: [] }));

      if (hasPermission('Estimation', 'view')) tasks.push(api.get('/estimations'));
      else tasks.push(Promise.resolve({ success: true, data: [] }));

      if (hasPermission('Receipt', 'view')) tasks.push(api.get('/receipts'));
      else tasks.push(Promise.resolve({ success: true, data: [] }));

      if (hasPermission('Payment', 'view')) tasks.push(api.get('/payments'));
      else tasks.push(Promise.resolve({ success: true, data: [] }));

      if (hasPermission('Purchase', 'view')) tasks.push(api.get('/inventory/purchases'));
      else tasks.push(Promise.resolve({ success: true, data: [] }));

      if (hasPermission('Sales', 'view')) tasks.push(api.get('/inventory/sales'));
      else tasks.push(Promise.resolve({ success: true, data: [] }));

      const [lbRes, estRes, recRes, payRes, purRes, salRes] = await Promise.all(tasks);

      if (lbRes.success) setLabourBills(lbRes.data.data || lbRes.data || []);
      if (estRes.success) setEstimations(estRes.data.data || estRes.data || []);
      if (recRes.success) setReceipts(recRes.data.data || recRes.data || []);
      if (payRes.success) setPayments(payRes.data.data || payRes.data || []);
      if (purRes.success) setPurchases(purRes.data.data || purRes.data || []);
      if (salRes.success) setSales(salRes.data.data || salRes.data || []);
    } catch (error) {
    }
  }, [isAuthenticated, hasPermission]);

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    await Promise.all([
      fetchExpenses(),
      fetchCashEntries(),
      fetchOthers()
    ]);
  }, [fetchExpenses, fetchCashEntries, fetchOthers, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    } else {
      setExpenses([]);
      setCashEntries([]);
      setLabourBills([]);
      setEstimations([]);
      setReceipts([]);
      setPayments([]);
      setPurchases([]);
      setSales([]);
    }
  }, [isAuthenticated, refreshAll]);

  // Actions
  const addExpense = async (data: any) => {
    const payload = {
      expense_no: data.expenseNo || data.expense_no,
      expense_date: data.expenseDate || data.expense_date || data.date,
      category: data.category,
      description: data.description,
      amount: data.amount,
      payment_mode: data.paymentMode || data.payment_mode,
      reference_no: data.referenceNo || data.reference_no,
      status: data.status || 'Paid'
    };
    const res = await api.post('/expenses', payload);
    if (res.success) {
      toast.success('Expense recorded');
      await fetchExpenses();
      triggerDashboardRefresh();
    }
  };

  const updateExpense = async (id: string, data: any) => {
    const payload = {
      expense_no: data.expenseNo || data.expense_no,
      expense_date: data.expenseDate || data.expense_date || data.date,
      category: data.category,
      description: data.description,
      amount: data.amount,
      payment_mode: data.paymentMode || data.payment_mode,
      reference_no: data.referenceNo || data.reference_no,
      status: data.status || 'Paid'
    };
    const res = await api.put(`/expenses/${id}`, payload);
    if (res.success) {
      toast.success('Expense updated');
      await fetchExpenses();
      triggerDashboardRefresh();
    }
  };

  const deleteExpense = async (id: string) => {
    const res = await api.delete(`/expenses/${id}`);
    if (res.success) {
      toast.success('Expense deleted');
      await fetchExpenses();
      triggerDashboardRefresh();
    }
  };

  const addCashEntry = async (data: any) => {
    const res = await api.post('/inventory/cash', {
      entry_no: data.entryNo,
      entry_date: data.date,
      entry_time: data.time,
      transaction_type: data.transactionType,
      reference_no: data.referenceNo,
      description: data.description,
      amount: data.amount,
      payment_type: data.paymentType,
      notes: data.notes,
      handled_by: data.handledBy
    });
    if (res.success) {
      toast.success('Cash entry recorded');
      await fetchCashEntries();
    }
  };

  const updateCashEntry = async (id: string, data: any) => {
    // Note: backend may need PUT /inventory/cash/:id if not already there
    const res = await api.put(`/inventory/cash/${id}`, data);
    if (res.success) {
      toast.success('Cash entry updated');
      await fetchCashEntries();
    }
  };

  const deleteCashEntry = async (id: string) => {
    const res = await api.delete(`/inventory/cash/${id}`);
    if (res.success) {
      toast.success('Cash entry deleted');
      await fetchCashEntries();
    }
  };

  // Stubs for other actions (they should ideally use their own contexts, but we keep them for compatibility)
  const addLabourBill = async (bill: any) => { await api.post('/labour-bills', bill); await fetchOthers(); };
  const updateLabourBill = async (id: string, bill: any) => { await api.put(`/labour-bills/${id}`, bill); await fetchOthers(); };
  const deleteLabourBill = async (id: string) => { await api.delete(`/labour-bills/${id}`); await fetchOthers(); };

  const addEstimation = async (est: any) => { await api.post('/estimations', est); await fetchOthers(); };
  const updateEstimation = async (id: string, est: any) => { await api.put(`/estimations/${id}`, est); await fetchOthers(); };
  const deleteEstimation = async (id: string) => { await api.delete(`/estimations/${id}`); await fetchOthers(); };

  const addReceipt = async (rec: any) => { await api.post('/receipts', rec); await fetchOthers(); };
  const updateReceipt = async (id: string, rec: any) => { await api.put(`/receipts/${id}`, rec); await fetchOthers(); };
  const deleteReceipt = async (id: string) => { await api.delete(`/receipts/${id}`); await fetchOthers(); };

  const addPayment = async (pay: any) => { await api.post('/payments', pay); await fetchOthers(); };
  const updatePayment = async (id: string, pay: any) => { await api.put(`/payments/${id}`, pay); await fetchOthers(); };
  const deletePayment = async (id: string) => { await api.delete(`/payments/${id}`); await fetchOthers(); };

  const addPurchase = async (pur: any) => { await api.post('/inventory/purchases', pur); await fetchOthers(); };
  const updatePurchase = async (id: string, pur: any) => { await api.put(`/inventory/purchases/${id}`, pur); await fetchOthers(); };
  const deletePurchase = async (id: string) => { await api.delete(`/inventory/purchases/${id}`); await fetchOthers(); };

  const addSale = async (sal: any) => { await api.post('/inventory/sales', sal); await fetchOthers(); };
  const updateSale = async (id: string, sal: any) => { await api.put(`/inventory/sales/${id}`, sal); await fetchOthers(); };
  const deleteSale = async (id: string) => { await api.delete(`/inventory/sales/${id}`); await fetchOthers(); };

  const getTotalRevenue = () => {
    const lbTotal = labourBills.reduce((sum, b) => sum + (Number(b.totalAmount) || Number((b as any).grand_total) || 0), 0);
    const saleTotal = sales.reduce((sum, s) => sum + (Number(s.totalAmount) || Number((s as any).grand_total) || 0), 0);
    return lbTotal + saleTotal;
  };

  const getTotalExpenses = () => {
    const purTotal = purchases.reduce((sum, p) => sum + (Number(p.totalAmount) || Number((p as any).grand_total) || 0), 0);
    const expTotal = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return purTotal + expTotal;
  };

  const getCashBalance = () => {
    const cashIn = cashEntries.filter(c => c.transactionType === 'Cash In').reduce((sum, c) => sum + c.amount, 0);
    const cashOut = cashEntries.filter(c => c.transactionType === 'Cash Out').reduce((sum, c) => sum + c.amount, 0);
    return (getTotalRevenue() + cashIn) - (getTotalExpenses() + cashOut);
  };

  return (
    <TransactionsContext.Provider
      value={{
        labourBills, addLabourBill, updateLabourBill, deleteLabourBill,
        estimations, addEstimation, updateEstimation, deleteEstimation,
        receipts, addReceipt, updateReceipt, deleteReceipt,
        payments, addPayment, updatePayment, deletePayment,
        purchases, addPurchase, updatePurchase, deletePurchase,
        sales, addSale, updateSale, deleteSale,
        expenses, addExpense, updateExpense, deleteExpense,
        cashEntries, addCashEntry, updateCashEntry, deleteCashEntry,
        refreshAllTransactions: refreshAll,
        refreshExpenses: fetchExpenses,
        refreshCashEntries: fetchCashEntries,
        getTotalRevenue,
        getTotalExpenses,
        getCashBalance,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error('useTransactions must be used within a TransactionsProvider');
  return context;
};