import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, endpoints } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

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
        const rawData = response.data.data || response.data;
        if (Array.isArray(rawData)) {
          const mapped = rawData.map((row: any) => ({
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
        } else {
          setPurchases([]);
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [isAuthenticated]);

  const addPurchase = async (purchaseData: any) => {
    const payload = {
        purchase_no: purchaseData.billNo,
        purchase_date: purchaseData.date,
        supplier_id: purchaseData.supplierId,
        supplier_name: purchaseData.supplierName,
        items: purchaseData.items,
        subtotal: purchaseData.subtotal,
        total_gst: purchaseData.totalGST,
        discount: purchaseData.discount,
        grand_total: purchaseData.grandTotal,
        payment_mode: purchaseData.paymentMode,
        status: purchaseData.status,
        notes: purchaseData.notes,
        invoice_no: purchaseData.invoiceNo
    };

    try {
      const response = await api.post(endpoints.inventory.purchase.create, payload);

      if (response.success) {
        await fetchPurchases();
        toast.success(`Purchase ${payload.purchase_no} saved successfully.`);
        return response.data;
      } else {
        throw new Error(response.message || response.error || 'Failed to add purchase');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while saving the purchase.');
      throw error;
    }
  };

  const updatePurchase = async (id: string, purchaseData: any) => {
    const payload = {
        purchase_no: purchaseData.billNo,
        purchase_date: purchaseData.date,
        supplier_id: purchaseData.supplierId,
        supplier_name: purchaseData.supplierName,
        items: purchaseData.items,
        subtotal: purchaseData.subtotal,
        total_gst: purchaseData.totalGST,
        discount: purchaseData.discount,
        grand_total: purchaseData.grandTotal,
        payment_mode: purchaseData.paymentMode,
        status: purchaseData.status,
        notes: purchaseData.notes,
        invoice_no: purchaseData.invoiceNo
    };

    try {
      const response = await api.put(endpoints.inventory.purchase.update(id), payload);

      if (response.success) {
        await fetchPurchases();
        toast.success(`Purchase ${payload.purchase_no} updated successfully.`);
        return response.data;
      } else {
        throw new Error(response.message || response.error || 'Failed to update purchase');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating the purchase.');
      throw error;
    }
  };

  const deletePurchase = async (id: string) => {
    try {
      const response = await api.delete(endpoints.inventory.purchase.delete(id));
      if (response.success) {
        await fetchPurchases();
        toast.success('Purchase deleted successfully.');
      } else {
        throw new Error(response.error || 'Failed to delete purchase');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete purchase');
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
