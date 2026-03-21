/**
 * Alignment Context
 * 
 * Manages alignment entry data across the application
 * Provides CRUD operations for alignment records directly matching PostgreSQL backend
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { api } from '@/services/api';

export interface AlignmentEntry {
  id: string;
  date: string;
  billNo: string;
  vehicleNo: string;
  vehicleMake?: string;
  customerName: string;
  alignmentType: 'Front' | 'Rear' | 'Both';
  technician?: string;
  amount: number;
  charges?: number; 
  notes?: string;
  status: 'Completed' | 'Pending' | 'In Progress';
  createdAt: string;
  updatedAt?: string;
}

interface AlignmentContextType {
  alignmentEntries: AlignmentEntry[];
  isLoading: boolean;
  fetchAlignments: () => Promise<void>;
  addAlignmentEntry: (entry: Omit<AlignmentEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateAlignmentEntry: (id: string, entry: Partial<AlignmentEntry>) => Promise<void>;
  deleteAlignmentEntry: (id: string) => Promise<void>;
  getAlignmentEntry: (id: string) => AlignmentEntry | undefined;
  getAlignmentsByDateRange: (from: string, to: string) => AlignmentEntry[];
}

const AlignmentContext = createContext<AlignmentContextType | undefined>(undefined);

export const useAlignment = () => {
  const context = useContext(AlignmentContext);
  if (!context) {
    throw new Error('useAlignment must be used within AlignmentProvider');
  }
  return context;
};

interface AlignmentProviderProps {
  children: ReactNode;
}

export const AlignmentProvider: React.FC<AlignmentProviderProps> = ({ children }) => {
  const [alignmentEntries, setAlignmentEntries] = useState<AlignmentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchAlignments = useCallback(async () => {
    if (!isAuthenticated) {
      setAlignmentEntries([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get('/alignments');
      console.log('[AlignmentContext] fetchAlignments response:', response);
      
      if (response.success && response.data) {
        // Handle both: response.data.data (array) AND response.data (array)
        const rawData = response.data.data || response.data;
        if (Array.isArray(rawData)) {
          const mapped = rawData.map((row: any) => ({
            id: row.id.toString(),
            date: row.entry_date,
            billNo: row.entry_no,
            vehicleNo: row.vehicle_no,
            vehicleMake: row.vehicle_make,
            customerName: row.customer_name,
            alignmentType: row.alignment_type,
            technician: row.technician,
            amount: Number(row.amount || 0),
            charges: Number(row.amount || 0),
            notes: row.notes,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          setAlignmentEntries(mapped);
        } else {
          console.warn('[AlignmentContext] Unexpected alignments format:', rawData);
          setAlignmentEntries([]);
        }
      }
    } catch (error: any) {
      console.error('[AlignmentContext] Error fetching alignments:', error);
      toast.error('Failed to load alignment entries');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAlignments();
  }, [fetchAlignments]);

  const addAlignmentEntry = useCallback(async (entry: Omit<AlignmentEntry, 'id' | 'createdAt'>) => {
    try {
      const response = await api.post('/alignments', entry);
      if (response.success) {
        toast.success('Alignment entry added successfully!');
        await fetchAlignments();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add alignment entry');
      throw error;
    }
  }, [fetchAlignments]);

  const updateAlignmentEntry = useCallback(async (id: string, updates: Partial<AlignmentEntry>) => {
    try {
      const response = await api.put(`/alignments/${id}`, updates);
      if (response.success) {
        toast.success('Alignment entry updated successfully!');
        await fetchAlignments();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update alignment entry');
      throw error;
    }
  }, [fetchAlignments]);

  const deleteAlignmentEntry = useCallback(async (id: string) => {
    try {
      const response = await api.delete(`/alignments/${id}`);
      if (response.success) {
        toast.success('Alignment entry deleted successfully!');
        await fetchAlignments();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete alignment entry');
      throw error;
    }
  }, [fetchAlignments]);

  const getAlignmentEntry = useCallback((id: string) => {
    return alignmentEntries.find(entry => entry.id === id);
  }, [alignmentEntries]);

  const getAlignmentsByDateRange = useCallback((from: string, to: string) => {
    return alignmentEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const fromDate = new Date(from);
      const toDate = new Date(to);
      return entryDate >= fromDate && entryDate <= toDate;
    });
  }, [alignmentEntries]);

  const value = {
    alignmentEntries,
    isLoading,
    fetchAlignments,
    addAlignmentEntry,
    updateAlignmentEntry,
    deleteAlignmentEntry,
    getAlignmentEntry,
    getAlignmentsByDateRange
  };

  return (
    <AlignmentContext.Provider value={value}>
      {children}
    </AlignmentContext.Provider>
  );
};