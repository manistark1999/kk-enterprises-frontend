import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDarkMode: boolean;
  disabled?: boolean;
  className?: string;
}

export function Dropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select an option', 
  isDarkMode,
  disabled = false,
  className = ''
}: DropdownProps) {
  const inputClass = `w-full px-3 py-2 rounded-lg border transition-all outline-none text-sm appearance-none cursor-pointer ${
    isDarkMode
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-700'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-blue-50'
  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'} ${className}`;

  return (
    <div className="relative">
      <select 
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}
