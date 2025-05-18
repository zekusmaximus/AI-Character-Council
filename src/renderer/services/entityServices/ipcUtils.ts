// src/renderer/services/entityServices/ipcUtils.ts

import { createLogger } from '../../../shared/utils/logger';

const logger = createLogger('IpcUtils');

/**
 * Generic IPC utility for interacting with main process
 * @param channel The IPC channel to invoke
 * @param args Arguments to pass to the IPC channel
 * @returns The response data or throws an error
 */
export async function invokeIpc<T>(channel: string, ...args: any[]): Promise<T> {
  try {
    if (!window.electron) {
      throw new Error("Electron API is not available on window.");
    }
    
    // Call the IPC method and handle response format
    const response = await (window.electron as any)[channel](...args);
    
    // Return the data if successful
    if (response && response.success) {
      return response.data as T;
    }
    
    // If there's an error in the response, throw it
    if (response && response.error) {
      throw response.error;
    }
    
    // Fallback for unexpected response
    throw new Error(`IPC call to ${channel} failed with unknown error`);
  } catch (error) {
    // Log and re-throw for service layer to handle
    logger.error(`IPC error in channel ${channel}`, error);
    throw error;
  }
}