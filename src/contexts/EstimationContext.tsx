import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, endpoints } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { useNotifications } from './NotificationContext';

export interface EstimationItem {
  id: number;
  itemName: string;
  quantity: number;
  rate: number;
  gst: number;
  amount: number;
}

export interface EstimationRecord {
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
  items: EstimationItem[];
  subtotal: number;
  totalGST: number;
  discount: number;
  grandTotal: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
  createdAt: string;
  processedBy?: string;
  processedById?: number;
}

interface EstimationContextType {
  estimations: EstimationRecord[];
  isLoading: boolean;
  addEstimation: (estimation: EstimationRecord) => Promise<void>;
  updateEstimation: (id: string, estimation: Partial<EstimationRecord>) => Promise<void>;
  deleteEstimation: (id: string) => Promise<void>;
  getEstimationById: (id: string) => EstimationRecord | undefined;
  refreshEstimations: () => Promise<void>;
  getNextEstimationNo: () => Promise<string | null>;
}

const EstimationContext = createContext<EstimationContextType | undefined>(undefined);

const mapRow = (row: any): EstimationRecord => ({
  id: row.id.toString(),
  billNo: row.bill_no,
  date: row.estimation_date ? new Date(row.estimation_date).toISOString().split('T')[0] : '',
  time: row.estimation_time || '',
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
  subtotal: row.total_amount ? parseFloat(row.total_amount) : 0, 
  totalGST: 0, 
  discount: 0,
  grandTotal: row.total_amount ? parseFloat(row.total_amount) : 0,
  status: (row.status as 'Completed' | 'Pending' | 'Cancelled') || 'Pending',
  createdAt: row.created_at,
  processedBy: row.processed_by || '',
  processedById: row.processed_by_id
});

export function EstimationProvider({ children }: { children: ReactNode }) {
  const [estimations, setEstimations] = useState<EstimationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  const { isAuthenticated, user, hasPermission } = useAuth();

  const fetchEstimations = async () => {
    if (!isAuthenticated || !hasPermission('Estimation', 'view')) {
      if (!isAuthenticated) setEstimations([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get(endpoints.billing.estimation.list);
      const rawData = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setEstimations(rawData.map(mapRow));
    } catch (err: any) {
      setEstimations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEstimations(); }, [isAuthenticated]);

  const addEstimation = async (estimation: any) => {
    try {
      const payload = {
        bill_no: estimation.billNo || estimation.bill_no,
        estimation_date: estimation.date || estimation.estimation_date,
        estimation_time: estimation.time || estimation.estimation_time,
        customer_id: estimation.customerId || estimation.customer_id,
        customer_name: estimation.customerName || estimation.customer_name,
        customer_phone: estimation.customerPhone || estimation.customer_phone,
        customer_address: estimation.customerAddress || estimation.customer_address,
        vehicle_id: estimation.vehicleId || estimation.vehicle_id,
        vehicle_number: estimation.vehicleNumber || estimation.vehicle_number,
        vehicle_make: estimation.vehicleMake || estimation.vehicle_make,
        vehicle_model: estimation.vehicleModel || estimation.vehicle_model,
        km_reading: estimation.kmReading || estimation.km_reading,
        fuel_level: estimation.fuelLevel || estimation.fuel_level,
        total_amount: estimation.grandTotal || estimation.total_amount,
        status: (estimation.status)?.toLowerCase() || 'pending',
        items: estimation.items,
        processed_by: user?.username || estimation.processedBy || 'admin',
        processed_by_id: user?.id || estimation.processedById
      };

      const res = await api.post(endpoints.billing.estimation.create, payload);
      if (res.success) {
        await fetchEstimations();
        toast.success('Estimation saved successfully');

        // ADD NOTIFICATION
        addNotification(
          'Saved', 
          payload.bill_no, 
          'Estimation', 
          `New estimation ${payload.bill_no} created for ${payload.customer_name}`,
          { totalAmount: payload.total_amount }
        );
      } else {
        toast.error(res.message || 'Failed to save estimation');
        throw new Error(res.error || 'Failed to save estimation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add estimation');
      throw error;
    }
  };

  const updateEstimation = async (id: string, updated: any) => {
    try {
      const existing = estimations.find(e => e.id === id);
      const merged = { ...existing, ...updated } as any;
      
      const payload = {
        bill_no: merged.billNo || merged.bill_no,
        estimation_date: merged.date || merged.estimation_date,
        estimation_time: merged.time || merged.estimation_time,
        customer_id: merged.customerId || merged.customer_id,
        customer_name: merged.customerName || merged.customer_name,
        customer_phone: merged.customerPhone || merged.customer_phone,
        customer_address: merged.customerAddress || merged.customer_address,
        vehicle_id: merged.vehicleId || merged.vehicle_id,
        vehicle_number: merged.vehicleNumber || merged.vehicle_number,
        vehicle_make: merged.vehicleMake || merged.vehicle_make,
        vehicle_model: merged.vehicleModel || merged.vehicle_model,
        km_reading: merged.kmReading || merged.km_reading,
        fuel_level: merged.fuelLevel || merged.fuel_level,
        total_amount: merged.grandTotal || merged.total_amount,
        status: (merged.status)?.toLowerCase(),
        items: merged.items,
        processed_by: user?.username || merged.processedBy || 'admin',
        processed_by_id: user?.id || merged.processedById
      };

      const res = await api.put(endpoints.billing.estimation.update(id), payload);
      if (res.success) {
        await fetchEstimations();
        toast.success('Estimation updated successfully');

        // ADD NOTIFICATION
        addNotification(
          'Updated', 
          payload.bill_no, 
          'Estimation', 
          `Estimation ${payload.bill_no} updated for ${payload.customer_name}`,
          { totalAmount: payload.total_amount }
        );
      } else {
        toast.error(res.message || 'Failed to update estimation');
        throw new Error(res.error || 'Failed to update estimation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update estimation');
      throw error;
    }
  };

  const deleteEstimation = async (id: string) => {
    const existing = estimations.find(e => e.id === id);
    const res = await api.delete(endpoints.billing.estimation.delete(id));
    if (res.success) {
      setEstimations(prev => prev.filter(e => e.id !== id));
      toast.success('Estimation deleted successfully');

      // ADD NOTIFICATION
      if (existing) {
        addNotification(
          'Deleted', 
          existing.billNo, 
          'Estimation', 
          `Removed estimation record ${existing.billNo}`
        );
      }
    }
  };

  const getEstimationById = (id: string) => estimations.find(e => e.id === id);

  const getNextEstimationNo = async (): Promise<string | null> => {
    try {
      const res = await api.get('/estimations/next-number');
      if (res.success && res.data) {
        return res.data.data || res.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  return (
    <EstimationContext.Provider value={{ estimations, isLoading, addEstimation, updateEstimation, deleteEstimation, getEstimationById, refreshEstimations: fetchEstimations, getNextEstimationNo }}>
      {children}
    </EstimationContext.Provider>
  );
}

export function useEstimations() {
  const context = useContext(EstimationContext);
  if (context === undefined) throw new Error('useEstimations must be used within an EstimationProvider');
  return context;
}
