// src/main/ipc/databaseHandlers.ts

import { ipcMain } from 'electron';
import { prisma } from '../services/database';

export function setupDatabaseHandlers() {
  // PROJECT HANDLERS
  ipcMain.handle('project:getAll', async () => {
    try {
      return await prisma.project.findMany({
        orderBy: { updatedAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  });

  ipcMain.handle('project:getById', async (_, id: string) => {
    try {
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
      console.error(`Error fetching project ${id}:`, error);
      throw new Error(`Failed to fetch project ${id}`);
    }
  });

  ipcMain.handle('project:create', async (_, data: any) => {
    try {
      return await prisma.project.create({
        data
      });
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  });

  ipcMain.handle('project:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      return await prisma.project.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw new Error(`Failed to update project ${id}`);
    }
  });

  ipcMain.handle('project:delete', async (_, id: string) => {
    try {
      return await prisma.project.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw new Error(`Failed to delete project ${id}`);
    }
  });

  // CHARACTER HANDLERS
  ipcMain.handle('character:getAll', async (_, projectId: string) => {
    try {
      return await prisma.character.findMany({
        where: { projectId },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.error(`Error fetching characters for project ${projectId}:`, error);
      throw new Error(`Failed to fetch characters for project ${projectId}`);
    }
  });

  ipcMain.handle('character:getById', async (_, id: string) => {
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
      console.error(`Error fetching character ${id}:`, error);
      throw new Error(`Failed to fetch character ${id}`);
    }
  });

  ipcMain.handle('character:create', async (_, data: any) => {
    try {
      // Ensure JSON fields are properly stringified
      if (data.personalityTraits && typeof data.personalityTraits !== 'string') {
        data.personalityTraits = JSON.stringify(data.personalityTraits);
      }
      
      if (data.characterSheet && typeof data.characterSheet !== 'string') {
        data.characterSheet = JSON.stringify(data.characterSheet);
      }
      
      return await prisma.character.create({
        data
      });
    } catch (error) {
      console.error('Error creating character:', error);
      throw new Error('Failed to create character');
    }
  });

  ipcMain.handle('character:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      // Ensure JSON fields are properly stringified
      if (data.personalityTraits && typeof data.personalityTraits !== 'string') {
        data.personalityTraits = JSON.stringify(data.personalityTraits);
      }
      
      if (data.characterSheet && typeof data.characterSheet !== 'string') {
        data.characterSheet = JSON.stringify(data.characterSheet);
      }
      
      return await prisma.character.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error(`Error updating character ${id}:`, error);
      throw new Error(`Failed to update character ${id}`);
    }
  });

  ipcMain.handle('character:delete', async (_, id: string) => {
    try {
      return await prisma.character.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Error deleting character ${id}:`, error);
      throw new Error(`Failed to delete character ${id}`);
    }
  });

  // CHARACTER MEMORY HANDLERS
  ipcMain.handle('memory:getByCharacter', async (_, characterId: string) => {
    try {
      return await prisma.characterMemory.findMany({
        where: { characterId },
        orderBy: [
          { importance: 'desc' },
          { timestamp: 'desc' }
        ]
      });
    } catch (error) {
      console.error(`Error fetching memories for character ${characterId}:`, error);
      throw new Error(`Failed to fetch memories for character ${characterId}`);
    }
  });

  ipcMain.handle('memory:create', async (_, data: any) => {
    try {
      // Ensure JSON metadata is properly stringified
      if (data.metadata && typeof data.metadata !== 'string') {
        data.metadata = JSON.stringify(data.metadata);
      }
      
      return await prisma.characterMemory.create({
        data
      });
    } catch (error) {
      console.error('Error creating memory:', error);
      throw new Error('Failed to create memory');
    }
  });

  ipcMain.handle('memory:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      // Ensure JSON metadata is properly stringified
      if (data.metadata && typeof data.metadata !== 'string') {
        data.metadata = JSON.stringify(data.metadata);
      }
      
      return await prisma.characterMemory.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error(`Error updating memory ${id}:`, error);
      throw new Error(`Failed to update memory ${id}`);
    }
  });

  ipcMain.handle('memory:delete', async (_, id: string) => {
    try {
      return await prisma.characterMemory.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Error deleting memory ${id}:`, error);
      throw new Error(`Failed to delete memory ${id}`);
    }
  });

  // CONVERSATION HANDLERS
  ipcMain.handle('conversation:getAll', async (_, projectId: string) => {
    try {
      return await prisma.conversation.findMany({
        where: { projectId },
        orderBy: { updatedAt: 'desc' }
      });
    } catch (error) {
      console.error(`Error fetching conversations for project ${projectId}:`, error);
      throw new Error(`Failed to fetch conversations for project ${projectId}`);
    }
  });

  ipcMain.handle('conversation:getById', async (_, id: string) => {
    try {
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
      console.error(`Error fetching conversation ${id}:`, error);
      throw new Error(`Failed to fetch conversation ${id}`);
    }
  });

  ipcMain.handle('conversation:create', async (_, data: any) => {
    try {
      return await prisma.conversation.create({
        data
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  });

  ipcMain.handle('conversation:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      return await prisma.conversation.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error(`Error updating conversation ${id}:`, error);
      throw new Error(`Failed to update conversation ${id}`);
    }
  });

  ipcMain.handle('conversation:delete', async (_, id: string) => {
    try {
      return await prisma.conversation.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Error deleting conversation ${id}:`, error);
      throw new Error(`Failed to delete conversation ${id}`);
    }
  });

  // CONVERSATION MESSAGE HANDLERS
  ipcMain.handle('message:create', async (_, data: any) => {
    try {
      // Ensure JSON metadata is properly stringified
      if (data.metadata && typeof data.metadata !== 'string') {
        data.metadata = JSON.stringify(data.metadata);
      }
      
      const message = await prisma.conversationMessage.create({
        data,
        include: {
          character: true
        }
      });
      
      // Update conversation updatedAt timestamp
      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() }
      });
      
      return message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw new Error('Failed to create message');
    }
  });

  // TIMELINE HANDLERS
  ipcMain.handle('timeline:getAll', async (_, projectId: string) => {
    try {
      return await prisma.timeline.findMany({
        where: { projectId },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.error(`Error fetching timelines for project ${projectId}:`, error);
      throw new Error(`Failed to fetch timelines for project ${projectId}`);
    }
  });

  ipcMain.handle('timeline:getById', async (_, id: string) => {
    try {
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
      console.error(`Error fetching timeline ${id}:`, error);
      throw new Error(`Failed to fetch timeline ${id}`);
    }
  });

  ipcMain.handle('timeline:create', async (_, data: any) => {
    try {
      return await prisma.timeline.create({
        data
      });
    } catch (error) {
      console.error('Error creating timeline:', error);
      throw new Error('Failed to create timeline');
    }
  });

  ipcMain.handle('timeline:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      return await prisma.timeline.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error(`Error updating timeline ${id}:`, error);
      throw new Error(`Failed to update timeline ${id}`);
    }
  });

  ipcMain.handle('timeline:delete', async (_, id: string) => {
    try {
      return await prisma.timeline.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Error deleting timeline ${id}:`, error);
      throw new Error(`Failed to delete timeline ${id}`);
    }
  });

  // TIMELINE EVENT HANDLERS
  ipcMain.handle('event:create', async (_, data: any) => {
    try {
      // Ensure JSON metadata is properly stringified
      if (data.metadata && typeof data.metadata !== 'string') {
        data.metadata = JSON.stringify(data.metadata);
      }
      
      return await prisma.timelineEvent.create({
        data
      });
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  });

  ipcMain.handle('event:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      // Ensure JSON metadata is properly stringified
      if (data.metadata && typeof data.metadata !== 'string') {
        data.metadata = JSON.stringify(data.metadata);
      }
      
      return await prisma.timelineEvent.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw new Error(`Failed to update event ${id}`);
    }
  });

  ipcMain.handle('event:delete', async (_, id: string) => {
    try {
      return await prisma.timelineEvent.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw new Error(`Failed to delete event ${id}`);
    }
  });

  // CHARACTER-EVENT LINK HANDLERS
  ipcMain.handle('characterEventLink:create', async (_, data: any) => {
    try {
      return await prisma.characterEventLink.create({
        data,
        include: {
          character: true,
          event: true
        }
      });
    } catch (error) {
      console.error('Error creating character-event link:', error);
      throw new Error('Failed to create character-event link');
    }
  });

  ipcMain.handle('characterEventLink:delete', async (_, id: string) => {
    try {
      return await prisma.characterEventLink.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Error deleting character-event link ${id}:`, error);
      throw new Error(`Failed to delete character-event link ${id}`);
    }
  });

  // NOTE HANDLERS
  ipcMain.handle('note:getAll', async (_, projectId: string) => {
    try {
      return await prisma.note.findMany({
        where: { projectId },
        orderBy: { updatedAt: 'desc' }
      });
    } catch (error) {
      console.error(`Error fetching notes for project ${projectId}:`, error);
      throw new Error(`Failed to fetch notes for project ${projectId}`);
    }
  });

  ipcMain.handle('note:getById', async (_, id: string) => {
    try {
      return await prisma.note.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error(`Error fetching note ${id}:`, error);
      throw new Error(`Failed to fetch note ${id}`);
    }
  });

  ipcMain.handle('note:create', async (_, data: any) => {
    try {
      return await prisma.note.create({
        data
      });
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error('Failed to create note');
    }
  });

  ipcMain.handle('note:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      return await prisma.note.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error(`Error updating note ${id}:`, error);
      throw new Error(`Failed to update note ${id}`);
    }
  });

  ipcMain.handle('note:delete', async (_, id: string) => {
    try {
      return await prisma.note.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Error deleting note ${id}:`, error);
      throw new Error(`Failed to delete note ${id}`);
    }
  });

  // TAG HANDLERS
  ipcMain.handle('tag:getAll', async (_, projectId: string) => {
    try {
      return await prisma.tag.findMany({
        where: { projectId },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.error(`Error fetching tags for project ${projectId}:`, error);
      throw new Error(`Failed to fetch tags for project ${projectId}`);
    }
  });

  ipcMain.handle('tag:create', async (_, data: any) => {
    try {
      return await prisma.tag.create({
        data
      });
    } catch (error) {
      console.error('Error creating tag:', error);
      throw new Error('Failed to create tag');
    }
  });

  ipcMain.handle('tag:update', async (_, { id, data }: { id: string; data: any }) => {
    try {
      return await prisma.tag.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error(`Error updating tag ${id}:`, error);
      throw new Error(`Failed to update tag ${id}`);
    }
  });

  ipcMain.handle('tag:delete', async (_, id: string) => {
    try {
      return await prisma.tag.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Error deleting tag ${id}:`, error);
      throw new Error(`Failed to delete tag ${id}`);
    }
  });

  // USER SETTINGS HANDLERS
  ipcMain.handle('settings:get', async () => {
    try {
      const settings = await prisma.userSettings.findFirst();
      if (settings) {
        return settings;
      }
      
      // Create default settings if none exist
      return await prisma.userSettings.create({
        data: {
          theme: 'light',
          llmProvider: 'openai',
          llmModel: 'gpt-4',
          maxMemoriesPerCall: 10
        }
      });
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw new Error('Failed to fetch user settings');
    }
  });

  ipcMain.handle('settings:update', async (_, data: any) => {
    try {
      const settings = await prisma.userSettings.findFirst();
      
      if (settings) {
        return await prisma.userSettings.update({
          where: { id: settings.id },
          data
        });
      } else {
        return await prisma.userSettings.create({
          data
        });
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw new Error('Failed to update user settings');
    }
  });
}