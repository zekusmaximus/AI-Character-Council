// src/renderer/components/form/FormValidationError.tsx

import React from 'react';
import { extractValidationErrors } from '../errors/ValidationErrorDisplay';

interface FormValidationErrorProps {
  error?: any;
  field?: string;
  className?: string;
}

/**
 * Component to display field-specific validation errors in forms
 */
export const FormValidationError: React.FC<FormValidationErrorProps> = ({
  error,
  field,
  className = 'text-red-600 text-sm mt-1',
}) => {
  if (!error) return null;
  
  // Extract validation errors
  const validationErrors = extractValidationErrors(error);
  
  // If no validation errors, or no field specified, return null
  if (!validationErrors || !field) return null;
  
  // Get error message for the specific field
  const fieldError = validationErrors[field];
  
  // If no error for this field, check for nested fields
  // (e.g., "user.name" should match both "user.name" and errors under "user")
  if (!fieldError) {
    // Check if field is nested (contains a dot)
    if (field.includes('.')) {
      const segments = field.split('.');
      let current = validationErrors;
      
      // Navigate through nested objects
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const partialPath = segments.slice(0, i + 1).join('.');
        
        if (validationErrors[partialPath]) {
          return (
            <div className={className} role="alert">
              {validationErrors[partialPath]}
            </div>
          );
        }
        
        // Try to navigate deeper if current is an object
        if (current && typeof current === 'object' && segment in current) {
          current = current[segment];
        } else {
          break;
        }
      }
    }
    
    return null;
  }
  
  return (
    <div className={className} role="alert">
      {fieldError}
    </div>
  );
};

/**
 * HOC to add form validation to a field component
 */
export function withFormValidation<P extends object>(
  Component: React.ComponentType<P & { error?: string }>
): React.FC<P & FormValidationErrorProps> {
  return function ValidatedComponent({
    error,
    field,
    ...props
  }: P & FormValidationErrorProps) {
    // Extract field-specific error
    let fieldError: string | undefined;
    
    if (error && field) {
      const validationErrors = extractValidationErrors(error);
      if (validationErrors) {
        fieldError = validationErrors[field];
        
        // Check for nested fields
        if (!fieldError && field.includes('.')) {
          const segments = field.split('.');
          for (let i = 0; i < segments.length; i++) {
            const partialPath = segments.slice(0, i + 1).join('.');
            if (validationErrors[partialPath]) {
              fieldError = validationErrors[partialPath];
              break;
            }
          }
        }
      }
    }
    
    // Pass the extracted error to the component
    return <Component {...(props as P)} error={fieldError} />;
  };
}

/**
 * Form validation context for managing form-wide validation errors
 */
interface FormValidationContextType {
  errors: Record<string, string> | null;
  setErrors: (errors: Record<string, string> | null) => void;
  clearErrors: () => void;
  hasErrors: boolean;
}

const FormValidationContext = React.createContext<FormValidationContextType>({
  errors: null,
  setErrors: () => {},
  clearErrors: () => {},
  hasErrors: false
});

/**
 * Provider component for form validation context
 */
export const FormValidationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = React.useState<Record<string, string> | null>(null);
  
  const clearErrors = React.useCallback(() => {
    setErrors(null);
  }, []);
  
  const hasErrors = React.useMemo(() => {
    return !!errors && Object.keys(errors).length > 0;
  }, [errors]);
  
  const value = React.useMemo(() => ({
    errors,
    setErrors,
    clearErrors,
    hasErrors
  }), [errors, clearErrors, hasErrors]);
  
  return (
    <FormValidationContext.Provider value={value}>
      {children}
    </FormValidationContext.Provider>
  );
};

/**
 * Hook for using form validation context
 */
export const useFormValidation = () => {
  return React.useContext(FormValidationContext);
};

/**
 * Component to display all form validation errors
 */
export const FormValidationSummary: React.FC<{
  className?: string;
  title?: string;
}> = ({
  className = 'bg-red-50 border border-red-200 rounded-md p-3 mb-4',
  title = 'Please fix the following issues:'
}) => {
  const { errors, hasErrors } = useFormValidation();
  
  if (!hasErrors) return null;
  
  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-red-800 mb-2">
        {title}
      </h3>
      <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
        {errors && Object.entries(errors).map(([field, message]) => (
          <li key={field}>
            <span className="font-medium">
              {field.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .split('.').join(' → ')}:
            </span> {message}
          </li>
        ))}
      </ul>
    </div>
  );
};