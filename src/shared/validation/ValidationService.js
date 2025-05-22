import { z } from 'zod';
import { ValidationError } from '../utils/errors/AppError.js';
import * as schemas from './schemas.js';
/**
 * Validation service for data models
 *
 * This service provides methods to validate data against schemas
 * before it reaches the database layer.
 */
export class ValidationService {
    /**
     * Validate data against a schema and return typed data
     *
     * @param schema Zod schema to validate against
     * @param data Data to validate
     * @param options Additional validation options
     * @returns Validated and typed data
     * @throws ValidationError if validation fails
     */
    static validate(schema, data, options = {}) {
        try {
            // Parse and validate the data
            const result = schema.parse(data);
            return result;
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                // Extract and format validation errors
                const validationErrors = {};
                for (const issue of error.errors) {
                    const path = issue.path.join('.');
                    validationErrors[path || 'value'] = issue.message;
                }
                // Create a user-friendly error message
                const entityName = options.entityName || 'data';
                const operation = options.operation || 'validate';
                throw new ValidationError(`Failed to ${operation} ${entityName}: Invalid data provided`, validationErrors, {
                    context: {
                        providedData: data,
                        operation: options.operation
                    }
                });
            }
            // Re-throw other errors
            throw error;
        }
    }
    // Project validation
    static validateProject(data, operation = 'save') {
        return this.validate(schemas.projectSchema, data, {
            entityName: 'project',
            operation
        });
    }
    // Character validation
    static validateCharacter(data, operation = 'save') {
        return this.validate(schemas.characterSchema, data, {
            entityName: 'character',
            operation
        });
    }
    // Character version validation
    static validateCharacterVersion(data, operation = 'save') {
        return this.validate(schemas.characterVersionSchema, data, {
            entityName: 'character version',
            operation
        });
    }
    // Character memory validation
    static validateCharacterMemory(data, operation = 'save') {
        return this.validate(schemas.characterMemorySchema, data, {
            entityName: 'character memory',
            operation
        });
    }
    // Conversation validation
    static validateConversation(data, operation = 'save') {
        return this.validate(schemas.conversationSchema, data, {
            entityName: 'conversation',
            operation
        });
    }
    // Conversation message validation
    static validateConversationMessage(data, operation = 'save') {
        return this.validate(schemas.conversationMessageSchema, data, {
            entityName: 'conversation message',
            operation
        });
    }
    // Timeline validation
    static validateTimeline(data, operation = 'save') {
        return this.validate(schemas.timelineSchema, data, {
            entityName: 'timeline',
            operation
        });
    }
    // Timeline event validation
    static validateTimelineEvent(data, operation = 'save') {
        return this.validate(schemas.timelineEventSchema, data, {
            entityName: 'timeline event',
            operation
        });
    }
    // Character event link validation
    static validateCharacterEventLink(data, operation = 'save') {
        return this.validate(schemas.characterEventLinkSchema, data, {
            entityName: 'character event link',
            operation
        });
    }
    // Note validation
    static validateNote(data, operation = 'save') {
        return this.validate(schemas.noteSchema, data, {
            entityName: 'note',
            operation
        });
    }
    // Tag validation
    static validateTag(data, operation = 'save') {
        return this.validate(schemas.tagSchema, data, {
            entityName: 'tag',
            operation
        });
    }
    // Tagged item validation
    static validateTaggedItem(data, operation = 'save') {
        return this.validate(schemas.taggedItemSchema, data, {
            entityName: 'tagged item',
            operation
        });
    }
    // User settings validation
    static validateUserSettings(data, operation = 'save') {
        return this.validate(schemas.userSettingsSchema, data, {
            entityName: 'user settings',
            operation
        });
    }
    // Vector database validation
    static validateVectorDatabase(data, operation = 'save') {
        return this.validate(schemas.vectorDatabaseSchema, data, {
            entityName: 'vector database entry',
            operation
        });
    }
}
