// src/main/services/ServerService.ts

import { 
  projectRepository,
  characterRepository,
  memoryRepository,
  conversationRepository,
  messageRepository,
  timelineRepository,
  eventRepository,
  noteRepository,
  tagRepository,
  taggedItemRepository,
  settingsRepository,
  vectorRepository
} from '../../shared/repositories';

import { 
  ValidationService,
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
import { handleDatabaseError } from 'src/main/database/databaseErrorHandler';
import { PersonalityTraitsField, CharacterSheetField } from '../../shared/utils/jsonUtils';

const logger = createLogger('ServerService');

/**
 * Server service for handling data operations with validation
 * This layer sits between the IPC handlers and the repositories
 */
export class ServerService {
  // Project services
  static async getAllProjects() {
    try {
      return await projectRepository.getAll();
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getAllProjects',
        table: 'project'
      });
    }
  }

  static async getProjectById(id: string) {
    try {
      return await projectRepository.getByIdWithRelations(id);
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getProjectById',
        table: 'project',
        id
      });
    }
  }

  static async createProject(data: any) {
    try {
      // Validate project data
      const validatedData = validateProject(data, 'create');

      // Create project
      return await projectRepository.create(validatedData);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;

      return handleDatabaseError(error, {
        operation: 'createProject',
        table: 'project',
        data
      });
    }
  }

  static async updateProject(id: string, data: any) {
    try {
      // Validate project data
      const validatedData = validateProject({ ...data, id }, 'update');

      // Update project
      return await projectRepository.update(id, data);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;

      return handleDatabaseError(error, {
        operation: 'updateProject',
        table: 'project',
        id,
        data
      });
    }
  }

  static async deleteProject(id: string) {
    try {
      return await projectRepository.delete(id);
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'deleteProject',
        table: 'project',
        id
      });
    }
  }

  static async getProjectsWithCounts() {
    try {
      return await projectRepository.getAllWithCounts();
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getProjectsWithCounts',
        table: 'project'
      });
    }
  }

  // Character services
  static async getCharactersByProject(projectId: string) {
    try {
      return await characterRepository.getAllByProject(projectId);
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getCharactersByProject',
        table: 'character',
        data: { projectId }
      });
    }
  }

  static async getCharacterById(id: string) {
    try {
      const character = await characterRepository.getByIdWithRelations(id);

      // Parse JSON fields
      if (character) {
        return characterRepository.parseCharacter(character);
      }

      return null;
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getCharacterById',
        table: 'character',
        id
      });
    }
  }

  static async createCharacter(data: any) {
    try {
      // Validate character data
      const validatedData = validateCharacter(data, 'create');

      // Handle JSON fields
      if (validatedData.personalityTraits && typeof validatedData.personalityTraits !== 'string') {
        validatedData.personalityTraits = PersonalityTraitsField.serialize(validatedData.personalityTraits);
      }

      if (validatedData.characterSheet && typeof validatedData.characterSheet !== 'string') {
        validatedData.characterSheet = CharacterSheetField.serialize(validatedData.characterSheet);
      }

      // Create character
      return await characterRepository.create(validatedData);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;

      return handleDatabaseError(error, {
        operation: 'createCharacter',
        table: 'character',
        data
      });
    }
  }

  static async updateCharacter(id: string, data: any) {
    try {
      // Validate character data
      const validatedData = validateCharacter({ ...data, id }, 'update');

      // Handle JSON fields
      if (validatedData.personalityTraits && typeof validatedData.personalityTraits !== 'string') {
        validatedData.personalityTraits = PersonalityTraitsField.serialize(validatedData.personalityTraits);
      }

      // Character attributes are now handled as a relational field
      // No serialization needed as they're stored in their own table

      // Update character
      return await characterRepository.update(id, validatedData);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;

      return handleDatabaseError(error, {
        operation: 'updateCharacter',
        table: 'character',
        id,
        data
      });
    }
  }

  static async deleteCharacter(id: string) {
    try {
      return await characterRepository.delete(id);
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'deleteCharacter',
        table: 'character',
        id
      });
    }
  }

  // Memory services
  static async getMemoriesByCharacter(characterId: string) {
    try {
      const memories = await memoryRepository.getByCharacter(characterId);

      // Parse metadata for all memories
      return memories.map(memory => memoryRepository.parseMemory(memory));
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getMemoriesByCharacter',
        table: 'characterMemory',
        data: { characterId }
      });
    }
  }

  // Additional services for other entities like Conversations, Timelines, Notes, Tags, etc.
  // would follow the same pattern as above

  // Example for user settings
  static async getUserSettings() {
    try {
      return await settingsRepository.getCurrent();
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getUserSettings',
        table: 'userSettings'
      });
    }
  }

  static async updateUserSettings(data: any) {
    try {
      // Validate settings data
      const validatedData = validateUserSettings(data, 'update');

      // Update settings
      return await settingsRepository.updateSettings(validatedData);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;

      return handleDatabaseError(error, {
        operation: 'updateUserSettings',
        table: 'userSettings',
        data
      });
    }
  }
}

// Export a singleton instance
export const serverService = ServerService;