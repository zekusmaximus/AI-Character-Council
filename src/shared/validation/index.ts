// Export all validation-related modules from a central location
import * as schemas from './schemas.js';
import { ValidationService } from './ValidationService.js';
import { ValidationUtils, 
  validateProject,
  validateCharacter,
  validateCharacterMemory,
  validateConversation,
  validateConversationMessage,
  validateTimeline,
  validateTimelineEvent,
  validateNote,
  validateTag,
  validateUserSettings
} from './utils.js';

// Export all schemas and types
export * from './schemas.js';

// Export validation service and utils
export {
  schemas,
  ValidationService,
  ValidationUtils,
  
  // Shorthand validation functions
  validateProject,
  validateCharacter,
  validateCharacterMemory,
  validateConversation,
  validateConversationMessage,
  validateTimeline,
  validateTimelineEvent,
  validateNote,
  validateTag,
  validateUserSettings
};