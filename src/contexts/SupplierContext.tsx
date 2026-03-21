import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

export interface Supplier {
  id: string;
  name: string;
  company: string;
  mobile: string;
  email: string;
  gstNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: 'Active' | 'Inactive';
  creditLimit?: number;
  creditDays?: number;
  bankAccount?: string;
  ifscCode?: string;
  createdAt: string;
}

interface SupplierContextType {
  suppliers: Supplier[];
  isLoading: boolean;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getActiveSuppliers: () => Supplier[];
  getSupplierById: (id: string) => Supplier | undefined;
  refreshSuppliers: () => Promise<void>;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

const mapRow = (row: any): Supplier => ({
  id: row.id.toString(),
  name: row.name,
  company: row.company || '',
  mobile: row.mobile || '',
  email: row.email || '',
  gstNumber: row.gst_number || '',
  address: row.address || '',
  city: row.city || '',
  state: row.state || '',
  pincode: row.pincode || '',
  status: (row.status as 'Active' | 'Inactive') || 'Active',
  creditLimit: row.credit_limit ? parseFloat(row.credit_limit) : 0,
  creditDays: row.credit_days || 0,
  bankAccount: row.bank_account || '',
  ifscCode: row.ifsc_code || '',
  createdAt: row.created_at
});

export function SupplierProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();

  const fetchSuppliers = async () => {
    if (!isAuthenticated) {
      setSuppliers([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get('/suppliers');
      if (res.success && res.data) {
        setSuppliers((res.data.data || res.data).map(mapRow));
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, [isAuthenticated]);

  const addSupplier = async (data: Omit<Supplier, 'id' | 'createdAt'>) => {
    const res = await api.post('/suppliers', {
      name: data.name, company: data.company, mobile: data.mobile, email: data.email,
      gst_number: data.gstNumber, address: data.address, city: data.city, state: data.state,
      pincode: data.pincode, credit_limit: data.creditLimit, credit_days: data.creditDays,
      bank_account: data.bankAccount, ifsc_code: data.ifscCode, status: data.status
    });
    if (res.success) await fetchSuppliers();
    else throw new Error(res.error || 'Failed to add supplier');
  };

  const updateSupplier = async (id: string, data: Partial<Supplier>) => {
    const existing = suppliers.find(s => s.id === id);
    const merged = { ...existing, ...data };
    const res = await api.put(`/suppliers/${id}`, {
      name: merged.name, company: merged.company, mobile: merged.mobile, email: merged.email,
      gst_number: merged.gstNumber, address: merged.address, city: merged.city, state: merged.state,
      pincode: merged.pincode, credit_limit: merged.creditLimit, credit_days: merged.creditDays,
      bank_account: merged.bankAccount, ifsc_code: merged.ifscCode, status: merged.status
    });
    if (res.success) await fetchSuppliers();
    else throw new Error(res.error || 'Failed to update supplier');
  };

  const deleteSupplier = async (id: string) => {
    const res = await api.delete(`/suppliers/${id}`);
    if (res.success) setSuppliers(prev => prev.filter(s => s.id !== id));
    else throw new Error(res.error || 'Failed to delete supplier');
  };

  const getActiveSuppliers = () => suppliers.filter(s => s.status === 'Active');
  const getSupplierById = (id: string) => suppliers.find(s => s.id === id);

  return (
    <SupplierContext.Provider value={{ suppliers, isLoading, addSupplier, updateSupplier, deleteSupplier, getActiveSuppliers, getSupplierById, refreshSuppliers: fetchSuppliers }}>
      {children}
    </SupplierContext.Provider>
  );
}

export function useSuppliers() {
  const context = useContext(SupplierContext);
  if (!context) throw new Error('useSuppliers must be used within SupplierProvider');
  return context;
}
