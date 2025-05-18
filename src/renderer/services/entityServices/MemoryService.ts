// src/renderer/services/entityServices/MemoryService.ts

import type { CharacterMemory } from '@prisma/client';
import { 
  MemoryMetadataField,
  parseJsonFields,
  serializeJsonFields
} from '../../../shared/utils/jsonUtils';
import { validateCharacterMemory } from '../../../shared/validation';
import { invokeIpc } from './ipcUtils';
import { createLogger } from '../../../shared/utils/logger';
import { RendererErrorHandler } from '../../error/RendererErrorHandler';

const logger = createLogger('MemoryService');

/**
 * Service for character memory-related operations
 */
export class MemoryService {
  // Get all memories for a character
  static async getByCharacter(characterId: string): Promise<CharacterMemory[]> {
    try {
      const data = await invokeIpc<CharacterMemory[]>('memories.getByCharacter', characterId);
      
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
      const result = await invokeIpc<CharacterMemory>('memories.create', serializedData);
      
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
      const result = await invokeIpc<CharacterMemory>('memories.update', id, serializedData);
      
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
      await invokeIpc<any>('memories.delete', id);
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
      const data = await invokeIpc<CharacterMemory[]>('memories.getByType', characterId, memoryType);
      
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
      const data = await invokeIpc<CharacterMemory[]>('memories.getMostImportant', characterId, limit);
      
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