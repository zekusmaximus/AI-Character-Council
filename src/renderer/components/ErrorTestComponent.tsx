import React, { useState } from 'react';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { ErrorDialog } from '../components/ErrorDialog';
import { useErrorNotification } from '../components/ErrorNotification';
import { withErrorHandling } from '../error/RendererErrorHandler';

/**
 * Component to test various error scenarios
 */
const ErrorTestComponent: React.FC = () => {
  const [localError, setLocalError] = useState<Error | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { setError } = useErrorNotification();
  
  // Function with error handling
  const handleErrorWithBoundary = () => {
    // This will be caught by the error boundary
    throw new Error('Test error for error boundary');
  };
  
  // Function with dialog
  const handleErrorWithDialog = () => {
    try {
      // Create an error with some context
      const error = new Error('Test error for error dialog');
      (error as any).code = 'TEST_DIALOG_ERROR';
      (error as any).context = {
        testData: 'This is some test context',
        timestamp: new Date().toISOString()
      };
      
      // Set the error and show dialog
      setLocalError(error);
      setIsDialogOpen(true);
    } catch (err) {
      console.error('Failed to show error dialog', err);
    }
  };
  
  // Function with global notification
  const handleErrorWithNotification = () => {
    try {
      // Create an error for notification
      const error = {
        message: 'Test error for notification system',
        code: 'TEST_NOTIFICATION_ERROR',
        context: {
          notification: true,
          timestamp: Date.now()
        }
      };
      
      // Set to the global notification system
      setError(error);
    } catch (err) {
      console.error('Failed to show error notification', err);
    }
  };
  
  // Async function with error handling
  const asyncErrorFn = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('Async test error');
  };
  
  // Use the withErrorHandling wrapper
  const handleAsyncError = withErrorHandling(
    async () => {
      await asyncErrorFn();
    },
    'ErrorTestComponent'
  );
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Error Handling Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={handleErrorWithBoundary}
          className="w-full py-2 px-4 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Test Error Boundary
        </button>
        
        <button
          onClick={handleErrorWithDialog}
          className="w-full py-2 px-4 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
        >
          Test Error Dialog
        </button>
        
        <button
          onClick={handleErrorWithNotification}
          className="w-full py-2 px-4 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
        >
          Test Error Notification
        </button>
        
        <button
          onClick={handleAsyncError}
          className="w-full py-2 px-4 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
        >
          Test Async Error
        </button>
      </div>
      
      {/* Error dialog */}
      <ErrorDialog
        isOpen={isDialogOpen}
        error={localError}
        onClose={() => setIsDialogOpen(false)}
        title="Test Error Dialog"
        showDetails={true}
        retryAction={() => alert('Retry action triggered')}
      />
    </div>
  );
};

// Wrap the component with an error boundary
const ErrorTestWithBoundary = () => (
  <ErrorBoundary
    fallback={(error, resetError) => (
      <div className="p-6 max-w-md mx-auto bg-red-50 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Caught by Boundary</h3>
        <p className="text-red-700 mb-4">{error.message}</p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reset Error
        </button>
      </div>
    )}
  >
    <ErrorTestComponent />
  </ErrorBoundary>
);

export default ErrorTestWithBoundary;