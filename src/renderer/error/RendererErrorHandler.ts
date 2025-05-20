import { createLogger } from '../../shared/utils/logger.ts';
import type { ElectronAPI } from '../types/electron';
// Define a shared ElectronAPI interface for type safety

// Define the RendererErrorData type for error event payloads
export interface RendererErrorData {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  context?: any;
}

// Extend the window.electron type to include onError and reportError
declare global {
  interface Window {
    electron?: ElectronAPI; // Use the defined ElectronAPI interface
  }
}

// Set up logger for the renderer process
const logger = createLogger('RendererErrorHandler');

/**
 * Error handling service for the renderer process
 */
export class RendererErrorHandler {
  /**
   * Initialize global error handling for the renderer process
   */
  public static init(): void {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      logger.error('Uncaught error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
      
      // Report to main process
      RendererErrorHandler.reportErrorToMain({
        name: event.error?.name || 'Error',
        message: event.message,
        stack: event.error?.stack,
        code: 'UNCAUGHT_ERROR',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
      
      return false; // Allow default error handling to continue
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      
      logger.error('Unhandled promise rejection', reason);
      
      // Report to main process
      RendererErrorHandler.reportErrorToMain({
        name: reason?.name || 'UnhandledRejection',
        message: reason?.message || String(reason),
        stack: reason?.stack,
        code: 'UNHANDLED_REJECTION',
        context: {
          reason: reason instanceof Error ? undefined : reason
        }
      });
      
      return false; // Allow default error handling to continue
    });
    
    // Listen for error events from the main process
    if (window.electron?.onError) {
      window.electron.onError((errorData: RendererErrorData) => {
        logger.warn('Error received from main process', errorData);
        RendererErrorHandler.handleError(errorData);
      });
    }
    
    logger.info('Renderer error handler initialized');
  }
  
  /**
   * Handle an error in the renderer process
   */
  public static handleError(error: any): void {
    // Log the error
    logger.error('Application error in renderer', error);
    
    // Dispatch error event so UI components can react
    const errorEvent = new CustomEvent('app:error', {
      detail: error
    });
    window.dispatchEvent(errorEvent);
  }
  
  /**
   * Report an error to the main process
   */
  public static reportErrorToMain(error: any): void {
    if (window.electron?.reportError) {
      try {
        window.electron.reportError(error);
      } catch (e) {
        logger.error('Failed to report error to main process', e);
      }
    } else {
      logger.warn('Cannot report error to main process: electron.reportError not available');
    }
  }
  
  /**
   * Handle API errors from fetch or similar calls
   */
  public static async handleApiError(response: Response): Promise<never> {
    let errorData: any = {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    };
    
    try {
      // Try to parse response body
      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        errorData.body = await response.json();
      } else {
        errorData.body = await response.text();
      }
    } catch (e) {
      errorData.parseError = String(e);
    }
    
    const error = new Error(`API error: ${response.status} ${response.statusText}`);
    (error as any).apiError = errorData;
    
    logger.error('API error', error, errorData);
    throw error;
  }
  
  /**
   * Create an error handler for async operations in components
   */
  public static createErrorBoundary(component: string) {
    return (error: Error) => {
      logger.error(`Error in component ${component}`, error);
      RendererErrorHandler.handleError({
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: 'COMPONENT_ERROR',
        context: { component }
      });
    };
  }
}

/**
 * Higher-order function to wrap async functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  componentName: string
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorHandler = RendererErrorHandler.createErrorBoundary(componentName);
      errorHandler(error as Error);
      throw error; // Re-throw to allow component to handle it if needed
    }
  };
}