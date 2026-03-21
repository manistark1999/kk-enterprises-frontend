import React from 'react';
import { 
  getLabelClass, 
  getInputClassWithValidation, 
  getTextareaClassWithValidation,
  getSelectClassWithValidation,
  isFieldEmpty 
} from '@/utils/formStyles';

interface FormFieldProps {
  label: string;
  name: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: 'text' | 'number' | 'date' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  isDarkMode: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  showValidation?: boolean; // Set to true to enable real-time validation
  onBlur?: () => void;
}

/**
 * Reusable FormField component with automatic validation
 * 
 * Features:
 * - Automatic red star (*) for required fields
 * - Real-time validation with red border for empty required fields
 * - Consistent styling across all forms
 * - Support for text, number, date, email, textarea, and select inputs
 * 
 * Usage:
 * <FormField
 *   label="Customer Name"
 *   name="customerName"
 *   value={formData.customerName}
 *   onChange={handleInputChange}
 *   required
 *   isDarkMode={isDarkMode}
 *   showValidation={true}
 * />
 */
export function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  isDarkMode,
  disabled = false,
  options = [],
  className = '',
  min,
  max,
  step,
  rows = 3,
  showValidation = true,
  onBlur,
}: FormFieldProps) {
  // Check if field has an error (empty when required and validation is enabled)
  const hasError = required && showValidation && isFieldEmpty(value);

  return (
    <div className={className}>
      {/* Label with required indicator */}
      <label htmlFor={name} className={getLabelClass(isDarkMode, required, hasError)}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input based on type */}
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={getTextareaClassWithValidation(isDarkMode, hasError)}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={getSelectClassWithValidation(isDarkMode, hasError)}
        >
          <option value="">{placeholder || 'Select...'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={getInputClassWithValidation(isDarkMode, hasError)}
        />
      )}

      {/* Optional error message */}
      {hasError && (
        <p className="mt-1 text-xs text-red-500">
          This field is required
        </p>
      )}
    </div>
  );
}
