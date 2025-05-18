// src/shared/repositories/index.ts

// Export all repositories from a central location
import { BaseRepository } from './BaseRepository';
import { CharacterRepository } from './CharacterRepository';
import { CharacterRepositoryV2 } from './CharacterRepositoryV2';
import { MemoryRepository } from './MemoryRepository';
import { 
  ConversationRepository, 
  ConversationMessageRepository 
} from './ConversationRepository';
import { 
  TimelineRepository, 
  TimelineEventRepository 
} from './TimelineRepository';
import { ProjectRepository } from './ProjectRepository';
import { NoteRepository } from './NoteRepository';
import { 
  TagRepository, 
  TaggedItemRepository 
} from './TagRepository';
import { UserSettingsRepository } from './UserSettingsRepository';
import { VectorDatabaseRepository } from './VectorDatabaseRepository';

// Create singleton instances of repositories
const characterRepository = new CharacterRepositoryV2();
const memoryRepository = new MemoryRepository();
const conversationRepository = new ConversationRepository();
const messageRepository = new ConversationMessageRepository();
const timelineRepository = new TimelineRepository();
const eventRepository = new TimelineEventRepository();
const projectRepository = new ProjectRepository();
const noteRepository = new NoteRepository();
const tagRepository = new TagRepository();
const taggedItemRepository = new TaggedItemRepository();
const settingsRepository = new UserSettingsRepository();
const vectorRepository = new VectorDatabaseRepository();

// Export repositories
export {
  BaseRepository,
  CharacterRepository, // Legacy repository
  CharacterRepositoryV2,
  MemoryRepository,
  ConversationRepository,
  ConversationMessageRepository,
  TimelineRepository,
  TimelineEventRepository,
  ProjectRepository,
  NoteRepository,
  TagRepository,
  TaggedItemRepository,
  UserSettingsRepository,
  VectorDatabaseRepository,
  
  // Singleton instances
  characterRepository,
  memoryRepository,
  conversationRepository,
  messageRepository,
  timelineRepository,
  eventRepository,
  projectRepository,
  noteRepository,
  tagRepository,
  taggedItemRepository,
  settingsRepository,
  vectorRepository
};