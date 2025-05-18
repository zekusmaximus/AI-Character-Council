import { Conversation, ConversationMessage, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { 
  conversationSchema, 
  conversationMessageSchema, 
  ConversationInput, 
  ConversationMessageInput 
} from '../validation/schemas';
import { createLogger } from '../utils/logger';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler';

const logger = createLogger('ConversationRepository');

/**
 * Repository for Conversation operations
 */
export class ConversationRepository extends BaseRepository<
  Conversation,
  ConversationInput,
  Partial<ConversationInput>
> {
  constructor() {
    super('conversation', conversationSchema);
  }
  
  /**
   * Get all conversations for a project
   */
  async getByProject(projectId: string): Promise<Conversation[]> {
    try {
      return await this.prisma.conversation.findMany({
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
   * Get a conversation with all its messages
   */
  async getByIdWithMessages(id: string): Promise<Conversation & { messages: ConversationMessage[] }> {
    try {
      const result = await this.prisma.conversation.findUnique({
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
      
      if (!result) {
        return handleDatabaseError(new Error('Conversation not found'), {
          operation: 'getByIdWithMessages',
          table: this.tableName,
          id
        });
      }
      
      return result;
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByIdWithMessages',
        table: this.tableName,
        id
      });
    }
  }
  
  /**
   * Get conversations involving a character
   */
  async getByCharacter(characterId: string): Promise<Conversation[]> {
    try {
      return await this.prisma.conversation.findMany({
        where: {
          messages: {
            some: {
              characterId
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
   * Get roundtable conversations
   */
  async getRoundtables(projectId: string): Promise<Conversation[]> {
    try {
      return await this.prisma.conversation.findMany({
        where: {
          projectId,
          isRoundtable: true
        },
        orderBy: { updatedAt: 'desc' }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getRoundtables',
        table: this.tableName,
        data: { projectId }
      });
    }
  }
}

/**
 * Repository for Conversation Message operations
 */
export class ConversationMessageRepository extends BaseRepository<
  ConversationMessage,
  ConversationMessageInput,
  Partial<ConversationMessageInput>
> {
  constructor() {
    super('conversationMessage', conversationMessageSchema);
  }
  
  /**
   * Get all messages for a conversation
   */
  async getByConversation(conversationId: string): Promise<ConversationMessage[]> {
    try {
      return await this.prisma.conversationMessage.findMany({
        where: { conversationId },
        orderBy: { timestamp: 'asc' },
        include: {
          character: true
        }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByConversation',
        table: this.tableName,
        data: { conversationId }
      });
    }
  }
  
  /**
   * Get recent messages for a conversation, limited by count
   */
  async getRecentMessages(conversationId: string, limit: number = 20): Promise<ConversationMessage[]> {
    try {
      const count = await this.prisma.conversationMessage.count({
        where: { conversationId }
      });
      
      const skip = Math.max(0, count - limit);
      
      return await this.prisma.conversationMessage.findMany({
        where: { conversationId },
        orderBy: { timestamp: 'asc' },
        skip,
        take: limit,
        include: {
          character: true
        }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getRecentMessages',
        table: this.tableName,
        data: { conversationId, limit }
      });
    }
  }
  
  /**
   * Get messages by a specific character
   */
  async getByCharacter(characterId: string, limit?: number): Promise<ConversationMessage[]> {
    try {
      const query: Prisma.ConversationMessageFindManyArgs = {
        where: { characterId },
        orderBy: { timestamp: 'desc' },
        include: {
          conversation: true
        }
      };
      
      if (limit) {
        query.take = limit;
      }
      
      return await this.prisma.conversationMessage.findMany(query);
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByCharacter',
        table: this.tableName,
        data: { characterId, limit }
      });
    }
  }
  
  /**
   * Get messages that haven't been processed into memories
   */
  async getUnprocessedMessages(characterId: string): Promise<ConversationMessage[]> {
    try {
      return await this.prisma.conversationMessage.findMany({
        where: {
          characterId,
          isMemory: false
        },
        orderBy: { timestamp: 'asc' },
        include: {
          conversation: true
        }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getUnprocessedMessages',
        table: this.tableName,
        data: { characterId }
      });
    }
  }
  
  /**
   * Mark messages as processed into memories
   */
  async markAsProcessed(messageIds: string[]): Promise<boolean> {
    try {
      await this.prisma.conversationMessage.updateMany({
        where: {
          id: {
            in: messageIds
          }
        },
        data: {
          isMemory: true
        }
      });
      
      return true;
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'markAsProcessed',
        table: this.tableName,
        data: { messageIds }
      });
    }
  }
  
  /**
   * Handle special case for message creation with metadata
   */
  async create(data: ConversationMessageInput): Promise<ConversationMessage> {
    try {
      // Validate the data
      const validatedData = this.validate(data, 'create');
      
      // Handle JSON fields
      let dataToCreate = { ...validatedData };
      
      // Stringify metadata if it's an object
      if (dataToCreate.metadata && typeof dataToCreate.metadata !== 'string') {
        dataToCreate.metadata = JSON.stringify(dataToCreate.metadata);
      }
      
      // Create the message
      const message = await this.prisma.conversationMessage.create({
        data: dataToCreate,
        include: {
          character: true
        }
      });
      
      // Update the conversation's updatedAt timestamp
      await this.prisma.conversation.update({
        where: { id: dataToCreate.conversationId },
        data: { updatedAt: new Date() }
      });
      
      return message;
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
   * Handle special case for message update with metadata
   */
  async update(id: string, data: Partial<ConversationMessageInput>): Promise<ConversationMessage> {
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
      
      // Update the message
      return await this.prisma.conversationMessage.update({
        where: { id },
        data: dataToSave,
        include: {
          character: true
        }
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
   * Parse message metadata
   */
  parseMessage(message: ConversationMessage): ConversationMessage & { metadata: any } {
    if (!message) return message as any;
    
    const parsed = { ...message };
    
    // Parse metadata
    if (parsed.metadata && typeof parsed.metadata === 'string') {
      try {
        (parsed as any).metadata = JSON.parse(parsed.metadata);
      } catch (error) {
        logger.error('Failed to parse message metadata JSON', {
          error,
          messageId: parsed.id
        });
        (parsed as any).metadata = {};
      }
    }
    
    return parsed as any;
  }
}