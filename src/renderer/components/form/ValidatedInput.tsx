// src/renderer/components/form/ValidatedInput.tsx

import React from 'react';
import { FormValidationError } from './FormValidationError';

interface ValidatedInputProps {
  label?: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: any;
  required?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

/**
 * Input component with built-in validation error display
 */
export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  required = false,
  className = '',
  min,
  max,
  step,
  disabled = false
}) => {
  // Determine if the input has an error
  const hasError = error && error[name];
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-invalid={hasError ? 'true' : 'false'}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          hasError 
            ? 'border-red-300 focus:border-red-300 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-300 focus:ring-blue-200'
        }`}
      />
      
      <FormValidationError error={error} field={name} />
    </div>
  );
};

/**
 * Textarea component with built-in validation error display
 */
export const ValidatedTextarea: React.FC<Omit<ValidatedInputProps, 'type' | 'min' | 'max' | 'step'> & {
  rows?: number;
}> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
  rows = 4,
  disabled = false
}) => {
  // Determine if the input has an error
  const hasError = error && error[name];
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange as any}
        placeholder={placeholder}
        required={required}
        rows={rows}
        disabled={disabled}
        aria-invalid={hasError ? 'true' : 'false'}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          hasError 
            ? 'border-red-300 focus:border-red-300 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-300 focus:ring-blue-200'
        }`}
      />
      
      <FormValidationError error={error} field={name} />
    </div>
  );
};

/**
 * Select component with built-in validation error display
 */
export const ValidatedSelect: React.FC<Omit<ValidatedInputProps, 'type' | 'min' | 'max' | 'step'> & {
  options: Array<{ value: string; label: string }>;
}> = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  className = '',
  disabled = false
}) => {
  // Determine if the input has an error
  const hasError = error && error[name];
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange as any}
        required={required}
        disabled={disabled}
        aria-invalid={hasError ? 'true' : 'false'}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
          hasError 
            ? 'border-red-300 focus:border-red-300 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-300 focus:ring-blue-200'
        }`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      <FormValidationError error={error} field={name} />
    </div>
  );
};