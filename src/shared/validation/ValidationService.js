"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../utils/errors/AppError");
const schemas = __importStar(require("./schemas"));
/**
 * Validation service for data models
 *
 * This service provides methods to validate data against schemas
 * before it reaches the database layer.
 */
class ValidationService {
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
            if (error instanceof zod_1.z.ZodError) {
                // Extract and format validation errors
                const validationErrors = {};
                for (const issue of error.errors) {
                    const path = issue.path.join('.');
                    validationErrors[path || 'value'] = issue.message;
                }
                // Create a user-friendly error message
                const entityName = options.entityName || 'data';
                const operation = options.operation || 'validate';
                throw new AppError_1.ValidationError(`Failed to ${operation} ${entityName}: Invalid data provided`, validationErrors, {
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
exports.ValidationService = ValidationService;
