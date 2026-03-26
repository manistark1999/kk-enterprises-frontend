import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface CompanyData {
  id?: string;
  company_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  gst_number: string;
  website?: string;
  logo_url?: string;
  bank_name?: string;
  account_no?: string;
  ifsc_code?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  business_type?: string;
  established_year?: string;
  tax_reg_type?: string;
}

interface CompanyContextType {
  companyData: CompanyData;
  isLoading: boolean;
  updateCompanyData: (data: CompanyData) => Promise<void>;
  refreshCompanyData: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const defaultCompany: CompanyData = {
  company_name: 'KK Enterprises',
  address: '123 Workshop Road, Industrial Area',
  city: 'Namakkal',
  state: 'Tamil Nadu',
  pincode: '637001',
  phone: '+91 98765 43210',
  email: 'contact@kkenterprises.com',
  gst_number: '33AAAAA0000A1Z5',
  bank_name: 'Sate Bank of India',
  account_no: '1234567890',
  ifsc_code: 'SBIN0001234'
};

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companyData, setCompanyData] = useState<CompanyData>(defaultCompany);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCompanyData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await api.get('/company');
      if (res.success && res.data) {
        setCompanyData(res.data);
        // Also sync to localStorage for backward compatibility with components not yet using context
        localStorage.setItem('companyData', JSON.stringify(res.data));
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [isAuthenticated]);

  const updateCompanyData = async (data: CompanyData) => {
    try {
      const res = await api.post('/company', data);
      if (res.success) {
        setCompanyData(res.data);
        localStorage.setItem('companyData', JSON.stringify(res.data));
        toast.success('Company settings updated successfully');
      } else {
        throw new Error(res.message || 'Failed to update company data');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error updating company data');
      throw error;
    }
  };

  return (
    <CompanyContext.Provider value={{ companyData, isLoading, updateCompanyData, refreshCompanyData: fetchCompanyData }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) throw new Error('useCompany must be used within a CompanyProvider');
  return context;
}
