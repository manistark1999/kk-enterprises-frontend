import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { toast } from 'sonner';

export interface VehicleRegister {
  id: string;
  customer_id?: string;
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
  linked_customer_name?: string;
  linked_customer_phone?: string;
  linked_customer_address?: string;
}

interface VehicleRegistryContextType {
  vehicles: VehicleRegister[];
  isLoading: boolean;
  addVehicle: (vehicle: Partial<VehicleRegister>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<VehicleRegister>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  getVehicleByNumber: (vehicleNumber: string) => VehicleRegister | undefined;
  lookupVehicle: (vehicleNumber: string) => Promise<VehicleRegister | undefined>;
  searchVehicles: (query: string) => Promise<any[]>;
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
  const { addNotification } = useNotifications();

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
        const rawData = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setVehicles(rawData.map(mapRowToVehicle));
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [isAuthenticated]);

  const addVehicle = async (vehicle: Partial<VehicleRegister>) => {
    try {
      const res = await api.post('/vehicle-registry', vehicle);
      if (res.success) {
        await fetchVehicles();
        toast.success('Vehicle registered successfully');

        // ADD NOTIFICATION
        addNotification(
          'Saved', 
          vehicle.vehicle_number || 'New Vehicle', 
          'Vehicle Registry', 
          `Registered vehicle ${vehicle.vehicle_number} for owner ${vehicle.owner_name}`
        );
      } else {
        throw new Error(res.error || 'Failed to add vehicle');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const updateVehicle = async (id: string, vehicle: Partial<VehicleRegister>) => {
    try {
      const existing = vehicles.find(v => v.id === id);
      const res = await api.put(`/vehicle-registry/${id}`, vehicle);
      if (res.success) {
        await fetchVehicles();
        toast.success('Vehicle information updated');

        // ADD NOTIFICATION
        addNotification(
          'Updated', 
          vehicle.vehicle_number || existing?.vehicle_number || 'Vehicle', 
          'Vehicle Registry', 
          `Updated technical details for vehicle ${vehicle.vehicle_number || existing?.vehicle_number}`
        );
      } else {
        throw new Error(res.error || 'Failed to update vehicle');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      const existing = vehicles.find(v => v.id === id);
      const res = await api.delete(`/vehicle-registry/${id}`);
      if (res.success) {
        await fetchVehicles();
        toast.success('Vehicle record deleted');

        // ADD NOTIFICATION
        if (existing) {
          addNotification(
            'Deleted', 
            existing.vehicle_number, 
            'Vehicle Registry', 
            `Removed record for vehicle ${existing.vehicle_number}`
          );
        }
      } else {
        throw new Error(res.error || 'Failed to delete vehicle');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const getVehicleByNumber = (vehicleNumber: string) => {
    if (!vehicleNumber) return undefined;
    const cleanSearch = vehicleNumber.replace(/\s+/g, '').toLowerCase();
    return vehicles.find(v => v.vehicle_number.replace(/\s+/g, '').toLowerCase() === cleanSearch);
  };

  const lookupVehicle = async (vehicleNumber: string): Promise<VehicleRegister | undefined> => {
    if (!vehicleNumber) return undefined;
    try {
      const res = await api.get(`/vehicle-registry/lookup/${encodeURIComponent(vehicleNumber)}`);
      if (res.success && res.data) {
        return mapRowToVehicle(res.data.data || res.data);
      }
      return undefined;
    } catch (err) {
      return getVehicleByNumber(vehicleNumber);
    }
  };

  const searchVehicles = async (query: string): Promise<any[]> => {
    if (!query || query.length < 2) return [];
    try {
      const res = await api.get(`/vehicle-registry/search?q=${encodeURIComponent(query)}`);
      if (res.success && res.data) {
        return res.data.data || res.data;
      }
      return [];
    } catch (err) {
      return [];
    }
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
        lookupVehicle,
        searchVehicles,
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
