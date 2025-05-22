// src/renderer/services/entityServices.ts

// We only need the type imports from repositories - the actual
// communication is handled through IPC
import type {
  Character,
  CharacterMemory,
  Conversation,
  ConversationMessage,
  TimelineEvent,
  Timeline,
  Project,
  Note,
  Tag
} from '@prisma/client';

// Import JSON utilities for serialization/deserialization of complex fields stored as JSON
import { 
  PersonalityTraitsField, 
  CharacterSheetField, 
  MemoryMetadataField, 
  EventMetadataField, 
  MessageMetadataField,
  parseJsonFields,
  serializeJsonFields
} from '../../shared/utils/jsonUtils';

// Import validation functions
import {
  validateProject,
  validateCharacter,
  validateCharacterMemory,
  validateConversation,
  validateConversationMessage,
  validateTimeline,
  validateTimelineEvent,
  validateNote,
  validateTag,
  validateUserSettings
} from '../../shared/validation';

import { createLogger } from '../../shared/utils/logger';
import { RendererErrorHandler } from '../error/RendererErrorHandler';

const logger = createLogger('EntityServices');

// Generic IPC utilities for interacting with main process
type ElectronApiChannels = {
  'projects.getAll': () => Promise<any>;
  'projects.getById': (id: string) => Promise<any>;
  'projects.create': (data: any) => Promise<any>;
  'projects.update': (id: string, data: any) => Promise<any>;
  'projects.delete': (id: string) => Promise<any>;
  'projects.getAllWithCounts': () => Promise<any>;
  'projects.getRecentlyUpdated': (days: number) => Promise<any>;
  'characters.getAll': (projectId: string) => Promise<any>;
  'characters.getById': (id: string) => Promise<any>;
  'characters.create': (data: any) => Promise<any>;
  'characters.update': (id: string, data: any) => Promise<any>;
  'characters.delete': (id: string) => Promise<any>;
  'characters.searchByName': (name: string, projectId?: string) => Promise<any>;
  'memories.getByCharacter': (characterId: string) => Promise<any>;
  'memories.create': (data: any) => Promise<any>;
  'memories.update': (id: string, data: any) => Promise<any>;
  'memories.delete': (id: string) => Promise<any>;
  'memories.getByType': (characterId: string, memoryType: string) => Promise<any>;
  'memories.getMostImportant': (characterId: string, limit: number) => Promise<any>;
  'conversations.getAll': (projectId: string) => Promise<any>;
  'conversations.getById': (id: string) => Promise<any>;
  'conversations.create': (data: any) => Promise<any>;
  'conversations.update': (id: string, data: any) => Promise<any>;
  'conversations.delete': (id: string) => Promise<any>;
  'messages.create': (data: any) => Promise<any>;
  'timelines.getAll': (projectId: string) => Promise<any>;
  'timelines.getById': (id: string) => Promise<any>;
  'timelines.create': (data: any) => Promise<any>;
  'timelines.update': (id: string, data: any) => Promise<any>;
  'timelines.delete': (id: string) => Promise<any>;
  'events.create': (data: any) => Promise<any>;
  'events.update': (id: string, data: any) => Promise<any>;
  'events.delete': (id: string) => Promise<any>;
  'events.reorder': (timelineId: string, eventIds: string[]) => Promise<any>;
  'characterEventLinks.create': (data: any) => Promise<any>;
  'characterEventLinks.delete': (id: string) => Promise<any>;
  'notes.getAll': (projectId: string) => Promise<any>;
  'notes.getById': (id: string) => Promise<any>;
  'notes.create': (data: any) => Promise<any>;
  'notes.update': (id: string, data: any) => Promise<any>;
  'notes.delete': (id: string) => Promise<any>;
  'notes.searchByContent': (projectId: string, query: string) => Promise<any>;
  'tags.getAll': (projectId: string) => Promise<any>;
  'tags.create': (data: any) => Promise<any>;
  'tags.update': (id: string, data: any) => Promise<any>;
  'tags.delete': (id: string) => Promise<any>;
  'taggedItems.create': (data: any) => Promise<any>;
  'taggedItems.delete': (id: string) => Promise<any>;
  'settings.get': () => Promise<any>;
  'settings.update': (data: any) => Promise<any>;
};

