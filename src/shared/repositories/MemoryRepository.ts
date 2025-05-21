import { CharacterMemory, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository.js';
import { characterMemorySchema, CharacterMemoryInput } from '../validation/schemas.js';
import { createLogger } from '../utils/logger.js';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler.js';

const logger = createLogger('MemoryRepository');

/**
 * Repository for Character Memory operations
 */
export class MemoryRepository extends BaseRepository<
  CharacterMemory,
  CharacterMemoryInput,
  Partial<CharacterMemoryInput>
> {
  constructor() {
    super('characterMemory', characterMemorySchema);
  }
  
  /**
   * Get all memories for a character
   */
  async getByCharacter(characterId: string): Promise<CharacterMemory[]> {
    try {
      return await this.prisma.characterMemory.findMany({
        where: { characterId },
        orderBy: [
          { importance: 'desc' },
          { timestamp: 'desc' }
        ]
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByCharacter',
        table: this.tableName,
        data: { characterId }
      });
    }
  }
  
  /**
   * Get memories filtered by type
   */
  async getByType(characterId: string, memoryType: string): Promise<CharacterMemory[]> {
    try {
      return await this.prisma.characterMemory.findMany({
        where: { 
          characterId,
          memoryType
        },
        orderBy: [
          { importance: 'desc' },
          { timestamp: 'desc' }
        ]
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByType',
        table: this.tableName,
        data: { characterId, memoryType }
      });
    }
  }
  
  /**
   * Get most important memories
   */
  async getMostImportant(characterId: string, limit: number = 10): Promise<CharacterMemory[]> {
    try {
      return await this.prisma.characterMemory.findMany({
        where: { characterId },
        orderBy: [
          { importance: 'desc' },
          { timestamp: 'desc' }
        ],
        take: limit
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getMostImportant',
        table: this.tableName,
        data: { characterId, limit }
      });
    }
  }
  
  /**
   * Search memories by content
   */
  async searchByContent(characterId: string, query: string): Promise<CharacterMemory[]> {
    try {
      return await this.prisma.characterMemory.findMany({
        where: {
          characterId,
          content: {
            contains: query
          }
        },
        orderBy: [
          { importance: 'desc' },
          { timestamp: 'desc' }
        ]
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'searchByContent',
        table: this.tableName,
        data: { characterId, query }
      });
    }
  }
  
  /**
   * Handle special case for memory creation with metadata
   */
  async create(data: CharacterMemoryInput): Promise<CharacterMemory> {
    try {
      // Validate the data
      const validatedData = this.validate(data, 'create');
      
      // Handle JSON fields
      let dataToCreate = { ...validatedData };
      
      // Stringify metadata if it's an object
      if (dataToCreate.metadata && typeof dataToCreate.metadata !== 'string') {
        dataToCreate.metadata = JSON.stringify(dataToCreate.metadata);
      }
      
      // Create the memory
      return await this.prisma.characterMemory.create({
        data: dataToCreate
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') {
        throw error; // Re-throw validation errors
      }
      
      return handleDatabaseError(error, {
        operation: 'create',
        table: this.tableName,
        data
      });
    }
  }
  
  /**
   * Handle special case for memory update with metadata
   */
  async update(id: string, data: Partial<CharacterMemoryInput>): Promise<CharacterMemory> {
    try {
      // Validate the data
      const validatedData = this.validate({ ...data, id }, 'update');
      
      // Remove id from the data to update
      const { id: _, ...dataToUpdate } = validatedData;
      
      // Handle JSON fields
      let dataToSave = { ...dataToUpdate };
      
      // Stringify metadata if it's an object
      if (dataToSave.metadata && typeof dataToSave.metadata !== 'string') {
        dataToSave.metadata = JSON.stringify(dataToSave.metadata);
      }
      
      // Update the memory
      return await this.prisma.characterMemory.update({
        where: { id },
        data: dataToSave
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') {
        throw error; // Re-throw validation errors
      }
      
      return handleDatabaseError(error, {
        operation: 'update',
        table: this.tableName,
        id,
        data
      });
    }
  }
  
  /**
   * Parse memory metadata
   */
  parseMemory(memory: CharacterMemory): CharacterMemory & { metadata: any } {
    if (!memory) return memory as any;
    
    const parsed = { ...memory };
    
    // Parse metadata
    if (parsed.metadata && typeof parsed.metadata === 'string') {
      try {
        (parsed as any).metadata = JSON.parse(parsed.metadata);
      } catch (error) {
        logger.error('Failed to parse memory metadata JSON', {
          error,
          memoryId: parsed.id
        });
        (parsed as any).metadata = {};
      }
    }
    
    return parsed as any;
  }
}