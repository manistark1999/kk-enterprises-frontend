import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  email?: string;
  phone?: string;
}

interface SearchableDropdownProps {
  options: Option[] | string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDarkMode: boolean;
  disabled?: boolean;
  autoOpen?: boolean;
  listLabel?: string;
  className?: string;
}

export function SearchableDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select option...',
  isDarkMode,
  disabled = false,
  autoOpen = false,
  listLabel = 'All Options',
  className = ''
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Normalize options to always be Option[] format with safety checks
  const normalizedOptions = useMemo<Option[]>(() => {
    return (options || []).map(opt => {
      if (typeof opt === 'string') {
        return { value: opt, label: opt };
      }
      if (opt && typeof opt === 'object' && 'value' in opt) {
        return { 
          value: opt.value || '', 
          label: (opt as Option).label || opt.value || '' 
        };
      }
      return { value: '', label: '' };
    }).filter(opt => opt.value !== '');
  }, [options]);

  const selectedOption = normalizedOptions.find(opt => opt && opt.value === value);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    return searchTerm.trim() === '' 
      ? normalizedOptions 
      : normalizedOptions.filter(option =>
          option.label?.toLowerCase().includes(searchTerm.toLowerCase())
        );
  }, [searchTerm, normalizedOptions]);

  const totalCount = normalizedOptions.length;
  const filteredCount = filteredOptions.length;

  // Update coordinates when opening
  const updateCoords = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // Click outside to close - updated for Portals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      updateCoords();
      // Also update on scroll/resize
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  // Auto-open dropdown when autoOpen is true
  useEffect(() => {
    if (autoOpen && !value) {
      setIsOpen(true);
    }
  }, [autoOpen, value]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      if (!isOpen) updateCoords();
      setIsOpen(!isOpen);
    }
  };

  // Portal target
  const portalRoot = document.getElementById('portal-root');

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Input Field */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 outline-none flex items-center justify-between ${
          isDarkMode
            ? 'bg-gray-700/50 border-gray-600 text-white hover:border-blue-500'
            : 'bg-white border-gray-300 text-gray-900 hover:border-blue-400'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${
          isOpen ? (isDarkMode ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-blue-400 ring-2 ring-blue-400/20') : ''
        }`}
      >
        <span className={`truncate mr-2 ${selectedOption ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        } ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
      </button>

      {/* Dropdown Panel using Portal */}
      {portalRoot && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div 
              ref={panelRef}
              className="fixed z-[9999]"
              style={{
                top: coords.top + 4,
                left: coords.left,
                width: coords.width,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                transition={{ 
                  duration: 0.15,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className={`rounded-lg border shadow-2xl overflow-hidden flex flex-col ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-300'
                }`}
                style={{ 
                  transformOrigin: 'top',
                  maxHeight: '400px'
                }}
              >
            {/* Search Input Section */}
            <div className={`p-3 border-b sticky top-0 ${
              isDarkMode 
                ? 'border-gray-700 bg-gray-800' 
                : 'border-gray-200 bg-white'
            }`}>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${totalCount} options...`}
                  className={`w-full pl-10 pr-4 py-2 rounded-md border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20'
                  }`}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {searchTerm && (
                <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {filteredCount} of {totalCount} results
                </div>
              )}
            </div>

            {/* Options List with Scroll */}
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden !overflow-visible">
              {filteredOptions.length > 0 ? (
                <div className="py-1">
                  {filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors ${
                        isDarkMode
                          ? 'hover:bg-gray-700 text-white'
                          : 'hover:bg-blue-50 text-gray-900'
                      } ${
                        option.value === value 
                          ? (isDarkMode ? 'bg-gray-700/70 border-l-3 border-blue-500' : 'bg-blue-50 border-l-3 border-blue-500') 
                          : ''
                      }`}
                    >
                      <span className="text-sm">{option.label}</span>
                      {option.value === value && (
                        <Check className={`w-4 h-4 ml-2 flex-shrink-0 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`px-4 py-8 text-center text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No results found
                </div>
              )}
            </div>
          </motion.div>
            </div>
          )}
        </AnimatePresence>,
        portalRoot
      )}
    </div>
  );
}