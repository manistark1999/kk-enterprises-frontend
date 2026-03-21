import { useState, useCallback } from 'react';
import { isFieldEmpty } from '@/utils/formStyles';

interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

/**
 * Custom hook for form validation
 * 
 * Features:
 * - Track validation errors
 * - Validate required fields
 * - Support for custom validation rules
 * - Check if form is valid before submission
 * 
 * Usage:
 * const { errors, validateField, validateForm, isFormValid } = useFormValidation(formData, validationRules);
 */
export function useFormValidation<T extends Record<string, any>>(
  formData: T,
  rules: ValidationRule[]
) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  /**
   * Validate a single field
   */
  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const rule = rules.find(r => r.field === fieldName);
    if (!rule) return null;

    // Check required
    if (rule.required && isFieldEmpty(value)) {
      return rule.message || 'This field is required';
    }

    // Check minLength
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `Minimum length is ${rule.minLength} characters`;
    }

    // Check maxLength
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `Maximum length is ${rule.maxLength} characters`;
    }

    // Check pattern
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || 'Invalid format';
    }

    // Check custom validation
    if (rule.custom && !rule.custom(value)) {
      return rule.message || 'Invalid value';
    }

    return null;
  }, [rules]);

  /**
   * Validate all fields
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    rules.forEach(rule => {
      const error = validateField(rule.field, formData[rule.field]);
      if (error) {
        newErrors[rule.field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, rules, validateField]);

  /**
   * Mark field as touched (for blur events)
   */
  const touchField = useCallback((fieldName: string) => {
    setTouched(prev => new Set(prev).add(fieldName));
    
    // Validate the touched field
    const error = validateField(fieldName, formData[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }));
  }, [formData, validateField]);

  /**
   * Clear errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched(new Set());
  }, []);

  /**
   * Check if form is valid (all required fields filled)
   */
  const isFormValid = useCallback((): boolean => {
    return rules.every(rule => {
      if (!rule.required) return true;
      return !isFieldEmpty(formData[rule.field]);
    });
  }, [formData, rules]);

  /**
   * Get error for a specific field
   */
  const getFieldError = useCallback((fieldName: string): string | null => {
    return errors[fieldName] || null;
  }, [errors]);

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return !!errors[fieldName];
  }, [errors]);

  /**
   * Check if field is touched
   */
  const isFieldTouched = useCallback((fieldName: string): boolean => {
    return touched.has(fieldName);
  }, [touched]);

  return {
    errors,
    validateField,
    validateForm,
    touchField,
    clearErrors,
    isFormValid,
    getFieldError,
    hasFieldError,
    isFieldTouched,
  };
}
