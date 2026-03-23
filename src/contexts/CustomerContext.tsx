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

  const { isAuthenticated } = useAuth();

  const fetchCustomers = async () => {
    if (!isAuthenticated) {
      setCustomers([]);
      setSummary({ total: 0, active: 0, inactive: 0, totalVehicles: 0 });
      return;
    }
    try {
      setIsLoading(true);
      const [customersRes, summaryRes] = await Promise.all([
        api.get("/customers"),
        api.get("/customers/summary")
      ]);
      
      console.log('[CustomerContext] fetchCustomers called');
      console.log('[CustomerContext] customersRes:', customersRes);
      console.log('[CustomerContext] customersRes.data:', customersRes.data);
      
      if (customersRes.success && customersRes.data) {
        const customersArray = customersRes.data.data || customersRes.data;
        if (Array.isArray(customersArray)) {
          const mappedCustomers = customersArray.map((c: any): Customer => ({
            id: c.id.toString(),
            customerCode: c.customer_code || '',
            customer_code: c.customer_code || '',
            name: c.customer_name || '',
            customerName: c.customer_name || '',
            phone: c.phone || '',
            phoneNumber: c.phone || '',
            alternatePhone: c.alternate_phone || '',
            contactPerson: c.contact_person || '',
            email: c.email || '',
            address: c.address || '',
            city: c.city || '',
            state: c.state || '',
            pincode: c.pincode || '',
            gstNumber: c.gst_no || '',
            isActive: c.status === 'active' || c.status === 'Active' || !c.status,
            status: c.status || 'active',
            vehicleDetails: [],
            createdAt: c.created_at,
            updatedAt: c.updated_at
          }));
          setCustomers(mappedCustomers);
        } else {
          console.error('[CustomerContext] Expected array but got:', typeof customersArray);
          setCustomers([]);
        }
      } else {
        console.warn('[CustomerContext] No data in response, customersRes.success:', customersRes.success);
      }

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data.data || summaryRes.data);
        console.log('[CustomerContext] Set summary:', summaryRes.data.data || summaryRes.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Only show error toast if we're actually logged in
      if (isAuthenticated) {
        toast.error('Failed to fetch customers from database');
      }
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
      } else {
        throw new Error(response.message || 'Failed to add customer');
      }
    } catch (error: any) {
      console.error('Error adding customer:', error);
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
      } else {
        throw new Error(response.message || 'Failed to update customer');
      }
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error(error.message || 'Failed to update customer');
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const response = await api.delete(`/customers/${id}`);

      if (response.success) {
        setCustomers(prev => prev.filter(c => c.id !== id));
        // Refresh summary after delete
        const summaryRes = await api.get("/customers/summary");
        if (summaryRes.success && summaryRes.data) {
          setSummary(summaryRes.data.data);
        }
        toast.success('Customer deleted successfully');
      } else {
        throw new Error(response.error || 'Failed to delete customer');
      }
    } catch (error: any) {
      console.error('Error deleting customer:', error);
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
        refreshCustomers: fetchCustomers
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