import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

// Type definitions for all master data
export interface VehicleMake {
  id: string;
  name: string;
  make_name?: string; // KEEP FOR COMPATIBILITY
  country: string;
  status: string;
  createdAt: string;
  models?: string[];
}

export interface VehicleModel {
  id: string;
  makeId: string;
  modelName: string;
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
  vehicleModels: VehicleModel[];
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
  
  // History
  vehicleMakeHistory: any[];
  refreshVehicleMakeHistory: () => Promise<void>;
  mastersHistory: any[];
  refreshMastersHistory: () => Promise<void>;

  
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
  getModelsByMake: (make: string) => string[];
}


const MastersContext = createContext<MastersContextType | undefined>(undefined);

export const MastersProvider = ({ children }: { children: ReactNode }) => {
  const [vehicleMakes, setVehicleMakes] = useState<VehicleMake[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vehicleMakeHistory, setVehicleMakeHistory] = useState<any[]>([]);
  const [mastersHistory, setMastersHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  const { isAuthenticated } = useAuth();

  const fetchAll = async () => {
    if (!isAuthenticated) {
      setVehicleMakes([]);
      setVehicleModels([]);
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
      const results = await Promise.allSettled([
        api.get('/vehicle-makes'),
        api.get('/vehicle-makes/models'),
        api.get('/work/types'),
        api.get('/work/groups'),
        api.get('/suppliers'),
        api.get('/transports'),
        api.get('/staff'),
        api.get('/brands')
      ]);

      // Helper to extract successful response
      const getVal = (res: any) => (res.status === 'fulfilled' && res.value?.success) ? res.value : null;

      const [vmRes, vmodRes, wtRes, wgRes, supRes, trRes, stRes, brRes] = results.map(getVal);

      if (vmRes && vmRes.data) {
        const rows = vmRes.data.data || vmRes.data;
        if (Array.isArray(rows)) {
          setVehicleMakes(rows.map((r: any) => ({
            id: r.id.toString(), 
            name: r.make_name || r.name || '', 
            make_name: r.make_name || r.name || '', 
            country: r.country || '', 
            status: r.status || 'Active', 
            createdAt: r.created_at,
            models: [] // Will be populated from vehicle_models table
          })));
        } else {
          setVehicleMakes([]);
        }
      }

      if (vmodRes && vmodRes.data) {
        const rawData = Array.isArray(vmodRes.data?.data)
          ? vmodRes.data.data
          : Array.isArray(vmodRes.data)
          ? vmodRes.data
          : [];
        setVehicleModels(rawData.map((r: any) => ({
          id: r.id.toString(),
          makeId: r.make_id?.toString() || '',
          modelName: r.model_name || '',
          status: r.status || 'Active',
          createdAt: r.created_at
        })));
      }

      if (wtRes && wtRes.data) {
        const rows = wtRes.data.data || wtRes.data;
        if (Array.isArray(rows)) {
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
        } else {
          setWorkTypes([]);
        }
      }
      
      if (wgRes && wgRes.data) {
        const rows = wgRes.data.data || wgRes.data;
        if (Array.isArray(rows)) {
          setWorkGroups(rows.map((r: any) => ({
            id: r.id.toString(), 
            name: r.name || r.group_name || '', 
            description: r.description || '',
            category: r.category || 'General',
            workTypes: Array.isArray(r.work_types) ? r.work_types : JSON.parse(r.work_types || '[]'),
            status: r.status || 'Active', 
            createdAt: r.created_at
          })));
        } else {
          setWorkGroups([]);
        }
      }
      
      if (supRes && supRes.data) {
        const rows = supRes.data.data || supRes.data;
        if (Array.isArray(rows)) {
          setSuppliers(rows.map((r: any) => ({
            id: r.id.toString(), 
            name: r.name || '', 
            contactPerson: r.contact_person || r.company || '',
            phone: r.mobile || '', 
            email: r.email || '', 
            address: r.address || '',
            gst: r.gst_number || '', 
            category: r.category || 'General', 
            status: r.status || 'Active', 
            createdAt: r.created_at
          })));
        } else {
          setSuppliers([]);
        }
      }
      
      if (trRes && trRes.data) {
        const rows = trRes.data.data || trRes.data;
        if (Array.isArray(rows)) {
          setTransports(rows.map((r: any) => ({
            id: r.id.toString(), 
            name: r.name || '', 
            contactPerson: r.contact_person || '',
            mobile: r.phone || '', 
            email: r.email || '', 
            address: r.address || '',
            gst: r.gst_no || '', 
            status: r.status || 'Active', 
            createdAt: r.created_at
          })));
        } else {
          setTransports([]);
        }
      }
      
      if (stRes && stRes.data) {
        const rows = stRes.data.data || stRes.data;
        if (Array.isArray(rows)) {
          setStaff(rows.map((r: any) => ({
            id: r.id.toString(), 
            name: r.name || '', 
            designation: r.designation || '',
            mobile: r.mobile || '', 
            email: r.email || '',
            joiningDate: r.joining_date ? new Date(r.joining_date).toISOString().split('T')[0] : '',
            salary: r.salary ? parseFloat(r.salary) : 0, 
            address: r.address || '',
            bankAccount: r.bank_account || '', 
            ifscCode: r.ifsc_code || '',
            status: r.status || 'Active', 
            createdAt: r.created_at
          })));
        } else {
          setStaff([]);
        }
      }
      
      if (brRes && brRes.data) {
        const rows = brRes.data.data || brRes.data;
        if (Array.isArray(rows)) {
          setBrands(rows.map((r: any) => ({
            id: r.id.toString(), 
            name: r.name || '', 
            manufacturer: r.manufacturer || '',
            category: r.category || '', 
            origin: r.country || '',
            description: r.description || '',
            status: r.status || 'Active', 
            createdAt: r.created_at
          })));
        } else {
          setBrands([]);
        }
      }
      
      await refreshVehicleMakeHistory();
      await refreshMastersHistory();
    } catch (err: any) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [isAuthenticated]);

  // Vehicle Makes
  const addVehicleMake = async (make: VehicleMake) => {
    try {
      await api.post('/vehicle-makes', { 
        make_name: make.make_name || make.name, 
        country: make.country, 
        status: make.status 
      });

      await fetchAll();
      await refreshVehicleMakeHistory();

    } catch (error) {
      throw error;
    }
  };
  const updateVehicleMake = async (id: string, make: VehicleMake) => {
    try {
      await api.put(`/vehicle-makes/${id}`, { 
        make_name: make.make_name || make.name, 
        country: make.country, 
        status: make.status 
      });

      await fetchAll();
      await refreshVehicleMakeHistory();

    } catch (error) {
      throw error;
    }
  };
  const deleteVehicleMake = async (id: string) => {
    try {
      await api.delete(`/vehicle-makes/${id}`);
      await fetchAll();
      await refreshVehicleMakeHistory();
    } catch (error) {
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
      duration: wt.duration || '', 
      avg_price: Number(wt.avgPrice) || 0 
    };
    const res = await api.post('/work/types', payload);
    if (!res.success) throw new Error(res.message || 'Failed to add work type');
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
    try {
      await api.put(`/work/types/${id}`, payload);
      await fetchAll();
    } catch (error) {
      throw error;
    }
  };
  const deleteWorkType = async (id: string) => {
    try {
      await api.delete(`/work/types/${id}`);
      await fetchAll();
    } catch (error) {
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
    const res = await api.post('/work/groups', payload);
    if (!res.success) throw new Error(res.message || 'Failed to add work group');
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

  const getActiveVehicleMakes = () => (Array.isArray(vehicleMakes) ? vehicleMakes : []).filter(m => m.status?.toLowerCase() === 'active');
  const getActiveWorkTypes = () => (Array.isArray(workTypes) ? workTypes : []).filter(wt => wt.status?.toLowerCase() === 'active');
  const getActiveWorkGroups = () => (Array.isArray(workGroups) ? workGroups : []).filter(wg => wg.status?.toLowerCase() === 'active');
  const getActiveSuppliers = () => (Array.isArray(suppliers) ? suppliers : []).filter(s => s.status?.toLowerCase() === 'active');
  const getActiveTransports = () => (Array.isArray(transports) ? transports : []).filter(t => t.status?.toLowerCase() === 'active');
  const getActiveStaff = () => (Array.isArray(staff) ? staff : []).filter(s => s.status?.toLowerCase() === 'active');
  const getActiveBrands = () => (Array.isArray(brands) ? brands : []).filter(b => b.status?.toLowerCase() === 'active');

  const refreshVehicleMakeHistory = async () => {
    try {
      const res = await api.get('/vehicle-makes/history');
      if (res.success && res.data) {
        const rows = res.data.data || res.data;
        setVehicleMakeHistory(Array.isArray(rows) ? rows : []);
      }
    } catch (err) {
    }
  };
  
  const refreshMastersHistory = async () => {
    try {
      const res = await api.get('/audit?module_name=Masters');
      if (res.success && res.data) {
        const rawData = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        setMastersHistory(rawData);
      }
    } catch (err) {
    }
  };



  const getModelsByMake = (makeName: string) => {
    // Find the make by name
    const make = (Array.isArray(vehicleMakes) ? vehicleMakes : []).find(vm => vm.name === makeName);
    if (!make) return [];
    
    // Return models for this make
    return (Array.isArray(vehicleModels) ? vehicleModels : [])
      .filter(vm => vm.makeId === make.id && vm.status?.toLowerCase() === 'active')
      .map(vm => vm.modelName);
  };

  return (
    <MastersContext.Provider
      value={{
        isLoading,
        refreshAllMasters: fetchAll,
        vehicleMakes, vehicleModels, addVehicleMake, updateVehicleMake, deleteVehicleMake,
        workTypes, addWorkType, updateWorkType, deleteWorkType,
        workGroups, addWorkGroup, updateWorkGroup, deleteWorkGroup,
        suppliers, addSupplier, updateSupplier, deleteSupplier,
        transports, addTransport, updateTransport, deleteTransport,
        staff, addStaff, updateStaff, deleteStaff,
        brands, addBrand, updateBrand, deleteBrand,
        getActiveVehicleMakes, getActiveWorkTypes, getActiveWorkGroups,
        getActiveSuppliers, getActiveTransports, getActiveStaff, getActiveBrands,
        vehicleMakeHistory, refreshVehicleMakeHistory,
        mastersHistory, refreshMastersHistory,
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