async function invokeIpc<T, K extends keyof ElectronApiChannels>(
  channel: K,
  ...args: Parameters<ElectronApiChannels[K]>
): Promise<T> {
  try {
    if (!window.electron) {
      throw new Error("Electron API is not available on window.");
    }

    // Type-safe call to the Electron API
    const apiMethod = (window.electron as unknown as ElectronApiChannels)[channel];
    if (typeof apiMethod !== 'function') {
      throw new Error(`Electron API method for channel "${channel}" not found.`);
    }

    // @ts-expect-error: We trust the mapping and arguments
    const response = await apiMethod(...args);

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
    logger.error(`IPC error in channel ${String(channel)}`, error);
    throw error;
  }
}

// Project Service
export class ProjectService {
  // Get all projects
  static async getAll(): Promise<Project[]> {
    try {
      const data = await invokeIpc<Project[], 'projects.getAll'>('projects.getAll');
      return data || [];
    } catch (error) {
      logger.error('Failed to get all projects', error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
  
  // Get a project by ID
  static async getById(id: string): Promise<Project | null> {
    try {
      const data = await invokeIpc<Project, 'projects.getById'>('projects.getById', id);
      return data || null;
    } catch (error) {
      logger.error(`Failed to get project ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Create a new project
  static async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project | null> {
    try {
      // Validate the data
      const validatedData = validateProject(data, 'create');
      
      // Create the project
      const result = await invokeIpc<Project, 'projects.create'>('projects.create', validatedData);
      return result || null;
    } catch (error) {
      logger.error('Failed to create project', error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Update a project
  static async update(id: string, data: Partial<Project>): Promise<Project | null> {
    try {
      // Validate the data
      const validatedData = validateProject({ ...data, id }, 'update');
      
      // Update the project
      const result = await invokeIpc<Project, 'projects.update'>('projects.update', id, data);
      return result || null;
    } catch (error) {
      logger.error(`Failed to update project ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Delete a project
  static async delete(id: string): Promise<boolean> {
    try {
      await invokeIpc<any, 'projects.delete'>('projects.delete', id);
      return true;
    } catch (error) {
      logger.error(`Failed to delete project ${id}`, error);
      RendererErrorHandler.handleError(error);
      return false;
    }
  }
  
  // Get project with counts of related entities
  static async getAllWithCounts(): Promise<any[]> {
    try {
      const data = await invokeIpc<any[], 'projects.getAllWithCounts'>('projects.getAllWithCounts');
      return data || [];
    } catch (error) {
      logger.error('Failed to get projects with counts', error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
  
  // Get recently updated projects
  static async getRecentlyUpdated(days: number = 7): Promise<Project[]> {
    try {
      const data = await invokeIpc<Project[], 'projects.getRecentlyUpdated'>('projects.getRecentlyUpdated', days);
      return data || [];
    } catch (error) {
      logger.error(`Failed to get recently updated projects (${days} days)`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
}

// Settings Service
export class SettingsService {
  // Get settings
  static async get(): Promise<any | null> {
    try {
      const data = await invokeIpc<any, 'settings.get'>('settings.get');
      return data || null;
    } catch (error) {
      logger.error('Failed to get settings', error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Update settings
  static async update(data: any): Promise<any | null> {
    try {
      // Validate the data
      const validatedData = validateUserSettings(data, 'update');
      
      // Update the settings
      const result = await invokeIpc<any, 'settings.update'>('settings.update', validatedData);
      return result || null;
    } catch (error) {
      logger.error('Failed to update settings', error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
}

// Character Service
export class CharacterService {
  // Get all characters for a project
  static async getAll(projectId: string): Promise<Character[]> {
    try {
      const data = await invokeIpc<Character[], 'characters.getAll'>('characters.getAll', projectId);
      return data || [];
    } catch (error) {
      logger.error(`Failed to get characters for project ${projectId}`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
  
  // Get a character by ID
  static async getById(id: string): Promise<Character | null> {
    try {
      const data = await invokeIpc<Character, 'characters.getById'>('characters.getById', id);
      return data || null;
    } catch (error) {
      logger.error(`Failed to get character ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Create a new character
  static async create(data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character | null> {
    try {
      // Validate the data
      const validatedData = validateCharacter(data, 'create');
      const result = await invokeIpc<Character, 'characters.create'>('characters.create', validatedData);
      return result || null;
    } catch (error) {
      logger.error('Failed to create character', error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Update a character
  static async update(id: string, data: Partial<Character>): Promise<Character | null> {
    try {
      // Validate the data
      const validatedData = validateCharacter({ ...data, id }, 'update');
      const result = await invokeIpc<Character, 'characters.update'>('characters.update', id, validatedData);
      return result || null;
    } catch (error) {
      logger.error(`Failed to update character ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Delete a character
  static async delete(id: string): Promise<boolean> {
    try {
      await invokeIpc<any, 'characters.delete'>('characters.delete', id);
      return true;
    } catch (error) {
      logger.error(`Failed to delete character ${id}`, error);
      RendererErrorHandler.handleError(error);
      return false;
    }
  }
  
  // Search characters by name
  static async searchByName(name: string, projectId?: string): Promise<Character[]> {
    try {
      const data = await invokeIpc<Character[], 'characters.searchByName'>('characters.searchByName', name, projectId);
      return data || [];
    } catch (error) {
      logger.error(`Failed to search characters by name "${name}"`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
}

// Character Memory Service
export class MemoryService {
  // Get all memories for a character
  static async getByCharacter(characterId: string): Promise<CharacterMemory[]> {
    try {
      const data = await invokeIpc<CharacterMemory[], 'memories.getByCharacter'>('memories.getByCharacter', characterId);
      
      // Parse metadata for all memories
      return data ? data.map(memory => 
        parseJsonFields(memory, {
          metadata: MemoryMetadataField
        })
      ) : [];
    } catch (error) {
      logger.error(`Failed to get memories for character ${characterId}`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
  
  // Create a new memory
  static async create(data: Omit<CharacterMemory, 'id' | 'createdAt' | 'updatedAt'>): Promise<CharacterMemory | null> {
    try {
      // Validate the data
      const validatedData = validateCharacterMemory(data, 'create');
      
      // Serialize metadata
      const serializedData = serializeJsonFields(validatedData, {
        metadata: MemoryMetadataField
      } as any);
      
      // Create the memory
      const result = await invokeIpc<CharacterMemory, 'memories.create'>('memories.create', serializedData);
      
      // Parse the metadata in the result
      return result ? parseJsonFields(result, {
        metadata: MemoryMetadataField
      }) : null;
    } catch (error) {
      logger.error('Failed to create memory', error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Update a memory
  static async update(id: string, data: Partial<CharacterMemory>): Promise<CharacterMemory | null> {
    try {
      // Validate the data
      const validatedData = validateCharacterMemory({ ...data, id }, 'update');
      
      // Serialize metadata
      const serializedData = serializeJsonFields(validatedData, {
        metadata: MemoryMetadataField
      } as any);
      
      // Update the memory
      const result = await invokeIpc<CharacterMemory, 'memories.update'>('memories.update', id, serializedData);
      
      // Parse the metadata in the result
      return result ? parseJsonFields(result, {
        metadata: MemoryMetadataField
      }) : null;
    } catch (error) {
      logger.error(`Failed to update memory ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Delete a memory
  static async delete(id: string): Promise<boolean> {
    try {
      await invokeIpc<any, 'memories.delete'>('memories.delete', id);
      return true;
    } catch (error) {
      logger.error(`Failed to delete memory ${id}`, error);
      RendererErrorHandler.handleError(error);
      return false;
    }
  }
  
  // Get memories filtered by type
  static async getByType(characterId: string, memoryType: string): Promise<CharacterMemory[]> {
    try {
      const data = await invokeIpc<CharacterMemory[], 'memories.getByType'>('memories.getByType', characterId, memoryType);
      
      // Parse metadata for all memories
      return data ? data.map(memory => 
        parseJsonFields(memory, {
          metadata: MemoryMetadataField
        })
      ) : [];
    } catch (error) {
      logger.error(`Failed to get memories by type "${memoryType}" for character ${characterId}`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
  
  // Get most important memories
  static async getMostImportant(characterId: string, limit: number = 10): Promise<CharacterMemory[]> {
    try {
      const data = await invokeIpc<CharacterMemory[], 'memories.getMostImportant'>('memories.getMostImportant', characterId, limit);
      
      // Parse metadata for all memories
      return data ? data.map(memory => 
        parseJsonFields(memory, {
          metadata: MemoryMetadataField
        })
      ) : [];
    } catch (error) {
      logger.error(`Failed to get most important memories for character ${characterId}`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
}

// Conversation Service
export class ConversationService {
  // Get all conversations for a project
  static async getAll(projectId: string): Promise<Conversation[]> {
    try {
      const data = await invokeIpc<Conversation[], 'conversations.getAll'>('conversations.getAll', projectId);
      return data || [];
    } catch (error) {
      logger.error(`Failed to get conversations for project ${projectId}`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
  
  // Get a conversation by ID
  static async getById(id: string): Promise<any | null> {
    try {
      const data = await invokeIpc<any, 'conversations.getById'>('conversations.getById', id);
      
      // Parse message metadata
      if (data && data.messages) {
        data.messages = data.messages.map((message: ConversationMessage) =>
          parseJsonFields(message, {
            metadata: MessageMetadataField
          })
        );
      }
      
      return data || null;
    } catch (error) {
      logger.error(`Failed to get conversation ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Create a new conversation
  static async create(data: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation | null> {
    try {
      // Validate the data
      const validatedData = validateConversation(data, 'create');
      
      // Create the conversation
      const result = await invokeIpc<Conversation, 'conversations.create'>('conversations.create', validatedData);
      return result || null;
    } catch (error) {
      logger.error('Failed to create conversation', error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Update a conversation
  static async update(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
    try {
      // Validate the data
      const validatedData = validateConversation({ ...data, id }, 'update');
      
      // Update the conversation
      const result = await invokeIpc<Conversation, 'conversations.update'>('conversations.update', id, validatedData);
      return result || null;
    } catch (error) {
      logger.error(`Failed to update conversation ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Delete a conversation
  static async delete(id: string): Promise<boolean> {
    try {
      await invokeIpc<any, 'conversations.delete'>('conversations.delete', id);
      return true;
    } catch (error) {
      logger.error(`Failed to delete conversation ${id}`, error);
      RendererErrorHandler.handleError(error);
      return false;
    }
  }
  
  // Create a message
  static async createMessage(data: Omit<ConversationMessage, 'id' | 'timestamp'>): Promise<ConversationMessage | null> {
    try {
      // Validate the data
      const validatedData = validateConversationMessage(data, 'create');
      
      // Serialize metadata
      const serializedData = serializeJsonFields(validatedData, {
        metadata: MessageMetadataField
      } as any);
      
      // Create the message
      const result = await invokeIpc<ConversationMessage, 'messages.create'>('messages.create', serializedData);
      
      // Parse the metadata in the result
      return result ? parseJsonFields(result, {
        metadata: MessageMetadataField
      }) : null;
    } catch (error) {
      logger.error('Failed to create message', error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
}

// Timeline Service
export class TimelineService {
  // Get all timelines for a project
  static async getAll(projectId: string): Promise<Timeline[]> {
    try {
      const data = await invokeIpc<Timeline[], 'timelines.getAll'>('timelines.getAll', projectId);
      return data || [];
    } catch (error) {
      logger.error(`Failed to get timelines for project ${projectId}`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
  
  // Get a timeline by ID
  static async getById(id: string): Promise<any | null> {
    try {
      const data = await invokeIpc<any, 'timelines.getById'>('timelines.getById', id);
      
      // Parse event metadata
      if (data && data.events) {
        data.events = data.events.map((event: TimelineEvent) =>
          parseJsonFields(event, {
            metadata: EventMetadataField
          })
        );
      }
      
      return data || null;
    } catch (error) {
      logger.error(`Failed to get timeline ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Create a new timeline
  static async create(data: Omit<Timeline, 'id' | 'createdAt' | 'updatedAt'>): Promise<Timeline | null> {
    try {
      // Validate the data
      const validatedData = validateTimeline(data, 'create');
      
      // Create the timeline
      const result = await invokeIpc<Timeline, 'timelines.create'>('timelines.create', validatedData);
      return result || null;
    } catch (error) {
      logger.error('Failed to create timeline', error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Update a timeline
  static async update(id: string, data: Partial<Timeline>): Promise<Timeline | null> {
    try {
      // Validate the data
      const validatedData = validateTimeline({ ...data, id }, 'update');
      
      // Update the timeline
      const result = await invokeIpc<Timeline, 'timelines.update'>('timelines.update', id, validatedData);
      return result || null;
    } catch (error) {
      logger.error(`Failed to update timeline ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Delete a timeline
  static async delete(id: string): Promise<boolean> {
    try {
      await invokeIpc<any, 'timelines.delete'>('timelines.delete', id);
      return true;
    } catch (error) {
      logger.error(`Failed to delete timeline ${id}`, error);
      RendererErrorHandler.handleError(error);
      return false;
    }
  }
  
  // Create an event
  static async createEvent(data: Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimelineEvent | null> {
    try {
      // Validate the data
      const validatedData = validateTimelineEvent(data, 'create');
      
      // Serialize metadata
      const serializedData = serializeJsonFields(validatedData, {
        metadata: EventMetadataField
      } as any);
      
      // Create the event
      const result = await invokeIpc<TimelineEvent, 'events.create'>('events.create', serializedData);
      
      // Parse the metadata in the result
      return result ? parseJsonFields(result, {
        metadata: EventMetadataField
      }) : null;
    } catch (error) {
      logger.error('Failed to create event', error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Update an event
  static async updateEvent(id: string, data: Partial<TimelineEvent>): Promise<TimelineEvent | null> {
    try {
      // Validate the data
      const validatedData = validateTimelineEvent({ ...data, id }, 'update');
      
      // Serialize metadata
      const serializedData = serializeJsonFields(validatedData, {
        metadata: EventMetadataField
      } as any);
      
      // Update the event
      const result = await invokeIpc<TimelineEvent, 'events.update'>('events.update', id, serializedData);
      
      // Parse the metadata in the result
      return result ? parseJsonFields(result, {
        metadata: EventMetadataField
      }) : null;
    } catch (error) {
      logger.error(`Failed to update event ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Delete an event
  static async deleteEvent(id: string): Promise<boolean> {
    try {
      await invokeIpc<any, 'events.delete'>('events.delete', id);
      return true;
    } catch (error) {
      logger.error(`Failed to delete event ${id}`, error);
      RendererErrorHandler.handleError(error);
      return false;
    }
  }
  
  // Link a character to an event
  static async linkCharacterToEvent(data: any): Promise<any | null> {
    try {
      const result = await invokeIpc<any, 'characterEventLinks.create'>('characterEventLinks.create', data);
      return result || null;
    } catch (error) {
      logger.error('Failed to link character to event', error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Unlink a character from an event
  static async unlinkCharacterFromEvent(id: string): Promise<boolean> {
    try {
      await invokeIpc<any, 'characterEventLinks.delete'>('characterEventLinks.delete', id);
      return true;
    } catch (error) {
      logger.error(`Failed to unlink character from event ${id}`, error);
      RendererErrorHandler.handleError(error);
      return false;
    }
  }
  
  // Reorder events
  static async reorderEvents(timelineId: string, eventIds: string[]): Promise<boolean> {
    try {
      await invokeIpc<any, 'events.reorder'>('events.reorder', timelineId, eventIds);
      return true;
    } catch (error) {
      logger.error(`Failed to reorder events for timeline ${timelineId}`, error);
      RendererErrorHandler.handleError(error);
      return false;
    }
  }
}

// Note Service
export class NoteService {
  // Get all notes for a project
  static async getAll(projectId: string): Promise<Note[]> {
    try {
      const data = await invokeIpc<Note[], 'notes.getAll'>('notes.getAll', projectId);
      return data || [];
    } catch (error) {
      logger.error(`Failed to get notes for project ${projectId}`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
  
  // Get a note by ID
  static async getById(id: string): Promise<Note | null> {
    try {
      const data = await invokeIpc<Note, 'notes.getById'>('notes.getById', id);
      return data || null;
    } catch (error) {
      logger.error(`Failed to get note ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Create a new note
  static async create(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note | null> {
    try {
      // Validate the data
      const validatedData = validateNote(data, 'create');
      
      // Create the note
      const result = await invokeIpc<Note, 'notes.create'>('notes.create', validatedData);
      return result || null;
    } catch (error) {
      logger.error('Failed to create note', error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Update a note
  static async update(id: string, data: Partial<Note>): Promise<Note | null> {
    try {
      // Validate the data
      const validatedData = validateNote({ ...data, id }, 'update');
      
      // Update the note
      const result = await invokeIpc<Note, 'notes.update'>('notes.update', id, validatedData);
      return result || null;
    } catch (error) {
      logger.error(`Failed to update note ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Delete a note
  static async delete(id: string): Promise<boolean> {
    try {
      await invokeIpc<any, 'notes.delete'>('notes.delete', id);
      return true;
    } catch (error) {
      logger.error(`Failed to delete note ${id}`, error);
      RendererErrorHandler.handleError(error);
      return false;
    }
  }
  
  // Search notes by content
  static async searchByContent(projectId: string, query: string): Promise<Note[]> {
    try {
      const data = await invokeIpc<Note[], 'notes.searchByContent'>('notes.searchByContent', projectId, query);
      return data || [];
    } catch (error) {
      logger.error(`Failed to search notes by content "${query}"`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
}

// Tag Service
export class TagService {
  // Get all tags for a project
  static async getAll(projectId: string): Promise<Tag[]> {
    try {
      const data = await invokeIpc<Tag[], 'tags.getAll'>('tags.getAll', projectId);
      return data || [];
    } catch (error) {
      logger.error(`Failed to get tags for project ${projectId}`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
  
  // Create a new tag
  static async create(data: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag | null> {
    try {
      // Validate the data
      const validatedData = validateTag(data, 'create');
      
      // Create the tag
      const result = await invokeIpc<Tag, 'tags.create'>('tags.create', validatedData);
      return result || null;
    } catch (error) {
      logger.error('Failed to create tag', error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Update a tag
  static async update(id: string, data: Partial<Tag>): Promise<Tag | null> {
    try {
      // Validate the data
      const validatedData = validateTag({ ...data, id }, 'update');
      
      // Update the tag
      const result = await invokeIpc<Tag, 'tags.update'>('tags.update', id, validatedData);
      return result || null;
    } catch (error) {
      logger.error(`Failed to update tag ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Delete a tag
  static async delete(id: string): Promise<boolean> {
    try {
      await invokeIpc<any, 'tags.delete'>('tags.delete', id);
      return true;
    } catch (error) {
      logger.error(`Failed to delete tag ${id}`, error);
      RendererErrorHandler.handleError(error);
      return false;
    }
  }
}