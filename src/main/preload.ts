// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Expose safe APIs for use in the renderer process
contextBridge.exposeInMainWorld('electron', {
  // Basic connection test
  ping: () => ipcRenderer.invoke('ping'),
  
  // Project operations
  projects: {
    getAll: () => ipcRenderer.invoke('project:getAll'),
    getById: (id: string) => ipcRenderer.invoke('project:getById', id),
    create: (data: any) => ipcRenderer.invoke('project:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('project:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('project:delete', id)
  },
  
  // Character operations
  characters: {
    getAll: (projectId: string) => ipcRenderer.invoke('character:getAll', projectId),
    getById: (id: string) => ipcRenderer.invoke('character:getById', id),
    create: (data: any) => ipcRenderer.invoke('character:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('character:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('character:delete', id)
  },
  
  // Memory operations
  memories: {
    getByCharacter: (characterId: string) => ipcRenderer.invoke('memory:getByCharacter', characterId),
    create: (data: any) => ipcRenderer.invoke('memory:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('memory:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('memory:delete', id)
  },
  
  // Conversation operations
  conversations: {
    getAll: (projectId: string) => ipcRenderer.invoke('conversation:getAll', projectId),
    getById: (id: string) => ipcRenderer.invoke('conversation:getById', id),
    create: (data: any) => ipcRenderer.invoke('conversation:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('conversation:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('conversation:delete', id)
  },
  
  // Message operations
  messages: {
    create: (data: any) => ipcRenderer.invoke('message:create', data)
  },
  
  // Timeline operations
  timelines: {
    getAll: (projectId: string) => ipcRenderer.invoke('timeline:getAll', projectId),
    getById: (id: string) => ipcRenderer.invoke('timeline:getById', id),
    create: (data: any) => ipcRenderer.invoke('timeline:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('timeline:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('timeline:delete', id)
  },
  
  // Timeline event operations
  events: {
    create: (data: any) => ipcRenderer.invoke('event:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('event:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('event:delete', id)
  },
  
  // Character-event link operations
  characterEventLinks: {
    create: (data: any) => ipcRenderer.invoke('characterEventLink:create', data),
    delete: (id: string) => ipcRenderer.invoke('characterEventLink:delete', id)
  },
  
  // Note operations
  notes: {
    getAll: (projectId: string) => ipcRenderer.invoke('note:getAll', projectId),
    getById: (id: string) => ipcRenderer.invoke('note:getById', id),
    create: (data: any) => ipcRenderer.invoke('note:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('note:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('note:delete', id)
  },
  
  // Tag operations
  tags: {
    getAll: (projectId: string) => ipcRenderer.invoke('tag:getAll', projectId),
    create: (data: any) => ipcRenderer.invoke('tag:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('tag:update', { id, data }),
    delete: (id: string) => ipcRenderer.invoke('tag:delete', id)
  },
  
  // Settings operations
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (data: any) => ipcRenderer.invoke('settings:update', data)
  },

// Error handling
reportError: (error: any) => ipcRenderer.invoke('report-error', error),
onError: (callback: (error: any) => void) => {
  const listener = (_event: any, error: any) => callback(error);
  ipcRenderer.on('error', listener);
  return () => {
    ipcRenderer.removeListener('error', listener);
  };
},

// Get application logs
getLogs: (options: { limit?: number, minLevel?: string } = {}) => 
  ipcRenderer.invoke('get-logs', options),

// Add more API methods here as needed
});

// Add type definitions for window.electron
declare global {
interface Window {
  electron: {
    ping: () => Promise<string>;
    reportError: (error: any) => Promise<{ received: boolean }>;
    onError: (callback: (error: any) => void) => () => void;
    getLogs: (options?: { limit?: number, minLevel?: string }) => Promise<any>;
    // Add more methods here as they are implemented
  };
}
}
