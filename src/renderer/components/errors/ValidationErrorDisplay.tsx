// src/renderer/components/errors/ValidationErrorDisplay.tsx

import React from 'react';

interface ValidationErrorDisplayProps {
  errors: Record<string, string> | string[] | null;
  className?: string;
}

/**
 * Component to display validation errors in a user-friendly format
 */
export const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({
  errors,
  className = '',
}) => {
  if (!errors || (Array.isArray(errors) && errors.length === 0) || 
      (!Array.isArray(errors) && Object.keys(errors).length === 0)) {
    return null;
  }

  const formatFieldName = (fieldName: string): string => {
    // Handle nested paths (e.g., "core.traits.0.name" → "Core Traits Name")
    return fieldName
      .split('.')
      .map(part => {
        // Skip numeric indices
        if (!isNaN(Number(part))) return '';
        // Convert camelCase to Title Case with spaces
        return part.replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
      })
      .filter(Boolean)
      .join(' ');
  };

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-3 ${className}`}>
      <h3 className="text-sm font-medium text-red-800 mb-2">
        Please fix the following issues:
      </h3>
      <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
        {Array.isArray(errors) ? (
          // Handle array of error messages
          errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))
        ) : (
          // Handle object with field-specific errors
          Object.entries(errors).map(([field, message]) => (
            <li key={field}>
              <span className="font-medium">{formatFieldName(field)}:</span> {message}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

// Export a helper to extract validation errors from any error object
export function extractValidationErrors(error: any): Record<string, string> | null {
  // Handle Zod validation errors format
  if (error?.name === 'ValidationError' || error?.code === 'VALIDATION_ERROR') {
    return error.validationErrors || error.errors || error.context?.validationErrors || {};
  }
  
  // Handle generic validation errors format
  if (error?.validationErrors) {
    return error.validationErrors;
  }
  
  // Handle specific field error format
  if (error?.fieldErrors) {
    return error.fieldErrors;
  }
  
  // If the error has a known structure with nested validation details
  if (error?.context?.errors) {
    return error.context.errors;
  }
  
  return null;
}