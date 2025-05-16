import { app, dialog } from 'electron';
import { createLogger, Logger } from '../../shared/utils/logger';
import { AppError } from '../../shared/utils/errors/AppError';

// Create logger for this module
const logger = createLogger('ErrorHandler');

/**
 * Global error handler for the main process
 */
export class ErrorHandler {
  private static logger = Logger.getInstance();
  /**
   * Initialize the global error handler
   */
  public static init(): void {
    // Handle Node.js uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      ErrorHandler.handleError(error);
    });
    
    // Handle Node.js unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      // Convert reason to error if it isn't one already
      const error = reason instanceof Error ? reason : new Error(`Unhandled promise rejection: ${reason}`);
      ErrorHandler.handleError(error);
    });
    
    this.logger.info('Global error handler initialized');
  }
  
  /**
   * Handle an error
   */
  public static handleError(error: Error | AppError): void {
    // Log the error
    if (error instanceof AppError) {
      this.logger.error('Application error', error);
      
      // For non-operational errors, we may need to take more drastic measures
      if (!error.isOperational) {
        ErrorHandler.handleFatalError(error);
      }
    } else {
      logger.error('Unhandled error', error);
      // Treat unknown errors as non-operational
      ErrorHandler.handleFatalError(error);
    }
  }
  
  /**
   * Handle a fatal error that requires the application to exit
   */
  private static handleFatalError(error: Error): void {
    this.logger.fatal('Fatal error occurred', error);
    
    // Show an error dialog before quitting
    if (app) {
      dialog.showErrorBox(
        'Fatal Error',
        'A critical error has occurred. The application will now close.\n\n' +
        'Please restart the application. If this issue persists, please contact support.'
      );
      
      // Give some time for dialog to be shown and logs to be written
      setTimeout(() => {
        app.exit(1);
      }, 1000);
    } else {
      // If app is not available (e.g. during startup), exit directly
      process.exit(1);
    }
  }
  
  /**
   * Send an error to the renderer process
   */
  public static sendErrorToRenderer(window: Electron.BrowserWindow | null, error: AppError): void {
    if (!window || window.isDestroyed()) return;
    
    try {
      window.webContents.send('app-error', {
        message: error.message,
        code: error.code,
        isOperational: error.isOperational,
        context: error.context
      });
    } catch (err) {
      this.logger.error('Failed to send error to renderer', err);
    }
  }
}

/**
 * Wrap an async function to properly handle errors
 */
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorHandler.handleError(error as Error);
      throw error; // Re-throw to allow caller to handle it if needed
    }
  };
}