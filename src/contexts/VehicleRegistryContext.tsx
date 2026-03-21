import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

export interface VehicleRegister {
  id: string;
  vehicle_number: string;
  owner_name: string;
  mobile: string;
  vehicle_make: string;
  model: string;
  fuel_type?: string;
  chassis_number?: string;
  engine_number?: string;
  color?: string;
  year?: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface VehicleRegistryContextType {
  vehicles: VehicleRegister[];
  isLoading: boolean;
  addVehicle: (vehicle: Partial<VehicleRegister>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<VehicleRegister>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  getVehicleByNumber: (vehicleNumber: string) => VehicleRegister | undefined;
  refreshVehicles: () => Promise<void>;
}

const VehicleRegistryContext = createContext<VehicleRegistryContextType | undefined>(undefined);

const mapRowToVehicle = (row: any): VehicleRegister => ({
  ...row,
  id: row.id.toString()
});

export function VehicleRegistryProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<VehicleRegister[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();

  const fetchVehicles = async () => {
    if (!isAuthenticated) {
      setVehicles([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get('/vehicle-registry');
      if (res.success && res.data) {
        setVehicles((res.data.data || res.data).map(mapRowToVehicle));
      }
    } catch (err) {
      console.error('Error fetching vehicle registry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [isAuthenticated]);

  const addVehicle = async (vehicle: Partial<VehicleRegister>) => {
    const res = await api.post('/vehicle-registry', vehicle);
    if (res.success) {
      await fetchVehicles();
    } else {
      throw new Error(res.error || 'Failed to add vehicle');
    }
  };

  const updateVehicle = async (id: string, vehicle: Partial<VehicleRegister>) => {
    const res = await api.put(`/vehicle-registry/${id}`, vehicle);
    if (res.success) {
      await fetchVehicles();
    } else {
      throw new Error(res.error || 'Failed to update vehicle');
    }
  };

  const deleteVehicle = async (id: string) => {
    const res = await api.delete(`/vehicle-registry/${id}`);
    if (res.success) {
      await fetchVehicles();
    } else {
      throw new Error(res.error || 'Failed to delete vehicle');
    }
  };

  const getVehicleByNumber = (vehicleNumber: string) => {
    return vehicles.find(v => v.vehicle_number.toLowerCase() === vehicleNumber.toLowerCase());
  };

  return (
    <VehicleRegistryContext.Provider
      value={{
        vehicles,
        isLoading,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        getVehicleByNumber,
        refreshVehicles: fetchVehicles
      }}
    >
      {children}
    </VehicleRegistryContext.Provider>
  );
}

export function useVehicleRegistry() {
  const context = useContext(VehicleRegistryContext);
  if (context === undefined) {
    throw new Error('useVehicleRegistry must be used within a VehicleRegistryProvider');
  }
  return context;
}
