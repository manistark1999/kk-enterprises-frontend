import React, { useState, useEffect } from 'react';
import { api, endpoints } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Printer,
  Download,
  Filter,
  X,
  Save,
  FileText,
  Car,
  User,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Wrench,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { ServiceItemsTable } from './JobCardScreenUnified_ServiceItems';
import { getCurrentDate, getCurrentTime } from '@/utils/formatting/dateTimeUtils';
import {
  getCardClass,
  getInputClass,
  getLabelClass,
  getPrimaryButtonClass,
  getSecondaryButtonClass,
  getRequiredFieldClass
} from '@/utils/formStyles';
import { useCustomers } from '@/contexts/CustomerContext';
import { useMasters, Staff, Transport } from '@/contexts/MastersContext';
import { useVehicleRegistry } from '@/contexts/VehicleRegistryContext';
import { useLabourBills } from '@/contexts/LabourBillContext';
import { useItemsServices } from '@/contexts/ItemsServicesContext';
import { useNotifications } from '@/contexts/NotificationContext';
import JobCardPrintPreview from './JobCardPrintPreview'; // Corrected path
import { JobCardPrintProps } from '@/components/print/JobCardPrint'; // Corrected path
const kkLogo = "https://via.placeholder.com/150x50?text=KK+Enterprises"; // Placeholder logo
import { generateJobCardPrintHTML } from './JobCardPrintTemplate';
import { PrintActionModal } from '@/components/print/PrintActionModal';
import JobCardPrintView from './JobCardPrintView';

interface JobCardScreenUnifiedProps {
  isDarkMode: boolean;
  onNavigate?: (screen: string, data?: any) => void;
}

interface ServiceItem {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  rate: number;
  gst: number;
  amount: number;
}

interface JobCard {
  id: string;
  jobCardNo: string;
  date: string;
  time: string;

  // Customer Details
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;

  // Vehicle Details
  vehicleNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleType: string;
  transportName: string;
  kmReading: string;

  // Job Details
  serviceType: string;
  workType: string;

  // Alignment Measurements - Before
  beforeFrontCamber: string;
  beforeFrontCaster: string;
  beforeFrontToe: string;
  beforeRearCamber: string;
  beforeRearToe: string;

  // Alignment Measurements - After
  afterFrontCamber: string;
  afterFrontCaster: string;
  afterFrontToe: string;
  afterRearCamber: string;
  afterRearToe: string;

  // Staff Details
  technicianId: string;
  technicianName: string;

  // Work Description
  problemReported: string;
  workDone: string;
  remarks: string;

  // Billing Details
  labourCharge: string;
  partsCharge: string;
  totalAmount: string;

  // Service Items
  serviceItems: ServiceItem[];

  // Status
  status: 'Draft' | 'In Progress' | 'Completed' | 'Billed';
  labourBillNo?: string;
  vehicleId: string;
}

