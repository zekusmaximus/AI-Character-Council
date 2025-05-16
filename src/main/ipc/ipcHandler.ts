import { ipcMain } from 'electron';
import { createLogger } from '../shared/utils/logger';
import { AppError } from '../shared/errors/AppError';
import { ErrorHandler } from './error/ErrorHandler';

const logger = createLogger('IpcHandler');

/**
 * Type for IPC handler functions
 */
type IpcHandlerFn = (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any> | any;

/**
 * Register an IPC handler with error handling
 */
export function registerIpcHandler(channel: string, handler: IpcHandlerFn): void {
  logger.debug(`Registering IPC handler for channel: ${channel}`);
  
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      // Log the request
      logger.debug(`IPC request received on channel ${channel}`, { args });
      
      // Execute the handler
      const result = await handler(event, ...args);
      
      // Log and return the result
      logger.debug(`IPC handler for ${channel} completed successfully`);
      return { success: true, data: result };
    } catch (error) {
      // Handle and log the error
      logger.error(`Error in IPC handler for channel ${channel}`, error);
      
      // Format the error for IPC
      if (error instanceof AppError) {
        return {
          success: false,
          error: {
            name: error.name,
            message: error.message,
            code: error.code,
            isOperational: error.isOperational,
            context: error.context
          }
        };
      } else {
        // Handle unknown errors
        const unknownError = error instanceof Error ? error : new Error(String(error));
        return {
          success: false,
          error: {
            name: unknownError.name,
            message: unknownError.message,
            code: 'UNKNOWN_ERROR',
            isOperational: false
          }
        };
      }
    }
  });
}

/**
 * Remove an IPC handler
 */
export function removeIpcHandler(channel: string): void {
  logger.debug(`Removing IPC handler for channel: ${channel}`);
  ipcMain.removeHandler(channel);
}

/**
 * Initialize core IPC handlers
 */
export function initCoreIpcHandlers(): void {
  // Ping handler to check IPC connectivity
  registerIpcHandler('ping', () => {
    return 'pong';
  });
  
  // Handler to get application logs
  registerIpcHandler('get-logs', async (event, options: { limit?: number, minLevel?: string } = {}) => {
    // Implementation will depend on the logging system
    return { message: 'Log retrieval not implemented yet' };
  });
  
  // Handler to report an error from the renderer
  registerIpcHandler('report-error', (event, errorData: any) => {
    const { message, stack, code, context } = errorData;
    
    // Create an AppError from the data
    const error = new AppError(
      message || 'Error reported from renderer',
      code || 'RENDERER_ERROR',
      {
        context,
        isOperational: true
      }
    );
    
    // Add the stack if available
    if (stack) {
      error.stack = stack;
    }
    
    // Handle the error
    ErrorHandler.handleError(error);
    
    return { received: true };
  });
  
  logger.info('Core IPC handlers initialized');
}