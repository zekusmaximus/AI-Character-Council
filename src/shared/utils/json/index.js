// src/shared/utils/json/index.ts
// Export all JSON utilities from this central location
export * from '../jsonUtils.js';
// Usage examples:
/*
Import utilities in your components:

import {
  PersonalityTraitsField,
  CharacterSheetField,
  MemoryMetadataField,
  EventMetadataField,
  MessageMetadataField,
  JsonField
} from '@/shared/utils/json';

Example usage with a Character component:

// Parse personality traits from database
const personalityTraits = PersonalityTraitsField.parse(character.personalityTraits);

// Update personality traits locally
const updatedPersonalityTraits = {
  ...personalityTraits,
  core: {
    ...personalityTraits.core,
    traits: [
      ...personalityTraits.core.traits,
      { name: 'Patient', value: 70 }
    ]
  }
};

// Serialize back to JSON string for database storage
const serializedTraits = PersonalityTraitsField.serialize(updatedPersonalityTraits);

// Save to database
await CharacterService.update(character.id, {
  personalityTraits: serializedTraits
});

Example with parseJsonFields and serializeJsonFields utility functions:

import { parseJsonFields, serializeJsonFields } from '@/shared/utils/json.js';

// Parse multiple JSON fields at once
const parsedCharacter = parseJsonFields(character, {
  personalityTraits: PersonalityTraitsField,
  characterSheet: CharacterSheetField
});

// Make changes to parsed objects
parsedCharacter.personalityTraits.voice.speechPattern = 'Speaks slowly and deliberately';
parsedCharacter.characterSheet.custom.specialAbilities.push('Time Manipulation');

// Serialize all JSON fields at once for database storage
const serializedCharacter = serializeJsonFields(parsedCharacter, {
  personalityTraits: PersonalityTraitsField,
  characterSheet: CharacterSheetField
});

// Save to database
await CharacterService.update(character.id, serializedCharacter);
*/ 
