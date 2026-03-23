import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Printer,
  Plus,
  Trash2,
  Search,
  Calendar,
  User,
  Car,
  FileText,
  RefreshCw,
  Edit2,
  Eye,
  X,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { useLabourBills } from '@/contexts/LabourBillContext';
import { useEstimations } from '@/contexts/EstimationContext';
import { useSales } from '@/contexts/SalesContext';
import { usePurchases } from '@/contexts/PurchaseContext';
import { useMasters } from '@/contexts/MastersContext';
import { useItemsServices } from '@/contexts/ItemsServicesContext';
import { useCustomers } from '@/contexts/CustomerContext';
import { useSuppliers } from '@/contexts/SupplierContext';
import { toast } from 'sonner';
import { UnifiedPrintPreview } from '@/components/print/UnifiedPrintPreview';
import { api, endpoints } from '@/services/api';
import { getInputClass, getLabelClass, getPrimaryButtonClass, getSecondaryButtonClass, getCardClass } from '@/utils/formStyles';
import { getCurrentDate, getCurrentTime } from '@/utils/formatting/dateTimeUtils';

interface BillingItem {
  id: string;
  itemName: string;
  quantity: number;
  rate: number;
  gst: number;
  amount: number;
}

interface Customer {
  id?: string;
  name: string;
  mobile: string;
  address?: string;
  email?: string;
}

interface BillHistoryRecord {
  id: string;
  billNo: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  vehicleNumber: string;
  vehicleModel: string;
  vehicleMake?: string;
  kmReading?: string;
  fuelLevel?: string;
  subtotal: number;
  totalGST: number;
  discount: number;
  grandTotal: number;
  status: string;
  items: BillingItem[];
}

interface BillingScreenEnhancedProps {
  isDarkMode: boolean;
  billType: 'labour' | 'estimation' | 'sales' | 'purchase';
  title: string;
  billPrefix: string;
  onNavigate?: (screen: string, data?: any) => void;
  editBill?: any;
}

