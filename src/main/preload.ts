// src/main/preload.ts
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs for use in the renderer process
contextBridge.exposeInMainWorld('electron', {
  // Explicitly type the exposed API
  // Basic connection test
  ping: () => ipcRenderer.invoke('ping'),
  
  // Project operations
  projects: {
    getAll: () => ipcRenderer.invoke('project:getAll'),
    getById: (id) => ipcRenderer.invoke('project:getById', id),
    create: (data) => ipcRenderer.invoke('project:create', data),
    update: (id, data) => ipcRenderer.invoke('project:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('project:delete', id)
  },
  
  // Character operations
  characters: {
    getAll: (projectId) => ipcRenderer.invoke('character:getAll', projectId),
    getById: (id) => ipcRenderer.invoke('character:getById', id),
    create: (data) => ipcRenderer.invoke('character:create', data),
    update: (id, data) => ipcRenderer.invoke('character:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('character:delete', id)
  },
  
  // Memory operations
  memories: {
    getByCharacter: (characterId) => ipcRenderer.invoke('memory:getByCharacter', characterId),
    create: (data) => ipcRenderer.invoke('memory:create', data),
    update: (id, data) => ipcRenderer.invoke('memory:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('memory:delete', id)
  },
  
  // Conversation operations
  conversations: {
    getAll: (projectId) => ipcRenderer.invoke('conversation:getAll', projectId),
    getById: (id) => ipcRenderer.invoke('conversation:getById', id),
    create: (data) => ipcRenderer.invoke('conversation:create', data),
    update: (id, data) => ipcRenderer.invoke('conversation:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('conversation:delete', id)
  },
  
  // Message operations
  messages: {
    create: (data) => ipcRenderer.invoke('message:create', data)
  },
  
  // Timeline operations
  timelines: {
    getAll: (projectId) => ipcRenderer.invoke('timeline:getAll', projectId),
    getById: (id) => ipcRenderer.invoke('timeline:getById', id),
    create: (data) => ipcRenderer.invoke('timeline:create', data),
    update: (id, data) => ipcRenderer.invoke('timeline:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('timeline:delete', id)
  },
  
  // Timeline event operations
  events: {
    create: (data) => ipcRenderer.invoke('event:create', data),
    update: (id, data) => ipcRenderer.invoke('event:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('event:delete', id)
  },
  
  // Character-event link operations
  characterEventLinks: {
    create: (data) => ipcRenderer.invoke('characterEventLink:create', data),
    delete: (id) => ipcRenderer.invoke('characterEventLink:delete', id)
  },
  
  // Note operations
  notes: {
    getAll: (projectId) => ipcRenderer.invoke('note:getAll', projectId),
    getById: (id) => ipcRenderer.invoke('note:getById', id),
    create: (data) => ipcRenderer.invoke('note:create', data),
    update: (id, data) => ipcRenderer.invoke('note:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('note:delete', id)
  },
  
  // Tag operations
  tags: {
    getAll: (projectId) => ipcRenderer.invoke('tag:getAll', projectId),
    create: (data) => ipcRenderer.invoke('tag:create', data),
    update: (id, data) => ipcRenderer.invoke('tag:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('tag:delete', id)
  },
  
  // Settings operations
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (data) => ipcRenderer.invoke('settings:update', data)
  },

// Error handling
reportError: (error) => ipcRenderer.invoke('report-error', error),
onError: (callback) => {
  const listener = (_event, error) => callback(error);
  ipcRenderer.on('error', listener);
  return () => {
    ipcRenderer.removeListener('error', listener);
  };
},

// Get application logs
getLogs: (options = {}) => 
  ipcRenderer.invoke('get-logs', options),

// Add more API methods here as needed
});

