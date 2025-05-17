import { Character, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { characterSchema, CharacterInput } from '../validation/schemas';
import { createLogger } from '../utils/logger';
import { handleDatabaseError } from '../../main/database/databaseErrorHnadler';

const logger = createLogger('CharacterRepositoryV2');

/**
 * Repository for Character-related database operations using BaseRepository
 */
export class CharacterRepositoryV2 extends BaseRepository<
  Character,
  CharacterInput,
  Partial<CharacterInput>
> {
  constructor() {
    super('character', characterSchema);
  }
  
  /**
   * Get all characters for a project
   */
  async getAllByProject(projectId: string): Promise<Character[]> {
    try {
      return await this.prisma.character.findMany({
        where: { projectId },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getAllByProject',
        table: this.tableName,
        data: { projectId }
      });
    }
  }
  
  /**
   * Get a character with related data
   */
  async getByIdWithRelations(id: string): Promise<Character & {
    characterMemories: any[];
    characterVersions: any[];
    characterEventLinks: any[];
  }> {
    try {
      const result = await this.prisma.character.findUnique({
        where: { id },
        include: {
          characterMemories: true,
          characterVersions: true,
          characterEventLinks: {
            include: {
              event: true
            }
          }
        }
      });
      
      if (!result) {
        return handleDatabaseError(new Error('Character not found'), {
          operation: 'getByIdWithRelations',
          table: this.tableName,
          id
        });
      }
      
      return result;
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByIdWithRelations',
        table: this.tableName,
        id
      });
    }
  }
  
  /**
   * Search characters by name
   */
  async searchByName(name: string, projectId?: string): Promise<Character[]> {
    try {
      const where: Prisma.CharacterWhereInput = {
        name: {
          contains: name
        }
      };
      
      if (projectId) {
        where.projectId = projectId;
      }
      
      return await this.prisma.character.findMany({
        where,
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'searchByName',
        table: this.tableName,
        data: { name, projectId }
      });
    }
  }
  
  /**
   * Handle special case for character creation with personality traits
   */
  async create(data: CharacterInput): Promise<Character> {
    try {
      // Validate the data
      const validatedData = this.validate(data, 'create');
      
      // Handle JSON fields
      let dataToCreate = { ...validatedData };
      
      // Stringify JSON fields if they're objects
      if (dataToCreate.personalityTraits && typeof dataToCreate.personalityTraits !== 'string') {
        dataToCreate.personalityTraits = JSON.stringify(dataToCreate.personalityTraits);
      }
      
      if (dataToCreate.characterSheet && typeof dataToCreate.characterSheet !== 'string') {
        dataToCreate.characterSheet = JSON.stringify(dataToCreate.characterSheet);
      }
      
      // Create the character
      return await this.prisma.character.create({
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
   * Handle special case for character update with personality traits
   */
  async update(id: string, data: Partial<CharacterInput>): Promise<Character> {
    try {
      // Validate the data
      const validatedData = this.validate({ ...data, id }, 'update');
      
      // Remove id from the data to update
      const { id: _, ...dataToUpdate } = validatedData;
      
      // Handle JSON fields
      let dataToSave = { ...dataToUpdate };
      
      // Stringify JSON fields if they're objects
      if (dataToSave.personalityTraits && typeof dataToSave.personalityTraits !== 'string') {
        dataToSave.personalityTraits = JSON.stringify(dataToSave.personalityTraits);
      }
      
      if (dataToSave.characterSheet && typeof dataToSave.characterSheet !== 'string') {
        dataToSave.characterSheet = JSON.stringify(dataToSave.characterSheet);
      }
      
      // Update the character
      return await this.prisma.character.update({
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
   * Parse character JSON fields
   * Utility method to parse JSON fields after retrieval
   */
  parseCharacter(character: Character): Character & {
    personalityTraits: any;
    characterSheet: any;
  } {
    if (!character) return character as any;
    
    const parsed = { ...character };
    
    // Parse personality traits
    if (parsed.personalityTraits && typeof parsed.personalityTraits === 'string') {
      try {
        (parsed as any).personalityTraits = JSON.parse(parsed.personalityTraits);
      } catch (error) {
        logger.error('Failed to parse personalityTraits JSON', {
          error,
          characterId: parsed.id
        });
        (parsed as any).personalityTraits = {};
      }
    }
    
    // Parse character sheet
    if (parsed.characterSheet && typeof parsed.characterSheet === 'string') {
      try {
        (parsed as any).characterSheet = JSON.parse(parsed.characterSheet);
      } catch (error) {
        logger.error('Failed to parse characterSheet JSON', {
          error,
          characterId: parsed.id
        });
        (parsed as any).characterSheet = {};
      }
    }
    
    return parsed as any;
  }
}