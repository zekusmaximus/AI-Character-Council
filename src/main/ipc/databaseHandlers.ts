// src/main/ipc/databaseHandlers.ts

import { ipcMain } from 'electron';
import { prisma } from '../services/database';
import { createLogger } from '../../shared/utils/logger';
import { 
  validateProject,
  validateCharacter,
  validateCharacterMemory,
  validateConversation,
  validateConversationMessage,
  validateTimeline,
  validateTimelineEvent,
  validateNote,
  validateTag,
  validateUserSettings
} from '../../shared/validation';
import { ValidationUtils } from '../../shared/validation/utils';
import { handleDatabaseError } from '../database/databaseErrorHnadler';

const logger = createLogger('DatabaseHandlers');

export function setupDatabaseHandlers() {
  // PROJECT HANDLERS
  ipcMain.handle('project:getAll', async () => {
    try {
      return await prisma.project.findMany({
        orderBy: { updatedAt: 'desc' }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getAll',
        table: 'project'
      });
    }
  });

  ipcMain.handle('project:getById', async (_, id: string) => {
    try {
      // Validate ID
      ValidationUtils.validateId(id, 'project');
      
      return await prisma.project.findUnique({
        where: { id },
        include: {
          characters: true,
          conversations: true,
          timelines: true,
          notes: true,
          tags: true
        }
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'getById',
        table: 'project',
        id
      });
    }
  });

  ipcMain.handle('project:create', async (_, data: any) => {
    try {
      // Validate project data
      const validatedData = validateProject(data, 'create');
      
      // Create project
      return await prisma.project.create({
        data: validatedData
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'create',
        table: 'project',
        data
      });
    }
  });

  ipcMain.handle('project:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      // Validate ID and data
      ValidationUtils.validateId(id, 'project');
      const validatedData = validateProject({ ...data, id }, 'update');
      
      // Remove id from data to update
      const { id: _, ...dataToUpdate } = validatedData;
      
      // Update project
      return await prisma.project.update({
        where: { id },
        data: dataToUpdate
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'update',
        table: 'project',
        id,
        data
      });
    }
  });

  ipcMain.handle('project:delete', async (_, id: string) => {
    try {
      // Validate ID
      ValidationUtils.validateId(id, 'project');
      
      // Delete project
      return await prisma.project.delete({
        where: { id }
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'delete',
        table: 'project',
        id
      });
    }
  });

  // CHARACTER HANDLERS
  ipcMain.handle('character:getAll', async (_, projectId: string) => {
    try {
      // Validate project ID
      ValidationUtils.validateId(projectId, 'project');
      
      return await prisma.character.findMany({
        where: { projectId },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'getAll',
        table: 'character',
        data: { projectId }
      });
    }
  });

  ipcMain.handle('character:getById', async (_, id: string) => {
    try {
      // Validate ID
      ValidationUtils.validateId(id, 'character');
      
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
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'getById',
        table: 'character',
        id
      });
    }
  });

  ipcMain.handle('character:create', async (_, data: any) => {
    try {
      // Validate character data
      const validatedData = validateCharacter(data, 'create');
      
      // Handle JSON fields
      let dataToCreate = { ...validatedData };
      
      // Ensure JSON fields are properly stringified
      if (dataToCreate.personalityTraits && typeof dataToCreate.personalityTraits !== 'string') {
        dataToCreate.personalityTraits = ValidationUtils.stringifyJSON(dataToCreate.personalityTraits);
      }
      
      if (dataToCreate.characterSheet && typeof dataToCreate.characterSheet !== 'string') {
        dataToCreate.characterSheet = ValidationUtils.stringifyJSON(dataToCreate.characterSheet);
      }
      
      // Create character
      return await prisma.character.create({
        data: dataToCreate
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'create',
        table: 'character',
        data: ValidationUtils.sanitizeData(data)
      });
    }
  });

  ipcMain.handle('character:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      // Validate ID and data
      ValidationUtils.validateId(id, 'character');
      const validatedData = validateCharacter({ ...data, id }, 'update');
      
      // Remove id from data to update
      const { id: _, ...dataToUpdate } = validatedData;
      
      // Handle JSON fields
      let dataToSave = { ...dataToUpdate };
      
      // Ensure JSON fields are properly stringified
      if (dataToSave.personalityTraits && typeof dataToSave.personalityTraits !== 'string') {
        dataToSave.personalityTraits = ValidationUtils.stringifyJSON(dataToSave.personalityTraits);
      }
      
      if (dataToSave.characterSheet && typeof dataToSave.characterSheet !== 'string') {
        dataToSave.characterSheet = ValidationUtils.stringifyJSON(dataToSave.characterSheet);
      }
      
      // Update character
      return await prisma.character.update({
        where: { id },
        data: dataToSave
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'update',
        table: 'character',
        id,
        data: ValidationUtils.sanitizeData(data)
      });
    }
  });

  ipcMain.handle('character:delete', async (_, id: string) => {
    try {
      // Validate ID
      ValidationUtils.validateId(id, 'character');
      
      // Delete character
      return await prisma.character.delete({
        where: { id }
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'delete',
        table: 'character',
        id
      });
    }
  });

  // CHARACTER MEMORY HANDLERS
  ipcMain.handle('memory:getByCharacter', async (_, characterId: string) => {
    try {
      // Validate character ID
      ValidationUtils.validateId(characterId, 'character');
      
      return await prisma.characterMemory.findMany({
        where: { characterId },
        orderBy: [
          { importance: 'desc' },
          { timestamp: 'desc' }
        ]
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'getByCharacter',
        table: 'characterMemory',
        data: { characterId }
      });
    }
  });

  ipcMain.handle('memory:create', async (_, data: any) => {
    try {
      // Validate memory data
      const validatedData = validateCharacterMemory(data, 'create');
      
      // Handle JSON fields
      let dataToCreate = { ...validatedData };
      
      // Ensure JSON metadata is properly stringified
      if (dataToCreate.metadata && typeof dataToCreate.metadata !== 'string') {
        dataToCreate.metadata = ValidationUtils.stringifyJSON(dataToCreate.metadata);
      }
      
      // Create memory
      return await prisma.characterMemory.create({
        data: dataToCreate
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'create',
        table: 'characterMemory',
        data: ValidationUtils.sanitizeData(data)
      });
    }
  });

  ipcMain.handle('memory:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      // Validate ID and data
      ValidationUtils.validateId(id, 'memory');
      const validatedData = validateCharacterMemory({ ...data, id }, 'update');
      
      // Remove id from data to update
      const { id: _, ...dataToUpdate } = validatedData;
      
      // Handle JSON fields
      let dataToSave = { ...dataToUpdate };
      
      // Ensure JSON metadata is properly stringified
      if (dataToSave.metadata && typeof dataToSave.metadata !== 'string') {
        dataToSave.metadata = ValidationUtils.stringifyJSON(dataToSave.metadata);
      }
      
      // Update memory
      return await prisma.characterMemory.update({
        where: { id },
        data: dataToSave
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'update',
        table: 'characterMemory',
        id,
        data: ValidationUtils.sanitizeData(data)
      });
    }
  });

  ipcMain.handle('memory:delete', async (_, id: string) => {
    try {
      // Validate ID
      ValidationUtils.validateId(id, 'memory');
      
      // Delete memory
      return await prisma.characterMemory.delete({
        where: { id }
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'delete',
        table: 'characterMemory',
        id
      });
    }
  });

  // CONVERSATION HANDLERS
  ipcMain.handle('conversation:getAll', async (_, projectId: string) => {
    try {
      // Validate project ID
      ValidationUtils.validateId(projectId, 'project');
      
      return await prisma.conversation.findMany({
        where: { projectId },
        orderBy: { updatedAt: 'desc' }
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'getAll',
        table: 'conversation',
        data: { projectId }
      });
    }
  });

  ipcMain.handle('conversation:getById', async (_, id: string) => {
    try {
      // Validate ID
      ValidationUtils.validateId(id, 'conversation');
      
      return await prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
            include: {
              character: true
            }
          }
        }
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'getById',
        table: 'conversation',
        id
      });
    }
  });

  ipcMain.handle('conversation:create', async (_, data: any) => {
    try {
      // Validate conversation data
      const validatedData = validateConversation(data, 'create');
      
      // Create conversation
      return await prisma.conversation.create({
        data: validatedData
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'create',
        table: 'conversation',
        data
      });
    }
  });

  ipcMain.handle('conversation:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      // Validate ID and data
      ValidationUtils.validateId(id, 'conversation');
      const validatedData = validateConversation({ ...data, id }, 'update');
      
      // Remove id from data to update
      const { id: _, ...dataToUpdate } = validatedData;
      
      // Update conversation
      return await prisma.conversation.update({
        where: { id },
        data: dataToUpdate
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'update',
        table: 'conversation',
        id,
        data
      });
    }
  });

  ipcMain.handle('conversation:delete', async (_, id: string) => {
    try {
      // Validate ID
      ValidationUtils.validateId(id, 'conversation');
      
      // Delete conversation
      return await prisma.conversation.delete({
        where: { id }
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'delete',
        table: 'conversation',
        id
      });
    }
  });

  // CONVERSATION MESSAGE HANDLERS
  ipcMain.handle('message:create', async (_, data: any) => {
    try {
      // Validate message data
      const validatedData = validateConversationMessage(data, 'create');
      
      // Handle JSON fields
      let dataToCreate = { ...validatedData };
      
      // Ensure JSON metadata is properly stringified
      if (dataToCreate.metadata && typeof dataToCreate.metadata !== 'string') {
        dataToCreate.metadata = ValidationUtils.stringifyJSON(dataToCreate.metadata);
      }
      
      // Create message
      const message = await prisma.conversationMessage.create({
        data: dataToCreate,
        include: {
          character: true
        }
      });
      
      // Update conversation updatedAt timestamp
      await prisma.conversation.update({
        where: { id: dataToCreate.conversationId },
        data: { updatedAt: new Date() }
      });
      
      return message;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'create',
        table: 'conversationMessage',
        data: ValidationUtils.sanitizeData(data)
      });
    }
  });

  // TIMELINE HANDLERS
  ipcMain.handle('timeline:getAll', async (_, projectId: string) => {
    try {
      // Validate project ID
      ValidationUtils.validateId(projectId, 'project');
      
      return await prisma.timeline.findMany({
        where: { projectId },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'getAll',
        table: 'timeline',
        data: { projectId }
      });
    }
  });

  ipcMain.handle('timeline:getById', async (_, id: string) => {
    try {
      // Validate ID
      ValidationUtils.validateId(id, 'timeline');
      
      return await prisma.timeline.findUnique({
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
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'getById',
        table: 'timeline',
        id
      });
    }
  });

  ipcMain.handle('timeline:create', async (_, data: any) => {
    try {
      // Validate timeline data
      const validatedData = validateTimeline(data, 'create');
      
      // Create timeline
      return await prisma.timeline.create({
        data: validatedData
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'create',
        table: 'timeline',
        data
      });
    }
  });

  ipcMain.handle('timeline:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      // Validate ID and data
      ValidationUtils.validateId(id, 'timeline');
      const validatedData = validateTimeline({ ...data, id }, 'update');
      
      // Remove id from data to update
      const { id: _, ...dataToUpdate } = validatedData;
      
      // Update timeline
      return await prisma.timeline.update({
        where: { id },
        data: dataToUpdate
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'update',
        table: 'timeline',
        id,
        data
      });
    }
  });

  ipcMain.handle('timeline:delete', async (_, id: string) => {
    try {
      // Validate ID
      ValidationUtils.validateId(id, 'timeline');
      
      // Delete timeline
      return await prisma.timeline.delete({
        where: { id }
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'delete',
        table: 'timeline',
        id
      });
    }
  });

  // TIMELINE EVENT HANDLERS
  ipcMain.handle('event:create', async (_, data: any) => {
    try {
      // Validate event data
      const validatedData = validateTimelineEvent(data, 'create');
      
      // Handle JSON fields
      let dataToCreate = { ...validatedData };
      
      // Ensure JSON metadata is properly stringified
      if (dataToCreate.metadata && typeof dataToCreate.metadata !== 'string') {
        dataToCreate.metadata = ValidationUtils.stringifyJSON(dataToCreate.metadata);
      }
      
      // Create event
      return await prisma.timelineEvent.create({
        data: dataToCreate
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'create',
        table: 'timelineEvent',
        data: ValidationUtils.sanitizeData(data)
      });
    }
  });

  ipcMain.handle('event:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      // Validate ID and data
      ValidationUtils.validateId(id, 'event');
      const validatedData = validateTimelineEvent({ ...data, id }, 'update');
      
      // Remove id from data to update
      const { id: _, ...dataToUpdate } = validatedData;
      
      // Handle JSON fields
      let dataToSave = { ...dataToUpdate };
      
      // Ensure JSON metadata is properly stringified
      if (dataToSave.metadata && typeof dataToSave.metadata !== 'string') {
        dataToSave.metadata = ValidationUtils.stringifyJSON(dataToSave.metadata);
      }
      
      // Update event
      return await prisma.timelineEvent.update({
        where: { id },
        data: dataToSave
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'update',
        table: 'timelineEvent',
        id,
        data: ValidationUtils.sanitizeData(data)
      });
    }
  });

  ipcMain.handle('event:delete', async (_, id: string) => {
    try {
      // Validate ID
      ValidationUtils.validateId(id, 'event');
      
      // Delete event
      return await prisma.timelineEvent.delete({
        where: { id }
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'ValidationError') throw error;
      
      return handleDatabaseError(error, {
        operation: 'delete',
        table: 'timelineEvent',
        id
      });
    }
  });

  // Additional database handlers would continue with the same pattern...
  // Following the same validation pattern for remaining entities:
  // - CharacterEventLink
  // - Note
  // - Tag
  // - TaggedItem
  // - UserSettings

  logger.info('Database handlers registered with validation');
}