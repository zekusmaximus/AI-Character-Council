// Export all validation-related modules from a central location
import * as schemas from './schemas';
import { ValidationService } from './ValidationService';
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
} from './utils';

// Export all schemas and types
export * from './schemas';

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