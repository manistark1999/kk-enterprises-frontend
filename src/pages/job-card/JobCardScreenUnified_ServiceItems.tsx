import React from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ServiceItem {
  id: string;
  serviceName: string;
  serviceId: string;
  quantity: number;
  rate: number;
  gst: number;
  amount: number;
}

interface Service {
  id: string;
  name: string;
  defaultRate: number;
  gstPercentage: number;
  status: 'Active' | 'Inactive';
}

interface ServiceItemsTableProps {
  serviceItems: ServiceItem[];
  services: Service[];
  isDarkMode: boolean;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onServiceSelect: (itemId: string, serviceName: string) => void;
  onItemChange: (itemId: string, field: string, value: string) => void;
}

export const ServiceItemsTable: React.FC<ServiceItemsTableProps> = ({
  serviceItems,
  services,
  isDarkMode,
  onAddItem,
  onRemoveItem,
  onServiceSelect,
  onItemChange,
}) => {
  const { canCreate, canEdit, canDelete } = useAuth();
  
  // State for tracking current visible item
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Get active services
  const activeServices = services.filter(s => s.status === 'Active');
  

  // Reset index if it's out of bounds
  React.useEffect(() => {
    if (currentIndex >= serviceItems.length && serviceItems.length > 0) {
      setCurrentIndex(serviceItems.length - 1);
    }
  }, [serviceItems.length, currentIndex]);

  // Get current item
  const currentItem = serviceItems[currentIndex];

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < serviceItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleAddItem = () => {
    onAddItem();
    // Navigate to the new item
    setTimeout(() => setCurrentIndex(serviceItems.length), 0);
  };

  const handleRemoveItem = () => {
    if (currentItem) {
      onRemoveItem(currentItem.id);
      // Adjust index after removal
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  const primaryButtonClass = `px-4 py-2 rounded-lg font-medium transition-all ${
    isDarkMode
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white'
  }`;

  // Consistent input styling
  const inputClass = `w-full h-10 px-3 py-2 rounded-lg border transition-all text-sm ${
    isDarkMode
      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`;

  const selectClass = `w-full h-10 px-3 py-2 rounded-lg border transition-all cursor-pointer text-sm ${
    isDarkMode
      ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`;

  // Amount display styling
  const amountClass = `h-10 flex items-center px-3 py-2 rounded-lg font-semibold text-sm ${
    isDarkMode ? 'text-blue-400 bg-gray-800/50' : 'text-blue-600 bg-blue-50'
  }`;

  // If no items exist
  if (serviceItems.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-base font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Service Items
          </h3>
          {canCreate('Job Card') && (
            <button
              type="button"
              onClick={onAddItem}
              className={`${primaryButtonClass} flex items-center gap-2 px-4 py-2 text-sm`}
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          )}
        </div>
        <div className={`text-center py-12 rounded-lg border-2 border-dashed ${
          isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'
        }`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No service items added yet. Click "Add Item" to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className={`text-base font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Service Items
          </h3>
          
          {/* Navigation Controls */}
          {serviceItems.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`p-1.5 rounded-lg transition-all ${
                  currentIndex === 0
                    ? isDarkMode 
                      ? 'text-gray-700 cursor-not-allowed' 
                      : 'text-gray-300 cursor-not-allowed'
                    : isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-white' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className={`text-sm font-medium px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentIndex + 1} / {serviceItems.length}
              </span>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === serviceItems.length - 1}
                className={`p-1.5 rounded-lg transition-all ${
                  currentIndex === serviceItems.length - 1
                    ? isDarkMode 
                      ? 'text-gray-700 cursor-not-allowed' 
                      : 'text-gray-300 cursor-not-allowed'
                    : isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-white' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {canCreate('Job Card') && (
          <button
            type="button"
            onClick={handleAddItem}
            className={`${primaryButtonClass} flex items-center gap-2 px-4 py-2 text-sm`}
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        )}
      </div>

      {/* Single Item Card */}
      {currentItem && (
        <div className={`p-6 rounded-lg border ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item Name - Full Width */}
            <div className="md:col-span-2">
              <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Item Name <span className="text-blue-700">*</span>
              </label>
              <select
                value={currentItem.serviceName}
                onChange={(e) => onServiceSelect(currentItem.id, e.target.value)}
                className={selectClass}
              >
                <option value="">Select Service</option>
                {activeServices.map((service) => (
                  <option key={service.id} value={service.name}>
                    {service.name} (₹{service.defaultRate})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Quantity
              </label>
              <input
                type="number"
                value={currentItem.quantity}
                onChange={(e) => onItemChange(currentItem.id, 'quantity', e.target.value)}
                className={inputClass}
                min="1"
                placeholder="1"
              />
            </div>

            {/* Rate */}
            <div>
              <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Rate (₹)
              </label>
              <input
                type="number"
                value={currentItem.rate}
                onChange={(e) => onItemChange(currentItem.id, 'rate', e.target.value)}
                className={inputClass}
                placeholder="0"
                disabled={!!currentItem.serviceId}
              />
            </div>

            {/* GST % */}
            <div>
              <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                GST %
              </label>
              <input
                type="number"
                value={currentItem.gst}
                className={inputClass}
                disabled
              />
            </div>

            {/* Amount */}
            <div>
              <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Amount (₹)
              </label>
              <div className={amountClass}>
                ₹{currentItem.amount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Remove Button */}
          {serviceItems.length > 1 && canDelete('Job Card') && (
            <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={handleRemoveItem}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isDarkMode
                    ? 'text-blue-400 hover:bg-blue-700/10'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Remove This Item
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary Info */}
      {serviceItems.length > 1 && (
        <div className={`mt-3 px-4 py-2 rounded-lg text-xs ${
          isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700'
        }`}>
          <p>💡 Total {serviceItems.length} items added. Use ← → arrows to navigate between items.</p>
        </div>
      )}
    </div>
  );
};