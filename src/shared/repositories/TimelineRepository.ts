import { Timeline, TimelineEvent, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { timelineSchema, timelineEventSchema, TimelineInput, TimelineEventInput } from '../validation/schemas';
import { createLogger } from '../utils/logger';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler';

const logger = createLogger('TimelineRepository');

/**
 * Repository for Timeline operations
 */
export class TimelineRepository extends BaseRepository<
  Timeline,
  TimelineInput,
  Partial<TimelineInput>
> {
  constructor() {
    super('timeline', timelineSchema);
  }
  
  /**
   * Get all timelines for a project
   */
  async getByProject(projectId: string): Promise<Timeline[]> {
    try {
      return await this.prisma.timeline.findMany({
        where: { projectId },
        orderBy: { name: 'asc' }
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
   * Get a timeline with all its events
   */
  async getByIdWithEvents(id: string): Promise<Timeline & { events: TimelineEvent[] }> {
    try {
      const result = await this.prisma.timeline.findUnique({
        where: { id },
        include: {
          events: {
            orderBy: { order: 'asc' },
            include: {
              characterEventLinks: {
                include: {
                  character: true
                }
              }
            }
          }
        }
      });
      
      if (!result) {
        return handleDatabaseError(new Error('Timeline not found'), {
          operation: 'getByIdWithEvents',
          table: this.tableName,
          id
        });
      }
      
      return result;
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByIdWithEvents',
        table: this.tableName,
        id
      });
    }
  }
  
  /**
   * Get the main timeline for a project
   */
  async getMainTimeline(projectId: string): Promise<Timeline | null> {
    try {
      return await this.prisma.timeline.findFirst({
        where: {
          projectId,
          isMainline: true
        },
        include: {
          events: {
            orderBy: { order: 'asc' }
          }
        }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getMainTimeline',
        table: this.tableName,
        data: { projectId }
      });
    }
  }
}

/**
 * Repository for Timeline Event operations
 */
export class TimelineEventRepository extends BaseRepository<
  TimelineEvent,
  TimelineEventInput,
  Partial<TimelineEventInput>
> {
  constructor() {
    super('timelineEvent', timelineEventSchema);
  }
  
  /**
   * Get all events for a timeline
   */
  async getByTimeline(timelineId: string): Promise<TimelineEvent[]> {
    try {
      return await this.prisma.timelineEvent.findMany({
        where: { timelineId },
        orderBy: { order: 'asc' },
        include: {
          characterEventLinks: {
            include: {
              character: true
            }
          }
        }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByTimeline',
        table: this.tableName,
        data: { timelineId }
      });
    }
  }
  
  /**
   * Get events involving a character
   */
  async getByCharacter(characterId: string): Promise<TimelineEvent[]> {
    try {
      return await this.prisma.timelineEvent.findMany({
        where: {
          characterEventLinks: {
            some: {
              characterId
            }
          }
        },
        include: {
          timeline: true,
          characterEventLinks: {
            include: {
              character: true
            }
          }
        },
        orderBy: [
          { timeline: { name: 'asc' } },
          { order: 'asc' }
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
   * Get important events
   */
  async getImportantEvents(timelineId: string, threshold: number = 70): Promise<TimelineEvent[]> {
    try {
      return await this.prisma.timelineEvent.findMany({
        where: {
          timelineId,
          importance: {
            gte: threshold
          }
        },
        orderBy: { order: 'asc' },
        include: {
          characterEventLinks: {
            include: {
              character: true
            }
          }
        }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getImportantEvents',
        table: this.tableName,
        data: { timelineId, threshold }
      });
    }
  }
  
  /**
   * Reorder events
   */
  async reorderEvents(timelineId: string, eventIds: string[]): Promise<boolean> {
    try {
      // Start a transaction
      return await this.prisma.$transaction(async (tx) => {
        // Update each event with its new order
        for (let i = 0; i < eventIds.length; i++) {
          await tx.timelineEvent.update({
            where: { id: eventIds[i] },
            data: { order: i }
          });
        }
        return true;
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'reorderEvents',
        table: this.tableName,
        data: { timelineId, eventIds }
      });
    }
  }
  
  /**
   * Handle special case for event creation with metadata
   */
  async create(data: TimelineEventInput): Promise<TimelineEvent> {
    try {
      // Validate the data
      const validatedData = this.validate(data, 'create');
      
      // Handle JSON fields
      let dataToCreate = { ...validatedData };
      
      // Stringify metadata if it's an object
      if (dataToCreate.metadata && typeof dataToCreate.metadata !== 'string') {
        dataToCreate.metadata = JSON.stringify(dataToCreate.metadata);
      }
      
      // Create the event
      return await this.prisma.timelineEvent.create({
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
   * Handle special case for event update with metadata
   */
  async update(id: string, data: Partial<TimelineEventInput>): Promise<TimelineEvent> {
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
      
      // Update the event
      return await this.prisma.timelineEvent.update({
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
   * Parse event metadata
   */
  parseEvent(event: TimelineEvent): TimelineEvent & { metadata: any } {
    if (!event) return event as any;
    
    const parsed = { ...event };
    
    // Parse metadata
    if (parsed.metadata && typeof parsed.metadata === 'string') {
      try {
        (parsed as any).metadata = JSON.parse(parsed.metadata);
      } catch (error) {
        logger.error('Failed to parse event metadata JSON', {
          error,
          eventId: parsed.id
        });
        (parsed as any).metadata = {};
      }
    }
    
    return parsed as any;
  }
}