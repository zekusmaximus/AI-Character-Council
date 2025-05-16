// Import the RendererErrorHandler (adjust the path as needed)
import { RendererErrorHandler } from '../error/RendererErrorHandler';

/**
 * Handles IPC errors by reporting them and rethrowing.
 */
function handleIpcError(error: unknown, channel: string, args: any[]) {
  RendererErrorHandler.handleError({
    name: error instanceof Error ? error.name : 'IpcError',
    message: error instanceof Error ? error.message : String(error),
    code: (error as any).code || 'IPC_ERROR',
    context: {
      channel,
      args,
      ...(error instanceof Error && (error as any).context ? (error as any).context : {})
    }
  });

  throw error;
}

/**
* Typed IPC client factory 
* Creates a proxy object with methods matching channel names
*/
export function createIpcClient<T extends { [key: string]: (...args: any[]) => Promise<any> }>(
channels: { [K in keyof T]: string }
): T {
const client = {} as T;

for (const [key, channel] of Object.entries(channels)) {
  (client as any)[key] = (...args: any[]) => invokeIpc(channel, ...args);
}

return client;
}

/**
* Create a standardized API client for database operations
*/
export function createDbClient<T>(entityName: string) {
  return createIpcClient<{
    getAll: () => Promise<T[]>;
    getById: (id: string) => Promise<T>;
    create: (data: Omit<T, 'id'>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<boolean>;
  }>({
    getAll: `get${entityName}s`,
    getById: `get${entityName}ById`,
    create: `create${entityName}`,
    update: `update${entityName}`,
    delete: `delete${entityName}`
  });
}

/**
 * Invokes an IPC channel and handles errors.
 * Assumes window.electron.ipcRenderer.invoke is available.
 */
async function invokeIpc(channel: string, ...args: any[]): Promise<any> {
  try {
    // @ts-ignore
    return await window.electron.ipcRenderer.invoke(channel, ...args);
  } catch (error) {
    handleIpcError(error, channel, args);
  }
}

