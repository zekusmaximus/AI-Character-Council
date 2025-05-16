// src/renderer/types/electron.d.ts
export interface ElectronAPI {
    ping: () => Promise<string>;
    
    projects: {
      getAll: () => Promise<any[]>;
      getById: (id: string) => Promise<any>;
      create: (data: any) => Promise<any>;
      update: (id: string, data: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    characters: {
      getAll: (projectId: string) => Promise<any[]>;
      getById: (id: string) => Promise<any>;
      create: (data: any) => Promise<any>;
      update: (id: string, data: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    memories: {
      getByCharacter: (characterId: string) => Promise<any[]>;
      create: (data: any) => Promise<any>;
      update: (id: string, data: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    conversations: {
      getAll: (projectId: string) => Promise<any[]>;
      getById: (id: string) => Promise<any>;
      create: (data: any) => Promise<any>;
      update: (id: string, data: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    messages: {
      create: (data: any) => Promise<any>;
    };
    
    timelines: {
      getAll: (projectId: string) => Promise<any[]>;
      getById: (id: string) => Promise<any>;
      create: (data: any) => Promise<any>;
      update: (id: string, data: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    events: {
      create: (data: any) => Promise<any>;
      update: (id: string, data: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    characterEventLinks: {
      create: (data: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    notes: {
      getAll: (projectId: string) => Promise<any[]>;
      getById: (id: string) => Promise<any>;
      create: (data: any) => Promise<any>;
      update: (id: string, data: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    tags: {
      getAll: (projectId: string) => Promise<any[]>;
      create: (data: any) => Promise<any>;
      update: (id: string, data: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    };
    
    settings: {
      get: () => Promise<any>;
      update: (data: any) => Promise<any>;
    };
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }