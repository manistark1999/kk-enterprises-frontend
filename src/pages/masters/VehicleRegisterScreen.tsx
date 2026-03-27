import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Filter,
  Building2,
  Calendar,
  Phone,
  User,
  Fuel,
  Hash,
  Info,
  ChevronRight
} from 'lucide-react';
import { useVehicleRegistry } from '@/contexts/VehicleRegistryContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function VehicleRegisterScreen({ isDarkMode }: { isDarkMode: boolean }) {
  const { canCreate, canEdit, canDelete } = useAuth();
  const { vehicles, isLoading, addVehicle, updateVehicle, deleteVehicle } = useVehicleRegistry();
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  
  const [formData, setFormData] = useState<any>({
    vehicle_number: '',
    owner_name: '',
    mobile: '',
    vehicle_make: '',
    model: '',
    fuel_type: 'Diesel',
    chassis_number: '',
    engine_number: '',
    color: '',
    year: new Date().getFullYear(),
    status: 'Active',
    notes: ''
  });

  const handleOpenDrawer = (vehicle?: any) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        vehicle_number: vehicle.vehicle_number,
        owner_name: vehicle.owner_name,
        mobile: vehicle.mobile,
        vehicle_make: vehicle.vehicle_make,
        model: vehicle.model,
        fuel_type: vehicle.fuel_type || 'Diesel',
        chassis_number: vehicle.chassis_number || '',
        engine_number: vehicle.engine_number || '',
        color: vehicle.color || '',
        year: vehicle.year || new Date().getFullYear(),
        status: vehicle.status || 'Active',
        notes: vehicle.notes || ''
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        vehicle_number: '',
        owner_name: '',
        mobile: '',
        vehicle_make: '',
        model: '',
        fuel_type: 'Diesel',
        chassis_number: '',
        engine_number: '',
        color: '',
        year: new Date().getFullYear(),
        status: 'Active',
        notes: ''
      });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.vehicle_number) return toast.error('Vehicle number is required');
      
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, formData);
        toast.success('Vehicle updated successfully');
        addNotification('Edited', formData.vehicle_number, 'Vehicle', 'Vehicle details updated');
      } else {
        await addVehicle(formData);
        toast.success('Vehicle registered successfully');
        addNotification('Added', formData.vehicle_number, 'Vehicle', 'New vehicle registered');
      }
      setIsDrawerOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save vehicle');
    }
  };

  const handleDelete = async (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id);
        toast.success('Vehicle deleted successfully');
        addNotification('Deleted', vehicle.vehicle_number, 'Vehicle', 'Vehicle removed from registry');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete vehicle');
      }
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.owner_name && v.owner_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.vehicle_make && v.vehicle_make.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all outline-none text-sm ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white focus:border-primary focus:bg-gray-700'
      : 'bg-white border-gray-300 text-gray-900 focus:border-primary'
  }`;

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Vehicle Register
            </h1>
          </div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Manage and track all registered vehicles in the workshop
          </p>
        </div>
        
        {canCreate('Vehicle Register') && (
          <button
            onClick={() => handleOpenDrawer()}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Vehicle
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className={`p-4 mb-6 rounded-xl border flex flex-col md:flex-row gap-4 items-center justify-between ${
        isDarkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex-1 relative w-full">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Search by vehicle number, owner, or make..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClass.replace('w-full', 'w-full pl-10')}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className={`flex-1 md:flex-none px-4 py-2 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
            isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}>
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Vehicles', value: vehicles.length, icon: Car, color: 'blue' },
          { label: 'Active Status', value: vehicles.filter(v => v.status === 'Active').length, icon: Check, color: 'blue' },
          { label: 'Recent Registrations', value: vehicles.filter(v => {
            const date = new Date(v.created_at);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            return diff < 7 * 24 * 60 * 60 * 1000;
          }).length, icon: Calendar, color: 'blue' },
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-800/20 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 uppercase font-black text-[10px]`}>
                 <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 overflow-hidden flex flex-col rounded-2xl border ${
        isDarkMode ? 'bg-gray-800/20 border-gray-700' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">ID</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">Vehicle Info</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Owner</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Specs</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {isLoading ? (
                <tr>
                   <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                         <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                         <p className="text-gray-500">Loading vehicles...</p>
                      </div>
                   </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                         <Info className="w-12 h-12 opacity-20" />
                         <p>No vehicles registered yet</p>
                      </div>
                   </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr 
                    key={vehicle.id}
                    className={`transition-colors group ${isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">#{vehicle.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${
                          isDarkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'
                        }`}>
                          {vehicle.vehicle_number.slice(-4)}
                        </div>
                        <div>
                          <div className={`font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {vehicle.vehicle_number}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} flex items-center gap-1`}>
                            <Hash className="w-3 h-3" />
                            {vehicle.chassis_number || 'No Chassis #'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-2`}>
                          <User className="w-3.5 h-3.5 opacity-60" />
                          {vehicle.owner_name}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} flex items-center gap-2`}>
                          <Phone className="w-3.5 h-3.5 opacity-60" />
                          {vehicle.mobile}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {vehicle.vehicle_make} {vehicle.model}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray- shadow-sm text-gray-600 border border-gray-100'
                          }`}>
                            {vehicle.fuel_type}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {vehicle.year}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${
                        vehicle.status === 'Active' 
                          ? (isDarkMode ? 'bg-blue-500/10 text-blue-400 ring-blue-500/30' : 'bg-blue-50 text-blue-600 ring-blue-100')
                          : (isDarkMode ? 'bg-blue-700/10 text-blue-400 ring-red-500/30' : 'bg-blue-50 text-blue-700 ring-red-100')
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEdit('Vehicle Register') && (
                            <button 
                              onClick={() => handleOpenDrawer(vehicle)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-primary' : 'hover:bg-gray-100 text-gray-500 hover:text-primary'
                              }`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete('Vehicle Register') && (
                            <button 
                              onClick={() => handleDelete(vehicle.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-blue-400' : 'hover:bg-gray-100 text-gray-500 hover:text-blue-700'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer Form */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className={`relative w-full max-w-xl h-full flex flex-col shadow-2xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className={`p-6 border-b flex items-center justify-between ${
                isDarkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-100 bg-gray-50/80'
              }`}>
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {editingVehicle ? 'Edit Vehicle' : 'Register New Vehicle'}
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Enter detailed vehicle and owner information
                  </p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Vehicle Basic Details */}
                <section>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Vehicle Basic Details</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vehicle Entry ID</label>
                       <input
                         type="text"
                         value={editingVehicle ? `#${editingVehicle.id}` : '#Auto'}
                         disabled
                         readOnly
                         className={inputClass + (isDarkMode ? " bg-gray-700/50" : " bg-gray-100/50")}
                       />
                    </div>
                    <div className="md:col-span-1">
                       <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vehicle Number *</label>
                       <input
                         type="text"
                         placeholder="KA-01-AB-1234"
                         value={formData.vehicle_number}
                         onChange={(e) => setFormData({...formData, vehicle_number: e.target.value.toUpperCase()})}
                         className={inputClass}
                       />
                    </div>
                    <div>
                       <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Make *</label>
                       <input
                         type="text"
                         placeholder="e.g. Toyota"
                         value={formData.vehicle_make}
                         onChange={(e) => setFormData({...formData, vehicle_make: e.target.value})}
                         className={inputClass}
                       />
                    </div>
                    <div>
                       <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Model *</label>
                       <input
                         type="text"
                         placeholder="e.g. Innova"
                         value={formData.model}
                         onChange={(e) => setFormData({...formData, model: e.target.value})}
                         className={inputClass}
                       />
                    </div>
                    <div>
                       <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Fuel Type</label>
                       <select
                         value={formData.fuel_type}
                         onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
                         className={inputClass}
                       >
                         <option value="Diesel">Diesel</option>
                         <option value="Petrol">Petrol</option>
                         <option value="CNG">CNG</option>
                         <option value="Electric">Electric</option>
                         <option value="Hybrid">Hybrid</option>
                       </select>
                    </div>
                    <div>
                       <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Year</label>
                       <input
                         type="number"
                         value={formData.year}
                         onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                         className={inputClass}
                       />
                    </div>
                  </div>
                </section>

                {/* Owner Details */}
                <section>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Owner Information</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Owner Name</label>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.owner_name}
                        onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mobile Number</label>
                      <input
                        type="text"
                        placeholder="Contact Number"
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </section>

                {/* Technical / Identity */}
                <section>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Technical Details</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Chassis Number</label>
                      <input
                        type="text"
                        placeholder="VIN / Chassis #"
                        value={formData.chassis_number}
                        onChange={(e) => setFormData({...formData, chassis_number: e.target.value.toUpperCase()})}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Engine Number</label>
                      <input
                        type="text"
                        placeholder="Engine #"
                        value={formData.engine_number}
                        onChange={(e) => setFormData({...formData, engine_number: e.target.value.toUpperCase()})}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Color</label>
                      <input
                        type="text"
                        placeholder="Body Color"
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className={inputClass}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Blacklisted">Blacklisted</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                       <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Notes / Remarks</label>
                       <textarea
                         rows={3}
                         placeholder="Additional details about the vehicle..."
                         value={formData.notes}
                         onChange={(e) => setFormData({...formData, notes: e.target.value})}
                         className={inputClass + " resize-none"}
                       />
                    </div>
                  </div>
                </section>
              </div>

              {/* Drawer Footer */}
              <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-100 bg-gray-50/80'}`}>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                      isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
                    }`}
                  >
                    Cancel
                  </button>
                  {(editingVehicle ? canEdit('Vehicle Register') : canCreate('Vehicle Register')) && (
                    <button
                      onClick={handleSave}
                      className="flex-[2] px-4 py-3 bg-primary text-white rounded-xl font-black shadow-primary/20 shadow-xl hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Save
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
