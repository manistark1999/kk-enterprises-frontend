import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

export interface Staff {
  id: string;
  name: string;
  designation: string;
  mobile: string;
  email: string;
  salary: number;
  joiningDate: string;
  status: 'Active' | 'Inactive';
  address?: string;
  bankAccount?: string;
  ifscCode?: string;
  createdAt: string;
}

interface StaffContextType {
  staff: Staff[];
  isLoading: boolean;
  addStaff: (staff: Omit<Staff, 'id' | 'createdAt'>) => Promise<void>;
  updateStaff: (id: string, staff: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  getActiveStaff: () => Staff[];
  getStaffById: (id: string) => Staff | undefined;
  refreshStaff: () => Promise<void>;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

const mapRow = (row: any): Staff => ({
  id: row.id.toString(),
  name: row.name,
  designation: row.designation || '',
  mobile: row.mobile || '',
  email: row.email || '',
  salary: row.salary ? parseFloat(row.salary) : 0,
  joiningDate: row.joining_date ? new Date(row.joining_date).toISOString().split('T')[0] : '',
  status: (row.status as 'Active' | 'Inactive') || 'Active',
  address: row.address || '',
  bankAccount: row.bank_account || '',
  ifscCode: row.ifsc_code || '',
  createdAt: row.created_at
});

export function StaffProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();

  const fetchStaff = async () => {
    if (!isAuthenticated) {
      setStaff([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get('/staff');
      if (res.success && res.data) {
        const rawData = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setStaff(rawData.map(mapRow));
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, [isAuthenticated]);

  const addStaff = async (data: Omit<Staff, 'id' | 'createdAt'>) => {
    const res = await api.post('/staff', {
      name: data.name, designation: data.designation, mobile: data.mobile, email: data.email,
      salary: data.salary, joining_date: data.joiningDate, address: data.address,
      bank_account: data.bankAccount, ifsc_code: data.ifscCode, status: data.status
    });
    if (res.success) await fetchStaff();
    else throw new Error(res.error || 'Failed to add staff');
  };

  const updateStaff = async (id: string, data: Partial<Staff>) => {
    const existing = staff.find(s => s.id === id);
    const merged = { ...existing, ...data };
    const res = await api.put(`/staff/${id}`, {
      name: merged.name, designation: merged.designation, mobile: merged.mobile, email: merged.email,
      salary: merged.salary, joining_date: merged.joiningDate, address: merged.address,
      bank_account: merged.bankAccount, ifsc_code: merged.ifscCode, status: merged.status
    });
    if (res.success) await fetchStaff();
    else throw new Error(res.error || 'Failed to update staff');
  };

  const deleteStaff = async (id: string) => {
    const res = await api.delete(`/staff/${id}`);
    if (res.success) setStaff(prev => prev.filter(s => s.id !== id));
    else throw new Error(res.error || 'Failed to delete staff');
  };

  const getActiveStaff = () => staff.filter(s => s.status === 'Active');
  const getStaffById = (id: string) => staff.find(s => s.id === id);

  return (
    <StaffContext.Provider value={{ staff, isLoading, addStaff, updateStaff, deleteStaff, getActiveStaff, getStaffById, refreshStaff: fetchStaff }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) {
    return { staff: [], isLoading: false, addStaff: async () => {}, updateStaff: async () => {}, deleteStaff: async () => {}, getActiveStaff: () => [], getStaffById: () => undefined, refreshStaff: async () => {} };
  }
  return context;
}