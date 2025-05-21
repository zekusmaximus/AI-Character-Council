import { Project, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { projectSchema, ProjectInput } from '../validation/schemas';
import { createLogger } from '../utils/logger';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler';

const logger = createLogger('ProjectRepository');

/**
 * Repository for Project operations
 */
export class ProjectRepository extends BaseRepository<
  Project,
  ProjectInput,
  Partial<ProjectInput>
> {
  constructor() {
    super('project', projectSchema);
  }
  
  /**
   * Get a project with all related entities
   */
  async getByIdWithRelations(id: string): Promise<Project & {
    characters: any[];
    conversations: any[];
    timelines: any[];
    notes: any[];
    tags: any[];
  }> {
    try {
      const result = await this.prisma.project.findUnique({
        where: { id },
        include: {
          characters: true,
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
    } catch (error) {
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
  async getAllWithCounts(): Promise<(Project & {
    _count: { characters: number; timelines: number; conversations: number; notes: number }
  })[]> {
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
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getAllWithCounts',
        table: this.tableName
      });
    }
  }
  
  /**
   * Search projects by name
   */
  async searchByName(name: string): Promise<Project[]> {
    try {
      return await this.prisma.project.findMany({
        where: {
          name: {
            contains: name
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
    } catch (error) {
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
  async getRecentlyUpdated(days: number = 7): Promise<Project[]> {
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
    } catch (error) {
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
  async duplicate(id: string, newName: string): Promise<Project> {
    try {
      // Validate the project exists
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: {
          characters: true,
          timelines: {
            include: {
              events: true
            }
          },
          tags: true,
          notes: true
        }
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
        const characterIdMap = new Map<string, string>();
        
        // Duplicate characters
        for (const character of project.characters) {
          const newCharacter = await tx.character.create({
            data: {
              projectId: newProject.id,
              name: character.name,
              bio: character.bio,
              personalityTraits: {
                createMany: {
                  data: []
                }
              },
              characterAttributes: {
                createMany: {
                  data: []
                }
              },
              image: character.image
            }
          });
          
          // Store mapping of original ID to new ID
          characterIdMap.set(character.id, newCharacter.id);
        }
        
        // Timeline ID mapping for events
        const timelineIdMap = new Map<string, string>();
        
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
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'duplicate',
        table: this.tableName,
        data: { id, newName }
      });
    }
  }
}