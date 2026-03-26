import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useNotifications } from './NotificationContext';
import { useDashboardRefresh } from './DashboardRefreshContext';

export interface LabourBillItem {
  id: number;
  itemName: string;
  quantity: number;
  rate: number;
  gst: number;
  amount: number;
}

export interface LabourBillRecord {
  id: string;
  billNo: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  vehicleNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  kmReading: string;
  fuelLevel: string;
  customerId?: string;
  vehicleId?: string;
  items: LabourBillItem[];
  subtotal: number;
  totalGST: number;
  discount: number;
  grandTotal: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
  createdAt: string;
  processedBy?: string;
  processedById?: number;
}

interface LabourBillContextType {
  labourBills: LabourBillRecord[];
  isLoading: boolean;
  addLabourBill: (bill: LabourBillRecord) => Promise<void>;
  updateLabourBill: (id: string, bill: Partial<LabourBillRecord>) => Promise<void>;
  deleteLabourBill: (id: string) => Promise<void>;
  getLabourBillById: (id: string) => LabourBillRecord | undefined;
  getNextBillNumber: (prefix: string, year?: number) => string;
  refreshLabourBills: () => Promise<void>;
}

const LabourBillContext = createContext<LabourBillContextType | undefined>(undefined);

const mapRow = (row: any): LabourBillRecord => ({
  id: row.id.toString(),
  billNo: row.bill_no,
  date: row.bill_date ? new Date(row.bill_date).toISOString().split('T')[0] : '',
  time: row.bill_time || '',
  customerName: row.customer_name || '',
  customerPhone: row.customer_phone || '',
  customerAddress: row.customer_address || '',
  vehicleNumber: row.vehicle_number || '',
  vehicleMake: row.vehicle_make || '',
  vehicleModel: row.vehicle_model || '',
  kmReading: row.km_reading || '',
  fuelLevel: row.fuel_level || '',
  customerId: row.customer_id?.toString() || '',
  vehicleId: row.vehicle_id?.toString() || '',
  items: Array.isArray(row.items) ? row.items : JSON.parse(row.items || '[]'),
  subtotal: row.subtotal ? parseFloat(row.subtotal) : 0,
  totalGST: row.total_gst ? parseFloat(row.total_gst) : 0,
  discount: row.discount ? parseFloat(row.discount) : 0,
  grandTotal: row.grand_total ? parseFloat(row.grand_total) : 0,
  status: (row.status as 'Completed' | 'Pending' | 'Cancelled') || 'Completed',
  createdAt: row.created_at,
  processedBy: row.processed_by || '',
  processedById: row.processed_by_id
});

