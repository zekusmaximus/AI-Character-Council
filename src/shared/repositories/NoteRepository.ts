// src/shared/repositories/NoteRepository.ts

import { Note, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { noteSchema, NoteInput } from '../validation/schemas';
import { createLogger } from '../utils/logger';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler';

const logger = createLogger('NoteRepository');

/**
 * Repository for Note operations
 */
export class NoteRepository extends BaseRepository<
  Note,
  NoteInput,
  Partial<NoteInput>
> {
  constructor() {
    super('note', noteSchema);
  }
  
  /**
   * Get all notes for a project
   */
  async getByProject(projectId: string): Promise<Note[]> {
    try {
      return await this.prisma.note.findMany({
        where: { projectId },
        orderBy: { updatedAt: 'desc' }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByProject',
        table: this.tableName,
        data: { projectId }
      });
    }
  }
  
  /**
   * Get notes by type
   */
  async getByType(projectId: string, type: string): Promise<Note[]> {
    try {
      return await this.prisma.note.findMany({
        where: { 
          projectId,
          type
        },
        orderBy: { updatedAt: 'desc' }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByType',
        table: this.tableName,
        data: { projectId, type }
      });
    }
  }
  
  /**
   * Search notes by content
   */
  async searchByContent(projectId: string, query: string): Promise<Note[]> {
    try {
      return await this.prisma.note.findMany({
        where: {
          projectId,
          OR: [
            { title: { contains: query } },
            { content: { contains: query } }
          ]
        },
        orderBy: { updatedAt: 'desc' }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'searchByContent',
        table: this.tableName,
        data: { projectId, query }
      });
    }
  }
  
  /**
   * Get notes related to a character
   */
  async getByCharacter(characterId: string): Promise<Note[]> {
    try {
      // This requires having TaggedItem entries linking Notes to the Character
      return await this.prisma.note.findMany({
        where: {
          TaggedItem: {
            some: {
              itemType: 'character',
              itemId: characterId
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
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
   * Get recent notes
   */
  async getRecent(projectId: string, limit: number = 10): Promise<Note[]> {
    try {
      return await this.prisma.note.findMany({
        where: { projectId },
        orderBy: { updatedAt: 'desc' },
        take: limit
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getRecent',
        table: this.tableName,
        data: { projectId, limit }
      });
    }
  }
}