export function BillingScreenEnhanced({ isDarkMode, billType, title, billPrefix, onNavigate, editBill }: BillingScreenEnhancedProps) {
  const { addLabourBill, updateLabourBill, deleteLabourBill, labourBills, refreshLabourBills, getNextBillNumber } = useLabourBills();
  const { estimations, addEstimation, updateEstimation, deleteEstimation, refreshEstimations } = useEstimations();
  const { sales, addSale, updateSale, deleteSale, refreshSales } = useSales();
  const { purchases, addPurchase, updatePurchase, deletePurchase, refreshPurchases } = usePurchases();
  const { vehicleMakes, getModelsByMake } = useMasters();
  const { itemsServices } = useItemsServices();
  const { customers } = useCustomers();
  const { suppliers } = useSuppliers();
  const [items, setItems] = useState<BillingItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [customerId, setCustomerId] = useState(''); // Store customer ID
  const [customerName, setCustomerName] = useState(''); // Store customer name for display
  const [customerAddress, setCustomerAddress] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleMakeDropdown, setVehicleMakeDropdown] = useState(''); // For dropdown selection
  const [kmReading, setKmReading] = useState('');
  const [fuelLevel, setFuelLevel] = useState('');
  const [billDate, setBillDate] = useState(getCurrentDate());
  const [billTime, setBillTime] = useState(getCurrentTime());
  const [currentBillNumber, setCurrentBillNumber] = useState('');

  const [status, setStatus] = useState<'Completed' | 'Pending' | 'Cancelled'>('Completed');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editBillId, setEditBillId] = useState<string | null>(null);
  const [newlyAddedItemId, setNewlyAddedItemId] = useState<string | null>(null); // Track newly added item
  const [showItemSelector, setShowItemSelector] = useState(true); // Show item selector when no items
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  const getCurrentBills = useCallback(() => {
    switch (billType) {
      case 'estimation': return estimations;
      case 'sales': return sales;
      case 'purchase': return purchases;
      case 'labour':
      default: return labourBills;
    }
  }, [billType, estimations, labourBills, sales, purchases]);

  const currentBills = getCurrentBills();

  // Validation states
  const [errors, setErrors] = useState({
    billNo: false,
    billDate: false,
    billTime: false,
    customerName: false,
    vehicleNumber: false
  });

  const [touched, setTouched] = useState({
    billNo: false,
    billDate: false,
    billTime: false,
    customerName: false,
    vehicleNumber: false
  });

  // Load editBill data when provided
  useEffect(() => {
    if (editBill) {
      console.log('Loading edit bill:', editBill);
      setIsEditMode(true);
      setEditBillId(editBill.id);
      setCurrentBillNumber(editBill.billNo);
      setBillDate(editBill.date);
      setBillTime(editBill.time);
      setCustomerName(editBill.customerName);
      setCustomerPhone(editBill.customerPhone || '');
      setCustomerAddress(editBill.customerAddress || '');
      setVehicleNumber(editBill.vehicleNumber);
      setVehicleMakeDropdown(editBill.vehicleMake || '');
      setVehicleModel(editBill.vehicleModel);
      setKmReading(editBill.kmReading || '');
      setFuelLevel(editBill.fuelLevel || '');
      setStatus(editBill.status || 'Completed');
      setDiscount(editBill.discount || 0);
      setItems(editBill.items || []);
      toast.info(`Editing bill ${editBill.billNo}`);
    }
  }, [editBill]);

  // Fetch next bill number from backend
  const fetchNextBillNumber = async () => {
    try {
      let endpoint = '';
      if (billType === 'estimation') endpoint = '/estimations/next-number';
      else if (billType === 'labour') endpoint = '/labour-bills/next-number';
      else if (billType === 'sales') endpoint = '/inventory/sales/next-number';
      else if (billType === 'purchase') endpoint = '/inventory/purchases/next-number';

      if (endpoint) {
        console.log(`📡 Fetching next ${billType} number from ${endpoint}...`);
        const response = await api.get(endpoint);

        if (response.success && response.data) {
          // Robust extraction: check both response.data.data and response.data
          const billNo =
            (typeof response.data.data === 'string' ? response.data.data : null) ||
            (typeof response.data === 'string' ? response.data : null) ||
            response.data.data?.bill_no ||
            response.data.bill_no ||
            response.data.data?.jobcard_no ||
            currentBillNumber; // Fallback to current if still nothing

          if (billNo && typeof billNo === 'string') {
            setCurrentBillNumber(billNo);
            console.log(`✅ Fetched next ${billType} number: ${billNo}`);
          } else {
            console.error(`⚠️ Could not find a valid number in response for ${billType}`, response.data);
          }
        }
      }
    } catch (err) {
      console.error(`❌ Failed to fetch next ${billType} number:`, err);
      toast.error(`Could not fetch next ${billType} number. Please refresh.`);
    }
  };

  // Initial fetch for create mode
  useEffect(() => {
    if (!isEditMode) {
      fetchNextBillNumber();
    }
  }, [isEditMode, billType]);

  // Automatically load all items from Items/Services master on mount - OPTIMIZED
  useEffect(() => {
    // Only load items automatically if not in edit mode and items are empty
    if (!isEditMode && items.length === 0 && itemsServices.length > 0) {
      const serviceItems = itemsServices.filter(
        item => item.type === 'Service' && item.status === 'Active'
      );

      if (serviceItems.length > 0) {
        const loadedItems: BillingItem[] = serviceItems.map((item, index) => {
          const quantity = 1;
          const rate = item.defaultRate || 0;
          const gst = item.gstPercentage || 0;
          const baseAmount = quantity * rate;
          const gstAmount = (baseAmount * gst) / 100;
          const amount = baseAmount + gstAmount;

          return {
            id: `${item.id}-${Date.now()}-${index}`,
            itemName: item.name,
            quantity,
            rate,
            gst,
            amount
          };
        });

        setItems(loadedItems);
        console.log('✅ Auto-loaded items from master:', loadedItems.length);
      }
    }
  }, [isEditMode]); // Only run when edit mode changes

  // We removed local auto-renumbering hooks as it's now fetched reliably from backend when needed

  // Update showItemSelector based on items
  useEffect(() => {
    setShowItemSelector(items.length === 0 && !isEditMode);
  }, [items.length, isEditMode]);

  // Create customer dropdown options
  const customerOptions = customers
    .filter(c => c.isActive) // Only show active customers
    .map(c => ({
      value: String(c.id), // Use customer ID as value
      label: `${c.name} - ${c.phone}` // Use 'phone' not 'mobile'
    }));

  // Create supplier dropdown options
  const supplierOptions = suppliers
    .map(s => ({
      value: String(s.id),
      label: s.name
    }));

  // Create vehicle make dropdown options - filter only active makes
  const vehicleMakeOptions = vehicleMakes
    .filter(vm => vm.status === 'Active')
    .map(vm => vm.name);

  const vehicleModelOptions = vehicleMakeDropdown 
    ? getModelsByMake(vehicleMakeDropdown)
    : [];

  // Create item options from items/services master
  const itemOptions = itemsServices
    .filter(item => item.type === 'Service' && item.status === 'Active')
    .map(item => ({
      value: item.name,
      label: `${item.name} (₹${item.defaultRate})`
    }));

  const handleCustomerChange = (customerId: string) => {
    console.log('🔍 Selected customer ID or Typed Name:', customerId);
    setCustomerId(customerId);

    // Find customer by ID
    const selectedCustomer = customers.find(c => String(c.id) === customerId);
    console.log('📞 Found customer:', selectedCustomer);

    if (selectedCustomer) {
      setCustomerPhone(selectedCustomer.phone);
      setCustomerAddress(selectedCustomer.address || '');
      setCustomerName(selectedCustomer.name);
      console.log('✅ Auto-filled phone:', selectedCustomer.phone);
    } else {
      setCustomerPhone('');
      setCustomerAddress('');
      setCustomerName(customerId); // Keep the raw typed text!
      console.log('ℹ️ Customer not found - using raw text as customer name');
    }
  };

  const handleSupplierChange = (supplierId: string) => {
    console.log('🔍 Selected supplier ID:', supplierId);
    setCustomerId(supplierId);

    const selectedSupplier = suppliers.find(s => String(s.id) === supplierId);
    if (selectedSupplier) {
      setCustomerPhone(selectedSupplier.mobile || '');
      setCustomerAddress(selectedSupplier.address || '');
      setCustomerName(selectedSupplier.name);
      console.log('✅ Auto-filled supplier:', selectedSupplier.name);
    } else {
      setCustomerPhone('');
      setCustomerAddress('');
      setCustomerName(supplierId);
    }
  };

  const addItem = () => {
    // Prevent adding multiple empty rows
    const lastItem = items[items.length - 1];
    if (items.length > 0 && (!lastItem.itemName || lastItem.itemName.trim() === '')) {
      toast.warning('Please fill the current item details before adding a new row');
      return;
    }

    const newItem: BillingItem = {
      id: Date.now().toString(),
      itemName: '',
      quantity: 1,
      rate: 0,
      gst: 0,
      amount: 0
    };
    setItems([...items, newItem]);
    setNewlyAddedItemId(newItem.id); 
  };


  const updateItem = (id: string, field: keyof BillingItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate amount
        const baseAmount = updatedItem.quantity * updatedItem.rate;
        const gstAmount = (baseAmount * updatedItem.gst) / 100;
        updatedItem.amount = baseAmount + gstAmount;
        return updatedItem;
      }
      return item;
    }));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success('Item removed');
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateTotalGST = () => {
    return items.reduce((sum, item) => {
      const baseAmount = item.quantity * item.rate;
      return sum + (baseAmount * item.gst / 100);
    }, 0);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const totalGST = calculateTotalGST();
    return subtotal + totalGST - discount;
  };

  const handleSave = () => {
    // Mark all fields as touched
    setTouched({
      billNo: true,
      billDate: true,
      billTime: true,
      customerName: true,
      vehicleNumber: true
    });

    // Validate required fields
    const newErrors = {
      billNo: !currentBillNumber,
      billDate: !billDate,
      billTime: billType === 'estimation' ? false : !billTime,
      customerName: !customerName,
      vehicleNumber: !vehicleNumber
    };

    setErrors(newErrors);

    const validItems = items.filter(item => item.itemName && item.itemName.toString().trim() !== '');

    // Tell the user EXACTLY what is missing
    const missingFields = [];
    if (!currentBillNumber) missingFields.push('Bill No');
    if (!billDate) missingFields.push('Date');
    if (billType !== 'estimation' && billType !== 'purchase' && billType !== 'sales' && !billTime) missingFields.push('Time');
    const nameLabel = billType === 'purchase' ? 'Supplier Name' : 'Customer Name';
    if (!customerName) missingFields.push(nameLabel);
    if (billType !== 'purchase' && billType !== 'sales' && !vehicleNumber) missingFields.push('Vehicle Number');

    console.log('--- SAVE VALIDATION TRIGGERED ---');
    console.log('Raw Items:', items);
    console.log('Valid Items identified:', validItems);
    console.log('Missing Fields detected:', missingFields);

    if (missingFields.length > 0) {
      toast.error(`Required: ${missingFields.join(', ')}`);
      return;
    }

    if (billType === 'purchase' && !customerId) {
      toast.error('Please select a valid supplier from the list');
      return;
    }

    if (validItems.length === 0) {
      toast.error('Please add at least one valid item row');
      return;
    }

    const billData: BillHistoryRecord = {
      id: isEditMode && editBillId ? editBillId : `${billPrefix}-${Date.now()}`,
      billNo: currentBillNumber,
      date: billDate,
      time: billTime,
      customerName,
      customerPhone,
      customerAddress,
      vehicleNumber,
      vehicleMake: vehicleMakeDropdown,
      vehicleModel,
      kmReading,
      fuelLevel,
      subtotal: calculateSubtotal(),
      totalGST: calculateTotalGST(),
      discount,
      grandTotal: calculateGrandTotal(),
      status,
      items
    };

    if (billType === 'estimation') {
      const saveEstimationFlow = async () => {
        try {
          const estimationData = {
            id: isEditMode && editBillId ? editBillId : '',
            billNo: currentBillNumber,
            date: billDate,
            time: billTime,
            customerName: customerName.split(' - ')[0] || customerName,
            customerPhone: customerPhone,
            customerAddress: customerAddress,
            vehicleNumber: vehicleNumber,
            vehicleMake: vehicleMakeDropdown,
            vehicleModel: vehicleModel,
            kmReading: kmReading,
            fuelLevel: fuelLevel,
            grandTotal: calculateGrandTotal(),
            status,
            items: validItems.map((item, i) => ({
              id: i + 1,
              itemName: item.itemName,
              quantity: item.quantity,
              rate: item.rate,
              gst: item.gst,
              amount: item.amount
            }))
          };

          if (isEditMode && editBillId) {
            await updateEstimation(editBillId, estimationData);
          } else {
            await addEstimation(estimationData as any);
          }

          handleReset();
          await fetchNextBillNumber();
        } catch (error: any) {
          console.error('[BillingPage] Estimation save failed:', error);
        }
      };
      saveEstimationFlow();
      return;
    }

    // Sales Bill
    if (billType === 'sales') {
      const saveSaleFlow = async () => {
        try {
          const saleData = {
            billNo: currentBillNumber,
            date: billDate,
            customerName: customerName.split(' - ')[0] || customerName,
            customerPhone: customerPhone,
            items: validItems.map((item, i) => ({ id: i + 1, itemName: item.itemName, quantity: item.quantity, rate: item.rate, gst: item.gst, amount: item.amount })),
            subtotal: calculateSubtotal(),
            totalGST: calculateTotalGST(),
            discount,
            grandTotal: calculateGrandTotal(),
            paymentMode: 'Cash',
            status: 'Completed'
          };

          if (isEditMode && editBillId) {
            await updateSale(editBillId, saleData);
          } else {
            await addSale(saleData);
          }

          handleReset();
          await fetchNextBillNumber();
        } catch (error: any) {
          console.error('[BillingPage] Sale save failed:', error);
        }
      };
      saveSaleFlow();
      return;
    }

    // Purchase Bill
    if (billType === 'purchase') {
      const savePurchase = async () => {
        try {
          if (!customerId) {
            toast.error('Please select a valid supplier');
            return;
          }

          const purchaseData = {
            id: editBillId || '',
            billNo: currentBillNumber,
            date: billDate,
            supplierId: parseInt(customerId),
            supplierName: customerName,
            items: validItems.map((item, i) => ({ id: i + 1, itemName: item.itemName, quantity: item.quantity, rate: item.rate, gst: item.gst, amount: item.amount })),
            subtotal: calculateSubtotal(),
            totalGST: calculateTotalGST(),
            discount,
            grandTotal: calculateGrandTotal(),
            paymentMode: 'Cash',
            status: 'Received',
            invoiceNo: '' // Assuming this can be added later if needed
          };
          
          if (isEditMode && editBillId) {
            await updatePurchase(editBillId, purchaseData);
          } else {
            await addPurchase(purchaseData);
          }
          
          handleReset();
          await fetchNextBillNumber();

        } catch (error: any) {
          // Error is already logged and toasted by the context
          console.error('[BillingScreen] Purchase save failed. Error was handled by PurchaseContext.');
        }
      };
      savePurchase();
      return;
    }

    // Labour Bill - saves via CONTEXT
    const saveBill = async () => {
      try {
        const labourBillData: LabourBillRecord = {
          id: editBillId || '', // Pass ID for updates
          billNo: currentBillNumber,
          date: billDate,
          time: billTime,
          customerName: customerName.split(' - ')[0] || customerName,
          customerPhone: customerPhone,
          customerAddress: customerAddress,
          vehicleNumber: vehicleNumber,
          vehicleMake: vehicleMakeDropdown,
          vehicleModel: vehicleModel,
          kmReading: kmReading,
          fuelLevel: fuelLevel,
          items: validItems.map((item, i) => ({ ...item, id: i+1 })),
          subtotal: calculateSubtotal(),
          totalGST: calculateTotalGST(),
          discount,
          grandTotal: calculateGrandTotal(),
          status,
          createdAt: '' // Not used on save
        };

        if (isEditMode && editBillId) {
          await updateLabourBill(editBillId, labourBillData);
        } else {
          await addLabourBill(labourBillData);
        }
        
        // Success is now handled inside the context (toast, refresh)
        // We just need to reset the form
        handleReset();
        await fetchNextBillNumber();

      } catch (error: any) {
        // Error toast is already handled in the context's catch block
        console.error('[BillingScreen] Save failed. The error was caught and handled by the context.');
      }
    };
    saveBill();
  };

  const handleReset = () => {
    setItems([]);
    setDiscount(0);
    setCustomerId('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setVehicleNumber('');
    setVehicleModel('');
    setVehicleMakeDropdown('');
    setKmReading('');
    setFuelLevel('');
    setBillDate(getCurrentDate());
    setBillTime(getCurrentTime());
    setStatus('Completed');
    setIsEditMode(false);
    setEditBillId(null);
    // Note: We don't clear currentBillNumber here as it's refreshed immediately after handleReset in save flows
    // setCurrentBillNumber(''); 

    // Reset validation states
    setErrors({
      billNo: false,
      billDate: false,
      billTime: false,
      customerName: false,
      vehicleNumber: false
    });
    setTouched({
      billNo: false,
      billDate: false,
      billTime: false,
      customerName: false,
      vehicleNumber: false
    });
  };

  const handlePrint = () => {
    if (!currentBillNumber || items.length === 0) {
      toast.error('Please add items before printing');
      return;
    }

    const formattedBill = {
      billNo: currentBillNumber,
      date: billDate,
      time: billTime,
      customerName: customerName.split(' - ')[0] || customerName,
      customerPhone,
      customerAddress,
      vehicleNumber,
      vehicleMake: vehicleMakeDropdown,
      vehicleModel,
      kmReading,
      fuelLevel,
      items: items.map(item => ({
        name: item.itemName,
        quantity: item.quantity,
        rate: item.rate,
        gst: item.gst,
        amount: item.amount
      })),
      subTotal: calculateSubtotal(),
      taxAmount: calculateTotalGST(),
      discount,
      totalAmount: calculateGrandTotal(),
      status
    };

    setPrintData(formattedBill);
    setIsPrintModalOpen(true);
    toast.success('Opening print preview...');
  };

  const handleItemNameChange = (id: string, value: string) => {
    // Check if item already exists in the list (deduplication)
    const isDuplicate = items.some(i => i.id !== id && i.itemName === value);
    if (isDuplicate) {
      toast.error('This item is already in the list. Please adjust the quantity instead.');
      return;
    }

    console.log('🔍 Item selected:', value);
    // Find the selected item from master data
    const selectedItem = itemsServices.find(item => item.name === value);

    if (selectedItem) {
      setItems(prevItems => prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = {
            ...item,
            itemName: value,
            rate: selectedItem.defaultRate,
            gst: selectedItem.gstPercentage || 0
          };

          // Recalculate amount
          const baseAmount = updatedItem.quantity * updatedItem.rate;
          const gstAmount = (baseAmount * updatedItem.gst) / 100;
          updatedItem.amount = baseAmount + gstAmount;

          return updatedItem;
        }
        return item;
      }));


      toast.success(`Auto-filled: ${selectedItem.name} - ₹${selectedItem.defaultRate}`);
    } else {
      console.log('❌ Item not found in master data');
      // Just update the name if item not found
      updateItem(id, 'itemName', value);
      toast.warning('Item not found in master data. Please enter rate manually.');
    }
  };

  // Validation handlers
  const validateField = (fieldName: keyof typeof errors, value: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: !value
    }));
  };

  const handleBlur = (fieldName: keyof typeof touched) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  // Helper to get input class with error state
  const getInputClassWithError = (fieldName: keyof typeof errors) => {
    const baseClass = getInputClass(isDarkMode);
    const hasError = errors[fieldName] && touched[fieldName];
    return hasError ? `${baseClass} !border-red-500 focus:!border-red-500` : baseClass;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{isEditMode ? `Edit ${title}` : title}</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Create and manage {billType} bills</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditMode && (
            <button
              onClick={handleReset}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
            >
              <X className="w-4 h-4" />
              Cancel Edit
            </button>
          )}
          <button
            onClick={() => onNavigate?.(`${billType}-history`)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
              : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
              }`}
          >
            <FileText className="w-4 h-4" />
            View History
          </button>
        </div>
      </div>

      {/* Bill Form */}
      <motion.div
        className={getCardClass(isDarkMode)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-6">
          {/* Bill Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={`${getLabelClass(isDarkMode)} flex items-center gap-1`}>
                Bill No {!currentBillNumber && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={currentBillNumber}
                readOnly
                placeholder={!currentBillNumber ? "Fetching..." : "Auto-generated"}
                className={`${getInputClass(isDarkMode)} ${!currentBillNumber ? 'animate-pulse text-gray-400' : 'bg-gray-100/50 dark:bg-gray-700/30'} cursor-not-allowed`}
              />
              {!isEditMode && (
                <button
                  onClick={fetchNextBillNumber}
                  className={`absolute right-3 top-3 p-1 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                  title="Refresh Number"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div>
              <label className={`${getLabelClass(isDarkMode)} flex items-center gap-1`}>
                Date {!billDate && touched.billDate && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={billDate}
                  onChange={(e) => {
                    setBillDate(e.target.value);
                    validateField('billDate', e.target.value);
                  }}
                  onBlur={() => {
                    handleBlur('billDate');
                    validateField('billDate', billDate);
                  }}
                  className={getInputClassWithError('billDate')}
                  disabled={isEditMode}
                />
                <Calendar className={`absolute right-3 top-3 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
              </div>
              {errors.billDate && touched.billDate && (
                <p className="text-red-500 text-xs mt-1">This field is required</p>
              )}
            </div>
            <div>
              <label className={`${getLabelClass(isDarkMode)} flex items-center gap-1`}>
                Time {!billTime && touched.billTime && <span className="text-red-500">*</span>}
              </label>
              <input
                type="time"
                value={billTime}
                onChange={(e) => {
                  setBillTime(e.target.value);
                  validateField('billTime', e.target.value);
                }}
                onBlur={() => {
                  handleBlur('billTime');
                  validateField('billTime', billTime);
                }}
                className={getInputClassWithError('billTime')}
              />
              {errors.billTime && touched.billTime && (
                <p className="text-red-500 text-xs mt-1">This field is required</p>
              )}
            </div>
          </div>

          {/* Customer/Supplier Information */}
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {billType === 'purchase' ? 'Supplier Information' : 'Customer Information'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`${getLabelClass(isDarkMode)} flex items-center gap-1`}>
                {billType === 'purchase' ? 'Supplier Name' : 'Customer Name'}
                {!customerName && touched.customerName && <span className="text-red-500">*</span>}
              </label>
              <div className={errors.customerName && touched.customerName ? 'border-2 border-red-500 rounded-lg' : ''}>
                <SearchableDropdown
                  options={billType === 'purchase' ? supplierOptions : customerOptions}
                  value={customerId}
                  onChange={(value) => {
                    if (billType === 'purchase') handleSupplierChange(value);
                    else handleCustomerChange(value);
                    validateField('customerName', value);
                  }}
                  placeholder={`Search ${billType === 'purchase' ? 'supplier' : 'customer'}...`}
                  isDarkMode={isDarkMode}
                />
              </div>
              {errors.customerName && touched.customerName && (
                <p className="text-red-500 text-xs mt-1">This field is required</p>
              )}
            </div>
            <div>
              <label className={getLabelClass(isDarkMode)}>Mobile Number</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter mobile number"
                className={getInputClass(isDarkMode)}
              />
            </div>
            <div className="md:col-span-2">
              <label className={getLabelClass(isDarkMode)}>Address</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Enter address"
                className={getInputClass(isDarkMode)}
              />
            </div>
          </div>

          {/* Vehicle Information */}
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Vehicle Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`${getLabelClass(isDarkMode)} flex items-center gap-1`}>
                Vehicle Number {!vehicleNumber && touched.vehicleNumber && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => {
                  setVehicleNumber(e.target.value.toUpperCase());
                  validateField('vehicleNumber', e.target.value);
                }}
                onBlur={() => {
                  handleBlur('vehicleNumber');
                  validateField('vehicleNumber', vehicleNumber);
                }}
                placeholder="e.g., KA01AB1234"
                className={getInputClassWithError('vehicleNumber')}
              />
              {errors.vehicleNumber && touched.vehicleNumber && (
                <p className="text-red-500 text-xs mt-1">This field is required</p>
              )}
            </div>
            <div className="relative !overflow-visible z-[50]">
              <label className={getLabelClass(isDarkMode)}>Vehicle Make</label>
              <SearchableDropdown
                options={vehicleMakeOptions}
                value={vehicleMakeDropdown}
                onChange={setVehicleMakeDropdown}
                placeholder="Select vehicle make..."
                isDarkMode={isDarkMode}
              />
            </div>
            <div>
              <label className={getLabelClass(isDarkMode)}>Vehicle Model</label>
              <select
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className={getInputClass(isDarkMode)}
              >
                <option value="">Select model</option>
                {vehicleModelOptions.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={getLabelClass(isDarkMode)}>KM Reading</label>
              <input
                type="text"
                value={kmReading}
                onChange={(e) => setKmReading(e.target.value)}
                placeholder="Enter KM"
                className={getInputClass(isDarkMode)}
              />
            </div>
            <div>
              <label className={getLabelClass(isDarkMode)}>Fuel Level</label>
              <select
                value={fuelLevel}
                onChange={(e) => setFuelLevel(e.target.value)}
                className={getInputClass(isDarkMode)}
              >
                <option value="">Select fuel level</option>
                <option value="Empty">Empty</option>
                <option value="1/4">1/4</option>
                <option value="1/2">1/2</option>
                <option value="3/4">3/4</option>
                <option value="Full">Full</option>
              </select>
            </div>
            <div>
              <label className={getLabelClass(isDarkMode)}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className={getInputClass(isDarkMode)}
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Items Table */}
      <motion.div
        className={getCardClass(isDarkMode)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 -z-20">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900 z-20'}`}>
              Service Items
            </h3>
            <button
              onClick={addItem}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                  <th className={`text-left py-3 px-4 text-sm font-semibold min-w-[300px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Item Name <span className="text-red-500">*</span></th>
                  <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Quantity</th>
                  <th className={`text-right py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Rate</th>
                  <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>GST %</th>
                  <th className={`text-right py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Amount</th>
                  <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No items added yet. Click "Add Item" to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'}`}
                    >
                      <td className="py-3 px-4">
                        <select
                          value={item.itemName}
                          onChange={(e) => {
                            handleItemNameChange(item.id, e.target.value);
                            // Clear the newly added flag when an item is selected
                            if (newlyAddedItemId === item.id) {
                              setNewlyAddedItemId(null);
                            }
                          }}
                          className={`${getInputClass(isDarkMode)} w-full`}
                        >
                          <option value="">-- Select Item --</option>
                          {itemOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className={`${getInputClass(isDarkMode)} text-center`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className={`${getInputClass(isDarkMode)} text-right`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.gst}
                          onChange={(e) => updateItem(item.id, 'gst', parseFloat(e.target.value) || 0)}
                          className={`${getInputClass(isDarkMode)} text-center`}
                        />
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                        ₹{item.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => deleteItem(item.id)}
                          className={`p-2 rounded-lg transition-colors ${isDarkMode
                            ? 'hover:bg-red-500/20 text-red-400'
                            : 'hover:bg-red-50 text-red-600'
                            }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        className={getCardClass(isDarkMode)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Bill Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Subtotal:</span>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ₹{calculateSubtotal().toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total GST:</span>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ₹{calculateTotalGST().toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Discount:</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className={`${getInputClass(isDarkMode)} w-32 text-right`}
              />
            </div>
            <div className={`flex justify-between pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'
              }`}>
              <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Grand Total:
              </span>
              <span className="font-bold text-lg text-blue-500">
                ₹{calculateGrandTotal().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReset}
              className={`px-6 py-3 rounded-lg border transition-all font-medium ${isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Reset
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrint}
                className={`px-6 py-3 rounded-lg transition-all font-medium ${isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
              >
                <Printer className="w-4 h-4 inline mr-2" />
                Print
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
              >
                <Save className="w-4 h-4 inline mr-2" />
                {isEditMode ? 'Update Bill' : 'Save Bill'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bill History */}
      <motion.div
        className={getCardClass(isDarkMode)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Bill History
            </h3>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total {title}s: {currentBills.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Bill No</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Date & Time</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Customer/Supplier</th>
                  <th className={`text-left py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Vehicle/Ref</th>
                  <th className={`text-right py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Amount</th>
                  <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Status</th>
                  <th className={`text-center py-3 px-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No records found. Create your first one above.
                      </p>
                    </td>
                  </tr>
                ) : (
                  [...currentBills]
                    .sort((a: any, b: any) => {
                      const dateA = new Date(a.date + (a.time ? ' ' + a.time : '')).getTime();
                      const dateB = new Date(b.date + (b.time ? ' ' + b.time : '')).getTime();
                      return dateB - dateA;
                    })
                    .map((bill: any) => (
                      <tr
                        key={bill.id}
                        className={`border-b ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'} hover:bg-gray-50/5 transition-colors`}
                      >
                        <td className={`py-3 px-4 font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                          {bill.billNo}
                        </td>
                        <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          {new Date(bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          <br />
                          {bill.time && (
                            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                              {bill.time}
                            </span>
                          )}
                        </td>
                        <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          {bill.customerName || bill.supplierName}
                          <br />
                          <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                            {bill.customerPhone || ''}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          {bill.vehicleNumber || 'N/A'}
                          <br />
                          <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                            {bill.vehicleMake && bill.vehicleModel ? `${bill.vehicleMake} ${bill.vehicleModel}` : (bill.vehicleModel || '')}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                          ₹{bill.grandTotal.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bill.status === 'Completed' || bill.status === 'Received' || bill.status === 'Paid'
                            ? 'bg-green-500/10 text-green-500'
                            : bill.status === 'Pending' || bill.status === 'Partial'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : 'bg-red-500/10 text-red-500'
                            }`}>
                            {(bill.status === 'Completed' || bill.status === 'Received' || bill.status === 'Paid') && <CheckCircle className="w-3 h-3" />}
                            {(bill.status === 'Pending' || bill.status === 'Partial') && <Clock className="w-3 h-3" />}
                            {bill.status === 'Cancelled' && <XCircle className="w-3 h-3" />}
                            {bill.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setIsEditMode(true);
                                setEditBillId(bill.id);
                                setCurrentBillNumber(bill.billNo);
                                setBillDate(bill.date);
                                setBillTime(bill.time || getCurrentTime());
                                setCustomerName(bill.customerName || bill.supplierName);
                                setCustomerPhone(bill.customerPhone || '');
                                setCustomerAddress(bill.customerAddress || '');
                                setVehicleNumber(bill.vehicleNumber || '');
                                setVehicleMakeDropdown(bill.vehicleMake || '');
                                setVehicleModel(bill.vehicleModel || '');
                                setKmReading(bill.kmReading || '');
                                setFuelLevel(bill.fuelLevel || '');
                                setStatus(bill.status || 'Completed');
                                setDiscount(bill.discount || 0);
                                setItems((bill.items || []).map((item: any) => ({
                                  id: String(item.id),
                                  itemName: item.itemName,
                                  quantity: item.quantity,
                                  rate: item.rate,
                                  gst: item.gst || item.gstPercent,
                                  amount: item.amount
                                })));
                                toast.info(`Editing ${bill.billNo}`);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-blue-500/20 text-blue-400' : 'hover:bg-blue-50 text-blue-600'
                                }`}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete ${bill.billNo}?`)) {
                                  try {
                                    if (billType === 'labour') await deleteLabourBill(bill.id);
                                    else if (billType === 'estimation') await deleteEstimation(bill.id);
                                    else if (billType === 'sales') await deleteSale(bill.id);
                                    else if (billType === 'purchase') await deletePurchase(bill.id);
                                    toast.success(`${bill.billNo} deleted`);
                                  } catch (err) {
                                    toast.error('Failed to delete');
                                  }
                                }
                              }}
                              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                                }`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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

      <UnifiedPrintPreview
        type="bill"
        data={printData}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}