// src/shared/repositories/TagRepository.ts
import { BaseRepository } from './BaseRepository.js';
import { tagSchema, taggedItemSchema } from '../validation/schemas.js';
import { createLogger } from '../utils/logger.js';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler.js';
const logger = createLogger('TagRepository');
/**
 * Repository for Tag operations
 */
export class TagRepository extends BaseRepository {
    constructor() {
        super('tag', tagSchema);
    }
    /**
     * Get all tags for a project
     */
    async getByProject(projectId) {
        try {
            return await this.prisma.tag.findMany({
                where: { projectId },
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: {
                            taggedItems: true
                        }
                    }
                }
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
     * Get tags with usage counts
     */
    async getTagsWithCounts(projectId) {
        try {
            return await this.prisma.tag.findMany({
                where: { projectId },
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: {
                            taggedItems: true
                        }
                    }
                }
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'getTagsWithCounts',
                table: this.tableName,
                data: { projectId }
            });
        }
    }
    /**
     * Find tags by name (partial match)
     */
    async findByName(projectId, name) {
        try {
            return await this.prisma.tag.findMany({
                where: {
                    projectId,
                    name: {
                        contains: name
                    }
                },
                orderBy: { name: 'asc' }
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'findByName',
                table: this.tableName,
                data: { projectId, name }
            });
        }
    }
}
/**
 * Repository for TaggedItem operations
 */
export class TaggedItemRepository extends BaseRepository {
    constructor() {
        super('taggedItem', taggedItemSchema);
    }
    /**
     * Get all tagged items for a tag
     */
    async getByTag(tagId) {
        try {
            return await this.prisma.taggedItem.findMany({
                where: { tagId },
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'getByTag',
                table: this.tableName,
                data: { tagId }
            });
        }
    }
    /**
     * Get all tagged items for an item (e.g., get all tags for a character)
     */
    async getByItem(itemType, itemId) {
        try {
            return await this.prisma.taggedItem.findMany({
                where: {
                    itemType,
                    itemId
                },
                include: {
                    tag: true
                }
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'getByItem',
                table: this.tableName,
                data: { itemType, itemId }
            });
        }
    }
    /**
     * Tag an item
     */
    async tagItem(tagId, itemType, itemId) {
        try {
            // Check if the tag already exists for this item
            const existingTag = await this.prisma.taggedItem.findFirst({
                where: {
                    tagId,
                    itemType,
                    itemId
                }
            });
            // If it already exists, just return it
            if (existingTag) {
                return existingTag;
            }
            // Otherwise, create a new tagged item
            return await this.prisma.taggedItem.create({
                data: {
                    tagId,
                    itemType,
                    itemId
                }
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'tagItem',
                table: this.tableName,
                data: { tagId, itemType, itemId }
            });
        }
    }
    /**
     * Remove a tag from an item
     */
    async untagItem(tagId, itemType, itemId) {
        try {
            // Find the specific tagged item
            const taggedItem = await this.prisma.taggedItem.findFirst({
                where: {
                    tagId,
                    itemType,
                    itemId
                }
            });
            // If not found, return false
            if (!taggedItem) {
                return false;
            }
            // Delete the tagged item
            await this.prisma.taggedItem.delete({
                where: {
                    id: taggedItem.id
                }
            });
            return true;
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'untagItem',
                table: this.tableName,
                data: { tagId, itemType, itemId }
            });
        }
    }
    /**
     * Find items by tag (with filtering by item type)
     */
    async findItemsByTag(tagId, itemType) {
        try {
            const where = { tagId };
            if (itemType) {
                where.itemType = itemType;
            }
            return await this.prisma.taggedItem.findMany({
                where
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'findItemsByTag',
                table: this.tableName,
                data: { tagId, itemType }
            });
        }
    }
}
