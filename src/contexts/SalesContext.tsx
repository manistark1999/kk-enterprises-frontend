import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, endpoints } from '@/services/api';
import { useAuth } from './AuthContext';

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
      console.error('Error fetching sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [isAuthenticated]);

  const addSale = async (newSale: any) => {
    try {
      const response = await api.post(endpoints.inventory.sales.create, newSale);
      if (response.success) {
        await fetchSales();
        return response.data;
      }
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  };

  const updateSale = async (id: string, updatedSale: any) => {
    try {
      const response = await api.put(endpoints.inventory.sales.update(id), updatedSale);
      if (response.success) {
        await fetchSales();
        return response.data;
      }
    } catch (error) {
      console.error('Error updating sale:', error);
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
      console.error('Error deleting sale:', error);
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
