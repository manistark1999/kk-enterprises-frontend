import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Car, User, Truck, Loader2 } from 'lucide-react';
import { useVehicleRegistry } from '@/contexts/VehicleRegistryContext';

interface VehicleAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (vehicle: any) => void;
  isDarkMode: boolean;
  placeholder?: string;
  error?: boolean;
}

export function VehicleAutocomplete({
  value,
  onChange,
  onSelect,
  isDarkMode,
  placeholder = "Type or select: KA-01-AB-1234",
  error = false
}: VehicleAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { searchVehicles } = useVehicleRegistry();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    if (value && value.length >= 2 && isOpen) {
      setIsLoading(true);
    }

    const timer = setTimeout(async () => {
      if (value && value.length >= 2 && isOpen) {
        try {
          const data = await searchVehicles(value);
          setResults(data);
        } catch (err) {
          setResults([]);
        } finally {
          setIsLoading(true); // Keep loading true until results are set? No.
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [value, isOpen, searchVehicles]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (vehicle: any) => {
    onSelect(vehicle);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value.toUpperCase());
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none ${
            isDarkMode
              ? `bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${error ? 'border-red-500/50 ring-red-500/10' : ''}`
              : `bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 ${error ? 'border-red-500 ring-2 ring-red-500/10' : ''}`
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
          <Search className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (value.length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            className={`absolute z-[999] mt-2 w-full rounded-xl border shadow-2xl overflow-hidden ${
              isDarkMode
                ? 'bg-gray-900/95 border-gray-800 backdrop-blur-md'
                : 'bg-white/95 border-gray-200 backdrop-blur-md'
            }`}
          >
            {results.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto p-1.5 pt-2">
                <div className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Suggestions from Master
                </div>
                {results.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => handleSelect(vehicle)}
                    className={`w-full px-3 py-2.5 rounded-lg text-left flex items-start gap-3 transition-all group ${
                      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-blue-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 group-hover:bg-blue-500/20' : 'bg-gray-100 group-hover:bg-blue-100'}`}>
                      <Car className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm ${isDarkMode ? 'text-orange-400' : 'text-blue-700'}`}>
                        {vehicle.vehicleNumber}
                      </div>
                      <div className={`text-xs truncate flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {vehicle.transportName ? (
                          <><Truck className="w-3 h-3" /> {vehicle.transportName}</>
                        ) : (
                          <><User className="w-3 h-3" /> {vehicle.customerName || 'No Name'}</>
                        )}
                      </div>
                    </div>
                    {(vehicle.vehicleMake || vehicle.vehicleModel) && (
                       <div className={`text-[10px] mt-1 px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                         {vehicle.vehicleMake} {vehicle.vehicleModel}
                       </div>
                    )}
                  </button>
                ))}
              </div>
            ) : !isLoading ? (
              <div className={`p-6 text-center text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                No matching vehicles found in Masters
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
