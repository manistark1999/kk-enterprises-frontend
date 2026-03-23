import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, endpoints } from '@/services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface ServiceItem {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  rate: number;
  gst: number;
  amount: number;
}

export interface JobCard {
  id: string;
  jobCardNo: string;
  date: string;
  time: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  vehicleNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleType: string;
  transportName: string;
  kmReading: string;
  serviceType: string;
  workType: string;
  beforeFrontCamber: string;
  beforeFrontCaster: string;
  beforeFrontToe: string;
  beforeRearCamber: string;
  beforeRearToe: string;
  afterFrontCamber: string;
  afterFrontCaster: string;
  afterFrontToe: string;
  afterRearCamber: string;
  afterRearToe: string;
  technicianId: string;
  technicianName: string;
  problemReported: string;
  workDone: string;
  remarks: string;
  labourCharge: string;
  partsCharge: string;
  totalAmount: string;
  serviceItems: ServiceItem[];
  status: 'Draft' | 'In Progress' | 'Completed' | 'Billed';
  labourBillNo?: string;
  vehicleId: string;
}

interface JobCardContextType {
  jobCards: JobCard[];
  isLoading: boolean;
  addJobCard: (jobCard: Omit<JobCard, 'id'>) => Promise<JobCard | null>;
  updateJobCard: (id: string, jobCard: Partial<JobCard>) => Promise<JobCard | null>;
  deleteJobCard: (id: string) => Promise<void>;
  refreshJobCards: () => Promise<void>;
  getJobCardById: (id: string) => Promise<JobCard | null>;
  fetchNextJobCardNumber: () => Promise<string | null>;
}

const JobCardContext = createContext<JobCardContextType | undefined>(undefined);

