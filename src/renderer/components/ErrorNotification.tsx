import React, { useEffect, useState } from 'react';

interface ErrorNotificationProps {
  error: {
    message: string;
    code?: string;
    context?: Record<string, any>;
  } | null;
  onDismiss?: () => void;
  autoHideDuration?: number;
  className?: string;
  showDetails?: boolean;
}

/**
 * Component to display error notifications to the user
 */
export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onDismiss,
  autoHideDuration = 5000, // 5 seconds by default
  className = '',
  showDetails = false,
}) => {
  const [visible, setVisible] = useState(!!error);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  
  // Reset visibility when error changes
  useEffect(() => {
    setVisible(!!error);
    setShowDetailPanel(false);
    
    // Auto-hide after duration if enabled
    if (error && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [error, autoHideDuration, onDismiss]);
  
  // Handle dismiss
  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };
  
  // Toggle detail panel
  const toggleDetails = () => {
    setShowDetailPanel(!showDetailPanel);
  };
  
  // If no error or not visible, don't render
  if (!error || !visible) {
    return null;
  }
  
  return (
    <div className={`bg-red-50 border border-red-300 rounded p-4 shadow-md ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <h3 className="text-red-700 font-medium text-sm mb-1">{error.code || 'Error'}</h3>
          <p className="text-red-600">{error.message || 'An unexpected error occurred'}</p>
        </div>
        <button 
          onClick={handleDismiss}
          className="ml-4 text-red-500 hover:text-red-700"
          aria-label="Dismiss"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Conditionally show details button */}
      {(showDetails && error.context) && (
        <div className="mt-2">
          <button
            onClick={toggleDetails}
            className="text-sm text-red-600 hover:text-red-800 underline focus:outline-none"
          >
            {showDetailPanel ? 'Hide details' : 'Show details'}
          </button>
          
          {showDetailPanel && (
            <div className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-40">
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(error.context, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Global error notification context and provider
 */
interface ErrorContextType {
  error: {
    message: string;
    code?: string;
    context?: Record<string, any>;
  } | null;
  setError: (error: ErrorContextType['error']) => void;
  clearError: () => void;
}

const ErrorContext = React.createContext<ErrorContextType>({
  error: null,
  setError: () => {},
  clearError: () => {},
});

export const useErrorNotification = () => React.useContext(ErrorContext);

interface ErrorProviderProps {
  children: React.ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setError] = useState<ErrorContextType['error']>(null);
  
  const clearError = () => setError(null);
  
  // Listen for global app error events
  useEffect(() => {
    const handleAppError = (event: CustomEvent) => {
      setError(event.detail);
    };
    
    // Add event listener
    window.addEventListener('app:error' as any, handleAppError as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('app:error' as any, handleAppError as EventListener);
    };
  }, []);
  
  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
      {/* Render the global error notification */}
      <div className="fixed bottom-4 right-4 z-50 max-w-md w-full">
        <ErrorNotification 
          error={error} 
          onDismiss={clearError} 
          showDetails={true}
        />
      </div>
    </ErrorContext.Provider>
  );
};