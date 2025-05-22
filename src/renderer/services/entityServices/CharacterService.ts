// src/renderer/services/entityServices/CharacterService.ts

import type { Character } from '@prisma/client';
import { 
  PersonalityTraitsField, 
  CharacterSheetField,
  parseJsonFields,
  serializeJsonFields
} from '../../../shared/utils/jsonUtils';
import { validateCharacter } from '../../../shared/validation';
import { invokeIpc } from './ipcUtils';
import { createLogger } from '../../../shared/utils/logger';
import { RendererErrorHandler } from '../../error/RendererErrorHandler';

const logger = createLogger('CharacterService');

/**
 * Service for character-related operations
 */
export class CharacterService {
  // Get all characters for a project
  static async getAll(projectId: string): Promise<Character[]> {
    try {
      const data = await invokeIpc<Character[]>('characters.getAll', projectId);
      
      // Parse JSON fields for all characters
      return data ? data.map(character => 
        parseJsonFields(character, {})
      ) : [];
    } catch (error) {
      logger.error(`Failed to get characters for project ${projectId}`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
  
  // Get a character by ID
  static async getById(id: string): Promise<Character | null> {
    try {
      const data = await invokeIpc<Character>('characters.getById', id);
      
      // Parse JSON fields
      return data ? parseJsonFields(data, {}) : null;
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
      
      // Serialize JSON fields
      const serializedData = serializeJsonFields(validatedData, {} as any);
      
      // Create the character
      const result = await invokeIpc<Character>('characters.create', serializedData);
      
      // Parse JSON fields in the result
      return result ? parseJsonFields(result, {}) : null;
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
      
      // Serialize JSON fields
      const serializedData = serializeJsonFields(validatedData, {} as any);
      
      // Update the character
      const result = await invokeIpc<Character>('characters.update', id, serializedData);
      
      // Parse JSON fields in the result
      return result ? parseJsonFields(result, {}) : null;
    } catch (error) {
      logger.error(`Failed to update character ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Delete a character
  static async delete(id: string): Promise<boolean> {
    try {
      await invokeIpc<any>('characters.delete', id);
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
      const data = await invokeIpc<Character[]>('characters.searchByName', name, projectId);
      
      // Parse JSON fields for all characters
      return data ? data.map(character => 
        parseJsonFields(character, {})
      ) : [];
    } catch (error) {
      logger.error(`Failed to search characters by name "${name}"`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
}