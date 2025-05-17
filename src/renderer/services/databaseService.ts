// src/renderer/services/databaseService.ts

import { 
  PersonalityTraitsField, 
  CharacterSheetField, 
  MemoryMetadataField, 
  EventMetadataField, 
  MessageMetadataField,
  parseJsonFields,
  serializeJsonFields
} from '../../shared/utils/jsonUtils';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('DatabaseService');

// Type definitions to improve type safety
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  bio?: string;
  personalityTraits: string | any; // Will be parsed from JSON string
  characterSheet?: string | any; // Will be parsed from JSON string
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterMemory {
  id: string;
  characterId: string;
  memoryType: string;
  content: string;
  source?: string;
  importance: number;
  embedding?: string;
  timestamp: string;
  expiresAt?: string;
  metadata: string | any; // Will be parsed from JSON string
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  timelineId: string;
  title: string;
  description?: string;
  date?: string;
  order: number;
  importance: number;
  metadata: string | any; // Will be parsed from JSON string
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  characterId?: string;
  content: string;
  role: string;
  timestamp: string;
  metadata: string | any; // Will be parsed from JSON string
  isMemory: boolean;
  character?: Character;
}

if (!window.electron) {
  throw new Error("Electron API is not available on window.");
}

// Project Services
export const ProjectService = {
  getAll: async (): Promise<Project[]> => {
    try {
      const response = await window.electron!.projects.getAll();
      return response.success ? response.data : [];
    } catch (error) {
      logger.error('Failed to get projects', error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<Project | null> => {
    try {
      const response = await window.electron!.projects.getById(id);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error(`Failed to get project ${id}`, error);
      return null;
    }
  },
  
  create: async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project | null> => {
    try {
      const response = await window.electron!.projects.create(data);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error('Failed to create project', error);
      return null;
    }
  },
  
  update: async (id: string, data: Partial<Project>): Promise<Project | null> => {
    try {
      const response = await window.electron!.projects.update(id, data);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error(`Failed to update project ${id}`, error);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await window.electron!.projects.delete(id);
      return response.success;
    } catch (error) {
      logger.error(`Failed to delete project ${id}`, error);
      return false;
    }
  }
};

// Character Services
export const CharacterService = {
  getAll: async (projectId: string): Promise<Character[]> => {
    try {
      const response = await window.electron!.characters.getAll(projectId);
      if (!response.success) return [];
      
      // Parse JSON fields for all characters
      return response.data.map((character: Character) => 
        parseJsonFields(character, {
          personalityTraits: PersonalityTraitsField,
          characterSheet: CharacterSheetField
        })
      );
    } catch (error) {
      logger.error(`Failed to get characters for project ${projectId}`, error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<Character | null> => {
    try {
      const response = await window.electron!.characters.getById(id);
      if (!response.success) return null;
      
      // Parse JSON fields
      return parseJsonFields(response.data, {
        personalityTraits: PersonalityTraitsField,
        characterSheet: CharacterSheetField
      });
    } catch (error) {
      logger.error(`Failed to get character ${id}`, error);
      return null;
    }
  },
  
  create: async (data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character | null> => {
    try {
      // Serialize JSON fields
      const serializedData = serializeJsonFields(data, {
        personalityTraits: PersonalityTraitsField,
        characterSheet: CharacterSheetField
      } as any);
      
      const response = await window.electron!.characters.create(serializedData);
      if (!response.success) return null;
      
      // Parse the returned data
      return parseJsonFields(response.data, {
        personalityTraits: PersonalityTraitsField,
        characterSheet: CharacterSheetField
      });
    } catch (error) {
      logger.error('Failed to create character', error);
      return null;
    }
  },
  
  update: async (id: string, data: Partial<Character>): Promise<Character | null> => {
    try {
      // Serialize JSON fields
      const serializedData = serializeJsonFields(data, {
        personalityTraits: PersonalityTraitsField,
        characterSheet: CharacterSheetField
      } as any);
      
      const response = await window.electron!.characters.update(id, serializedData);
      if (!response.success) return null;
      
      // Parse the returned data
      return parseJsonFields(response.data, {
        personalityTraits: PersonalityTraitsField,
        characterSheet: CharacterSheetField
      });
    } catch (error) {
      logger.error(`Failed to update character ${id}`, error);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await window.electron!.characters.delete(id);
      return response.success;
    } catch (error) {
      logger.error(`Failed to delete character ${id}`, error);
      return false;
    }
  }
};

// Memory Services
export const MemoryService = {
  getByCharacter: async (characterId: string): Promise<CharacterMemory[]> => {
    try {
      const response = await window.electron!.memories.getByCharacter(characterId);
      if (!response.success) return [];
      
      // Parse metadata for all memories
      return response.data.map((memory: CharacterMemory) =>
        parseJsonFields(memory, {
          metadata: MemoryMetadataField
        })
      );
    } catch (error) {
      logger.error(`Failed to get memories for character ${characterId}`, error);
      return [];
    }
  },
  
  create: async (data: Omit<CharacterMemory, 'id' | 'createdAt' | 'updatedAt'>): Promise<CharacterMemory | null> => {
    try {
      // Serialize metadata
      const serializedData = serializeJsonFields(data, {
        metadata: MemoryMetadataField
      } as any);
      
      const response = await window.electron!.memories.create(serializedData);
      if (!response.success) return null;
      
      // Parse the returned data
      return parseJsonFields(response.data, {
        metadata: MemoryMetadataField
      });
    } catch (error) {
      logger.error('Failed to create memory', error);
      return null;
    }
  },
  
  update: async (id: string, data: Partial<CharacterMemory>): Promise<CharacterMemory | null> => {
    try {
      // Serialize metadata
      const serializedData = serializeJsonFields(data, {
        metadata: MemoryMetadataField
      } as any);
      
      const response = await window.electron!.memories.update(id, serializedData);
      if (!response.success) return null;
      
      // Parse the returned data
      return parseJsonFields(response.data, {
        metadata: MemoryMetadataField
      });
    } catch (error) {
      logger.error(`Failed to update memory ${id}`, error);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await window.electron!.memories.delete(id);
      return response.success;
    } catch (error) {
      logger.error(`Failed to delete memory ${id}`, error);
      return false;
    }
  }
};

// Conversation Services
export const ConversationService = {
  getAll: async (projectId: string): Promise<any[]> => {
    try {
      const response = await window.electron!.conversations.getAll(projectId);
      return response.success ? response.data : [];
    } catch (error) {
      logger.error(`Failed to get conversations for project ${projectId}`, error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<any | null> => {
    try {
      const response = await window.electron!.conversations.getById(id);
      if (!response.success) return null;
      
      const conversation = response.data;
      
      // Parse message metadata
      if (conversation && conversation.messages) {
        conversation.messages = conversation.messages.map((message: ConversationMessage) =>
          parseJsonFields(message, {
            metadata: MessageMetadataField
          })
        );
      }
      
      return conversation;
    } catch (error) {
      logger.error(`Failed to get conversation ${id}`, error);
      return null;
    }
  },
  
  create: async (data: any): Promise<any | null> => {
    try {
      const response = await window.electron!.conversations.create(data);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error('Failed to create conversation', error);
      return null;
    }
  },
  
  update: async (id: string, data: any): Promise<any | null> => {
    try {
      const response = await window.electron!.conversations.update(id, data);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error(`Failed to update conversation ${id}`, error);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await window.electron!.conversations.delete(id);
      return response.success;
    } catch (error) {
      logger.error(`Failed to delete conversation ${id}`, error);
      return false;
    }
  },
  
  createMessage: async (data: Omit<ConversationMessage, 'id' | 'timestamp'>): Promise<ConversationMessage | null> => {
    try {
      // Serialize metadata
      const serializedData = serializeJsonFields(data, {
        metadata: MessageMetadataField
      } as any);
      
      const response = await window.electron!.messages.create(serializedData);
      if (!response.success) return null;
      
      // Parse the returned data
      return parseJsonFields(response.data, {
        metadata: MessageMetadataField
      });
    } catch (error) {
      logger.error('Failed to create message', error);
      return null;
    }
  }
};

// Timeline Services
export const TimelineService = {
  getAll: async (projectId: string): Promise<any[]> => {
    try {
      const response = await window.electron!.timelines.getAll(projectId);
      return response.success ? response.data : [];
    } catch (error) {
      logger.error(`Failed to get timelines for project ${projectId}`, error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<any | null> => {
    try {
      const response = await window.electron!.timelines.getById(id);
      if (!response.success) return null;
      
      const timeline = response.data;
      
      // Parse event metadata
      if (timeline && timeline.events) {
        timeline.events = timeline.events.map((event: TimelineEvent) =>
          parseJsonFields(event, {
            metadata: EventMetadataField
          })
        );
      }
      
      return timeline;
    } catch (error) {
      logger.error(`Failed to get timeline ${id}`, error);
      return null;
    }
  },
  
  create: async (data: any): Promise<any | null> => {
    try {
      const response = await window.electron!.timelines.create(data);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error('Failed to create timeline', error);
      return null;
    }
  },
  
  update: async (id: string, data: any): Promise<any | null> => {
    try {
      const response = await window.electron!.timelines.update(id, data);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error(`Failed to update timeline ${id}`, error);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await window.electron!.timelines.delete(id);
      return response.success;
    } catch (error) {
      logger.error(`Failed to delete timeline ${id}`, error);
      return false;
    }
  },
  
  createEvent: async (data: Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimelineEvent | null> => {
    try {
      // Serialize metadata
      const serializedData = serializeJsonFields(data, {
        metadata: EventMetadataField
      } as any);
      
      const response = await window.electron!.events.create(serializedData);
      if (!response.success) return null;
      
      // Parse the returned data
      return parseJsonFields(response.data, {
        metadata: EventMetadataField
      });
    } catch (error) {
      logger.error('Failed to create event', error);
      return null;
    }
  },
  
  updateEvent: async (id: string, data: Partial<TimelineEvent>): Promise<TimelineEvent | null> => {
    try {
      // Serialize metadata
      const serializedData = serializeJsonFields(data, {
        metadata: EventMetadataField
      } as any);
      
      const response = await window.electron!.events.update(id, serializedData);
      if (!response.success) return null;
      
      // Parse the returned data
      return parseJsonFields(response.data, {
        metadata: EventMetadataField
      });
    } catch (error) {
      logger.error(`Failed to update event ${id}`, error);
      return null;
    }
  },
  
  deleteEvent: async (id: string): Promise<boolean> => {
    try {
      const response = await window.electron!.events.delete(id);
      return response.success;
    } catch (error) {
      logger.error(`Failed to delete event ${id}`, error);
      return false;
    }
  },
  
  linkCharacterToEvent: async (data: any): Promise<any | null> => {
    try {
      const response = await window.electron!.characterEventLinks.create(data);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error('Failed to link character to event', error);
      return null;
    }
  },
  
  unlinkCharacterFromEvent: async (id: string): Promise<boolean> => {
    try {
      const response = await window.electron!.characterEventLinks.delete(id);
      return response.success;
    } catch (error) {
      logger.error(`Failed to unlink character from event ${id}`, error);
      return false;
    }
  }
};

// Note Services
export const NoteService = {
  getAll: async (projectId: string): Promise<any[]> => {
    try {
      const response = await window.electron!.notes.getAll(projectId);
      return response.success ? response.data : [];
    } catch (error) {
      logger.error(`Failed to get notes for project ${projectId}`, error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<any | null> => {
    try {
      const response = await window.electron!.notes.getById(id);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error(`Failed to get note ${id}`, error);
      return null;
    }
  },
  
  create: async (data: any): Promise<any | null> => {
    try {
      const response = await window.electron!.notes.create(data);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error('Failed to create note', error);
      return null;
    }
  },
  
  update: async (id: string, data: any): Promise<any | null> => {
    try {
      const response = await window.electron!.notes.update(id, data);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error(`Failed to update note ${id}`, error);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await window.electron!.notes.delete(id);
      return response.success;
    } catch (error) {
      logger.error(`Failed to delete note ${id}`, error);
      return false;
    }
  }
};

// Tag Services
export const TagService = {
  getAll: async (projectId: string): Promise<any[]> => {
    try {
      const response = await window.electron!.tags.getAll(projectId);
      return response.success ? response.data : [];
    } catch (error) {
      logger.error(`Failed to get tags for project ${projectId}`, error);
      return [];
    }
  },
  
  create: async (data: any): Promise<any | null> => {
    try {
      const response = await window.electron!.tags.create(data);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error('Failed to create tag', error);
      return null;
    }
  },
  
  update: async (id: string, data: any): Promise<any | null> => {
    try {
      const response = await window.electron!.tags.update(id, data);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error(`Failed to update tag ${id}`, error);
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await window.electron!.tags.delete(id);
      return response.success;
    } catch (error) {
      logger.error(`Failed to delete tag ${id}`, error);
      return false;
    }
  }
};

// Settings Services
export const SettingsService = {
  get: async (): Promise<any | null> => {
    try {
      const response = await window.electron!.settings.get();
      return response.success ? response.data : null;
    } catch (error) {
      logger.error('Failed to get settings', error);
      return null;
    }
  },
  
  update: async (data: any): Promise<any | null> => {
    try {
      const response = await window.electron!.settings.update(data);
      return response.success ? response.data : null;
    } catch (error) {
      logger.error('Failed to update settings', error);
      return null;
    }
  }
};