const mapApiJobCard = (jc: any): JobCard => {
  // Normalize status from backend (snake_case) to frontend (Friendly Case)
  const normalizedStatus = (jc.status || '').toLowerCase();
  let status: JobCard['status'] = 'Draft';
  if (normalizedStatus === 'completed') status = 'Completed';
  else if (normalizedStatus === 'pending') status = 'In Progress';
  else if (normalizedStatus === 'billed') status = 'Billed';
  else if (normalizedStatus === 'draft') status = 'Draft';

  return {
    id: jc.id?.toString() || jc.jobcard_no || `JC-${Date.now()}`,
    jobCardNo: jc.jobcard_no || '',
    date: jc.created_at ? jc.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    time: jc.created_at
      ? new Date(jc.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    customerId: (jc.customer_id || '').toString(),
    customerName: jc.customer_name || '',
    customerPhone: jc.phone || jc.customer_phone || '',
    customerAddress: jc.address || jc.customer_address || '',
    vehicleNumber: jc.vehicle_no || jc.vehicle_number || '',
    vehicleMake: jc.brand || jc.vehicle_make || '',
    vehicleModel: jc.model || jc.vehicle_model || '',
    vehicleType: jc.vehicle_type || '',
    transportName: jc.transport_name || '',
    kmReading: jc.km_reading || '',
    serviceType: jc.service_type || '',
    workType: jc.work_type || '',
    beforeFrontCamber: jc.before_front_camber || '',
    beforeFrontCaster: jc.before_front_caster || '',
    beforeFrontToe: jc.before_front_toe || '',
    beforeRearCamber: jc.before_rear_camber || '',
    beforeRearToe: jc.before_rear_toe || '',
    afterFrontCamber: jc.after_front_camber || '',
    afterFrontCaster: jc.after_front_caster || '',
    afterFrontToe: jc.after_front_toe || '',
    afterRearCamber: jc.after_rear_camber || '',
    afterRearToe: jc.after_rear_toe || '',
    technicianId: (jc.technician_id || '').toString(),
    technicianName: jc.technician_name || '',
    problemReported: jc.complaint || jc.problem_reported || '',
    workDone: jc.work_done || '',
    remarks: jc.remarks || '',
    labourCharge: (jc.labour_charge || 0).toString(),
    partsCharge: (jc.parts_charge || 0).toString(),
    totalAmount: (jc.estimated_amount || jc.total_amount || 0).toString(),
    serviceItems: Array.isArray(jc.service_items) ? jc.service_items : [],
    status,
    labourBillNo: jc.labour_bill_no || '',
    vehicleId: jc.vehicle_id?.toString() || ''
  };
};


export function JobCardProvider({ children }: { children: ReactNode }) {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchJobCards = async () => {
    if (!isAuthenticated) {
      setJobCards([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.get(endpoints.billing.jobcard.list);
      const payload: any = response.data;
      if (payload?.success && Array.isArray(payload.data)) {
        setJobCards(payload.data.map(mapApiJobCard));
      } else {
        toast.error(payload?.message || 'Failed to load job cards');
      }
    } catch (error: any) {
      console.error('Error fetching job cards:', error);
      toast.error('Failed to fetch job cards from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobCards();
  }, [isAuthenticated]);

  const addJobCard = async (jobCardData: any) => {
    try {
      const payload = {
        jobcard_no: jobCardData.jobCardNo || jobCardData.jobcard_no,
        customer_id: jobCardData.customerId || jobCardData.customer_id,
        customer_name: jobCardData.customerName || jobCardData.customer_name,
        phone: jobCardData.customerPhone || jobCardData.phone || jobCardData.customer_phone,
        address: jobCardData.customerAddress || jobCardData.address || jobCardData.customer_address,
        vehicle_id: jobCardData.vehicleId || jobCardData.vehicle_id,
        vehicle_no: jobCardData.vehicleNumber || jobCardData.vehicle_no,
        vehicle_type: jobCardData.vehicleType || jobCardData.vehicle_type,
        brand: jobCardData.vehicleMake || jobCardData.brand || jobCardData.vehicle_make,
        model: jobCardData.vehicleModel || jobCardData.model || jobCardData.vehicle_model,
        transport_name: jobCardData.transportName || jobCardData.transport_name,
        km_reading: jobCardData.kmReading || jobCardData.km_reading,
        service_type: jobCardData.serviceType || jobCardData.service_type,
        work_type: jobCardData.workType || jobCardData.work_type,
        technician_id: jobCardData.technicianId || jobCardData.technician_id,
        technician: jobCardData.technicianName || jobCardData.technician || jobCardData.technician_name,
        before_front_camber: jobCardData.beforeFrontCamber || jobCardData.before_front_camber,
        before_front_caster: jobCardData.beforeFrontCaster || jobCardData.before_front_caster,
        before_front_toe: jobCardData.beforeFrontToe || jobCardData.before_front_toe,
        before_rear_camber: jobCardData.beforeRearCamber || jobCardData.before_rear_camber,
        before_rear_toe: jobCardData.beforeRearToe || jobCardData.before_rear_toe,
        after_front_camber: jobCardData.afterFrontCamber || jobCardData.after_front_camber,
        after_front_caster: jobCardData.afterFrontCaster || jobCardData.after_front_caster,
        after_front_toe: jobCardData.afterFrontToe || jobCardData.after_front_toe,
        after_rear_camber: jobCardData.afterRearCamber || jobCardData.after_rear_camber,
        after_rear_toe: jobCardData.afterRearToe || jobCardData.after_rear_toe,
        service_items: jobCardData.serviceItems || jobCardData.service_items,
        complaint: jobCardData.problemReported || jobCardData.complaint,
        work_done: jobCardData.workDone || jobCardData.work_done,
        remarks: jobCardData.remarks,
        status: (jobCardData.status === 'In Progress' ? 'pending' : jobCardData.status?.toLowerCase()) || 'pending',
        estimated_amount: parseFloat(jobCardData.totalAmount || jobCardData.estimated_amount) || 0,
        labour_charge: parseFloat(jobCardData.labourCharge || jobCardData.labour_charge) || 0,
        parts_charge: parseFloat(jobCardData.partsCharge || jobCardData.parts_charge) || 0,
        date: jobCardData.date || jobCardData.created_at
      };

      const response = await api.post(endpoints.billing.jobcard.create, payload);
      // Wait, api.post returns ApiResponse which has 'success' and 'data' (the parsed JSON)
      if (response.success && response.data) {
        const resData = response.data;
        await fetchJobCards();
        toast.success('Job Card created successfully!');
        return mapApiJobCard(resData.data || resData);
      } else {
        toast.error(response.message || 'Failed to save job card');
        return null;
      }
    } catch (error: any) {
      console.error('Error adding job card:', error);
      toast.error(error.message || 'Failed to add job card');
      throw error;
    }
  };

  const updateJobCard = async (id: string, jobCardData: Partial<JobCard> | any) => {
    try {
      const existing = jobCards.find(jc => jc.id === id);
      // Construct a payload that combines existing data with the new incoming data
      // We process the incoming data first to prioritize updates from the screen
      const payload = {
        jobcard_no: jobCardData.jobCardNo || jobCardData.jobcard_no || (existing as any)?.jobCardNo || (existing as any)?.jobcard_no,
        customer_id: jobCardData.customerId || jobCardData.customer_id || (existing as any)?.customerId || (existing as any)?.customer_id,
        customer_name: jobCardData.customerName || jobCardData.customer_name || (existing as any)?.customerName || (existing as any)?.customer_name,
        phone: jobCardData.customerPhone || jobCardData.phone || jobCardData.customer_phone || (existing as any)?.customerPhone || (existing as any)?.phone,
        address: jobCardData.customerAddress || jobCardData.address || jobCardData.customer_address || (existing as any)?.customerAddress || (existing as any)?.address,
        vehicle_id: jobCardData.vehicleId || jobCardData.vehicle_id || (existing as any)?.vehicleId || (existing as any)?.vehicle_id,
        vehicle_no: jobCardData.vehicleNumber || jobCardData.vehicle_no || (existing as any)?.vehicleNumber || (existing as any)?.vehicle_no,
        vehicle_type: jobCardData.vehicleType || jobCardData.vehicle_type || (existing as any)?.vehicleType || (existing as any)?.vehicle_type,
        brand: jobCardData.vehicleMake || jobCardData.brand || jobCardData.vehicle_make || (existing as any)?.vehicleMake || (existing as any)?.brand,
        model: jobCardData.vehicleModel || jobCardData.model || jobCardData.vehicle_model || (existing as any)?.vehicleModel || (existing as any)?.model,
        transport_name: jobCardData.transportName || jobCardData.transport_name || (existing as any)?.transportName || (existing as any)?.transport_name,
        km_reading: jobCardData.kmReading || jobCardData.km_reading || (existing as any)?.kmReading || (existing as any)?.km_reading,
        service_type: jobCardData.serviceType || jobCardData.service_type || (existing as any)?.serviceType || (existing as any)?.service_type,
        work_type: jobCardData.workType || jobCardData.work_type || (existing as any)?.workType || (existing as any)?.work_type,
        technician_id: jobCardData.technicianId || jobCardData.technician_id || (existing as any)?.technicianId || (existing as any)?.technician_id,
        technician: jobCardData.technicianName || jobCardData.technician || jobCardData.technician_name || (existing as any)?.technicianName || (existing as any)?.technician,
        before_front_camber: jobCardData.beforeFrontCamber || jobCardData.before_front_camber || (existing as any)?.beforeFrontCamber,
        before_front_caster: jobCardData.beforeFrontCaster || jobCardData.before_front_caster || (existing as any)?.beforeFrontCaster,
        before_front_toe: jobCardData.beforeFrontToe || jobCardData.before_front_toe || (existing as any)?.beforeFrontToe,
        before_rear_camber: jobCardData.beforeRearCamber || jobCardData.before_rear_camber || (existing as any)?.beforeRearCamber,
        before_rear_toe: jobCardData.beforeRearToe || jobCardData.before_rear_toe || (existing as any)?.beforeRearToe,
        after_front_camber: jobCardData.afterFrontCamber || jobCardData.after_front_camber || (existing as any)?.afterFrontCamber,
        after_front_caster: jobCardData.afterFrontCaster || jobCardData.after_front_caster || (existing as any)?.afterFrontCaster,
        after_front_toe: jobCardData.afterFrontToe || jobCardData.after_front_toe || (existing as any)?.afterFrontToe,
        after_rear_camber: jobCardData.afterRearCamber || jobCardData.after_rear_camber || (existing as any)?.afterRearCamber,
        after_rear_toe: jobCardData.afterRearToe || jobCardData.after_rear_toe || (existing as any)?.afterRearToe,
        service_items: jobCardData.serviceItems || jobCardData.service_items || (existing as any)?.serviceItems,
        complaint: jobCardData.problemReported || jobCardData.complaint || (existing as any)?.problemReported,
        work_done: jobCardData.workDone || jobCardData.work_done || (existing as any)?.workDone,
        remarks: jobCardData.remarks || (existing as any)?.remarks,
        status: (jobCardData.status === 'In Progress' ? 'pending' : jobCardData.status?.toLowerCase()) || (existing?.status?.toLowerCase()) || 'pending',
        estimated_amount: parseFloat(jobCardData.totalAmount || jobCardData.estimated_amount || (existing as any)?.totalAmount || 0),
        labour_charge: parseFloat(jobCardData.labourCharge || jobCardData.labour_charge || (existing as any)?.labourCharge || 0),
        parts_charge: parseFloat(jobCardData.partsCharge || jobCardData.parts_charge || (existing as any)?.partsCharge || 0),
        date: jobCardData.date || jobCardData.created_at || (existing as any)?.date || (existing as any)?.created_at
      };

      const response = await api.put(endpoints.billing.jobcard.update(id), payload);
      if (response.success && response.data) {
        const resData = response.data;
        await fetchJobCards();
        toast.success('Job Card updated successfully!');
        return mapApiJobCard(resData.data || resData);
      } else {
        toast.error(response.message || 'Failed to update job card');
        return null;
      }
    } catch (error: any) {
      console.error('Error updating job card:', error);
      toast.error(error.message || 'Failed to update job card');
      throw error;
    }
  };

  const deleteJobCard = async (id: string) => {
    try {
      const response = await api.delete(endpoints.billing.jobcard.delete(id));
      if (response.success) {
        toast.success('Job Card deleted successfully!');
        await fetchJobCards();
      } else {
        toast.error(response.message || 'Failed to delete job card');
      }
    } catch (error: any) {
      console.error('Error deleting job card:', error);
      toast.error(error.message || 'Failed to delete job card');
      throw error;
    }
  };

  const getJobCardById = async (id: string): Promise<JobCard | null> => {
    try {
      const response = await api.get(endpoints.billing.jobcard.getById(id));
      if (response.success && response.data) {
        return mapApiJobCard(response.data.data || response.data);
      }
      return null;
    } catch (error) {
      console.error('Error fetching single job card:', error);
      return null;
    }
  };

  const refreshJobCards = async () => {
    await fetchJobCards();
  };

  const fetchNextJobCardNumber = async () => {
    try {
        const response = await api.get(endpoints.billing.jobcard.nextNumber);
        const payload: any = response.data;
        if (payload?.success && payload.data) {
            return payload.data;
        }
        return null;
    } catch (err) {
        console.error('Failed to fetch next job card number:', err);
        return null;
    }
  };

  return (
    <JobCardContext.Provider
      value={{
        jobCards,
        isLoading,
        addJobCard,
        updateJobCard,
        deleteJobCard,
        refreshJobCards: fetchJobCards,
        fetchNextJobCardNumber,
        getJobCardById
      }}
    >
      {children}
    </JobCardContext.Provider>
  );
}

export function useJobCards() {
  const context = useContext(JobCardContext);
  if (!context) {
    throw new Error('useJobCards must be used within a JobCardProvider');
  }
  return context;
}
