import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, endpoints } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

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
  items: EstimationItem[];
  subtotal: number;
  totalGST: number;
  discount: number;
  grandTotal: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
  createdAt: string;
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
  items: Array.isArray(row.items) ? row.items : JSON.parse(row.items || '[]'),
  subtotal: row.total_amount ? parseFloat(row.total_amount) : 0, // Simplified if subtotal not separate
  totalGST: 0, // Backend might not return breakdown if not stored
  discount: 0,
  grandTotal: row.total_amount ? parseFloat(row.total_amount) : 0,
  status: (row.status as 'Completed' | 'Pending' | 'Cancelled') || 'Pending',
  createdAt: row.created_at
});

export function EstimationProvider({ children }: { children: ReactNode }) {
  const [estimations, setEstimations] = useState<EstimationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();

  const fetchEstimations = async () => {
    if (!isAuthenticated) {
      setEstimations([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get(endpoints.billing.estimation.list);
      console.log('[EstimationContext] fetchEstimations response:', res);
      
      if (res.success && res.data) {
        // Handle both: res.data.data (array) AND res.data (array)
        const rawData = res.data.data || res.data;
        if (Array.isArray(rawData)) {
          setEstimations(rawData.map(mapRow));
        } else {
          console.warn('[EstimationContext] Unexpected estimations format:', rawData);
          setEstimations([]);
        }
      }
    } catch (err) {
      console.error('[EstimationContext] Error fetching estimations:', err);
      toast.error('Failed to load estimations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEstimations(); }, [isAuthenticated]);

  const addEstimation = async (estimation: EstimationRecord) => {
    try {
      const payload = {
        bill_no: estimation.billNo,
        estimation_date: estimation.date,
        estimation_time: estimation.time,
        customer_name: estimation.customerName,
        customer_phone: estimation.customerPhone,
        customer_address: estimation.customerAddress,
        vehicle_number: estimation.vehicleNumber,
        vehicle_make: estimation.vehicleMake,
        vehicle_model: estimation.vehicleModel,
        km_reading: estimation.kmReading,
        fuel_level: estimation.fuelLevel,
        total_amount: estimation.grandTotal,
        status: estimation.status,
        items: estimation.items
      };

      const res = await api.post(endpoints.billing.estimation.create, payload);
      if (res.success) {
        await fetchEstimations();
        toast.success('Estimation saved successfully');
      } else {
        toast.error(res.message || 'Failed to save estimation');
        throw new Error(res.error || 'Failed to save estimation');
      }
    } catch (error: any) {
      console.error('[EstimationContext] addEstimation catch:', error);
      toast.error(error.message || 'Failed to add estimation');
      throw error;
    }
  };

  const updateEstimation = async (id: string, updated: Partial<EstimationRecord>) => {
    try {
      const existing = estimations.find(e => e.id === id);
      const merged = { ...existing, ...updated } as EstimationRecord;
      
      const payload = {
        bill_no: merged.billNo,
        estimation_date: merged.date,
        estimation_time: merged.time,
        customer_name: merged.customerName,
        customer_phone: merged.customerPhone,
        customer_address: merged.customerAddress,
        vehicle_number: merged.vehicleNumber,
        vehicle_make: merged.vehicleMake,
        vehicle_model: merged.vehicleModel,
        km_reading: merged.kmReading,
        fuel_level: merged.fuelLevel,
        total_amount: merged.grandTotal,
        status: merged.status,
        items: merged.items
      };

      const res = await api.put(endpoints.billing.estimation.update(id), payload);
      if (res.success) {
        await fetchEstimations();
        toast.success('Estimation updated successfully');
      } else {
        toast.error(res.message || 'Failed to update estimation');
        throw new Error(res.error || 'Failed to update estimation');
      }
    } catch (error: any) {
      console.error('[EstimationContext] updateEstimation catch:', error);
      toast.error(error.message || 'Failed to update estimation');
      throw error;
    }
  };

  const deleteEstimation = async (id: string) => {
    const res = await api.delete(endpoints.billing.estimation.delete(id));
    if (res.success) {
      setEstimations(prev => prev.filter(e => e.id !== id));
      toast.success('Estimation deleted successfully');
    }
  };

  const getEstimationById = (id: string) => estimations.find(e => e.id === id);

  const getNextEstimationNo = async (): Promise<string | null> => {
    try {
      const res = await api.get('/estimations/next-number');
      if (res.success && res.data) {
        // Correct unwrapping for the next number string
        return res.data.data || res.data;
      }
      return null;
    } catch (err) {
      console.error('[EstimationContext] Error fetching next estimation number:', err);
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
