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
  vehicleModel?: string;
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
  saveAlignmentHistory: (historyData: any) => Promise<void>;
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
            vehicleModel: row.vehicle_model,
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
          setAlignmentEntries([]);
        }
      }
    } catch (error: any) {
      console.error('[INV-ALIGN] fetchAlignments error:', error);
      toast.error(error.message || 'Failed to load alignment entries');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAlignments();
  }, [fetchAlignments]);

  const addAlignmentEntry = useCallback(async (entry: Omit<AlignmentEntry, 'id' | 'createdAt'>) => {
    try {
      const payload = {
        date: entry.date,
        vehicleNo: entry.vehicleNo,
        vehicleMake: entry.vehicleMake,
        vehicleModel: entry.vehicleModel,
        customerName: entry.customerName,
        alignmentType: entry.alignmentType,
        technician: entry.technician,
        amount: entry.amount || entry.charges || 0,
        notes: entry.notes,
        status: entry.status || 'Completed'
      };


      const response = await api.post('/alignments', payload);
      if (response.success) {
        toast.success('Alignment entry added successfully!');
        await fetchAlignments();
      } else {
        throw new Error(response.message || 'Failed to add alignment entry');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add alignment entry');
      throw error;
    }
  }, [fetchAlignments]);

  const updateAlignmentEntry = useCallback(async (id: string, updates: Partial<AlignmentEntry>) => {
    try {
      const existing = alignmentEntries.find(e => e.id === id);
      const merged = { ...existing, ...updates } as AlignmentEntry;

      const payload = {
        date: merged.date,
        vehicleNo: merged.vehicleNo,
        vehicleMake: merged.vehicleMake,
        vehicleModel: merged.vehicleModel,
        customerName: merged.customerName,
        alignmentType: merged.alignmentType,
        technician: merged.technician,
        amount: merged.amount || merged.charges || 0,
        notes: merged.notes,
        status: merged.status
      };


      const response = await api.put(`/alignments/${id}`, payload);
      if (response.success) {
        toast.success('Alignment entry updated successfully!');
        await fetchAlignments();
      } else {
        throw new Error(response.message || 'Failed to update alignment entry');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update alignment entry');
      throw error;
    }
  }, [alignmentEntries, fetchAlignments]);

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

  const saveAlignmentHistory = useCallback(async (historyData: any) => {
    try {
      const response = await api.post('/alignments/history', { historyData });
      if (response.success) {
        toast.success('Alignment history saved to database successfully!');
      } else {
        throw new Error(response.message || 'Failed to save alignment history to database');
      }
    } catch (error: any) {
      console.error('[INV-ALIGN] saveAlignmentHistory error:', error);
      toast.error(error.message || 'Failed to save alignment history to database');
      throw error;
    }
  }, []);

  const value = {
    alignmentEntries,
    isLoading,
    fetchAlignments,
    addAlignmentEntry,
    updateAlignmentEntry,
    deleteAlignmentEntry,
    getAlignmentEntry,
    getAlignmentsByDateRange,
    saveAlignmentHistory
  };

  return (
    <AlignmentContext.Provider value={value}>
      {children}
    </AlignmentContext.Provider>
  );
};