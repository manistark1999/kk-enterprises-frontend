import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, endpoints } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface SalesItem {
  id: string | number;
  itemName: string;
  quantity: number;
  rate: number;
  gst: number;
  amount: number;
}

export interface Sale {
  id: string;
  billNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: SalesItem[];
  subtotal: number;
  totalGST: number;
  discount: number;
  grandTotal: number;
  paymentMode: string;
  status: string;
  createdAt?: string;
}

interface SalesContextType {
  sales: Sale[];
  isLoading: boolean;
  addSale: (sale: any) => Promise<any>;
  updateSale: (id: string, sale: any) => Promise<any>;
  deleteSale: (id: string) => Promise<void>;
  refreshSales: () => Promise<void>;
  getSaleById: (id: string) => Sale | undefined;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();

  const fetchSales = async () => {
    if (!isAuthenticated) {
      setSales([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get(endpoints.inventory.sales.list);
      if (response.success && response.data) {
        const mapped = (response.data.data || []).map((row: any) => ({
          id: row.id.toString(),
          billNo: row.sale_no,
          date: row.sale_date,
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
          subtotal: Number(row.subtotal),
          totalGST: Number(row.total_gst),
          discount: Number(row.discount),
          grandTotal: Number(row.grand_total),
          paymentMode: row.payment_mode,
          status: row.status,
          createdAt: row.created_at
        }));
        setSales(mapped);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [isAuthenticated]);

  const addSale = async (newSale: Partial<Sale>) => {
    try {
      const payload = {
        sale_no: newSale.billNo,
        sale_date: newSale.date,
        customer_name: newSale.customerName,
        customer_phone: newSale.customerPhone,
        items: newSale.items,
        subtotal: newSale.subtotal,
        total_gst: newSale.totalGST,
        discount: newSale.discount,
        grand_total: newSale.grandTotal,
        payment_mode: newSale.paymentMode || 'Cash',
        status: newSale.status || 'Completed'
      };

      const response = await api.post(endpoints.inventory.sales.create, payload);
      if (response.success) {
        await fetchSales();
        toast.success('Sale recorded successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add sale');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add sale');
      throw error;
    }
  };

  const updateSale = async (id: string, updatedSale: Partial<Sale>) => {
    try {
      const existing = sales.find(s => s.id === id);
      const merged = { ...existing, ...updatedSale } as Sale;

      const payload = {
        sale_no: merged.billNo,
        sale_date: merged.date,
        customer_name: merged.customerName,
        customer_phone: merged.customerPhone,
        items: merged.items,
        subtotal: merged.subtotal,
        total_gst: merged.totalGST,
        discount: merged.discount,
        grand_total: merged.grandTotal,
        payment_mode: merged.paymentMode,
        status: merged.status
      };

      const response = await api.put(endpoints.inventory.sales.update(id), payload);
      if (response.success) {
        await fetchSales();
        toast.success('Sale updated successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update sale');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update sale');
      throw error;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      const response = await api.delete(endpoints.inventory.sales.delete(id));
      if (response.success) {
        await fetchSales();
      }
    } catch (error) {
      throw error;
    }
  };

  const getSaleById = (id: string) => {
    return sales.find(s => s.id === id);
  };

  return (
    <SalesContext.Provider
      value={{
        sales,
        isLoading,
        addSale,
        updateSale,
        deleteSale,
        refreshSales: fetchSales,
        getSaleById,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within SalesProvider');
  }
  return context;
}
