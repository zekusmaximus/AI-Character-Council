// Report error to error handling system
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