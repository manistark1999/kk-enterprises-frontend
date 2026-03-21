import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, endpoints } from '@/services/api';
import { useAuth } from './AuthContext';

export interface PurchaseItem {
  id: string | number;
  itemName: string;
  quantity: number;
  rate: number;
  gst: number;
  amount: number;
}

export interface Purchase {
  id: string;
  billNo: string;
  date: string;
  supplierId: string | number;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  totalGST: number;
  discount: number;
  grandTotal: number;
  paymentMode: string;
  status: string;
  notes?: string;
  invoiceNo?: string;
  createdAt?: string;
}

interface PurchaseContextType {
  purchases: Purchase[];
  isLoading: boolean;
  addPurchase: (purchase: any) => Promise<any>;
  updatePurchase: (id: string, purchase: any) => Promise<any>;
  deletePurchase: (id: string) => Promise<void>;
  refreshPurchases: () => Promise<void>;
  getPurchaseById: (id: string) => Purchase | undefined;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export function PurchaseProvider({ children }: { children: ReactNode }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();

  const fetchPurchases = async () => {
    if (!isAuthenticated) {
      setPurchases([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get(endpoints.inventory.purchase.list);
      if (response.success && response.data) {
        const mapped = (response.data.data || []).map((row: any) => ({
          id: row.id.toString(),
          billNo: row.purchase_no,
          date: row.purchase_date,
          supplierId: row.supplier_id,
          supplierName: row.supplier_name,
          items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
          subtotal: Number(row.subtotal),
          totalGST: Number(row.total_gst),
          discount: Number(row.discount),
          grandTotal: Number(row.grand_total),
          paymentMode: row.payment_mode,
          status: row.status,
          notes: row.notes,
          invoiceNo: row.invoice_no,
          createdAt: row.created_at
        }));
        setPurchases(mapped);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [isAuthenticated]);

  const addPurchase = async (newPurchase: any) => {
    try {
      const response = await api.post(endpoints.inventory.purchase.create, newPurchase);
      if (response.success) {
        await fetchPurchases();
        return response.data;
      }
    } catch (error) {
      console.error('Error adding purchase:', error);
      throw error;
    }
  };

  const updatePurchase = async (id: string, updatedPurchase: any) => {
    try {
      const response = await api.put(endpoints.inventory.purchase.update(id), updatedPurchase);
      if (response.success) {
        await fetchPurchases();
        return response.data;
      }
    } catch (error) {
      console.error('Error updating purchase:', error);
      throw error;
    }
  };

  const deletePurchase = async (id: string) => {
    try {
      const response = await api.delete(endpoints.inventory.purchase.delete(id));
      if (response.success) {
        await fetchPurchases();
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      throw error;
    }
  };

  const getPurchaseById = (id: string) => {
    return purchases.find(p => p.id === id);
  };

  return (
    <PurchaseContext.Provider
      value={{
        purchases,
        isLoading,
        addPurchase,
        updatePurchase,
        deletePurchase,
        refreshPurchases: fetchPurchases,
        getPurchaseById,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchases() {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchases must be used within PurchaseProvider');
  }
  return context;
}
