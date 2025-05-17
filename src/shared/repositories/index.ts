// Export all repositories from a central location
import { BaseRepository } from './BaseRepository';
import { CharacterRepository } from './CharacterRepository';
import { CharacterRepositoryV2 } from './CharacterRepositoryV2';
import { MemoryRepository } from './MemoryRepository';
import { ConversationRepository, ConversationMessageRepository } from './ConversationRepository.ts';
import { TimelineRepository, TimelineEventRepository } from './TimelineRepository';
import { ProjectRepository } from './ProjectRepository';

// Create singleton instances of repositories
const characterRepository = new CharacterRepositoryV2();
const memoryRepository = new MemoryRepository();
const conversationRepository = new ConversationRepository();
const messageRepository = new ConversationMessageRepository();
const timelineRepository = new TimelineRepository();
const eventRepository = new TimelineEventRepository();
const projectRepository = new ProjectRepository();

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
  
  // Singleton instances
  characterRepository,
  memoryRepository,
  conversationRepository,
  messageRepository,
  timelineRepository,
  eventRepository,
  projectRepository
};

// Export repository types
export type { };