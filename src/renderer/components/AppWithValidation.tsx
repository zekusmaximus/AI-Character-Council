// src/renderer/components/AppWithValidation.tsx

import { useState, useEffect } from 'react';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { ErrorProvider } from '../components';
import { RendererErrorHandler } from '../error/RendererErrorHandler';
import ValidationDemo from './demo/ValidationDemo';
import { EnhancedErrorDialog } from './errors/EnhancedErrorDialog';

// Create a custom fallback UI for the root error boundary
const RootErrorFallback = ({ error, resetError }: { error: Error, resetError: () => void }) => (
  <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
      <svg 
        className="w-16 h-16 text-red-500 mx-auto mb-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
        />
      </svg>

      <h1 className="text-2xl font-bold text-gray-800 mb-4">Application Error</h1>
      <p className="text-gray-600 mb-6">
        {error.message || 'An unexpected error occurred in the application.'}
      </p>

      <div className="flex flex-col space-y-4">
        <button 
          onClick={resetError}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          Try Again
        </button>

        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
        >
          Reload Application
        </button>
      </div>
    </div>
  </div>
);

function AppWithValidation() {
  const [status, setStatus] = useState<string>('');
  const [appError, setAppError] = useState<Error | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('home');

  // Initialize error handling on component mount
  useEffect(() => {
    RendererErrorHandler.init();
  }, []);

  // Test connection to the main process
  const testConnection = async () => {
    try {
      setStatus('Connecting...');
      // @ts-ignore - window.electron is defined in the preload script
      const response = await window.electron.ping();
      setStatus(`Connection successful: ${response}`);      
    } catch (error) {
      setStatus(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);

      // Show the error dialog
      setAppError(error instanceof Error ? error : new Error(String(error)));
      setIsErrorDialogOpen(true);
    }
  };

  // Trigger a sample validation error
  const triggerValidationError = () => {
    const error = new Error("Validation failed");
    (error as any).name = "ValidationError";
    (error as any).code = "VALIDATION_ERROR";
    (error as any).validationErrors = {
      name: "Name is required",
      email: "Email must be valid",
      password: "Password must be at least 8 characters"
    };

    setAppError(error);
    setIsErrorDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">AI Character Council</h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    activeTab === 'home' 
                      ? 'text-indigo-600 border-b-2 border-indigo-500' 
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveTab('validation')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    activeTab === 'validation' 
                      ? 'text-indigo-600 border-b-2 border-indigo-500' 
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Validation Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="py-6">
        {activeTab === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">AI Character Council</h1>
              <p className="text-gray-600 mb-6">Speculative Fiction Character Management</p>

              <div className="space-y-4">
                <button 
                  onClick={testConnection}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                >
                  Test Electron Connection
                </button>

                <button 
                  onClick={triggerValidationError}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded"
                >
                  Show Validation Error Dialog
                </button>
              </div>

              {status && (
                <p className="mt-4 text-sm text-gray-700 p-2 bg-gray-100 rounded">
                  {status}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'validation' && <ValidationDemo />}
      </div>

      {/* Error Dialog */}
      <EnhancedErrorDialog
        isOpen={isErrorDialogOpen}
        error={appError}
        onClose={() => setIsErrorDialogOpen(false)}
        showDetails={true}
      />
    </div>
  );
}

// Wrap the app in the error handling components
function AppWithErrorHandling() {
  return (
    <ErrorBoundary fallback={(error, resetError) => <RootErrorFallback error={error} resetError={resetError} />}>
      <ErrorProvider>
        <AppWithValidation />
      </ErrorProvider>
    </ErrorBoundary>
  );
}

export default AppWithErrorHandling;