import { BaseRepository } from './BaseRepository.js';
import { projectSchema } from '../validation/schemas.js';
import { createLogger } from '../utils/logger.js';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler.js';
const logger = createLogger('ProjectRepository');
/**
 * Repository for Project operations
 */
export class ProjectRepository extends BaseRepository {
    constructor() {
        super('project', projectSchema);
    }
    /**
     * Get a project with all related entities
     */
    async getByIdWithRelations(id) {
        try {
            const result = await this.prisma.project.findUnique({
                where: { id },
                include: {
                    characters: {
                        include: {
                            personalityTraits: true,
                            characterAttributes: true
                        } // Use 'as any' if TypeScript complains, but ideally update your Prisma schema to reflect these relations
                    },
                    conversations: true,
                    timelines: true,
                    notes: true,
                    tags: true
                }
            });
            if (!result) {
                return handleDatabaseError(new Error('Project not found'), {
                    operation: 'getByIdWithRelations',
                    table: this.tableName,
                    id
                });
            }
            return result;
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'getByIdWithRelations',
                table: this.tableName,
                id
            });
        }
    }
    /**
     * Get projects with counts of related entities
     */
    async getAllWithCounts() {
        try {
            return await this.prisma.project.findMany({
                orderBy: { updatedAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            characters: true,
                            timelines: true,
                            conversations: true,
                            notes: true
                        }
                    }
                }
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'getAllWithCounts',
                table: this.tableName
            });
        }
    }
    /**
     * Search projects by name
     */
    async searchByName(name) {
        try {
            return await this.prisma.project.findMany({
                where: {
                    name: {
                        contains: name
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'searchByName',
                table: this.tableName,
                data: { name }
            });
        }
    }
    /**
     * Get recent projects (updated within the last x days)
     */
    async getRecentlyUpdated(days = 7) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            return await this.prisma.project.findMany({
                where: {
                    updatedAt: {
                        gte: cutoffDate
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'getRecentlyUpdated',
                table: this.tableName,
                data: { days }
            });
        }
    }
    /**
     * Duplicate a project with all its contents
     */
    async duplicate(id, newName) {
        try {
            // Validate the project exists
            const project = await this.prisma.project.findUnique({
                where: { id },
                include: {
                    characters: {
                        include: {
                            personalityTraits: true,
                            characterAttributes: true,
                        },
                    },
                    timelines: {
                        include: {
                            events: true,
                        },
                    },
                    tags: true,
                    notes: true,
                },
            });
            if (!project) {
                return handleDatabaseError(new Error('Project not found'), {
                    operation: 'duplicate',
                    table: this.tableName,
                    id
                });
            }
            // Start a transaction to create the new project with all its contents
            return await this.prisma.$transaction(async (tx) => {
                // Create new project
                const newProject = await tx.project.create({
                    data: {
                        name: newName,
                        description: project.description ? `${project.description} (Copy)` : 'Copy of project'
                    }
                });
                // Character ID mapping for relationships
                const characterIdMap = new Map();
                // Duplicate characters
                for (const character of project.characters) {
                    const newCharacter = await tx.character.create({
                        data: {
                            projectId: newProject.id,
                            name: character.name,
                            bio: character.bio,
                            image: character.image
                        }
                    });
                    // Duplicate personality traits
                    for (const trait of character.personalityTraits) {
                        await tx.personalityTrait.create({
                            data: {
                                characterId: newCharacter.id,
                                name: trait.name,
                                value: trait.value,
                            }
                        });
                    }
                    // Duplicate character attributes
                    for (const attribute of character.characterAttributes) {
                        await tx.characterAttribute.create({
                            data: {
                                characterId: newCharacter.id,
                                name: attribute.name,
                                value: attribute.value
                            }
                        });
                    }
                    // Store mapping of original ID to new ID
                    characterIdMap.set(character.id, newCharacter.id);
                }
                // Timeline ID mapping for events
                const timelineIdMap = new Map();
                // Duplicate timelines
                for (const timeline of project.timelines) {
                    const newTimeline = await tx.timeline.create({
                        data: {
                            projectId: newProject.id,
                            name: timeline.name,
                            description: timeline.description,
                            color: timeline.color,
                            isMainline: timeline.isMainline
                        }
                    });
                    // Store mapping of original ID to new ID
                    timelineIdMap.set(timeline.id, newTimeline.id);
                    // Duplicate timeline events
                    for (const event of timeline.events) {
                        await tx.timelineEvent.create({
                            data: {
                                timelineId: newTimeline.id,
                                title: event.title,
                                description: event.description,
                                date: event.date,
                                order: event.order,
                                importance: event.importance,
                                metadata: event.metadata
                            }
                        });
                    }
                }
                // Duplicate tags
                for (const tag of project.tags) {
                    await tx.tag.create({
                        data: {
                            projectId: newProject.id,
                            name: tag.name,
                            color: tag.color
                        }
                    });
                }
                // Duplicate notes
                for (const note of project.notes) {
                    await tx.note.create({
                        data: {
                            projectId: newProject.id,
                            title: note.title,
                            content: note.content,
                            type: note.type
                        }
                    });
                }
                return newProject;
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'duplicate',
                table: this.tableName,
                data: { id, newName }
            });
        }
    }
}
