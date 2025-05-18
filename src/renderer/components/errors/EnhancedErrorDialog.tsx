// src/renderer/components/errors/EnhancedErrorDialog.tsx

import React, { useState, useEffect } from 'react';
import { ValidationErrorDisplay, extractValidationErrors } from './ValidationErrorDisplay';
import { getFriendlyErrorMessage, getErrorDetails, formatErrorDetails } from '../../utils/errorUtils';

interface EnhancedErrorDialogProps {
  isOpen: boolean;
  error: Error | any | null;
  onClose: () => void;
  title?: string;
  showDetails?: boolean;
  retryAction?: () => void;
  cancelButtonText?: string;
  retryButtonText?: string;
}

export const EnhancedErrorDialog: React.FC<EnhancedErrorDialogProps> = ({
  isOpen,
  error,
  onClose,
  title = 'Error',
  showDetails = false,
  retryAction,
  cancelButtonText = 'Close',
  retryButtonText = 'Try Again',
}) => {
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null);
  
  // Reset detail view when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowErrorDetails(false);
    }
  }, [isOpen]);
  
  // Extract validation errors when the error changes
  useEffect(() => {
    if (error) {
      const extractedErrors = extractValidationErrors(error);
      setValidationErrors(extractedErrors);
    } else {
      setValidationErrors(null);
    }
  }, [error]);
  
  if (!isOpen || !error) {
    return null;
  }
  
  // Extract error information
  const errorName = error.name || 'Error';
  const friendlyMessage = getFriendlyErrorMessage(error);
  const errorDetails = getErrorDetails(error);
  const isValidationError = Boolean(validationErrors);
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Dialog */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto z-10"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="error-dialog-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 
              id="error-dialog-title" 
              className="text-lg font-medium text-gray-900 flex items-center"
            >
              <svg 
                className="w-6 h-6 text-red-500 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              {isValidationError ? 'Validation Error' : title}
            </h3>
            <button 
              type="button" 
              className="text-gray-400 hover:text-gray-500" 
              onClick={onClose}
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Body */}
          <div className="px-6 py-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-1">{errorName}</p>
              <p className="text-gray-900">{friendlyMessage}</p>
            </div>
            
            {/* Validation Errors */}
            {validationErrors && (
              <div className="mt-3">
                <ValidationErrorDisplay errors={validationErrors} />
              </div>
            )}
            
            {/* Error Details (Collapsible) */}
            {showDetails && (
              <div className="mt-4">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  aria-expanded={showErrorDetails}
                >
                  <svg 
                    className={`w-4 h-4 mr-1 transform ${showErrorDetails ? 'rotate-90' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  {showErrorDetails ? 'Hide Technical Details' : 'Show Technical Details'}
                </button>
                
                {showErrorDetails && (
                  <div className="mt-2 bg-gray-50 p-3 rounded-md text-xs overflow-auto max-h-40">
                    <pre className="whitespace-pre-wrap break-words">
                      {formatErrorDetails(errorDetails)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              {cancelButtonText}
            </button>
            
            {retryAction && (
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                onClick={() => {
                  retryAction();
                  onClose();
                }}
              >
                {retryButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};