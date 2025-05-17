// src/renderer/utils/jsonTestUtility.ts

import { 
  safeStringify, 
  safeParse,
  JsonField,
  PersonalityTraitsField,
  CharacterSheetField,
  MemoryMetadataField,
  EventMetadataField,
  MessageMetadataField
} from '../../shared/utils/jsonUtils';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('JsonTestUtility');

/**
 * Utility for testing and debugging JSON parsing/serialization
 * This can be used in the development environment to validate the JSON utilities
 */
export class JsonTestUtility {
  /**
   * Test all predefined fields with sample data
   */
  static testAllFields(): void {
    logger.info('Testing all predefined JSON fields');
    
    this.testPersonalityTraitsField();
    this.testCharacterSheetField();
    this.testMemoryMetadataField();
    this.testEventMetadataField();
    this.testMessageMetadataField();
    
    logger.info('All field tests completed');
  }
  
  /**
   * Test the PersonalityTraitsField
   */
  static testPersonalityTraitsField(): void {
    const sampleData = {
      core: {
        traits: [
          { name: 'Intelligent', value: 85 },
          { name: 'Curious', value: 90 }
        ],
        values: ['Truth', 'Knowledge', 'Freedom']
      },
      voice: {
        speechPattern: 'Formal and precise, with occasional dry humor',
        vocabulary: 'Academic',
        mannerisms: ['Adjusts glasses', 'Raises eyebrow when skeptical']
      },
      worldview: {
        beliefs: ['Science can explain everything', 'Human potential is limitless'],
        moral: {
          valuesMost: 'Intellectual integrity',
          valuesLeast: 'Willful ignorance'
        }
      }
    };
    
    // Test serialization
    const serialized = PersonalityTraitsField.serialize(sampleData);
    logger.info('PersonalityTraits serialized:', { serialized });
    
    // Test parsing
    const parsed = PersonalityTraitsField.parse(serialized);
    logger.info('PersonalityTraits parsed:', { parsed });
    
    // Verify data integrity
    const isEqual = JSON.stringify(parsed) === JSON.stringify(sampleData);
    logger.info('PersonalityTraits data integrity check:', { isEqual });
    
    // Test with invalid JSON
    const invalidResult = PersonalityTraitsField.parse('{"core": {invalid json');
    logger.info('PersonalityTraits with invalid JSON:', { invalidResult });
  }
  
  /**
   * Test the CharacterSheetField
   */
  static testCharacterSheetField(): void {
    const sampleData = {
      attributes: {
        strength: 14,
        intelligence: 18,
        wisdom: 12,
        charisma: 10
      },
      custom: {
        magicAffinity: 'High',
        homeworld: 'Elysium',
        specialAbilities: ['Telekinesis', 'Mind Reading']
      },
      notes: 'Character tends to overthink situations and has a fear of water.'
    };
    
    // Test serialization
    const serialized = CharacterSheetField.serialize(sampleData);
    logger.info('CharacterSheet serialized:', { serialized });
    
    // Test parsing
    const parsed = CharacterSheetField.parse(serialized);
    logger.info('CharacterSheet parsed:', { parsed });
    
    // Verify data integrity
    const isEqual = JSON.stringify(parsed) === JSON.stringify(sampleData);
    logger.info('CharacterSheet data integrity check:', { isEqual });
  }
  
  /**
   * Test the MemoryMetadataField
   */
  static testMemoryMetadataField(): void {
    const sampleData = {
      contextualRelevance: 85,
      associatedMemories: ['mem_001', 'mem_042', 'mem_107'],
      emotionalTone: 'Nostalgic',
      sourceDetails: {
        type: 'conversation',
        id: 'conv_123',
        date: '2024-04-15'
      }
    };
    
    // Test serialization
    const serialized = MemoryMetadataField.serialize(sampleData);
    logger.info('MemoryMetadata serialized:', { serialized });
    
    // Test parsing
    const parsed = MemoryMetadataField.parse(serialized);
    logger.info('MemoryMetadata parsed:', { parsed });
    
    // Verify data integrity
    const isEqual = JSON.stringify(parsed) === JSON.stringify(sampleData);
    logger.info('MemoryMetadata data integrity check:', { isEqual });
  }
  
  /**
   * Test the EventMetadataField
   */
  static testEventMetadataField(): void {
    const sampleData = {
      duration: '3 days',
      location: 'Royal Palace',
      consequences: [
        'Kings illness worsened',
        'Prince assumed temporary rule',
        'Neighboring kingdom prepared for invasion'
      ],
      themes: ['Betrayal', 'Power', 'Illness'],
      linkedEvents: ['evt_001', 'evt_005']
    };
    
    // Test serialization
    const serialized = EventMetadataField.serialize(sampleData);
    logger.info('EventMetadata serialized:', { serialized });
    
    // Test parsing
    const parsed = EventMetadataField.parse(serialized);
    logger.info('EventMetadata parsed:', { parsed });
    
    // Verify data integrity
    const isEqual = JSON.stringify(parsed) === JSON.stringify(sampleData);
    logger.info('EventMetadata data integrity check:', { isEqual });
  }
  
  /**
   * Test the MessageMetadataField
   */
  static testMessageMetadataField(): void {
    const sampleData = {
      emotions: ['Anger', 'Fear'],
      intentMarkers: ['Deception', 'Deflection'],
      internalThoughts: 'I need to hide what I know about the stolen artifact',
      memoryReferences: ['mem_042', 'mem_107'],
      tokenCount: 156
    };
    
    // Test serialization
    const serialized = MessageMetadataField.serialize(sampleData);
    logger.info('MessageMetadata serialized:', { serialized });
    
    // Test parsing
    const parsed = MessageMetadataField.parse(serialized);
    logger.info('MessageMetadata parsed:', { parsed });
    
    // Verify data integrity
    const isEqual = JSON.stringify(parsed) === JSON.stringify(sampleData);
    logger.info('MessageMetadata data integrity check:', { isEqual });
  }
  
  /**
   * Test custom field with specified type
   */
  static testCustomField<T>(fieldName: string, defaultValue: T, testData: T): void {
    const customField = new JsonField<T>(fieldName, defaultValue);
    
    // Test serialization
    const serialized = customField.serialize(testData);
    logger.info(`${fieldName} serialized:`, { serialized });
    
    // Test parsing
    const parsed = customField.parse(serialized);
    logger.info(`${fieldName} parsed:`, { parsed });
    
    // Verify data integrity
    const isEqual = JSON.stringify(parsed) === JSON.stringify(testData);
    logger.info(`${fieldName} data integrity check:`, { isEqual });
    
    // Test with null/undefined
    const nullResult = customField.parse(null);
    logger.info(`${fieldName} with null:`, { nullResult });
    
    const undefinedResult = customField.parse(undefined);
    logger.info(`${fieldName} with undefined:`, { undefinedResult });
  }
}

// Export utility functions for direct use
export const testJsonUtils = {
  stringify: <T>(data: T, label: string): string => {
    try {
      const result = safeStringify(data);
      logger.info(`Stringify ${label}:`, { result });
      return result;
    } catch (error) {
      logger.error(`Stringify ${label} failed:`, error);
      return '{}';
    }
  },
  
  parse: <T>(jsonString: string, label: string): T => {
    try {
      const result = safeParse<T>(jsonString);
      logger.info(`Parse ${label}:`, { result });
      return result;
    } catch (error) {
      logger.error(`Parse ${label} failed:`, error);
      return {} as T;
    }
  }
};