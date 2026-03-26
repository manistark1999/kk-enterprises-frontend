/**
 * Alignment Entry Panel
 * 
 * Right-side panel for entering alignment data
 * Opens from Inventory module
 * Automatically updates Alignment Register
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Car, User, Calendar, DollarSign, FileText, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useAlignment, AlignmentEntry } from '@/contexts/AlignmentContext';
import { useMasters } from '@/contexts/MastersContext';
import { useCustomers } from '@/contexts/CustomerContext';
import { useVehicleRegistry } from '@/contexts/VehicleRegistryContext';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { VehicleAutocomplete } from '@/components/ui/VehicleAutocomplete';
import {
  getInputClass,
  getLabelClass,
  getSelectClass,
  getPrimaryButtonClass,
  getSecondaryButtonClass
} from '@/utils/formStyles';

interface AlignmentEntryPanelProps {
  isDarkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  editingEntry?: AlignmentEntry | null;
}

export function AlignmentEntryPanel({ isDarkMode, isOpen, onClose, editingEntry }: AlignmentEntryPanelProps) {
  const { addAlignmentEntry, updateAlignmentEntry } = useAlignment();
  const { vehicleMakes, vehicleModels, staff } = useMasters();
  const { customers } = useCustomers();
  const { vehicles, getVehicleByNumber, lookupVehicle } = useVehicleRegistry();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vehicleNo: '',
    customerName: '',
    alignmentType: 'Both' as 'Front' | 'Rear' | 'Both',
    amount: '',
    notes: '',
    status: 'Completed' as 'Completed' | 'Pending' | 'In Progress',
    billNo: '',
    vehicleMake: '',
    vehicleModel: '',
    technician: ''
  });

  // Master Data Options
  const technicianOptions = staff.filter(s => s.status?.toLowerCase() === 'active').map(s => s.name);
  const vehicleMakeOptions = vehicleMakes.filter(vm => vm.status?.toLowerCase() === 'active').map(vm => vm.name);
  
  const vehicleModelOptions = React.useMemo(() => {
    if (!formData.vehicleMake) return [];
    
    // Find make case-insensitively
    const make = vehicleMakes.find(vm => 
      (vm.name || vm.make_name || '').toLowerCase() === formData.vehicleMake.toLowerCase()
    );
    
    let options: string[] = [];
    
    if (make) {
      options = vehicleModels
        .filter(vm => String(vm.makeId) === String(make.id) && vm.status?.toLowerCase() === 'active')
        .map(vm => vm.modelName);
    }
    
    // If we have a selected model but it's not in the filtered master list, 
    // we must include it so the dropdown can display it correctly.
    if (formData.vehicleModel && !options.some(opt => opt.toLowerCase() === formData.vehicleModel.toLowerCase())) {
      options = [formData.vehicleModel, ...options];
    }
    
    return options;
  }, [formData.vehicleMake, formData.vehicleModel, vehicleMakes, vehicleModels]);

  const customerOptions = customers.map(c => ({
    value: c.name,
    label: `${c.name} - ${c.phone}`
  }));

  const handleVehicleNumberChange = (number: string) => {
    setFormData(prev => ({ ...prev, vehicleNo: number }));
  };

  const handleVehicleSelect = (vehicle: any) => {
    const vn = vehicle.vehicleNumber || vehicle.vehicle_number || '';
    const vm = vehicle.vehicleMake || vehicle.vehicle_make || '';
    const vmod = vehicle.vehicleModel || vehicle.model || '';
    const cn = vehicle.customerName || vehicle.owner_name || '';

    setFormData(prev => ({
      ...prev,
      vehicleNo: vn || prev.vehicleNo,
      vehicleMake: vm || prev.vehicleMake,
      vehicleModel: vmod || prev.vehicleModel,
      customerName: cn || prev.customerName
    }));
    if (vn) toast.success('Vehicle details auto-filled');
  };

  // Auto-lookup logic for manual entry
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.vehicleNo && formData.vehicleNo.length >= 6) {
        try {
          // Check if this vehicle exists in master
          const vehicle = await lookupVehicle(formData.vehicleNo);
          if (vehicle) {
             // If we found it and some fields are empty, fill them
             if (!formData.vehicleMake || !formData.vehicleModel || !formData.customerName) {
                handleVehicleSelect({
                  ...vehicle,
                  vehicleNumber: vehicle.vehicle_number,
                  vehicleMake: vehicle.vehicle_make,
                  vehicleModel: vehicle.model,
                  customerName: vehicle.owner_name
                });
             }
          }
        } catch (err) {
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.vehicleNo, lookupVehicle]);

  // Populate form when editing
  useEffect(() => {
    if (editingEntry) {
      setFormData({
        date: editingEntry.date,
        vehicleNo: editingEntry.vehicleNo,
        customerName: editingEntry.customerName,
        alignmentType: editingEntry.alignmentType,
        amount: editingEntry.amount.toString(),
        notes: editingEntry.notes || '',
        status: editingEntry.status,
        billNo: editingEntry.billNo,
        vehicleMake: editingEntry.vehicleMake || '',
        vehicleModel: editingEntry.vehicleModel || '',
        technician: editingEntry.technician || ''
      });
    } else {
      // Reset form for new entry
      setFormData({
        date: new Date().toISOString().split('T')[0],
        vehicleNo: '',
        customerName: '',
        alignmentType: 'Both',
        amount: '',
        notes: '',
        status: 'Completed',
        billNo: `LB-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        vehicleMake: '',
        vehicleModel: '',
        technician: ''
      });
    }
  }, [editingEntry, isOpen]);

  const inputClass = getInputClass(isDarkMode);
  const labelClass = getLabelClass(isDarkMode);
  const selectClass = getSelectClass(isDarkMode);
  const primaryButtonClass = getPrimaryButtonClass();
  const secondaryButtonClass = getSecondaryButtonClass(isDarkMode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.vehicleNo || !formData.customerName || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const entryData = {
      date: formData.date,
      billNo: formData.billNo || `LB-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      vehicleNo: formData.vehicleNo,
      vehicleMake: formData.vehicleMake,
      customerName: formData.customerName,
      alignmentType: formData.alignmentType,
      technician: formData.technician,
      amount: amount,
      notes: formData.notes,
      status: formData.status
    };


    try {
      if (editingEntry) {
        await updateAlignmentEntry(editingEntry.id, entryData);
      } else {
        await addAlignmentEntry(entryData);
      }

      onClose();
    } catch (error) {
      // Toast is already shown in context
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
          >
            {/* Modal */}
            <motion.div
              className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden ${
                isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
              } backdrop-blur-xl border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`px-6 py-5 border-b ${
                isDarkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-white/80'
              } backdrop-blur-xl`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${
                      isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <Settings className={`w-5 h-5 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {editingEntry ? 'Edit Alignment Entry' : 'New Alignment Entry'}
                      </h2>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {editingEntry ? 'Update alignment details' : 'Enter alignment details'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancel}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body with Form - Scrollable */}
              <div className="px-6 py-6 max-h-[calc(90vh-180px)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Date */}
                  <div>
                    <label className={labelClass}>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* Bill No */}
                  <div>
                    <label className={labelClass}>
                      <FileText className="w-4 h-4 inline mr-1" />
                      Bill No
                    </label>
                    <input
                      type="text"
                      value={formData.billNo}
                      onChange={(e) => setFormData({ ...formData, billNo: e.target.value })}
                      className={inputClass}
                      placeholder="Auto-generated"
                    />
                  </div>

                  {/* Vehicle Number - Master Lookup */}
                  <div>
                    <label className={labelClass}>
                      <Car className="w-4 h-4 inline mr-1" />
                      Vehicle Number <span className="text-red-500">*</span>
                    </label>
                    <VehicleAutocomplete
                      value={formData.vehicleNo}
                      onChange={handleVehicleNumberChange}
                      onSelect={handleVehicleSelect}
                      isDarkMode={isDarkMode}
                      placeholder="Search Master: KA-01-AB-1234"
                    />
                  </div>

                  {/* Vehicle Make */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Vehicle Make</label>
                      <SearchableDropdown
                        options={vehicleMakeOptions}
                        value={formData.vehicleMake}
                        onChange={(value) => setFormData({ ...formData, vehicleMake: value, vehicleModel: '' })}
                        placeholder="Select Make"
                        isDarkMode={isDarkMode}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Vehicle Model</label>
                      <SearchableDropdown
                        options={vehicleModelOptions}
                        value={formData.vehicleModel}
                        onChange={(value) => setFormData({ ...formData, vehicleModel: value })}
                        placeholder="Select Model"
                        disabled={!formData.vehicleMake}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className={labelClass}>
                      <User className="w-4 h-4 inline mr-1" />
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <SearchableDropdown
                      options={customerOptions}
                      value={formData.customerName}
                      onChange={(value) => setFormData({ ...formData, customerName: value })}
                      placeholder="Select or enter customer"
                      isDarkMode={isDarkMode}
                    />
                  </div>

                  {/* Alignment Type */}
                  <div>
                    <label className={labelClass}>
                      <Settings className="w-4 h-4 inline mr-1" />
                      Alignment Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.alignmentType}
                      onChange={(e) => setFormData({ ...formData, alignmentType: e.target.value as any })}
                      className={selectClass}
                      required
                    >
                      <option value="Front">Front Alignment</option>
                      <option value="Rear">Rear Alignment</option>
                      <option value="Both">Both (Front & Rear)</option>
                    </select>
                  </div>

                  {/* Technician */}
                  <div>
                    <label className={labelClass}>
                      <User className="w-4 h-4 inline mr-1" />
                      Technician
                    </label>
                    <SearchableDropdown
                      options={technicianOptions}
                      value={formData.technician}
                      onChange={(value) => setFormData({ ...formData, technician: value })}
                      placeholder="Select Technician"
                      isDarkMode={isDarkMode}
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className={labelClass}>
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className={inputClass}
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className={labelClass}>
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className={selectClass}
                      required
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className={labelClass}>
                      <FileText className="w-4 h-4 inline mr-1" />
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className={inputClass}
                      placeholder="Additional notes (optional)"
                      rows={3}
                    />
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className={`px-6 py-4 border-t ${
                isDarkMode 
                  ? 'bg-gray-800/80 border-gray-700' 
                  : 'bg-white/80 border-gray-200'
              } backdrop-blur-xl`}>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={handleCancel}
                    className={secondaryButtonClass}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className={primaryButtonClass}
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingEntry ? 'Update' : 'Save'} Entry</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}