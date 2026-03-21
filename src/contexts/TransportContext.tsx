import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface Transport {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  gst_no?: string;
  status: 'Active' | 'Inactive';
  created_at: string;
}

interface TransportContextType {
  transports: Transport[];
  isLoading: boolean;
  addTransport: (transport: Omit<Transport, 'id' | 'created_at'>) => Promise<void>;
  updateTransport: (id: string, transport: Partial<Transport>) => Promise<void>;
  deleteTransport: (id: string) => Promise<void>;
  refreshTransports: () => Promise<void>;
}

const TransportContext = createContext<TransportContextType | undefined>(undefined);

export function TransportProvider({ children }: { children: ReactNode }) {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // removed unused notifications

  const { isAuthenticated } = useAuth();

  const fetchTransports = async () => {
    if (!isAuthenticated) {
      setTransports([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get('/transports');
      if (response.success && response.data) {
        setTransports(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching transports:', error);
      toast.error(error.message || 'Failed to fetch transports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransports();
  }, [isAuthenticated]);

  const addTransport = async (newTransport: Omit<Transport, 'id' | 'created_at'>) => {
    try {
      const response = await api.post('/transports', newTransport);
      if (response.success && response.data) {
        setTransports(prev => [response.data.data, ...prev]);
        toast.success('Transport added successfully');
      }
    } catch (error: any) {
      console.error('Error adding transport:', error);
      toast.error(error.message || 'Failed to add transport');
      throw error;
    }
  };

  const updateTransport = async (id: string, updatedFields: Partial<Transport>) => {
    try {
      const response = await api.put(`/transports/${id}`, updatedFields);
      if (response.success && response.data) {
        setTransports(prev =>
          prev.map(t => (t.id === id ? { ...t, ...response.data.data } : t))
        );
        toast.success('Transport updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating transport:', error);
      toast.error(error.message || 'Failed to update transport');
      throw error;
    }
  };

  const deleteTransport = async (id: string) => {
    try {
      const response = await api.delete(`/transports/${id}`);
      if (response.success) {
        setTransports(prev => prev.filter(t => t.id !== id));
        toast.success('Transport deleted successfully');
      }
    } catch (error: any) {
      console.error('Error deleting transport:', error);
      toast.error(error.message || 'Failed to delete transport');
      throw error;
    }
  };

  return (
    <TransportContext.Provider
      value={{
        transports,
        isLoading,
        addTransport,
        updateTransport,
        deleteTransport,
        refreshTransports: fetchTransports
      }}
    >
      {children}
    </TransportContext.Provider>
  );
}

export function useTransports() {
  const context = useContext(TransportContext);
  if (!context) {
    throw new Error('useTransports must be used within TransportProvider');
  }
  return context;
}