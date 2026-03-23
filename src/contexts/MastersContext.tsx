import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

// Type definitions for all master data
export interface VehicleMake {
  id: string;
  name: string;
  country: string;
  models: string[];
  status: string;
  createdAt: string;
}

export interface WorkType {
  id: string;
  name: string;
  workTypeName?: string; // KEEP FOR COMPATIBILITY
  description: string;
  category: string;
  duration: string;
  avgDuration?: string; // KEEP FOR COMPATIBILITY
  avgPrice: number;
  status: string;
  createdAt: string;
}

export interface WorkGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  workTypes: string[];
  status: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gst: string;
  category: string;
  status: string;
  createdAt: string;
}

export interface Transport {
  id: string;
  name: string;
  contactPerson: string;
  mobile: string;
  email: string;
  address: string;
  gst: string;
  status: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  designation: string;
  mobile: string;
  email: string;
  joiningDate: string;
  salary: number;
  address: string;
  bankAccount?: string;
  ifscCode?: string;
  status: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  origin: string;
  description: string;
  status: string;
  createdAt: string;
}

interface MastersContextType {
  // Vehicle Makes
  vehicleMakes: VehicleMake[];
  addVehicleMake: (make: VehicleMake) => Promise<void>;
  updateVehicleMake: (id: string, make: VehicleMake) => Promise<void>;
  deleteVehicleMake: (id: string) => Promise<void>;
  
  // Work Types
  workTypes: WorkType[];
  addWorkType: (workType: WorkType) => Promise<void>;
  updateWorkType: (id: string, workType: WorkType) => Promise<void>;
  deleteWorkType: (id: string) => Promise<void>;
  
  // Work Groups
  workGroups: WorkGroup[];
  addWorkGroup: (workGroup: WorkGroup) => Promise<void>;
  updateWorkGroup: (id: string, workGroup: WorkGroup) => Promise<void>;
  deleteWorkGroup: (id: string) => Promise<void>;
  
  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Supplier) => Promise<void>;
  updateSupplier: (id: string, supplier: Supplier) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  // Transports
  transports: Transport[];
  addTransport: (transport: Transport) => Promise<void>;
  updateTransport: (id: string, transport: Transport) => Promise<void>;
  deleteTransport: (id: string) => Promise<void>;
  
  // Staff
  staff: Staff[];
  addStaff: (staff: Staff) => Promise<void>;
  updateStaff: (id: string, staff: Staff) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  
  // Brands
  brands: Brand[];
  addBrand: (brand: Partial<Brand>) => Promise<void>;
  updateBrand: (id: string, brand: Partial<Brand>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  
  // Utility functions
  isLoading: boolean;
  refreshAllMasters: () => Promise<void>;
  getActiveVehicleMakes: () => VehicleMake[];
  getActiveWorkTypes: () => WorkType[];
  getActiveWorkGroups: () => WorkGroup[];
  getActiveSuppliers: () => Supplier[];
  getActiveTransports: () => Transport[];
  getActiveStaff: () => Staff[];
  getActiveBrands: () => Brand[];
  getModelsByMake: (makeName: string) => string[];
}

const MastersContext = createContext<MastersContextType | undefined>(undefined);

