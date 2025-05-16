// src/renderer/services/databaseService.ts

// Project Services
export const ProjectService = {
    getAll: async () => {
      return await window.electron.projects.getAll();
    },
    
    getById: async (id: string) => {
      return await window.electron.projects.getById(id);
    },
    
    create: async (data: any) => {
      return await window.electron.projects.create(data);
    },
    
    update: async (id: string, data: any) => {
      return await window.electron.projects.update(id, data);
    },
    
    delete: async (id: string) => {
      return await window.electron.projects.delete(id);
    }
  };
  
  // Character Services
  export const CharacterService = {
    getAll: async (projectId: string) => {
      return await window.electron.characters.getAll(projectId);
    },
    
    getById: async (id: string) => {
      return await window.electron.characters.getById(id);
    },
    
    create: async (data: any) => {
      // Handle JSON stringification here to prevent repeated code
      if (data.personalityTraits && typeof data.personalityTraits !== 'string') {
        data.personalityTraits = JSON.stringify(data.personalityTraits);
      }
      
      if (data.characterSheet && typeof data.characterSheet !== 'string') {
        data.characterSheet = JSON.stringify(data.characterSheet);
      }
      
      return await window.electron.characters.create(data);
    },
    
    update: async (id: string, data: any) => {
      // Handle JSON stringification
      if (data.personalityTraits && typeof data.personalityTraits !== 'string') {
        data.personalityTraits = JSON.stringify(data.personalityTraits);
      }
      
      if (data.characterSheet && typeof data.characterSheet !== 'string') {
        data.characterSheet = JSON.stringify(data.characterSheet);
      }
      
      return await window.electron.characters.update(id, data);
    },
    
    delete: async (id: string) => {
      return await window.electron.characters.delete(id);
    },
    
    // Helper to parse JSON fields when retrieving character
    parseCharacter: (character: any) => {
      if (!character) return null;
      
      const parsed = { ...character };
      
      // Parse personality traits
      if (parsed.personalityTraits && typeof parsed.personalityTraits === 'string') {
        try {
          parsed.personalityTraits = JSON.parse(parsed.personalityTraits);
        } catch (e) {
          console.error('Failed to parse personalityTraits:', e);
          parsed.personalityTraits = {};
        }
      }
      
      // Parse character sheet
      if (parsed.characterSheet && typeof parsed.characterSheet === 'string') {
        try {
          parsed.characterSheet = JSON.parse(parsed.characterSheet);
        } catch (e) {
          console.error('Failed to parse characterSheet:', e);
          parsed.characterSheet = {};
        }
      }
      
      return parsed;
    }
  };
  
  // Memory Services
  export const MemoryService = {
    getByCharacter: async (characterId: string) => {
      const memories = await window.electron.memories.getByCharacter(characterId);
      
      // Parse metadata JSON
      return memories.map((memory: any) => {
        if (memory.metadata && typeof memory.metadata === 'string') {
          try {
            memory.metadata = JSON.parse(memory.metadata);
          } catch (e) {
            console.error('Failed to parse memory metadata:', e);
            memory.metadata = {};
          }
        }
        return memory;
      });
    },
    
    create: async (data: any) => {
      // Handle JSON stringification
      if (data.metadata && typeof data.metadata !== 'string') {
        data.metadata = JSON.stringify(data.metadata);
      }
      
      return await window.electron.memories.create(data);
    },
    
    update: async (id: string, data: any) => {
      // Handle JSON stringification
      if (data.metadata && typeof data.metadata !== 'string') {
        data.metadata = JSON.stringify(data.metadata);
      }
      
      return await window.electron.memories.update(id, data);
    },
    
    delete: async (id: string) => {
      return await window.electron.memories.delete(id);
    }
  };
  
  // Conversation Services
  export const ConversationService = {
    getAll: async (projectId: string) => {
      return await window.electron.conversations.getAll(projectId);
    },
    
    getById: async (id: string) => {
      const conversation = await window.electron.conversations.getById(id);
      
      // Parse message metadata
      if (conversation && conversation.messages) {
        conversation.messages = conversation.messages.map((message: any) => {
          if (message.metadata && typeof message.metadata === 'string') {
            try {
              message.metadata = JSON.parse(message.metadata);
            } catch (e) {
              console.error('Failed to parse message metadata:', e);
              message.metadata = {};
            }
          }
          return message;
        });
      }
      
      return conversation;
    },
    
    create: async (data: any) => {
      return await window.electron.conversations.create(data);
    },
    
    update: async (id: string, data: any) => {
      return await window.electron.conversations.update(id, data);
    },
    
    delete: async (id: string) => {
      return await window.electron.conversations.delete(id);
    },
    
    createMessage: async (data: any) => {
      // Handle JSON stringification
      if (data.metadata && typeof data.metadata !== 'string') {
        data.metadata = JSON.stringify(data.metadata);
      }
      
      return await window.electron.messages.create(data);
    }
  };
  
  // Timeline Services
  export const TimelineService = {
    getAll: async (projectId: string) => {
      return await window.electron.timelines.getAll(projectId);
    },
    
    getById: async (id: string) => {
      const timeline = await window.electron.timelines.getById(id);
      
      // Parse event metadata
      if (timeline && timeline.events) {
        timeline.events = timeline.events.map((event: any) => {
          if (event.metadata && typeof event.metadata === 'string') {
            try {
              event.metadata = JSON.parse(event.metadata);
            } catch (e) {
              console.error('Failed to parse event metadata:', e);
              event.metadata = {};
            }
          }
          return event;
        });
      }
      
      return timeline;
    },
    
    create: async (data: any) => {
      return await window.electron.timelines.create(data);
    },
    
    update: async (id: string, data: any) => {
      return await window.electron.timelines.update(id, data);
    },
    
    delete: async (id: string) => {
      return await window.electron.timelines.delete(id);
    },
    
    createEvent: async (data: any) => {
      // Handle JSON stringification
      if (data.metadata && typeof data.metadata !== 'string') {
        data.metadata = JSON.stringify(data.metadata);
      }
      
      return await window.electron.events.create(data);
    },
    
    updateEvent: async (id: string, data: any) => {
      // Handle JSON stringification
      if (data.metadata && typeof data.metadata !== 'string') {
        data.metadata = JSON.stringify(data.metadata);
      }
      
      return await window.electron.events.update(id, data);
    },
    
    deleteEvent: async (id: string) => {
      return await window.electron.events.delete(id);
    },
    
    linkCharacterToEvent: async (data: any) => {
      return await window.electron.characterEventLinks.create(data);
    },
    
    unlinkCharacterFromEvent: async (id: string) => {
      return await window.electron.characterEventLinks.delete(id);
    }
  };
  
  // Note Services
  export const NoteService = {
    getAll: async (projectId: string) => {
      return await window.electron.notes.getAll(projectId);
    },
    
    getById: async (id: string) => {
      return await window.electron.notes.getById(id);
    },
    
    create: async (data: any) => {
      return await window.electron.notes.create(data);
    },
    
    update: async (id: string, data: any) => {
      return await window.electron.notes.update(id, data);
    },
    
    delete: async (id: string) => {
      return await window.electron.notes.delete(id);
    }
  };
  
  // Tag Services
  export const TagService = {
    getAll: async (projectId: string) => {
      return await window.electron.tags.getAll(projectId);
    },
    
    create: async (data: any) => {
      return await window.electron.tags.create(data);
    },
    
    update: async (id: string, data: any) => {
      return await window.electron.tags.update(id, data);
    },
    
    delete: async (id: string) => {
      return await window.electron.tags.delete(id);
    }
  };
  
  // Settings Services
  export const SettingsService = {
    get: async () => {
      return await window.electron.settings.get();
    },
    
    update: async (data: any) => {
      return await window.electron.settings.update(data);
    }
  };