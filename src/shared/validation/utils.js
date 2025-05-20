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
exports.validateUserSettings = exports.validateTag = exports.validateNote = exports.validateTimelineEvent = exports.validateTimeline = exports.validateConversationMessage = exports.validateConversation = exports.validateCharacterMemory = exports.validateCharacter = exports.validateProject = exports.ValidationUtils = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../utils/errors/AppError");
const logger_1 = require("../utils/logger");
const schemas = __importStar(require("./schemas"));
const logger = (0, logger_1.createLogger)('ValidationUtils');
/**
 * Utility functions for data validation
 */
exports.ValidationUtils = {
    /**
     * Validate data against a schema
     *
     * @param schema Zod schema to validate against
     * @param data Data to validate
     * @param options Validation options
     * @returns Validated data
     * @throws ValidationError if validation fails
     */
    validate(schema, data, options = {}) {
        try {
            return schema.parse(data);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                // Format validation errors
                const validationErrors = {};
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
                throw new AppError_1.ValidationError(message, validationErrors, { context: { ...options.context, data } });
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
    parseJSON(jsonString, schema, defaultValue) {
        if (!jsonString)
            return defaultValue;
        try {
            const parsed = JSON.parse(jsonString);
            return schema.parse(parsed);
        }
        catch (error) {
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
    stringifyJSON(data, defaultValue = '{}') {
        if (data === null || data === undefined)
            return defaultValue;
        try {
            return JSON.stringify(data);
        }
        catch (error) {
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
    validateId(id, entity = 'record') {
        if (typeof id !== 'string' || !id) {
            throw new AppError_1.ValidationError(`Invalid ${entity} ID`, { id: 'ID must be a non-empty string' });
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
    sanitizeData(data) {
        if (!data || typeof data !== 'object')
            return data;
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
const validateProject = (data, operation = 'save') => exports.ValidationUtils.validate(schemas.projectSchema, data, { entity: 'project', operation });
exports.validateProject = validateProject;
const validateCharacter = (data, operation = 'save') => exports.ValidationUtils.validate(schemas.characterSchema, data, { entity: 'character', operation });
exports.validateCharacter = validateCharacter;
const validateCharacterMemory = (data, operation = 'save') => exports.ValidationUtils.validate(schemas.characterMemorySchema, data, { entity: 'memory', operation });
exports.validateCharacterMemory = validateCharacterMemory;
const validateConversation = (data, operation = 'save') => exports.ValidationUtils.validate(schemas.conversationSchema, data, { entity: 'conversation', operation });
exports.validateConversation = validateConversation;
const validateConversationMessage = (data, operation = 'save') => exports.ValidationUtils.validate(schemas.conversationMessageSchema, data, { entity: 'message', operation });
exports.validateConversationMessage = validateConversationMessage;
const validateTimeline = (data, operation = 'save') => exports.ValidationUtils.validate(schemas.timelineSchema, data, { entity: 'timeline', operation });
exports.validateTimeline = validateTimeline;
const validateTimelineEvent = (data, operation = 'save') => exports.ValidationUtils.validate(schemas.timelineEventSchema, data, { entity: 'event', operation });
exports.validateTimelineEvent = validateTimelineEvent;
const validateNote = (data, operation = 'save') => exports.ValidationUtils.validate(schemas.noteSchema, data, { entity: 'note', operation });
exports.validateNote = validateNote;
const validateTag = (data, operation = 'save') => exports.ValidationUtils.validate(schemas.tagSchema, data, { entity: 'tag', operation });
exports.validateTag = validateTag;
const validateUserSettings = (data, operation = 'save') => exports.ValidationUtils.validate(schemas.userSettingsSchema, data, { entity: 'settings', operation });
exports.validateUserSettings = validateUserSettings;
