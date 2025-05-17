import { z } from 'zod';
import { ValidationError } from '../utils/errors/AppError';
import { createLogger } from '../utils/logger';
import * as schemas from './schemas';

const logger = createLogger('ValidationUtils');

/**
 * Utility functions for data validation
 */
export const ValidationUtils = {
  /**
   * Validate data against a schema
   * 
   * @param schema Zod schema to validate against
   * @param data Data to validate
   * @param options Validation options
   * @returns Validated data
   * @throws ValidationError if validation fails
   */
  validate<T>(
    schema: z.ZodType<T>,
    data: unknown,
    options: {
      entity?: string;
      operation?: string;
      context?: Record<string, any>;
    } = {}
  ): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format validation errors
        const validationErrors: Record<string, string> = {};
        
        error.errors.forEach(issue => {
          const path = issue.path.join('.') || 'value';
          validationErrors[path] = issue.message;
        });
        
        // Create error message
        const entity = options.entity || 'data';
        const operation = options.operation || 'validate';
        const message = `Failed to ${operation} ${entity}: ${Object.values(validationErrors).join('; ')}`;
        
        logger.warn(`Validation error: ${message}`, { 
          errors: validationErrors, 
          data 
        });
        
        throw new ValidationError(
          message,
          validationErrors,
          { context: { ...options.context, data } }
        );
      }
      throw error;
    }
  },
  
  /**
   * Parse a JSON string into a typed object
   * 
   * @param jsonString JSON string to parse
   * @param schema Zod schema to validate against
   * @param defaultValue Default value if parsing fails
   * @returns Parsed and validated object
   */
  parseJSON<T>(
    jsonString: string | null | undefined,
    schema: z.ZodType<T>,
    defaultValue: T
  ): T {
    if (!jsonString) return defaultValue;
    
    try {
      const parsed = JSON.parse(jsonString);
      return schema.parse(parsed);
    } catch (error) {
      logger.warn(`Error parsing JSON: ${error instanceof Error ? error.message : String(error)}`, {
        jsonString: jsonString?.substring(0, 100) + (jsonString && jsonString.length > 100 ? '...' : '')
      });
      return defaultValue;
    }
  },
  
  /**
   * Stringify an object to JSON
   * 
   * @param data Object to stringify
   * @param defaultValue Default value if stringifying fails
   * @returns JSON string
   */
  stringifyJSON<T>(
    data: T | null | undefined,
    defaultValue: string = '{}'
  ): string {
    if (data === null || data === undefined) return defaultValue;
    
    try {
      return JSON.stringify(data);
    } catch (error) {
      logger.warn(`Error stringifying object: ${error instanceof Error ? error.message : String(error)}`);
      return defaultValue;
    }
  },
  
  /**
   * Validate an ID
   * 
   * @param id ID to validate
   * @param entity Entity name for error message
   * @returns Validated ID
   * @throws ValidationError if ID is invalid
   */
  validateId(id: unknown, entity: string = 'record'): string {
    if (typeof id !== 'string' || !id) {
      throw new ValidationError(
        `Invalid ${entity} ID`,
        { id: 'ID must be a non-empty string' }
      );
    }
    
    return id;
  },
  
  /**
   * Sanitize data for logging
   * Removes sensitive fields from data
   * 
   * @param data Data to sanitize
   * @returns Sanitized data
   */
  sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sensitiveFields = ['password', 'apiKey', 'token', 'secret', 'credentials', 'llmApiKey'];
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
};

/**
 * Helper functions for specific data types
 */
export const validateProject = (data: unknown, operation: string = 'save') => 
  ValidationUtils.validate(schemas.projectSchema, data, { entity: 'project', operation });

export const validateCharacter = (data: unknown, operation: string = 'save') => 
  ValidationUtils.validate(schemas.characterSchema, data, { entity: 'character', operation });

export const validateCharacterMemory = (data: unknown, operation: string = 'save') => 
  ValidationUtils.validate(schemas.characterMemorySchema, data, { entity: 'memory', operation });

export const validateConversation = (data: unknown, operation: string = 'save') => 
  ValidationUtils.validate(schemas.conversationSchema, data, { entity: 'conversation', operation });

export const validateConversationMessage = (data: unknown, operation: string = 'save') => 
  ValidationUtils.validate(schemas.conversationMessageSchema, data, { entity: 'message', operation });

export const validateTimeline = (data: unknown, operation: string = 'save') => 
  ValidationUtils.validate(schemas.timelineSchema, data, { entity: 'timeline', operation });

export const validateTimelineEvent = (data: unknown, operation: string = 'save') => 
  ValidationUtils.validate(schemas.timelineEventSchema, data, { entity: 'event', operation });

export const validateNote = (data: unknown, operation: string = 'save') => 
  ValidationUtils.validate(schemas.noteSchema, data, { entity: 'note', operation });

export const validateTag = (data: unknown, operation: string = 'save') => 
  ValidationUtils.validate(schemas.tagSchema, data, { entity: 'tag', operation });

export const validateUserSettings = (data: unknown, operation: string = 'save') => 
  ValidationUtils.validate(schemas.userSettingsSchema, data, { entity: 'settings', operation });