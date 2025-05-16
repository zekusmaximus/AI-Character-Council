export interface ElectronAPI {
  // Basic connection test
  ping: () => Promise<string>;

  // Project operations
  projects: {
    getAll: () => Promise<any>;
    getById: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };

  // Character operations
  characters: {
    getAll: (projectId: string) => Promise<any>;
    getById: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };

  // Memory operations
  memories: {
    getByCharacter: (characterId: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };

  // Conversation operations
  conversations: {
    getAll: (projectId: string) => Promise<any>;
    getById: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };

  // Message operations
  messages: {
    create: (data: any) => Promise<any>;
  };

  // Timeline operations
  timelines: {
    getAll: (projectId: string) => Promise<any>;
    getById: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };

  // Event operations
  events: {
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };

  // Character-Event Link operations
  characterEventLinks: {
    create: (data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };

  // Note operations
  notes: {
    getAll: (projectId: string) => Promise<any>;
    getById: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };

  // Tag operations
  tags: {
    getAll: (projectId: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };

  // Settings operations
  settings: {
    get: () => Promise<any>;
    update: (data: any) => Promise<any>;
  };

  // Error handling
  reportError: (error: any) => Promise<{ received: boolean }>;
  onError: (callback: (error: any) => void) => () => void;

  // Get application logs
  getLogs: (options?: { limit?: number; minLevel?: string }) => Promise<any>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}