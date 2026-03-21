import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

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
  items: LabourBillItem[];
  subtotal: number;
  totalGST: number;
  discount: number;
  grandTotal: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
  createdAt: string;
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
  items: Array.isArray(row.items) ? row.items : JSON.parse(row.items || '[]'),
  subtotal: row.subtotal ? parseFloat(row.subtotal) : 0,
  totalGST: row.total_gst ? parseFloat(row.total_gst) : 0,
  discount: row.discount ? parseFloat(row.discount) : 0,
  grandTotal: row.grand_total ? parseFloat(row.grand_total) : 0,
  status: (row.status as 'Completed' | 'Pending' | 'Cancelled') || 'Completed',
  createdAt: row.created_at
});

export function LabourBillProvider({ children }: { children: ReactNode }) {
  const [labourBills, setLabourBills] = useState<LabourBillRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const fetchBills = async () => {
    if (!isAuthenticated) {
      setLabourBills([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get('/labour-bills');
      if (res.success && res.data) {
        setLabourBills((res.data.data || res.data).map(mapRow));
      }
    } catch (err) {
      console.error('Error fetching labour bills:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchBills(); 
  }, [isAuthenticated]);

  const addLabourBill = async (bill: LabourBillRecord) => {
    const res = await api.post('/labour-bills', {
      bill_no: bill.billNo,
      bill_date: bill.date,
      bill_time: bill.time,
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
      status: bill.status
    });
    if (res.success) {
      await fetchBills();
    } else {
      throw new Error(res.error || 'Failed to save labour bill');
    }
  };

  const updateLabourBill = async (id: string, updatedBill: Partial<LabourBillRecord>) => {
    const existing = labourBills.find(b => b.id === id);
    const merged = { ...existing, ...updatedBill };
    const res = await api.put(`/labour-bills/${id}`, {
      bill_no: merged.billNo,
      bill_date: merged.date,
      bill_time: merged.time,
      customer_name: merged.customerName,
      customer_phone: merged.customerPhone,
      customer_address: merged.customerAddress,
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
      status: merged.status
    });
    if (res.success) {
      await fetchBills();
    }
  };

  const deleteLabourBill = async (id: string) => {
    const res = await api.delete(`/labour-bills/${id}`);
    if (res.success) {
      setLabourBills(prev => prev.filter(b => b.id !== id));
    }
  };

  const getLabourBillById = (id: string) => labourBills.find(b => b.id === id);

  const getNextBillNumber = (prefix: string, year?: number) => {
    const currentYear = year || new Date().getFullYear();
    const currentYearBills = labourBills.filter(bill => {
      const parts = bill.billNo.split('-');
      return parts[0] === prefix && parseInt(parts[1]) === currentYear;
    });
    const max = currentYearBills.reduce((max, bill) => {
      const num = parseInt(bill.billNo.split('-')[2] || '0');
      return Math.max(max, num);
    }, 0);
    return `${prefix}-${currentYear}-${String(max + 1).padStart(3, '0')}`;
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