export const MastersProvider = ({ children }: { children: ReactNode }) => {
  const [vehicleMakes, setVehicleMakes] = useState<VehicleMake[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();

  const fetchAll = async () => {
    if (!isAuthenticated) {
      setVehicleMakes([]);
      setWorkTypes([]);
      setWorkGroups([]);
      setSuppliers([]);
      setTransports([]);
      setStaff([]);
      setBrands([]);
      return;
    }
    setIsLoading(true);
    try {
      const [vmRes, wtRes, wgRes, supRes, trRes, stRes, brRes] = await Promise.all([
        api.get('/vehicle-makes'),
        api.get('/work/types'),
        api.get('/work/groups'),
        api.get('/suppliers'),
        api.get('/transports'),
        api.get('/staff'),
        api.get('/brands')
      ]);

      if (vmRes.success && vmRes.data) {
        const rows = vmRes.data.data || vmRes.data;
        setVehicleMakes(rows.map((r: any) => ({
          id: r.id.toString(), 
          name: r.name || r.make_name || '', 
          models: Array.isArray(r.models) ? r.models : JSON.parse(r.models || '[]'),
          country: r.country || '', 
          status: r.status || 'Active', 
          createdAt: r.created_at
        })));
      }
      if (wtRes.success && wtRes.data) {
        const rows = wtRes.data.data || wtRes.data;
        setWorkTypes(rows.map((r: any) => ({
          id: r.id.toString(),
          name: r.name || r.work_type_name || '',
          workTypeName: r.work_type_name || r.name || '',
          description: r.description || '',
          category: r.category || '', 
          duration: r.avg_duration || r.duration || '',
          avgDuration: r.avg_duration || r.duration || '',
          avgPrice: r.avg_price ? parseFloat(r.avg_price) : 0,
          status: r.status || 'Active', 
          createdAt: r.created_at
        })));
      }
      if (wgRes.success && wgRes.data) {
        const rows = wgRes.data.data || wgRes.data;
        setWorkGroups(rows.map((r: any) => ({
          id: r.id.toString(), name: r.name || r.group_name || '', description: r.description || '',
          category: r.category || 'General',
          workTypes: Array.isArray(r.work_types) ? r.work_types : JSON.parse(r.work_types || '[]'),
          status: r.status || 'Active', createdAt: r.created_at
        })));
      }
      if (supRes.success && supRes.data) {
        const rows = supRes.data.data || supRes.data;
        setSuppliers(rows.map((r: any) => ({
          id: r.id.toString(), name: r.name || '', contactPerson: r.contact_person || r.company || '',
          phone: r.mobile || '', email: r.email || '', address: r.address || '',
          gst: r.gst_number || '', category: r.category || 'General', 
          status: r.status || 'Active', createdAt: r.created_at
        })));
      }
      if (trRes.success && trRes.data) {
        const rows = trRes.data.data || trRes.data;
        setTransports(rows.map((r: any) => ({
          id: r.id.toString(), name: r.name || '', contactPerson: r.contact_person || '',
          mobile: r.phone || '', email: r.email || '', address: r.address || '',
          gst: r.gst_no || '', status: r.status || 'Active', createdAt: r.created_at
        })));
      }
      if (stRes.success && stRes.data) {
        const rows = stRes.data.data || stRes.data;
        setStaff(rows.map((r: any) => ({
          id: r.id.toString(), name: r.name || '', designation: r.designation || '',
          mobile: r.mobile || '', email: r.email || '',
          joiningDate: r.joining_date ? new Date(r.joining_date).toISOString().split('T')[0] : '',
          salary: r.salary ? parseFloat(r.salary) : 0, address: r.address || '',
          bankAccount: r.bank_account || '', ifscCode: r.ifsc_code || '',
          status: r.status || 'Active', createdAt: r.created_at
        })));
      }
      if (brRes && brRes.success && brRes.data) {
        const rows = brRes.data.data || brRes.data;
        setBrands(rows.map((r: any) => ({
          id: r.id.toString(), name: r.name || '', manufacturer: r.manufacturer || '',
          category: r.category || '', origin: r.country || '',
          description: r.description || '',
          status: r.status || 'Active', createdAt: r.created_at
        })));
      }

    } catch (err) {
      console.error('Error loading masters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [isAuthenticated]);

  // Vehicle Makes
  const addVehicleMake = async (make: VehicleMake) => {
    try {
      await api.post('/vehicle-makes', { 
        name: make.name, 
        models: make.models, 
        country: make.country, 
        status: make.status 
      });
      await fetchAll();
    } catch (error) {
      console.error('Failed to add vehicle make:', error);
      throw error;
    }
  };
  const updateVehicleMake = async (id: string, make: VehicleMake) => {
    try {
      await api.put(`/vehicle-makes/${id}`, { 
        name: make.name, 
        models: make.models, 
        country: make.country, 
        status: make.status 
      });
      await fetchAll();
    } catch (error) {
      console.error('Failed to update vehicle make:', error);
      throw error;
    }
  };
  const deleteVehicleMake = async (id: string) => {
    try {
      await api.delete(`/vehicle-makes/${id}`);
      await fetchAll(); // Safer to refetch everything
    } catch (error) {
      console.error('Failed to delete vehicle make:', error);
      throw error;
    }
  };

  // Work Types
  const addWorkType = async (wt: WorkType) => {
    const payload = { 
      name: wt.name, 
      description: wt.description, 
      category: wt.category, 
      status: wt.status, 
      duration: Number(wt.duration) || 0, 
      avg_price: Number(wt.avgPrice) || 0 
    };
    console.log("Add Work Type Payload:", payload);
    await api.post('/work/types', payload);
    await fetchAll();
  };
  const updateWorkType = async (id: string, wt: WorkType) => {
    const payload = { 
      name: wt.name, 
      description: wt.description, 
      category: wt.category, 
      status: wt.status, 
      duration: Number(wt.duration) || 0, 
      avg_price: Number(wt.avgPrice) || 0 
    };
    console.log("Update Work Type Payload:", payload);
    try {
      await api.put(`/work/types/${id}`, payload);
      await fetchAll();
    } catch (error) {
      console.error('Failed to update work type:', error);
      throw error;
    }
  };
  const deleteWorkType = async (id: string) => {
    try {
      await api.delete(`/work/types/${id}`);
      await fetchAll();
    } catch (error) {
      console.error('Failed to delete work type:', error);
      throw error;
    }
  };

  // Work Groups
  const addWorkGroup = async (wg: WorkGroup) => {
    const payload = { 
      name: wg.name, 
      description: wg.description, 
      category: wg.category, 
      work_types: wg.workTypes, 
      status: wg.status 
    };
    console.log("Add Work Group Payload:", payload);
    await api.post('/work/groups', payload);
    await fetchAll();
  };
  const updateWorkGroup = async (id: string, wg: WorkGroup) => {
    const payload = { 
      name: wg.name, 
      description: wg.description, 
      category: wg.category, 
      work_types: wg.workTypes, 
      status: wg.status 
    };
    console.log("Update Work Group Payload:", payload);
    await api.put(`/work/groups/${id}`, payload);
    await fetchAll();
  };
  const deleteWorkGroup = async (id: string) => {
    await api.delete(`/work/groups/${id}`);
    await fetchAll();
  };

  // Suppliers
  const addSupplier = async (s: Supplier) => {
    await api.post('/suppliers', { name: s.name, contact_person: s.contactPerson, category: s.category, mobile: s.phone, email: s.email, address: s.address, gst_number: s.gst, status: s.status });
    await fetchAll();
  };
  const updateSupplier = async (id: string, s: Supplier) => {
    await api.put(`/suppliers/${id}`, { name: s.name, contact_person: s.contactPerson, category: s.category, mobile: s.phone, email: s.email, address: s.address, gst_number: s.gst, status: s.status });
    await fetchAll();
  };
  const deleteSupplier = async (id: string) => {
    await api.delete(`/suppliers/${id}`);
    await fetchAll();
  };

  // Transports
  const addTransport = async (t: Transport) => {
    await api.post('/transports', { name: t.name, contact_person: t.contactPerson, phone: t.mobile, email: t.email, address: t.address, gst_no: t.gst, status: t.status });
    await fetchAll();
  };
  const updateTransport = async (id: string, t: Transport) => {
    await api.put(`/transports/${id}`, { name: t.name, contact_person: t.contactPerson, phone: t.mobile, email: t.email, address: t.address, gst_no: t.gst, status: t.status });
    await fetchAll();
  };
  const deleteTransport = async (id: string) => {
    await api.delete(`/transports/${id}`);
    await fetchAll();
  };

  // Staff 
  const addStaff = async (s: Staff) => {
    await api.post('/staff', { name: s.name, designation: s.designation, mobile: s.mobile, email: s.email, salary: s.salary, joining_date: s.joiningDate, address: s.address, bank_account: s.bankAccount, ifsc_code: s.ifscCode, status: s.status });
    await fetchAll();
  };
  const updateStaff = async (id: string, s: Staff) => {
    await api.put(`/staff/${id}`, { name: s.name, designation: s.designation, mobile: s.mobile, email: s.email, salary: s.salary, joining_date: s.joiningDate, address: s.address, bank_account: s.bankAccount, ifsc_code: s.ifscCode, status: s.status });
    await fetchAll();
  };
  const deleteStaff = async (id: string) => {
    await api.delete(`/staff/${id}`);
    await fetchAll();
  };

  // Brands
  const addBrand = async (b: Partial<Brand>) => {
    await api.post('/brands', { name: b.name, manufacturer: b.manufacturer, category: b.category, country: b.origin, description: b.description, status: b.status });
    await fetchAll();
  };
  const updateBrand = async (id: string, b: Partial<Brand>) => {
    await api.put(`/brands/${id}`, { name: b.name, manufacturer: b.manufacturer, category: b.category, country: b.origin, description: b.description, status: b.status });
    await fetchAll();
  };
  const deleteBrand = async (id: string) => {
    await api.delete(`/brands/${id}`);
    await fetchAll();
  };

  const getActiveVehicleMakes = () => vehicleMakes.filter(m => m.status === 'Active');
  const getActiveWorkTypes = () => workTypes.filter(wt => wt.status === 'Active');
  const getActiveWorkGroups = () => workGroups.filter(wg => wg.status === 'Active');
  const getActiveSuppliers = () => suppliers.filter(s => s.status === 'Active');
  const getActiveTransports = () => transports.filter(t => t.status === 'Active');
  const getActiveStaff = () => staff.filter(s => s.status === 'Active');
  const getActiveBrands = () => brands.filter(b => b.status === 'Active');
  const getModelsByMake = (name: string) => {
    const make = vehicleMakes.find(m => m.name === name);
    return make ? make.models : [];
  };

  return (
    <MastersContext.Provider
      value={{
        isLoading,
        refreshAllMasters: fetchAll,
        vehicleMakes, addVehicleMake, updateVehicleMake, deleteVehicleMake,
        workTypes, addWorkType, updateWorkType, deleteWorkType,
        workGroups, addWorkGroup, updateWorkGroup, deleteWorkGroup,
        suppliers, addSupplier, updateSupplier, deleteSupplier,
        transports, addTransport, updateTransport, deleteTransport,
        staff, addStaff, updateStaff, deleteStaff,
        brands, addBrand, updateBrand, deleteBrand,
        getActiveVehicleMakes, getActiveWorkTypes, getActiveWorkGroups,
        getActiveSuppliers, getActiveTransports, getActiveStaff, getActiveBrands,
        getModelsByMake
      }}
    >
      {children}
    </MastersContext.Provider>
  );
};

export const useMasters = () => {
  const context = useContext(MastersContext);
  if (!context) throw new Error('useMasters must be used within a MastersProvider');
  return context;
};
