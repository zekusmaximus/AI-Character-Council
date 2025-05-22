// src/shared/utils/jsonUtils.ts
import { createLogger } from './logger.js';
const logger = createLogger('JsonUtils');
/**
 * Type-safe stringify function for converting objects to JSON strings
 */
export function safeStringify(data, options = {}) {
    const { defaultValue = '{}', pretty = false, keyName = 'unknown' } = options;
    try {
        if (data === null || data === undefined) {
            return defaultValue;
        }
        return pretty
            ? JSON.stringify(data, null, 2)
            : JSON.stringify(data);
    }
    catch (error) {
        logger.error(`Failed to stringify ${keyName}:`, error);
        return defaultValue;
    }
}
/**
 * Type-safe parse function for converting JSON strings to objects
 */
export function safeParse(jsonString, options = {}) {
    const { defaultValue = {}, keyName = 'unknown' } = options;
    try {
        if (!jsonString) {
            return defaultValue;
        }
        return JSON.parse(jsonString);
    }
    catch (error) {
        logger.error(`Failed to parse ${keyName}:`, error);
        return defaultValue;
    }
}
/**
 * Field serializer and parser with a consistent interface
 */
export class JsonField {
    constructor(fieldName, defaultValue) {
        this.fieldName = fieldName;
        this.defaultValue = defaultValue;
    }
    serialize(data) {
        return safeStringify(data, {
            defaultValue: this.getDefaultString(),
            keyName: this.fieldName
        });
    }
    parse(jsonString) {
        return safeParse(jsonString, {
            defaultValue: this.defaultValue,
            keyName: this.fieldName
        });
    }
    getDefaultString() {
        return safeStringify(this.defaultValue);
    }
}
export const PersonalityTraitsField = new JsonField('personalityTraits', {
    core: {
        traits: [],
        values: []
    },
    voice: {
        speechPattern: ''
    }
});
export const CharacterSheetField = new JsonField('characterSheet', {});
export const MemoryMetadataField = new JsonField('memoryMetadata', {});
export const EventMetadataField = new JsonField('eventMetadata', {});
export const MessageMetadataField = new JsonField('messageMetadata', {});
/**
 * Helper to automatically parse JSON fields of an object
 * @param obj The object containing JSON string fields
 * @param fieldParsers Map of field names to their parser functions
 * @returns A new object with the specified fields parsed
 */
export function parseJsonFields(obj, fieldParsers) {
    if (!obj)
        return {};
    const result = { ...obj };
    Object.entries(fieldParsers).forEach(([fieldName, parser]) => {
        if (fieldName in obj && typeof obj[fieldName] === 'string') {
            // Use type assertion to handle the unknown type
            const jsonField = parser;
            result[fieldName] = jsonField.parse(obj[fieldName]);
        }
    });
    return result;
}
/**
 * Helper to automatically serialize JSON fields of an object
 * @param obj The object containing fields to be serialized
 * @param fieldSerializers Map of field names to their serializer functions
 * @returns A new object with the specified fields serialized
 */
export function serializeJsonFields(obj, fieldSerializers) {
    if (!obj)
        return {};
    const result = { ...obj };
    Object.entries(fieldSerializers).forEach(([fieldName, serializer]) => {
        if (fieldName in obj && typeof obj[fieldName] !== 'string') {
            // Use type assertion to handle the unknown type
            const jsonField = serializer;
            result[fieldName] = jsonField.serialize(obj[fieldName]);
        }
    });
    return result;
}
