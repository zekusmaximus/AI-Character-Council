
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createLogger } from '../../shared/utils/logger.ts';
import { RendererErrorHandler } from './RendererErrorHandler';

const logger = createLogger('ErrorBoundary');

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch errors in the React component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { componentName, onError } = this.props;
    
    // Log the error
    logger.error(`Error caught by boundary${componentName ? ` in ${componentName}` : ''}`, error, {
      componentStack: errorInfo.componentStack
    });
    
    // Report to main process
    RendererErrorHandler.reportErrorToMain({
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: 'REACT_ERROR',
      context: {
        componentName,
        componentStack: errorInfo.componentStack
      }
    });
    
    // Call the error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  }
  
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };
  
  render(): ReactNode {
    const { children, fallback } = this.props;
    const { hasError, error } = this.state;
    
    if (hasError && error) {
      // Render the fallback UI
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.resetError);
        }
        return fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-4 border border-red-300 rounded bg-red-50 text-red-700">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="mb-4">{error.message || 'An unexpected error occurred'}</p>
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      );
    }
    
    return children;
  }
}

/**
 * Higher-order component to wrap components with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ErrorBoundaryProps, 'children'> = {}
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...options} componentName={options.componentName || displayName}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  ComponentWithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}