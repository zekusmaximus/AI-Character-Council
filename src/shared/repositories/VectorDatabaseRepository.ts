// src/shared/repositories/VectorDatabaseRepository.ts

import { VectorDatabase } from '@prisma/client';
import { BaseRepository } from './BaseRepository.js';
import { vectorDatabaseSchema, VectorDatabaseInput } from '../validation/schemas.js';
import { createLogger } from '../utils/logger.js';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler.js';

const logger = createLogger('VectorDatabaseRepository');

/**
 * Repository for VectorDatabase operations
 */
export class VectorDatabaseRepository extends BaseRepository<
  VectorDatabase,
  VectorDatabaseInput,
  Partial<VectorDatabaseInput>
> {
  constructor() {
    super('vectorDatabase', vectorDatabaseSchema);
  }
  
  /**
   * Get all vectors in a collection
   */
  async getByCollection(collection: string): Promise<VectorDatabase[]> {
    try {
      return await this.prisma.vectorDatabase.findMany({
        where: { collection }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByCollection',
        table: this.tableName,
        data: { collection }
      });
    }
  }
  
  /**
   * Get vector for a specific object
   */
  async getByObject(collection: string, objectId: string): Promise<VectorDatabase | null> {
    try {
      return await this.prisma.vectorDatabase.findFirst({
        where: {
          collection,
          objectId
        }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByObject',
        table: this.tableName,
        data: { collection, objectId }
      });
    }
  }
  
  /**
   * Add or update a vector embedding
   */
  async upsertVector(data: VectorDatabaseInput): Promise<VectorDatabase> {
    try {
      // Validate the data
      const validatedData = this.validate(data, 'create');
      
      // Check if a vector already exists for this object
      const existingVector = await this.getByObject(
        validatedData.collection, 
        validatedData.objectId
      );
      
      if (existingVector) {
        // Update existing vector
        return await this.prisma.vectorDatabase.update({
          where: { id: existingVector.id },
          data: validatedData
        });
      } else {
        // Create new vector
        return await this.prisma.vectorDatabase.create({
          data: validatedData
        });
      }
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'upsertVector',
        table: this.tableName,
        data
      });
    }
  }
  
  /**
   * Delete vectors for a specific object
   */
  async deleteByObject(collection: string, objectId: string): Promise<number> {
    try {
      const result = await this.prisma.vectorDatabase.deleteMany({
        where: {
          collection,
          objectId
        }
      });
      
      return result.count;
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'deleteByObject',
        table: this.tableName,
        data: { collection, objectId }
      });
    }
  }
  
  /**
   * Delete all vectors in a collection
   */
  async deleteCollection(collection: string): Promise<number> {
    try {
      const result = await this.prisma.vectorDatabase.deleteMany({
        where: { collection }
      });
      
      return result.count;
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'deleteCollection',
        table: this.tableName,
        data: { collection }
      });
    }
  }
  
  /**
   * Parse vector metadata
   */
  parseMetadata(vector: VectorDatabase): VectorDatabase & { metadata: any } {
    if (!vector) return vector as any;
    
    const parsed = { ...vector };
    
    // Parse metadata if it's a string
    if (parsed.metadata && typeof parsed.metadata === 'string') {
      try {
        (parsed as any).metadata = JSON.parse(parsed.metadata);
      } catch (error) {
        logger.error('Failed to parse vector metadata JSON', {
          error,
          vectorId: parsed.id
        });
        (parsed as any).metadata = {};
      }
    }
    
    return parsed as any;
  }
}