export function LabourBillProvider({ children }: { children: ReactNode }) {
  const [labourBills, setLabourBills] = useState<LabourBillRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  const { isAuthenticated, user, hasPermission } = useAuth();
  const { triggerDashboardRefresh } = useDashboardRefresh();
  
  const fetchBills = async () => {
    if (!isAuthenticated || !hasPermission('Labour Bill', 'view')) {
      if (!isAuthenticated) setLabourBills([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get('/labour-bills');
      if (res.success && res.data) {
        setLabourBills((res.data.data || res.data).map(mapRow));
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchBills(); 
  }, [isAuthenticated]);

  const addLabourBill = async (bill: LabourBillRecord) => {
    const payload = {
      bill_no: bill.billNo,
      bill_date: bill.date,
      bill_time: bill.time,
      customer_id: bill.customerId || bill.id,
      vehicle_id: bill.vehicleId,
      customer_name: bill.customerName,
      customer_phone: bill.customerPhone,
      customer_address: bill.customerAddress,
      vehicle_number: bill.vehicleNumber,
      vehicle_make: bill.vehicleMake,
      vehicle_model: bill.vehicleModel,
      km_reading: bill.kmReading,
      fuel_level: bill.fuelLevel,
      items: bill.items,
      subtotal: bill.subtotal,
      total_gst: bill.totalGST,
      discount: bill.discount,
      grand_total: bill.grandTotal,
      total_amount: bill.grandTotal, 
      status: bill.status?.toLowerCase() || 'completed',
      processed_by: user?.username || bill.processedBy || 'admin',
      processed_by_id: user?.id || bill.processedById
    };

    try {
      const res = await api.post('/labour-bills', payload);

      if (res.success) {
        await fetchBills();
        triggerDashboardRefresh();
        toast.success(`Bill ${payload.bill_no} saved successfully.`);

        // ADD NOTIFICATION
        addNotification(
          'Saved', 
          payload.bill_no, 
          'Labour Bill', 
          `Invoice ${payload.bill_no} generated for ${payload.customer_name}`,
          { totalAmount: payload.grand_total }
        );
      } else {
        throw new Error(res.message || res.error || 'Failed to save labour bill');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while saving the bill.');
      throw error;
    }
  };

  const updateLabourBill = async (id: string, updatedBill: Partial<LabourBillRecord>) => {
    try {
      const existing = labourBills.find(b => b.id === id);
      const merged = { ...existing, ...updatedBill } as any;

      const payload = {
        bill_no: merged.billNo,
        bill_date: merged.date,
        bill_time: merged.time,
        customer_name: merged.customerName,
        customer_phone: merged.customerPhone,
        customer_address: merged.customerAddress,
        customer_id: merged.customerId,
        vehicle_id: merged.vehicleId,
        vehicle_number: merged.vehicleNumber,
        vehicle_make: merged.vehicleMake,
        vehicle_model: merged.vehicleModel,
        km_reading: merged.kmReading,
        fuel_level: merged.fuelLevel,
        items: merged.items,
        subtotal: merged.subtotal,
        total_gst: merged.totalGST,
        discount: merged.discount,
        grand_total: merged.grandTotal,
        status: merged.status,
        processed_by: user?.username || merged.processedBy || 'admin',
        processed_by_id: user?.id || merged.processedById
      };
      
      const res = await api.put(`/labour-bills/${id}`, payload);

      if (res.success) {
        await fetchBills();
        triggerDashboardRefresh();
        toast.success(`Bill ${payload.bill_no} updated successfully.`);

        // ADD NOTIFICATION
        addNotification(
          'Updated', 
          payload.bill_no, 
          'Labour Bill', 
          `Invoice ${payload.bill_no} updated for ${payload.customer_name}`,
          { totalAmount: payload.grand_total }
        );
      } else {
        throw new Error(res.message || res.error || 'Failed to update labour bill');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating the bill.');
      throw error;
    }
  };

  const deleteLabourBill = async (id: string) => {
    try {
        const existing = labourBills.find(b => b.id === id);
        const res = await api.delete(`/labour-bills/${id}`);
        if (res.success) {
          setLabourBills(prev => prev.filter(b => b.id !== id));
          triggerDashboardRefresh();
          toast.success('Bill deleted successfully.');

          // ADD NOTIFICATION
          if (existing) {
            addNotification(
              'Deleted', 
              existing.billNo, 
              'Labour Bill', 
              `Removed labour bill invoice ${existing.billNo}`
            );
          }
        } else {
            throw new Error(res.error || 'Failed to delete bill');
        }
    } catch (error: any) {
        toast.error(error.message || 'Failed to delete bill');
        throw error;
    }
  };

  const getLabourBillById = (id: string) => labourBills.find(b => b.id === id);

  const getNextBillNumber = (prefix: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const monthPrefix = `${prefix}-${currentYear}-${currentMonth}-`;
    
    const currentMonthBills = labourBills.filter(bill => 
      bill.billNo && typeof bill.billNo === 'string' && bill.billNo.startsWith(monthPrefix)
    );
    
    const max = currentMonthBills.reduce((maxVal, bill) => {
      const suffix = bill.billNo?.split('-').pop();
      const num = parseInt(suffix || '0');
      return isNaN(num) ? maxVal : Math.max(maxVal, num);
    }, 0);
    
    return `${monthPrefix}${String(max + 1).padStart(3, '0')}`;
  };

  return (
    <LabourBillContext.Provider value={{ labourBills, isLoading, addLabourBill, updateLabourBill, deleteLabourBill, getLabourBillById, getNextBillNumber, refreshLabourBills: fetchBills }}>
      {children}
    </LabourBillContext.Provider>
  );
}

export function useLabourBills() {
  const context = useContext(LabourBillContext);
  if (context === undefined) throw new Error('useLabourBills must be used within a LabourBillProvider');
  return context;
}