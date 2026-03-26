import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from './NotificationContext';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface Customer {
  id: string;
  customerCode?: string;
  customer_code?: string; // Keep for compatibility
  name: string;
  customerName: string; // Alias for JobCard compatibility
  phone: string;
  phoneNumber: string; // Alias for JobCard compatibility
  alternatePhone?: string;
  contactPerson?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  vehicleDetails: {
    vehicleNumber: string;
    vehicleMake: string;
    vehicleModel: string;
  }[];
  isActive: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CustomerSummary {
  total: number;
  active: number;
  inactive: number;
  totalVehicles: number;
}

interface CustomerContextType {
  customers: Customer[];
  summary: CustomerSummary;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'customerName' | 'phoneNumber'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  getActiveCustomers: () => Customer[];
  isLoading: boolean;
  refreshCustomers: () => Promise<void>;
  fetchNextCode: () => Promise<string>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<CustomerSummary>({
    total: 0,
    active: 0,
    inactive: 0,
    totalVehicles: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotifications();

  const { isAuthenticated, hasPermission } = useAuth();

  const fetchCustomers = async () => {
    if (!isAuthenticated || !hasPermission('Customer', 'view')) {
      if (!isAuthenticated) setCustomers([]);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Direct call to fetch all customers
      const response = await api.get("/customers");
      
      if (response.success && response.data) {
        // Handle both { data: [...] } and simply [...] formats from backend
        const array = Array.isArray(response.data.data) 
                      ? response.data.data 
                      : (Array.isArray(response.data) ? response.data : []);
        
        // Exact mapping: Backend fields to UI fields
        const mapped = array.map((c: any): Customer => ({
          id: String(c.id),
          customerCode: c.customer_code || '',
          customer_code: c.customer_code || '', // Compatibility
          name: c.customer_name || '',
          customerName: c.customer_name || '', // Compatibility
          phone: c.phone || '',
          phoneNumber: c.phone || '', // Compatibility
          email: c.email || '',
          contactPerson: c.contact_person || '',
          alternatePhone: c.alternate_phone || '',
          address: c.address || '',
          city: c.city || '',
          state: c.state || '',
          pincode: c.pincode || '',
          gstNumber: c.gst_no || '',
          isActive: c.status === 'active' || c.status === 'Active' || !c.status,
          status: c.status || 'active',
          vehicleDetails: [], // Placeholder
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }));
        
        setCustomers(mapped);
      }
      
      // Fetch summary independently to ensure accurate counts
      const summaryRes = await api.get("/customers/summary");
      if (summaryRes.success && summaryRes.data) {
        const payload = summaryRes.data.data || summaryRes.data;
        setSummary(payload);
      }
      
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [isAuthenticated]);

  const addCustomer = async (customerData: Partial<Customer>) => {
    try {
      const payload = {
        customer_name: customerData.name || customerData.customerName,
        phone: customerData.phone,
        email: customerData.email,
        contact_person: customerData.contactPerson,
        alternate_phone: customerData.alternatePhone,
        customer_code: customerData.customerCode,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        pincode: customerData.pincode,
        gst_no: customerData.gstNumber,
        is_active: customerData.status === 'Active' || customerData.isActive === true
      };

      const response = await api.post('/customers', payload);
      if (response.success) {
        await fetchCustomers();
        toast.success('Customer added successfully');
        
        // ADD NOTIFICATION
        addNotification(
          'Created', 
          customerData.name || customerData.customerName || 'New Customer', 
          'Customer', 
          `Registered new customer ${customerData.name || customerData.customerName}`
        );
      } else {
        throw new Error(response.message || 'Failed to add customer');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add customer');
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const existing = customers.find(c => c.id === id);
      const merged = { ...existing, ...customerData };
      
      const payload = {
        customer_name: merged.name || merged.customerName,
        phone: merged.phone,
        email: merged.email,
        contact_person: merged.contactPerson,
        alternate_phone: merged.alternatePhone,
        customer_code: merged.customerCode,
        address: merged.address,
        city: merged.city,
        state: merged.state,
        pincode: merged.pincode,
        gst_no: merged.gstNumber,
        is_active: merged.status === 'Active' || merged.isActive === true
      };

      const response = await api.put(`/customers/${id}`, payload);
      if (response.success) {
        await fetchCustomers();
        toast.success('Customer updated successfully');
        
        // ADD NOTIFICATION
        addNotification(
          'Updated', 
          customerData.name || customerData.customerName || existing?.name || 'Customer', 
          'Customer', 
          `Updated information for customer ${customerData.name || customerData.customerName || existing?.name}`
        );
      } else {
        throw new Error(response.message || 'Failed to update customer');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update customer');
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const existing = customers.find(c => c.id === id);
      const response = await api.delete(`/customers/${id}`);

      if (response.success) {
        setCustomers(prev => prev.filter(c => c.id !== id));
        // Refresh summary after delete
        const summaryRes = await api.get("/customers/summary");
        if (summaryRes.success && summaryRes.data) {
          const sPayload = summaryRes.data.data || summaryRes.data;
          setSummary(sPayload);
        }
        toast.success('Customer deleted successfully');

        // ADD NOTIFICATION
        if (existing) {
          addNotification(
            'Deleted', 
            existing.name, 
            'Customer', 
            `Removed customer record for ${existing.name}`
          );
        }
      } else {
        throw new Error(response.message || 'Failed to delete customer');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete customer');
      throw error;
    }
  };

  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };

  const getActiveCustomers = () => {
    return customers.filter(customer => customer.isActive);
  };

  const fetchNextCode = async (): Promise<string> => {
    try {
      const res = await api.get('/customers/next-code');
      return res.success && res.data ? res.data : 'CUS-0001';
    } catch (error) {
      return 'CUS-0001';
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        summary,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
        getActiveCustomers,
        isLoading,
        refreshCustomers: fetchCustomers,
        fetchNextCode
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}