import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from './NotificationContext';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface Customer {
  id: string;
  customer_code?: string;
  name: string;
  customerName: string; // Alias for JobCard compatibility
  phone: string;
  phoneNumber: string; // Alias for JobCard compatibility
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  vehicleDetails: {
    vehicleNumber: string;
    vehicleMake: string;
    vehicleModel: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
      
      if (customersRes.success && customersRes.data) {
        const mappedCustomers = customersRes.data.data.map((c: any): Customer => ({
          id: c.id.toString(),
          customer_code: c.customer_code,
          name: c.customer_name,
          customerName: c.customer_name,
          phone: c.phone,
          phoneNumber: c.phone,
          email: c.email || '',
          address: c.address || '',
          city: c.city || '',
          state: c.state || '',
          pincode: c.pincode || '',
          gstNumber: c.gst_no || '',
          isActive: c.status === 'active' || c.status === 'Active' || !c.status,
          vehicleDetails: [],
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }));
        setCustomers(mappedCustomers);
      }

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data.data);
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

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'customerName' | 'phoneNumber'>) => {
    try {
      const response = await api.post("/customers", {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        pincode: customerData.pincode,
        gst_number: customerData.gstNumber,
        is_active: customerData.isActive
      });

      if (response.success) {
        await fetchCustomers();
        addNotification(
          'Created',
          customerData.name,
          'Customer Record',
          `Phone: ${customerData.phone}`
        );
        toast.success('Customer saved successfully');
      } else {
        throw new Error(response.error || 'Failed to add customer');
      }
    } catch (error: any) {
      console.error('Error adding customer:', error);
      toast.error(error.message || 'Failed to add customer');
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const response = await api.put(`/customers/${id}`, {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        pincode: customerData.pincode,
        gst_number: customerData.gstNumber,
        is_active: customerData.isActive
      });

      if (response.success) {
        await fetchCustomers();
        addNotification(
          'Updated',
          customerData.name || 'Customer',
          'Customer Record',
          'Updated successfully'
        );
        toast.success('Customer updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update customer');
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