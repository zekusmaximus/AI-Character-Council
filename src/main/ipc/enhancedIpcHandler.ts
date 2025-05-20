// src/main/ipc/enhancedIpcHandler.ts

import { ipcMain } from 'electron';
import { createLogger } from '../../shared/utils/logger';
import { ServerService } from '../services/ServerService';
import { AppError, ValidationError } from '../../shared/utils/errors/AppError';

const logger = createLogger('EnhancedIpcHandler');

/**
 * Register an IPC handler with enhanced error handling
 */
export function registerIpcHandler(channel: string, handlerFn: (...args: any[]) => Promise<any> | any): void {
  logger.debug(`Registering enhanced IPC handler for channel: ${channel}`);
  
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      // Log the request
      logger.debug(`IPC request received on channel ${channel}`, { args });
      
      // Execute the handler
      const result = await handlerFn(...args);
      
      // Log and return the successful result
      logger.debug(`IPC handler for ${channel} completed successfully`);
      return { success: true, data: result };
    } catch (error) {
      // Handle and log the error
      logger.error(`Error in IPC handler for channel ${channel}`, error);
      
      // Format the error for IPC with special handling for validation errors
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: {
            name: error.name,
            message: error.message,
            code: error.code,
            isOperational: error.isOperational,
            validationErrors: error.context.validationErrors,
            context: error.context
          }
        };
      } else if (error instanceof AppError) {
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
 * Initialize enhanced IPC handlers using the ServerService
 */
export function initEnhancedIpcHandlers(): void {
  // Project handlers
  registerIpcHandler('projects.getAll', async () => {
    return await ServerService.getAllProjects();
  });
  
  registerIpcHandler('projects.getById', async (id: string) => {
    return await ServerService.getProjectById(id);
  });
  
  registerIpcHandler('projects.create', async (data: any) => {
    return await ServerService.createProject(data);
  });
  
  registerIpcHandler('projects.update', async (id: string, data: any) => {
    return await ServerService.updateProject(id, data);
  });
  
  registerIpcHandler('projects.delete', async (id: string) => {
    return await ServerService.deleteProject(id);
  });
  
  registerIpcHandler('projects.getAllWithCounts', async () => {
    return await ServerService.getProjectsWithCounts();
  });
  
  // Character handlers
  registerIpcHandler('characters.getAll', async (projectId: string) => {
    return await ServerService.getCharactersByProject(projectId);
  });
  
  registerIpcHandler('characters.getById', async (id: string) => {
    return await ServerService.getCharacterById(id);
  });
  
  registerIpcHandler('characters.create', async (data: any) => {
    return await ServerService.createCharacter(data);
  });
  
  registerIpcHandler('characters.update', async (id: string, data: any) => {
    return await ServerService.updateCharacter(id, data);
  });
  
  registerIpcHandler('characters.delete', async (id: string) => {
    return await ServerService.deleteCharacter(id);
  });
  
  // Memory handlers
  registerIpcHandler('memories.getByCharacter', async (characterId: string) => {
    return await ServerService.getMemoriesByCharacter(characterId);
  });
  
  // Similar handlers for other entities would be registered here
  
  // Settings handlers
  registerIpcHandler('settings.get', async () => {
    return await ServerService.getUserSettings();
  });
  
  registerIpcHandler('settings.update', async (data: any) => {
    return await ServerService.updateUserSettings(data);
  });
  
  // Add error reporting handler
  registerIpcHandler('report-error', (errorData: any) => {
    logger.error('Error reported from renderer', errorData);
    return { received: true };
  });
  
  logger.info('Enhanced IPC handlers initialized');
}