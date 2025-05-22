// src/main/services/ServerService.ts

import { 
  projectRepository,
  characterRepository,
  memoryRepository,
  ConversationRepository,
  messageRepository,
  timelineRepository,
  eventRepository
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

import { createLogger } from '../../shared/utils/logger.ts';
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
      // return await characterRepository.getAllByProject(projectId);
      // Use getAll as a fallback or reimplement as needed
      return await characterRepository.getAll({ where: { projectId } });
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
      const character = await characterRepository.getById(id);
      // if (character) {
      //   return characterRepository.parseCharacter(character);
      // }
      return character;
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

      // Prepare nested writes for relations
      const { personalityTraits, characterAttributes, ...characterData } = validatedData;
      const createData = {
        ...characterData,
        project: { connect: { id: characterData.projectId } },
        ...(personalityTraits ? { personalityTraits: { create: personalityTraits } } : {}),
        ...(characterAttributes ? { characterAttributes: { create: characterAttributes } } : {}),
      };

      // Create character
      return await characterRepository.create(createData);
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

      // Prepare nested updates for relations
      const { personalityTraits, characterAttributes, ...characterData } = validatedData;
      const updateData = {
        ...characterData,
        // TODO: Add nested update logic for relations if needed
        // e.g., personalityTraits: { update: ... }, characterAttributes: { update: ... }
      };

      // Update character
      return await characterRepository.update(id, updateData);
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
  // static async getUserSettings() { ... }
  // static async updateUserSettings(data: any) { ... }
}

// Export a singleton instance
export const serverService = ServerService;