// src/shared/utils/jsonUtils.ts

import { createLogger } from './logger.js';

const logger = createLogger('JsonUtils');

/**
 * Type-safe stringify function for converting objects to JSON strings
 */
export function safeStringify<T>(
  data: T,
  options: {
    defaultValue?: string;
    pretty?: boolean;
    keyName?: string;
  } = {}
): string {
  const { defaultValue = '{}', pretty = false, keyName = 'unknown' } = options;
  
  try {
    if (data === null || data === undefined) {
      return defaultValue;
    }
    
    return pretty 
      ? JSON.stringify(data, null, 2) 
      : JSON.stringify(data);
  } catch (error) {
    logger.error(`Failed to stringify ${keyName}:`, error);
    return defaultValue;
  }
}

/**
 * Type-safe parse function for converting JSON strings to objects
 */
export function safeParse<T>(
  jsonString: string | null | undefined,
  options: {
    defaultValue?: T;
    keyName?: string;
  } = {}
): T {
  const { defaultValue = {} as T, keyName = 'unknown' } = options;
  
  try {
    if (!jsonString) {
      return defaultValue;
    }
    
    return JSON.parse(jsonString) as T;
  } catch (error) {
    logger.error(`Failed to parse ${keyName}:`, error);
    return defaultValue;
  }
}

/**
 * Field serializer and parser with a consistent interface
 */
export class JsonField<T> {
  private defaultValue: T;
  private fieldName: string;
  
  constructor(fieldName: string, defaultValue: T) {
    this.fieldName = fieldName;
    this.defaultValue = defaultValue;
  }
  
  serialize(data: T | null | undefined): string {
    return safeStringify(data, {
      defaultValue: this.getDefaultString(),
      keyName: this.fieldName
    });
  }
  
  parse(jsonString: string | null | undefined): T {
    return safeParse<T>(jsonString, {
      defaultValue: this.defaultValue,
      keyName: this.fieldName
    });
  }
  
  private getDefaultString(): string {
    return safeStringify(this.defaultValue);
  }
}

// Define preset handlers for common complex fields

// Character Personality Traits
interface PersonalityTraits {
  core?: {
    traits?: Array<{ name: string; value: number }>;
    values?: string[];
  };
  voice?: {
    speechPattern?: string;
    vocabulary?: string;
    mannerisms?: string[];
  };
  background?: {
    formativeEvents?: Array<{ event: string; impact: string }>;
    education?: string;
    relationships?: Array<{ person: string; nature: string }>;
  };
  worldview?: {
    beliefs?: string[];
    biases?: Array<{ topic: string; attitude: string }>;
    moral?: {
      valuesMost?: string;
      valuesLeast?: string;
      lines?: string[];
    };
  };
}

export const PersonalityTraitsField = new JsonField<PersonalityTraits>(
  'personalityTraits',
  {
    core: {
      traits: [],
      values: []
    },
    voice: {
      speechPattern: ''
    }
  }
);

// Character Sheet
interface CharacterSheet {
  attributes?: Record<string, any>;
  custom?: Record<string, any>;
  notes?: string;
  [key: string]: any;
}

export const CharacterSheetField = new JsonField<CharacterSheet>(
  'characterSheet',
  {}
);

// Memory Metadata
interface MemoryMetadata {
  contextualRelevance?: number;
  associatedMemories?: string[];
  emotionalTone?: string;
  sourceDetails?: {
    type: string;
    id?: string;
    date?: string;
  };
  [key: string]: any;
}

export const MemoryMetadataField = new JsonField<MemoryMetadata>(
  'memoryMetadata',
  {}
);

// Event Metadata
interface EventMetadata {
  duration?: string;
  location?: string;
  consequences?: string[];
  themes?: string[];
  linkedEvents?: string[];
  [key: string]: any;
}

export const EventMetadataField = new JsonField<EventMetadata>(
  'eventMetadata',
  {}
);

// Message Metadata
interface MessageMetadata {
  emotions?: string[];
  intentMarkers?: string[];
  internalThoughts?: string;
  memoryReferences?: string[];
  tokenCount?: number;
  [key: string]: any;
}

export const MessageMetadataField = new JsonField<MessageMetadata>(
  'messageMetadata',
  {}
);

/**
 * Helper to automatically parse JSON fields of an object
 * @param obj The object containing JSON string fields
 * @param fieldParsers Map of field names to their parser functions
 * @returns A new object with the specified fields parsed
 */
export function parseJsonFields<T extends Record<string, any>, K extends keyof T>(
  obj: T | null | undefined,
  fieldParsers: Partial<Record<K, JsonField<any>>>
): T {
  if (!obj) return {} as T;
  
  const result = { ...obj } as Record<string, any>;
  
  Object.entries(fieldParsers).forEach(([fieldName, parser]) => {
    if (fieldName in obj && typeof obj[fieldName] === 'string') {
      // Use type assertion to handle the unknown type
      const jsonField = parser as JsonField<any>;
      result[fieldName] = jsonField.parse(obj[fieldName]);
    }
  });
  
  return result as T;
}

/**
 * Helper to automatically serialize JSON fields of an object
 * @param obj The object containing fields to be serialized
 * @param fieldSerializers Map of field names to their serializer functions
 * @returns A new object with the specified fields serialized
 */
export function serializeJsonFields<T extends Record<string, any>, K extends keyof T>(
  obj: T | null | undefined,
  fieldSerializers: Partial<Record<K, JsonField<any>>>
): T {
  if (!obj) return {} as T;
  
  const result = { ...obj } as Record<string, any>;
  
  Object.entries(fieldSerializers).forEach(([fieldName, serializer]) => {
    if (fieldName in obj && typeof obj[fieldName] !== 'string') {
      // Use type assertion to handle the unknown type
      const jsonField = serializer as JsonField<any>;
      result[fieldName] = jsonField.serialize(obj[fieldName]);
    }
  });
  
  return result as T;
}