export function JobCardScreenUnified({ isDarkMode, onNavigate }: JobCardScreenUnifiedProps) {
  const { customers } = useCustomers();
  const {
    vehicleMakes,
    getModelsByMake,
    workTypes,
    transports,
    staff,
    getActiveVehicleMakes
  } = useMasters();
  const { vehicles: registeredVehicles } = useVehicleRegistry();
  const { labourBills } = useLabourBills();
  const { getActiveServices, itemsServices } = useItemsServices();
  // const { showNotification } = useNotifications(); // Removed because it's not in the context

  // Get services for the table
  const services = getActiveServices();

  // Debug: Log customer data
  useEffect(() => {
    console.log('📊 Job Card - Customers loaded:', customers.length);
    console.log('📋 Sample customer:', customers[0]);
    console.log('🔍 Active customers:', customers.filter(c => c.isActive).length);
  }, [customers]);

  // Debug: Log transport data
  useEffect(() => {
    console.log('🚚 Job Card - Transports loaded:', transports.length);
    console.log('📦 Sample transport:', transports[0]);
    console.log('✅ Active transports:', transports.filter(t => t.status === 'Active').length);
  }, [transports]);

  // Debug: Log staff data
  useEffect(() => {
    console.log('👨‍💼 Job Card - Staff loaded:', staff.length);
    console.log('👤 Sample staff:', staff[0]);
    console.log('✅ Active staff:', staff.filter(s => s.status === 'Active').length);
  }, [staff]);

  // Debug: Log services data
  useEffect(() => {
    const services = getActiveServices();
    console.log('🔧 Job Card - Active Services loaded:', services.length);
    console.log('📝 Sample service:', services[0]);
  }, []);

  // Form state
  const [isFormExpanded, setIsFormExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isAlignmentExpanded, setIsAlignmentExpanded] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Draft' | 'In Progress' | 'Completed' | 'Billed'>('All');

  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToView, setCardToView] = useState<JobCard | null>(null);
  const [cardToDelete, setCardToDelete] = useState<JobCard | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<JobCard | null>(null);
  const [companyData, setCompanyData] = useState<any>({
    companyName: 'KK Enterprises',
    address: 'Main Road, City',
    phone: '+91 9876543210',
    email: 'info@kkenterprises.com',
    website: 'www.kkenterprises.com',
    bankName: 'State Bank of India',
    accountNo: '1234567890',
    ifscCode: 'SBIN0001234'
  });

  // Load company data from localStorage
  useEffect(() => {
    const savedCompanyData = localStorage.getItem('companyData');
    if (savedCompanyData) {
      setCompanyData(JSON.parse(savedCompanyData));
    }
  }, []);

  const [formData, setFormData] = useState({
    // Customer Details
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',

    // Vehicle Details
    vehicleNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleType: 'Car',
    transportName: '',
    kmReading: '',

    // Job Details
    date: getCurrentDate(),
    time: getCurrentTime(),
    serviceType: 'Wheel Alignment',
    workType: '',

    // Alignment Measurements - Before
    beforeFrontCamber: '',
    beforeFrontCaster: '',
    beforeFrontToe: '',
    beforeRearCamber: '',
    beforeRearToe: '',

    // Alignment Measurements - After
    afterFrontCamber: '',
    afterFrontCaster: '',
    afterFrontToe: '',
    afterRearCamber: '',
    afterRearToe: '',

    // Staff Details
    technicianId: '',
    technicianName: '',

    // Work Description
    problemReported: '',
    workDone: '',
    remarks: '',

    // Billing Details
    labourCharge: '',
    partsCharge: '0',
    totalAmount: '',
    vehicleId: '',
    jobCardNo: ''
  });

  // Service Items state - Start with one empty item
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([
    {
      id: '1',
      serviceId: '',
      serviceName: '',
      quantity: 1,
      rate: 0,
      gst: 0,
      amount: 0
    }
  ]);

  // Debug: Log service items whenever they change
  useEffect(() => {
    console.log('🔧 Service Items Updated:', serviceItems.length, 'items');
    console.log('📝 Service Items:', serviceItems);
  }, [serviceItems]);

  // Auto-calculate Total Amount based on Service Items and Billing Details
  useEffect(() => {
    // Calculate Service Items Total (use already calculated amounts that include GST)
    const serviceItemsTotal = serviceItems.reduce((total: number, item: ServiceItem) => {
      return total + item.amount;
    }, 0);

    // Calculate Billing Details Total
    const labourCharge = parseFloat(formData.labourCharge) || 0;
    const partsCharge = parseFloat(formData.partsCharge) || 0;
    const billingTotal = labourCharge + partsCharge;

    // Total Amount = Service Items Total + Billing Details Total
    const grandTotal = serviceItemsTotal + billingTotal;

    // Update form data with calculated total
    setFormData(prev => ({
      ...prev,
      totalAmount: grandTotal.toFixed(2)
    }));

    console.log('💰 Total Calculation:', {
      serviceItemsTotal: serviceItemsTotal.toFixed(2),
      labourCharge: labourCharge.toFixed(2),
      partsCharge: partsCharge.toFixed(2),
      billingTotal: billingTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      serviceItemsDetails: serviceItems.map(item => ({
        name: item.serviceName,
        qty: item.quantity,
        rate: item.rate,
        gst: item.gst,
        amount: item.amount.toFixed(2)
      }))
    });
  }, [serviceItems, formData.labourCharge, formData.partsCharge]);

  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [isJobCardLoading, setIsJobCardLoading] = useState(false);
  const [isSavingJobCard, setIsSavingJobCard] = useState(false);

  const handlePrint = async (card: JobCard) => {
    setPrintData(card);
    setIsPrintModalOpen(true);

    // Log the print action to history
    try {
      await api.post('/audit-logs', {
        table_name: 'jobcards',
        record_id: card.id,
        action: 'PRINT',
        performed_by: 'Admin', // In a real app, use user?.username
        changed_data: { jobCardNo: card.jobCardNo, action: 'Printed job card report' }
      });
    } catch (err) {
      console.error('Failed to log print action:', err);
    }
  };

  const handlePrintAction = (action: 'print' | 'download', format: 'pdf' | 'html') => {
    if (!printData) return;

    if (action === 'print') {
      // Trigger browser print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const htmlContent = generateJobCardPrintHTML(printData, companyData);
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }
    } else if (action === 'download') {
      if (format === 'pdf') {
        // Generate PDF using html2pdf
        import('html2pdf.js').then((html2pdfModule) => {
          const html2pdf = html2pdfModule.default;
          const element = document.createElement('div');
          element.innerHTML = generateJobCardPrintHTML(printData, companyData);
          document.body.appendChild(element);

          const opt = {
            margin: 1,
            filename: `jobcard-${printData.jobCardNo}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
          };

          html2pdf().set(opt).from(element).save().then(() => {
            document.body.removeChild(element);
          });
        });
      } else {
        // Download as HTML
        const htmlContent = generateJobCardPrintHTML(printData, companyData);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jobcard-${printData.jobCardNo}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }

    setIsPrintModalOpen(false);
  };

  const mapApiJobCard = (jc: any): JobCard => ({
    id: jc.id?.toString() || jc.jobcard_no || `JC-${Date.now()}`,
    jobCardNo: jc.jobcard_no || '',
    date: jc.created_at ? jc.created_at.slice(0, 10) : getCurrentDate(),
    time: jc.created_at
      ? new Date(jc.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      : getCurrentTime(),
    customerId: '',
    customerName: jc.customer_name || '',
    customerPhone: jc.phone || '',
    customerAddress: jc.address || '',
    vehicleNumber: jc.vehicle_no || '',
    vehicleMake: jc.brand || '',
    vehicleModel: jc.model || '',
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
    technicianId: jc.technician_id || '',
    technicianName: jc.technician_name || '',
    problemReported: jc.complaint || '',
    workDone: jc.work_done || '',
    remarks: jc.remarks || '',
    labourCharge: (jc.labour_charge || 0).toString(),
    partsCharge: (jc.parts_charge || 0).toString(),
    totalAmount: (jc.estimated_amount || 0).toString(),
    serviceItems: jc.service_items || [],
    status:
      jc.status === 'completed'
        ? 'Completed'
        : jc.status === 'pending'
          ? 'In Progress'
          : 'Draft',
    labourBillNo: jc.labour_bill_no || '',
    vehicleId: jc.vehicle_id?.toString() || ''
  });

  const fetchJobCards = async () => {
    setIsJobCardLoading(true);
    try {
      const response = await api.get(endpoints.billing.jobcard.list);
      const payload: any = response.data;
      if (payload?.success && Array.isArray(payload.data)) {
        setJobCards(payload.data.map((cardData: any) => mapApiJobCard(cardData)));
      } else {
        toast.error(payload?.message || 'Failed to load job cards');
      }
    } catch (error: any) {
      console.error('Error fetching job cards:', error);
      toast.error('Failed to fetch job cards from server');
    } finally {
      setIsJobCardLoading(false);
    }
  };

  const fetchNextJobCardNo = async () => {
    try {
      const response = await api.get(endpoints.billing.jobcard.nextNumber);
      const payload: any = response.data;
      if (payload?.success && payload.data) {
        setFormData(prev => ({
          ...prev,
          jobCardNo: payload.data
        }));
      }
    } catch (err) {
      console.error('Failed to fetch next job card number:', err);
    }
  };

  // Fetch next job card number when opening form in create mode
  useEffect(() => {
    if (!isEditing && isFormExpanded) {
      fetchNextJobCardNo();
    }
  }, [isEditing, isFormExpanded]);

  useEffect(() => {
    fetchJobCards();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchJobCards, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-fill customer phone when customer is selected
  useEffect(() => {
    if (formData.customerName) {
      const selectedCustomer = customers.find(
        (c: any) => `${c.customerName} - ${c.phoneNumber}` === formData.customerName
      );
      if (selectedCustomer) {
        setFormData(prev => ({
          ...prev,
          customerPhone: selectedCustomer.phoneNumber,
          customerAddress: selectedCustomer.address || '',
          customerId: selectedCustomer.id
        }));
      }
    }
  }, [formData.customerName, customers]);

  // Auto-fill vehicle model when make is selected
  useEffect(() => {
    if (formData.vehicleMake) {
      const models = getModelsByMake(formData.vehicleMake);
      if (models.length === 1) {
        setFormData(prev => ({ ...prev, vehicleModel: models[0] }));
      } else if (!models.includes(formData.vehicleModel)) {
        setFormData(prev => ({ ...prev, vehicleModel: '' }));
      }
    }
  }, [formData.vehicleMake, getModelsByMake]);

  // Auto-fill staff ID when technician is selected
  useEffect(() => {
    if (formData.technicianName) {
      const selectedStaff = staff.find((s: Staff) => s.name === formData.technicianName && s.status === 'Active');
      if (selectedStaff) {
        setFormData((prev: any) => ({
          ...prev,
          technicianId: selectedStaff.id
        }));
      }
    }
  }, [formData.technicianName, staff]);

  // Auto-calculate total amount
  // Check if form is valid (required fields)
  const isFormValid = () => {
    return (
      formData.customerName &&
      formData.vehicleNumber &&
      formData.vehicleMake &&
      formData.serviceType &&
      formData.technicianName
    );
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    // Special handling for technician selection - auto-fill Staff ID
    if (field === 'technicianName') {
      const selectedStaff = staff.find((s: any) => s.name === value);
      if (selectedStaff) {
        setFormData(prev => ({
          ...prev,
          technicianName: selectedStaff.name,
          technicianId: selectedStaff.id
        }));
        toast.success('Staff ID auto-filled!');
        return;
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle customer selection with auto-fill
  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerAddress: selectedCustomer.address || ''
      }));
      toast.success('Customer details auto-filled!');
    }
  };

  // Build vehicle registry from all sources (Vehicle Registry + labour bills + job cards)
  const vehicleRegistry = React.useMemo(() => {
    const vehicles = new Map();

    // FIRST: Add vehicles from Vehicle Registry Context (highest priority)
    registeredVehicles.forEach(vehicle => {
      if (vehicle.vehicle_number && vehicle.status === 'Active') {
        vehicles.set(vehicle.vehicle_number.toUpperCase(), {
          id: vehicle.id,
          vehicleNumber: vehicle.vehicle_number,
          vehicleMake: vehicle.vehicle_make,
          vehicleModel: vehicle.model,
          customerId: '',
          customerName: vehicle.owner_name || '',
          customerPhone: vehicle.mobile || '',
          customerAddress: '',
          transportName: '',
          vehicleType: vehicle.fuel_type || 'Diesel'
        });
      }
    });

    // Add vehicles from labour bills (if not already in registry)
    labourBills.forEach(bill => {
      if (bill.vehicleNumber && !vehicles.has(bill.vehicleNumber.toUpperCase())) {
        const customer = customers.find(c =>
          c.name === bill.customerName.split(' - ')[0] ||
          c.phone === bill.customerPhone
        );

        vehicles.set(bill.vehicleNumber.toUpperCase(), {
          vehicleNumber: bill.vehicleNumber,
          vehicleMake: bill.vehicleMake || '',
          vehicleModel: bill.vehicleModel || '',
          customerId: customer?.id || '',
          customerName: bill.customerName.split(' - ')[0] || '',
          customerPhone: bill.customerPhone || '',
          customerAddress: bill.customerAddress || '',
          transportName: '',
          vehicleType: 'Car'
        });
      }
    });

    // Add vehicles from existing job cards (lowest priority)
    jobCards.forEach(card => {
      if (card.vehicleNumber && !vehicles.has(card.vehicleNumber.toUpperCase())) {
        vehicles.set(card.vehicleNumber.toUpperCase(), {
          vehicleNumber: card.vehicleNumber,
          vehicleMake: card.vehicleMake || '',
          vehicleModel: card.vehicleModel || '',
          customerId: card.customerId || '',
          customerName: card.customerName || '',
          customerPhone: card.customerPhone || '',
          customerAddress: card.customerAddress || '',
          transportName: card.transportName || '',
          vehicleType: card.vehicleType || 'Car'
        });
      }
    });

    return Array.from(vehicles.values());
  }, [registeredVehicles, labourBills, jobCards, customers]);

  // Handle vehicle selection with auto-fill (customer, make, model, transport)
  const handleVehicleSelect = (vehicleNumber: string) => {
    const vehicleData = (vehicleRegistry as any[]).find(v => v.vehicleNumber === vehicleNumber);

    if (vehicleData) {
      // Auto-fill all vehicle and customer data
      setFormData(prev => ({
        ...prev,
        vehicleNumber: vehicleData.vehicleNumber,
        vehicleMake: vehicleData.vehicleMake,
        vehicleModel: vehicleData.vehicleModel,
        vehicleType: vehicleData.vehicleType,
        transportName: vehicleData.transportName,
        customerId: vehicleData.customerId,
        customerName: vehicleData.customerName,
        customerPhone: vehicleData.customerPhone,
        customerAddress: vehicleData.customerAddress
      }));
      toast.success('✓ Vehicle details auto-filled from registry!');
    } else {
      // New vehicle - just set the number
      setFormData(prev => ({
        ...prev,
        vehicleNumber: vehicleNumber
      }));
    }
  };

  // Service Items Handlers
  const handleAddServiceItem = () => {
    const newItem: ServiceItem = {
      id: `${Date.now()}`,
      serviceId: '',
      serviceName: '',
      quantity: 1,
      rate: 0,
      gst: 0,
      amount: 0
    };
    setServiceItems([...serviceItems, newItem]);
    toast.success('Service item added!');
  };

  const handleRemoveServiceItem = (id: string) => {
    if (serviceItems.length === 1) {
      toast.error('At least one service item is required');
      return;
    }
    setServiceItems(serviceItems.filter(item => item.id !== id));
    toast.success('Service item removed');
  };

  const handleServiceSelect = (itemId: string, serviceName: string) => {
    const activeServices = getActiveServices();
    const selectedService = activeServices.find(s => s.name === serviceName);

    console.log('🔍 Service selected:', serviceName);
    console.log('📦 Found service:', selectedService);

    if (selectedService) {
      setServiceItems(serviceItems.map(item => {
        if (item.id === itemId) {
          const quantity = item.quantity || 1;
          const rate = selectedService.defaultRate;
          const gst = selectedService.gstPercentage;

          // Calculate: Amount = (Qty × Rate) + GST
          const baseAmount = quantity * rate;
          const gstAmount = (baseAmount * gst) / 100;
          const amount = baseAmount + gstAmount;

          console.log('✅ Auto-filling service item:', { quantity, rate, gst, baseAmount, gstAmount, amount });

          return {
            ...item,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            rate: rate,
            gst: gst,
            amount: amount
          };
        }
        return item;
      }));
      toast.success('Service details auto-filled!');
    }
  };

  const handleServiceItemChange = (itemId: string, field: string, value: any) => {
    console.log('🔄 handleServiceItemChange called:', { itemId, field, value });

    setServiceItems(serviceItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };

        // Recalculate amount if quantity, rate, or GST changes
        if (field === 'quantity' || field === 'rate' || field === 'gst') {
          const quantity = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
          const rate = field === 'rate' ? parseFloat(value) || 0 : item.rate;
          const gst = field === 'gst' ? parseFloat(value) || 0 : item.gst;

          // Calculate: Amount = (Qty × Rate) + ((Qty × Rate × GST%) / 100)
          const baseAmount = quantity * rate;
          const gstAmount = (baseAmount * gst) / 100;
          const finalAmount = baseAmount + gstAmount;

          updatedItem.amount = finalAmount;

          console.log('💰 Amount Calculation:', {
            quantity,
            rate,
            gst,
            baseAmount: baseAmount.toFixed(2),
            gstAmount: gstAmount.toFixed(2),
            finalAmount: finalAmount.toFixed(2)
          });
        }

        return updatedItem;
      }
      return item;
    }));
  };

  // Reset form to default values
  const resetForm = () => {
    console.log('🔄 Resetting form to new job card...');
    setFormData({
      customerId: '',
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      vehicleNumber: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleType: 'Car',
      transportName: '',
      kmReading: '',
      date: getCurrentDate(),
      time: getCurrentTime(),
      serviceType: 'Wheel Alignment',
      workType: '',
      beforeFrontCamber: '',
      beforeFrontCaster: '',
      beforeFrontToe: '',
      beforeRearCamber: '',
      beforeRearToe: '',
      afterFrontCamber: '',
      afterFrontCaster: '',
      afterFrontToe: '',
      afterRearCamber: '',
      afterRearToe: '',
      technicianId: '',
      technicianName: '',
      problemReported: '',
      workDone: '',
      remarks: '',
      labourCharge: '',
      partsCharge: '0',
      totalAmount: '',
      vehicleId: '',
      jobCardNo: ''
    });
    setServiceItems([
      {
        id: '1',
        serviceId: '',
        serviceName: '',
        quantity: 1,
        rate: 0,
        gst: 0,
        amount: 0
      }
    ]);
    setIsEditing(false);
    setEditingCardId(null);
    console.log('✅ Form reset complete - Should show 1 empty service item');
  };

  // Handle save job card
  const handleSaveJobCard = async () => {
    if (!isFormValid()) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      jobcard_no: formData.jobCardNo,
      customer_name: formData.customerName,
      phone: formData.customerPhone,
      address: formData.customerAddress,
      vehicle_no: formData.vehicleNumber,
      vehicle_type: formData.vehicleType,
      brand: formData.vehicleMake,
      model: formData.vehicleModel,
      transport_name: formData.transportName,
      km_reading: formData.kmReading,
      service_type: formData.serviceType,
      work_type: formData.workType,
      technician_id: formData.technicianId,
      technician_name: formData.technicianName,
      before_front_camber: formData.beforeFrontCamber,
      before_front_caster: formData.beforeFrontCaster,
      before_front_toe: formData.beforeFrontToe,
      before_rear_camber: formData.beforeRearCamber,
      before_rear_toe: formData.beforeRearToe,
      after_front_camber: formData.afterFrontCamber,
      after_front_caster: formData.afterFrontCaster,
      after_front_toe: formData.afterFrontToe,
      after_rear_camber: formData.afterRearCamber,
      after_rear_toe: formData.afterRearToe,
      service_items: serviceItems,
      complaint: formData.problemReported,
      work_done: formData.workDone,
      remarks: formData.remarks,
      status: 'pending',
      labour_charge: parseFloat(formData.labourCharge) || 0,
      parts_charge: parseFloat(formData.partsCharge) || 0,
      estimated_amount: parseFloat(formData.totalAmount) || 0
    };

    setIsSavingJobCard(true);

    try {
      const response = isEditing && editingCardId
        ? await api.put(endpoints.billing.jobcard.update(editingCardId), payload)
        : await api.post(endpoints.billing.jobcard.create, payload);

      const payloadData: any = response.data;

      if (payloadData?.success && payloadData.data) {
        const savedCard = mapApiJobCard(payloadData.data);
        setJobCards(prev =>
          isEditing && editingCardId
            ? prev.map(card => (card.id === savedCard.id ? savedCard : card))
            : [savedCard, ...prev]
        );
        toast.success(isEditing ? 'Job Card updated successfully!' : 'Job Card created successfully!');
        resetForm();
        if (!isEditing) {
          await fetchNextJobCardNo();
        }
        await fetchJobCards();
        setIsFormExpanded(true); // Keep it open for continuous entry, or false if they want it closed? The prompt says: "When one record is saved successfully, the next new form should automatically show the next available number." and "Open new form -> auto show 002". We'll set isFormExpanded(true) to show it automatically.
      } else {
        toast.error(payloadData?.message || 'Failed to save job card');
      }
    } catch (error: any) {
      console.error('❌ Backend sync failed:', error);
      toast.error(error?.message || 'Failed to save job card');
    } finally {
      setIsSavingJobCard(false);
    }
  };

  // Handle edit
  const handleEdit = (card: JobCard) => {
    console.log('✏️ Editing job card:', card.jobCardNo);
    console.log('📦 Service items in card:', card.serviceItems?.length || 0);

    setFormData({
      customerId: card.customerId,
      customerName: card.customerName,
      customerPhone: card.customerPhone,
      customerAddress: card.customerAddress,
      vehicleNumber: card.vehicleNumber,
      vehicleMake: card.vehicleMake,
      vehicleModel: card.vehicleModel,
      vehicleType: card.vehicleType,
      transportName: card.transportName,
      kmReading: card.kmReading,
      date: card.date,
      time: card.time,
      serviceType: card.serviceType,
      workType: card.workType,
      beforeFrontCamber: card.beforeFrontCamber,
      beforeFrontCaster: card.beforeFrontCaster,
      beforeFrontToe: card.beforeFrontToe,
      beforeRearCamber: card.beforeRearCamber,
      beforeRearToe: card.beforeRearToe,
      afterFrontCamber: card.afterFrontCamber,
      afterFrontCaster: card.afterFrontCaster,
      afterFrontToe: card.afterFrontToe,
      afterRearCamber: card.afterRearCamber,
      afterRearToe: card.afterRearToe,
      technicianId: card.technicianId,
      technicianName: card.technicianName,
      problemReported: card.problemReported,
      workDone: card.workDone,
      remarks: card.remarks,
      labourCharge: card.labourCharge,
      partsCharge: card.partsCharge,
      totalAmount: card.totalAmount,
      vehicleId: card.vehicleId,
      jobCardNo: card.jobCardNo
    });
    setServiceItems(card.serviceItems || [
      {
        id: '1',
        serviceId: '',
        serviceName: '',
        quantity: 1,
        rate: 0,
        gst: 0,
        amount: 0
      }
    ]);
    setIsEditing(true);
    setEditingCardId(card.id);
    setIsFormExpanded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (cardToDelete) {
      try {
        const response = await api.delete(endpoints.billing.jobcard.delete(cardToDelete.id));
        const payload: any = response.data;
        if (payload?.success) {
          setJobCards(prev => prev.filter(card => card.id !== cardToDelete.id));
          toast.success('Job Card deleted successfully!');
          await fetchJobCards();
        } else {
          toast.error(payload?.message || 'Failed to delete job card');
        }
      } catch (error: any) {
        console.error('Error deleting job card:', error);
        toast.error(error?.message || 'Failed to delete job card');
      } finally {
        setDeleteModalOpen(false);
        setCardToDelete(null);
      }
    }
  };


  // Filter and search job cards
  const filteredJobCards = jobCards.filter(card => {
    const matchesSearch =
      card.jobCardNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'All' || card.status === filterStatus;

    return matchesSearch && matchesFilter;
  });


  // Debug: Log vehicle registry
  useEffect(() => {
    console.log('🚗 Job Card - Vehicle Registry loaded:', vehicleRegistry.length);
    console.log('📋 Registered Vehicles from Context:', registeredVehicles.length);
    if (vehicleRegistry.length > 0) {
      console.log('🔍 Sample vehicle:', vehicleRegistry[0]);
    }
  }, [vehicleRegistry, registeredVehicles]);

  // Get vehicle options for dropdown
  const vehicleOptions = vehicleRegistry.map(v => ({
    value: v.vehicleNumber,
    label: v.vehicleNumber
  }));

  // Get customer options
  const customerOptions = React.useMemo(() => {
    const options = customers
      .filter(c => c.isActive)
      .map(c => ({
        value: c.id,
        label: c.name
      }));
    console.log('🎯 Customer Options Generated:', options.length, options);
    return options;
  }, [customers]);

  // Get vehicle make options
  const vehicleMakeOptions = React.useMemo(() => {
    return getActiveVehicleMakes()
      .map(vm => vm.name);
  }, [getActiveVehicleMakes]);

  // Get vehicle model options
  const vehicleModelOptions = formData.vehicleMake
    ? getModelsByMake(formData.vehicleMake)
    : [];

  // Get transport options
  const transportOptions = React.useMemo(() => {
    const options = transports
      .filter(t => t.status === 'Active')
      .map(t => t.name);
    console.log('🚛 Transport Options Generated:', options.length, options);
    return options;
  }, [transports]);

  // Get work type options
  const workTypeOptions = workTypes
    .filter(wt => wt.status === 'Active')
    .map(wt => wt.workTypeName);

  // Get technician options
  const technicianOptions = React.useMemo(() => {
    const options = staff
      .filter(s => s.status === 'Active')
      .map(s => s.name);
    console.log('👨‍🔧 Technician Options Generated:', options.length, options);
    return options;
  }, [staff]);

  const cardClass = getCardClass(isDarkMode);
  const inputClass = getInputClass(isDarkMode);
  const labelClass = getLabelClass(isDarkMode);
  const primaryButtonClass = getPrimaryButtonClass();
  const secondaryButtonClass = getSecondaryButtonClass(isDarkMode);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Job Card Management
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and manage job cards for vehicle services
          </p>
        </div>

        {/* New Job Card Button */}
        {isEditing && (
          <button
            onClick={() => {
              resetForm();
              setIsFormExpanded(true);
            }}
            className={`${primaryButtonClass} flex items-center gap-2`}
          >
            <Plus className="w-4 h-4" />
            New Job Card
          </button>
        )}
      </div>

      {/* Job Card Form Section */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Form Header with Collapse Toggle */}
        <div
          className="flex items-center justify-between cursor-pointer pb-4 border-b border-gray-200 dark:border-gray-700"
          onClick={() => setIsFormExpanded(!isFormExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <FileText className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isEditing ? 'Edit Job Card' : 'New Job Card'}
                </h2>
                {isEditing && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                    Editing Mode
                  </span>
                )}
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {isFormExpanded ? 'Click to collapse' : 'Click to expand'}
                {isEditing && ' • Click "New Job Card" button above to create new'}
              </p>
            </div>
          </div>
          {isFormExpanded ? (
            <ChevronUp className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          ) : (
            <ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          )}
        </div>

        {/* Form Content */}
        <AnimatePresence>
          {isFormExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="!overflow-visible"
            >
              <div className="pt-6 space-y-6">
                {/* Section 1: Job Card Information */}
                <div>
                  <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <FileText className="w-4 h-4" />
                    Job Card Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>
                        Job Card No <span className="text-gray-400 text-xs">(Auto-generated)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.jobCardNo || ''}
                        className={inputClass}
                        disabled
                        placeholder="Auto-generated"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className={inputClass}
                        style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className={inputClass}
                        style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Smart Auto-Fill Info Banner */}
                <div className={`p-4 rounded-lg border-l-4 ${isDarkMode
                  ? 'bg-blue-500/10 border-blue-500 text-blue-300'
                  : 'bg-blue-50 border-blue-500 text-blue-700'
                  }`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold mb-1">Smart Auto-Fill Enabled</p>
                      <p className={isDarkMode ? 'text-blue-200/80' : 'text-blue-600/80'}>
                        Type a <strong>Vehicle Number</strong> to auto-fill customer details, vehicle make/model, and transport from history.
                        Or select a <strong>Customer Name</strong> to auto-fill mobile and address from Masters.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Customer Information */}
                <div>
                  <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <User className="w-4 h-4" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        Customer Name <span className="text-red-500">*</span>
                        {vehicleRegistry.find(v => v.vehicleNumber === formData.vehicleNumber) &&
                          <span className="text-green-500 text-xs ml-2">(Auto-filled from vehicle)</span>
                        }
                      </label>
                      <SearchableDropdown
                        options={customerOptions}
                        value={formData.customerId}
                        onChange={handleCustomerSelect}
                        placeholder="Select Customer"
                        isDarkMode={isDarkMode}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Mobile Number <span className="text-green-500 text-xs">(Auto-filled)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.customerPhone}
                        className={inputClass}
                        disabled
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Address</label>
                      <input
                        type="text"
                        value={formData.customerAddress}
                        onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                        className={inputClass}
                        placeholder="Enter customer address"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Vehicle Information */}
                <div>
                  <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Car className="w-4 h-4" />
                    Vehicle Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className={labelClass}>
                        Vehicle Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.vehicleNumber}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            handleInputChange('vehicleNumber', value);
                            // Check if this vehicle exists in registry and auto-fill
                            const vehicleData = vehicleRegistry.find(v => v.vehicleNumber === value);
                            if (vehicleData) {
                              handleVehicleSelect(value);
                            }
                          }}
                          onBlur={(e) => {
                            // Auto-fill on blur if exact match found
                            const value = e.target.value.toUpperCase();
                            const vehicleData = vehicleRegistry.find(v => v.vehicleNumber === value);
                            if (vehicleData) {
                              handleVehicleSelect(value);
                            }
                          }}
                          className={getRequiredFieldClass(formData.vehicleNumber, isDarkMode)}
                          placeholder="Type or select: KA-01-AB-1234"
                          list="vehicle-history"
                        />
                        <datalist id="vehicle-history">
                          {vehicleRegistry.map((vehicle, idx) => (
                            <option
                              key={idx}
                              value={vehicle.vehicleNumber}
                            />
                          ))}
                        </datalist>
                        {vehicleRegistry.length > 0 && (
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                            💡 {vehicleRegistry.length} vehicles in registry - Start typing to see suggestions
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="!overflow-visible">
                      <label className={labelClass}>
                        Vehicle Make <span className="text-red-500">*</span>
                        {vehicleRegistry.find(v => v.vehicleNumber === formData.vehicleNumber) &&
                          <span className="text-green-500 text-xs ml-2">✓ Auto-filled from registry</span>
                        }
                      </label>
                      <SearchableDropdown
                        options={vehicleMakeOptions}
                        value={formData.vehicleMake}
                        onChange={(value) => handleInputChange('vehicleMake', value)}
                        placeholder="Select Vehicle Make"
                        isDarkMode={isDarkMode}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Vehicle Model
                        {vehicleRegistry.find(v => v.vehicleNumber === formData.vehicleNumber) &&
                          <span className="text-green-500 text-xs ml-2">✓ Auto-filled from registry</span>
                        }
                      </label>
                      <div className="relative">
                        <input
                          list="jobcard-available-models"
                          value={formData.vehicleModel}
                          onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                          className={inputClass}
                          placeholder="Select or type model"
                          disabled={!formData.vehicleMake}
                          autoComplete="off"
                        />
                        <datalist id="jobcard-available-models">
                          {vehicleModelOptions.map((model, index) => (
                            <option key={index} value={model} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Vehicle Type
                        {vehicleRegistry.find(v => v.vehicleNumber === formData.vehicleNumber) && formData.vehicleType &&
                          <span className="text-green-500 text-xs ml-2">(Auto-filled from registry)</span>
                        }
                      </label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                        className={inputClass}
                      >
                        <option value="Car">Car</option>
                        <option value="Truck">Truck</option>
                        <option value="Bus">Bus</option>
                        <option value="Bike">Bike</option>
                        <option value="Auto">Auto</option>
                        <option value="Trailer">Trailer</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Transport Name
                        {vehicleRegistry.find(v => v.vehicleNumber === formData.vehicleNumber) && formData.transportName &&
                          <span className="text-green-500 text-xs ml-2">(Auto-filled from history)</span>
                        }
                      </label>
                      <SearchableDropdown
                        options={transportOptions}
                        value={formData.transportName}
                        onChange={(value) => handleInputChange('transportName', value)}
                        placeholder="Select Transport"
                        isDarkMode={isDarkMode}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>KM Reading</label>
                      <input
                        type="text"
                        value={formData.kmReading}
                        onChange={(e) => handleInputChange('kmReading', e.target.value)}
                        className={inputClass}
                        placeholder="Enter KM reading"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Service Details */}
                <div>
                  <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Wrench className="w-4 h-4" />
                    Service Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        Service Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => handleInputChange('serviceType', e.target.value)}
                        className={inputClass}
                      >
                        <option value="Wheel Alignment">Wheel Alignment</option>
                        <option value="Wheel Balancing">Wheel Balancing</option>
                        <option value="Tyre Change">Tyre Change</option>
                        <option value="General Service">General Service</option>
                        <option value="Repair">Repair</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Work Type</label>
                      <SearchableDropdown
                        options={workTypeOptions}
                        value={formData.workType}
                        onChange={(value) => handleInputChange('workType', value)}
                        placeholder="Select Work Type"
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Alignment Details (Collapsible) */}
                {formData.serviceType === 'Wheel Alignment' && (
                  <div>
                    <div className={`flex items-center justify-between mb-4`}>
                      <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <AlertCircle className="w-4 h-4" />
                        Alignment Measurements
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAlignmentExpanded(!isAlignmentExpanded)}
                        className={`p-1.5 rounded-lg transition-all duration-200 ${isDarkMode
                          ? 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200'
                          : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                          }`}
                        aria-label={isAlignmentExpanded ? "Collapse alignment fields" : "Expand alignment fields"}
                      >
                        {isAlignmentExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <AnimatePresence>
                      {isAlignmentExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="!overflow-visible"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Before Alignment */}
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Before Alignment
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <label className={`${labelClass} text-xs`}>Front Camber</label>
                                  <input
                                    type="text"
                                    value={formData.beforeFrontCamber}
                                    onChange={(e) => handleInputChange('beforeFrontCamber', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g., -0.5°"
                                  />
                                </div>
                                <div>
                                  <label className={`${labelClass} text-xs`}>Front Caster</label>
                                  <input
                                    type="text"
                                    value={formData.beforeFrontCaster}
                                    onChange={(e) => handleInputChange('beforeFrontCaster', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g., 3.0°"
                                  />
                                </div>
                                <div>
                                  <label className={`${labelClass} text-xs`}>Front Toe</label>
                                  <input
                                    type="text"
                                    value={formData.beforeFrontToe}
                                    onChange={(e) => handleInputChange('beforeFrontToe', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g., 0.10°"
                                  />
                                </div>
                                <div>
                                  <label className={`${labelClass} text-xs`}>Rear Camber</label>
                                  <input
                                    type="text"
                                    value={formData.beforeRearCamber}
                                    onChange={(e) => handleInputChange('beforeRearCamber', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g., -0.3°"
                                  />
                                </div>
                                <div>
                                  <label className={`${labelClass} text-xs`}>Rear Toe</label>
                                  <input
                                    type="text"
                                    value={formData.beforeRearToe}
                                    onChange={(e) => handleInputChange('beforeRearToe', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g., 0.05°"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* After Alignment */}
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
                              <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                                After Alignment
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <label className={`${labelClass} text-xs`}>Front Camber</label>
                                  <input
                                    type="text"
                                    value={formData.afterFrontCamber}
                                    onChange={(e) => handleInputChange('afterFrontCamber', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g., 0.0°"
                                  />
                                </div>
                                <div>
                                  <label className={`${labelClass} text-xs`}>Front Caster</label>
                                  <input
                                    type="text"
                                    value={formData.afterFrontCaster}
                                    onChange={(e) => handleInputChange('afterFrontCaster', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g., 3.5°"
                                  />
                                </div>
                                <div>
                                  <label className={`${labelClass} text-xs`}>Front Toe</label>
                                  <input
                                    type="text"
                                    value={formData.afterFrontToe}
                                    onChange={(e) => handleInputChange('afterFrontToe', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g., 0.0°"
                                  />
                                </div>
                                <div>
                                  <label className={`${labelClass} text-xs`}>Rear Camber</label>
                                  <input
                                    type="text"
                                    value={formData.afterRearCamber}
                                    onChange={(e) => handleInputChange('afterRearCamber', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g., 0.0°"
                                  />
                                </div>
                                <div>
                                  <label className={`${labelClass} text-xs`}>Rear Toe</label>
                                  <input
                                    type="text"
                                    value={formData.afterRearToe}
                                    onChange={(e) => handleInputChange('afterRearToe', e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g., 0.0°"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Section 6: Staff Details */}
                <div>
                  <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <User className="w-4 h-4" />
                    Staff Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        Technician Name <span className="text-red-500">*</span>
                      </label>
                      <SearchableDropdown
                        options={technicianOptions}
                        value={formData.technicianName}
                        onChange={(value) => handleInputChange('technicianName', value)}
                        placeholder="Select Technician"
                        isDarkMode={isDarkMode}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Staff ID <span className="text-gray-400 text-xs">(Auto-filled)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.technicianId}
                        className={inputClass}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Section 7: Work Description */}
                <div>
                  <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <FileText className="w-4 h-4" />
                    Work Description
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Problem Reported</label>
                      <textarea
                        value={formData.problemReported}
                        onChange={(e) => handleInputChange('problemReported', e.target.value)}
                        className={inputClass}
                        rows={3}
                        placeholder="Describe the problem reported by customer"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Work Done</label>
                      <textarea
                        value={formData.workDone}
                        onChange={(e) => handleInputChange('workDone', e.target.value)}
                        className={inputClass}
                        rows={3}
                        placeholder="Describe the work performed"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Remarks</label>
                      <textarea
                        value={formData.remarks}
                        onChange={(e) => handleInputChange('remarks', e.target.value)}
                        className={inputClass}
                        rows={2}
                        placeholder="Any additional remarks"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 7.5: Service Items */}
                <ServiceItemsTable
                  serviceItems={serviceItems}
                  services={services}
                  isDarkMode={isDarkMode}
                  onAddItem={handleAddServiceItem}
                  onRemoveItem={handleRemoveServiceItem}
                  onServiceSelect={handleServiceSelect}
                  onItemChange={handleServiceItemChange}
                />

                {/* Section 8: Billing Details */}
                <div>
                  <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <FileText className="w-4 h-4" />
                    Billing Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Labour Charge (₹)</label>
                      <input
                        type="number"
                        value={formData.labourCharge}
                        onChange={(e) => handleInputChange('labourCharge', e.target.value)}
                        className={inputClass}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Parts Charge (₹)</label>
                      <input
                        type="number"
                        value={formData.partsCharge}
                        onChange={(e) => handleInputChange('partsCharge', e.target.value)}
                        className={inputClass}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Total Amount (₹) <span className="text-gray-400 text-xs">(Service Items + Billing)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.totalAmount ? `₹${parseFloat(formData.totalAmount).toFixed(2)}` : '₹0.00'}
                        className={`${inputClass} font-bold text-lg ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={resetForm}
                    className={secondaryButtonClass}
                  >
                    <X className="w-4 h-4" />
                    {isEditing ? 'Cancel Edit' : 'Clear Form'}
                  </button>
                  <button
                    onClick={handleSaveJobCard}
                    disabled={!isFormValid() || isSavingJobCard}
                    className={`${primaryButtonClass} ${(!isFormValid() || isSavingJobCard) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSavingJobCard ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSavingJobCard
                      ? 'Saving...'
                      : isEditing
                        ? 'Update Job Card'
                        : 'Save Job Card'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Job Card History Section */}
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* History Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Clock className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Job Card History
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredJobCards.length} job card{filteredJobCards.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              fetchJobCards();
              toast.success('Job cards refreshed!');
            }}
            className={secondaryButtonClass}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job card no, customer, vehicle..."
              className={`${inputClass} pl-10`}
            />
          </div>

          {/* Filter by Status */}
          <div className="relative">
            <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`${inputClass} pl-10`}
            >
              <option value="All">All Status</option>
              <option value="Draft">Draft</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Billed">Billed</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Job Card No
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer Name
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Vehicle Number
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Service Type
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Technician
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </th>
                  <th className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {isJobCardLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <RefreshCw className="w-6 h-6 mx-auto animate-spin text-blue-500 mb-2" />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Loading job cards from database...
                      </p>
                    </td>
                  </tr>
                ) : filteredJobCards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <FileText className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No job cards found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredJobCards.map((card) => (
                    <tr
                      key={card.id}
                      className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}
                    >
                      <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {card.jobCardNo}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {new Date(card.date).toLocaleDateString()}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {card.customerName}
                      </td>
                      <td className={`px-4 py-3 text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {card.vehicleNumber}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {card.serviceType}
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {card.technicianName}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${card.status === 'Completed'
                          ? isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                          : card.status === 'In Progress'
                            ? isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                            : card.status === 'Billed'
                              ? isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                              : isDarkMode ? 'bg-gray-600/20 text-gray-400' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {card.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setCardToView(card);
                              setViewModalOpen(true);
                            }}
                            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 group ${isDarkMode
                              ? 'hover:bg-blue-500/20 text-gray-400'
                              : 'hover:bg-blue-50 text-gray-500'
                              }`}
                            title="View Details"
                          >
                            <Eye className={`w-4 h-4 transition-colors ${isDarkMode ? 'group-hover:text-blue-400' : 'group-hover:text-blue-600'}`} />
                          </button>

                          <button
                            onClick={() => handleEdit(card)}
                            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 group ${isDarkMode
                              ? 'hover:bg-yellow-500/20 text-gray-400'
                              : 'hover:bg-yellow-50 text-gray-500'
                              }`}
                            title="Edit Job Card"
                          >
                            <Edit2 className={`w-4 h-4 transition-colors ${isDarkMode ? 'group-hover:text-yellow-400' : 'group-hover:text-yellow-600'}`} />
                          </button>

                          <button
                            onClick={() => handlePrint(card)}
                            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 group ${isDarkMode
                              ? 'hover:bg-green-500/20 text-gray-400'
                              : 'hover:bg-green-50 text-gray-500'
                              }`}
                            title="Print Job Card"
                          >
                            <Printer className={`w-4 h-4 transition-colors ${isDarkMode ? 'group-hover:text-green-400' : 'group-hover:text-green-600'}`} />
                          </button>

                          <button
                            onClick={() => {
                              setCardToDelete(card);
                              setDeleteModalOpen(true);
                            }}
                            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 group ${isDarkMode
                              ? 'hover:bg-red-500/20 text-gray-400'
                              : 'hover:bg-red-50 text-gray-500'
                              }`}
                            title="Delete Record"
                          >
                            <Trash2 className={`w-4 h-4 transition-colors ${isDarkMode ? 'group-hover:text-red-400' : 'group-hover:text-red-600'}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* View Modal */}
      <AnimatePresence>
        {viewModalOpen && cardToView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9990] flex items-center justify-center p-4"
            onClick={() => setViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
                }`}
            >
              {/* Modal Header */}
              <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-blue-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Job Card Details
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {cardToView.jobCardNo}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePrint(cardToView)}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 group ${isDarkMode
                        ? 'hover:bg-green-500/20 text-gray-400'
                        : 'hover:bg-green-50 text-gray-500'
                        }`}
                      title="Print Job Card"
                    >
                      <Printer className={`w-5 h-5 transition-colors ${isDarkMode ? 'group-hover:text-green-400' : 'group-hover:text-green-600'}`} />
                    </button>
                    <button
                      onClick={() => setViewModalOpen(false)}
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                        }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Customer Name</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cardToView.customerName}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cardToView.customerPhone}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vehicle Number</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cardToView.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vehicle Make/Model</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {cardToView.vehicleMake} {cardToView.vehicleModel}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Service Type</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cardToView.serviceType}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Technician</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cardToView.technicianName}</p>
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(cardToView.date).toLocaleDateString()} {cardToView.time}
                    </p>
                  </div>
                </div>

                {/* Service Items Table */}
                {cardToView.serviceItems && cardToView.serviceItems.length > 0 && (
                  <div>
                    <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Service Items</p>
                    <div className={`border rounded-lg overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <table className="w-full">
                        <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                          <tr>
                            <th className={`px-4 py-2 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service</th>
                            <th className={`px-4 py-2 text-right text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Qty</th>
                            <th className={`px-4 py-2 text-right text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rate</th>
                            <th className={`px-4 py-2 text-right text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {cardToView.serviceItems.map((item) => (
                            <tr key={item.id}>
                              <td className={`px-4 py-2 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.serviceName}</td>
                              <td className={`px-4 py-2 text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.quantity}</td>
                              <td className={`px-4 py-2 text-sm text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.rate.toFixed(2)}</td>
                              <td className={`px-4 py-2 text-sm text-right font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.amount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && cardToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-md rounded-2xl shadow-2xl p-6 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Confirm Deletion
              </h2>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Are you sure you want to delete job card{' '}
                <strong>{cardToDelete.jobCardNo}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className={getPrimaryButtonClass()}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print Modal */}
      <AnimatePresence>
        {isPrintModalOpen && printData && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPrintModalOpen(false)}
          >
            <JobCardPrintView
              data={printData}
              company={companyData}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
