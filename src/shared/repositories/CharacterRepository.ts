import { prisma } from '../../main/services/database';
import { ValidationService } from '../validation/ValidationService';
import { handleDatabaseError } from '../../main/database/databaseErrorHnadler';
import { createLogger } from '../utils/logger';

const logger = createLogger('CharacterRepository');

/**
 * Repository for Character-related database operations
 * 
 * This repository layer implements validation before database operations
 * and properly handles database errors.
 */
export class CharacterRepository {
  /**
   * Get all characters for a project
   */
  static async getAllByProject(projectId: string) {
    try {
      return await prisma.character.findMany({
        where: { projectId },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getAllByProject',
        table: 'character'
      });
    }
  }
  
  /**
   * Get a character by ID
   */
  static async getById(id: string) {
    try {
      return await prisma.character.findUnique({
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
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getById',
        table: 'character',
        id
      });
    }
  }
  
  /**
   * Create a new character
   */
  static async create(data: any) {
    try {
      // Validate the character data
      const validatedData = ValidationService.validateCharacter(data, 'create');
      
      // Create the character
      return await prisma.character.create({
        data: validatedData
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') {
        throw error; // Re-throw validation errors
      }
      
      return handleDatabaseError(error, {
        operation: 'create',
        table: 'character',
        data
      });
    }
  }
  
  /**
   * Update a character
   */
  static async update(id: string, data: any) {
    try {
      // Validate the character data
      const validatedData = ValidationService.validateCharacter(
        { ...data, id },
        'update'
      );
      
      // Update the character
      return await prisma.character.update({
        where: { id },
        data: validatedData
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') {
        throw error; // Re-throw validation errors
      }
      
      return handleDatabaseError(error, {
        operation: 'update',
        table: 'character',
        id,
        data
      });
    }
  }
  
  /**
   * Delete a character
   */
  static async delete(id: string) {
    try {
      return await prisma.character.delete({
        where: { id }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'delete',
        table: 'character',
        id
      });
    }
  }
}