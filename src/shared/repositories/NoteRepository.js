// src/shared/repositories/NoteRepository.ts
import { BaseRepository } from './BaseRepository.js';
import { noteSchema } from '../validation/schemas.js';
import { createLogger } from '../utils/logger.js';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler.js';
const logger = createLogger('NoteRepository');
/**
 * Repository for Note operations
 */
export class NoteRepository extends BaseRepository {
    constructor() {
        super('note', noteSchema);
    }
    /**
     * Get all notes for a project
     */
    async getByProject(projectId) {
        try {
            return await this.prisma.note.findMany({
                where: { projectId },
                orderBy: { updatedAt: 'desc' }
            });
        }
        catch (error) {
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
    async getByType(projectId, type) {
        try {
            return await this.prisma.note.findMany({
                where: {
                    projectId,
                    type
                },
                orderBy: { updatedAt: 'desc' }
            });
        }
        catch (error) {
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
    async searchByContent(projectId, query) {
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
        }
        catch (error) {
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
    async getByCharacter(characterId) {
        try {
            // This requires having TaggedItem entries linking Notes to the Character
            return await this.prisma.note.findMany({
                where: {
                    taggedItems: {
                        some: {
                            itemType: 'character',
                            itemId: characterId
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
        }
        catch (error) {
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
    async getRecent(projectId, limit = 10) {
        try {
            return await this.prisma.note.findMany({
                where: { projectId },
                orderBy: { updatedAt: 'desc' },
                take: limit
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'getRecent',
                table: this.tableName,
                data: { projectId, limit }
            });
        }
    }
}
