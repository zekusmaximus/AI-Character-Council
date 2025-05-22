import { useState, useEffect } from 'react';
import { ErrorBoundary } from './error/ErrorBoundary';
import { ErrorProvider } from './components';
import { RendererErrorHandler } from './error/RendererErrorHandler';

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

function App() {
  const [status, setStatus] = useState<string>('');
  const [errorDemo, setErrorDemo] = useState<string | null>(null);

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
      setErrorDemo(null);
    }
  };

  // Demo error handling
  const triggerDemoError = (type: string) => {
    try {
      setErrorDemo(type);
      
      switch (type) {
        case 'sync':
          // Synchronous error
          throw new Error('This is a demo synchronous error');
        
        case 'async':
          // Asynchronous error
          setTimeout(() => {
            throw new Error('This is a demo asynchronous error');
          }, 100);
          break;
          
        case 'promise':
          // Promise rejection
          Promise.reject(new Error('This is a demo promise rejection'));
          break;
          
        case 'network':
          // Simulate network error
          fetch('https://non-existent-domain-12345.com')
            .then(async response => {
              if (!response.ok) {
                await RendererErrorHandler.handleApiError(response);
              }
              return response.json();
            })
            .then(data => console.log(data))
            .catch(error => {
              RendererErrorHandler.handleError(error);
            });
          break;
          
        default:
          setErrorDemo(null);
      }
    } catch (error) {
      // For synchronous errors, they'll be caught here
      // For async errors, they'll be caught by the global handlers
      if (error instanceof Error) {
        RendererErrorHandler.handleError({
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: 'DEMO_ERROR',
          isOperational: true,
          context: { errorType: type }
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">AI Character Council</h1>
        <p className="text-gray-600 mb-6">Speculative Fiction Character Management</p>
        
        <div className="space-y-4">
          <button 
            onClick={testConnection}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Test Electron Connection
          </button>
          
          <div className="border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold mb-3">Error Handling Demo</h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => triggerDemoError('sync')}
                className={`${
                  errorDemo === 'sync' ? 'bg-red-500' : 'bg-red-100'
                } hover:bg-red-200 text-red-800 font-medium py-2 px-3 rounded text-sm`}
              >
                Trigger Sync Error
              </button>
              
              <button 
                onClick={() => triggerDemoError('async')}
                className={`${
                  errorDemo === 'async' ? 'bg-red-500' : 'bg-red-100'
                } hover:bg-red-200 text-red-800 font-medium py-2 px-3 rounded text-sm`}
              >
                Trigger Async Error
              </button>
              
              <button 
                onClick={() => triggerDemoError('promise')}
                className={`${
                  errorDemo === 'promise' ? 'bg-red-500' : 'bg-red-100'
                } hover:bg-red-200 text-red-800 font-medium py-2 px-3 rounded text-sm`}
              >
                Trigger Promise Rejection
              </button>
              
              <button 
                onClick={() => triggerDemoError('network')}
                className={`${
                  errorDemo === 'network' ? 'bg-red-500' : 'bg-red-100'
                } hover:bg-red-200 text-red-800 font-medium py-2 px-3 rounded text-sm`}
              >
                Trigger Network Error
              </button>
            </div>
          </div>
        </div>
        
        {status && (
          <p className="mt-4 text-sm text-gray-700 p-2 bg-gray-100 rounded">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

// Wrap the app in the error handling components
function AppWithErrorHandling() {
  return (
    <ErrorBoundary fallback={(error, resetError) => <RootErrorFallback error={error} resetError={resetError} />}>
      <ErrorProvider>
        <App />
      </ErrorProvider>
    </ErrorBoundary>
  );
}

export default AppWithErrorHandling;