// src/shared/repositories/index.ts
import { prisma } from '../../main/database/database.js';

// Import repositories
import { BaseRepository } from './BaseRepository.js';
import { CharacterRepositoryV2 } from './CharacterRepositoryV2.js';
import { MemoryRepository } from './MemoryRepository.js';
import { ConversationRepository, ConversationMessageRepository } from './ConversationRepository.js';
import { TimelineRepository, TimelineEventRepository } from './TimelineRepository.js';
import { ProjectRepository } from './ProjectRepository.js';
import { UserSettingsRepository } from './UserSettingsRepository.js';
import { VectorDatabaseRepository } from './VectorDatabaseRepository.js';

// Export repository classes
export {
  BaseRepository,
  CharacterRepositoryV2 as CharacterRepository,
  MemoryRepository,
  ConversationRepository,
  ConversationMessageRepository,
  TimelineRepository,
  TimelineEventRepository,
  ProjectRepository
};

// Create singleton instances
const characterRepository = new CharacterRepositoryV2();
const memoryRepository = new MemoryRepository();
const conversationRepository = new ConversationRepository();
const messageRepository = new ConversationMessageRepository();
const timelineRepository = new TimelineRepository();
const eventRepository = new TimelineEventRepository();
const projectRepository = new ProjectRepository();
const userSettingsRepository = new UserSettingsRepository();
const vectorDatabaseRepository = new VectorDatabaseRepository();

// Export instances
export {
  characterRepository,
  memoryRepository,
  conversationRepository,
  messageRepository,
  timelineRepository,
  eventRepository,
  projectRepository,
  userSettingsRepository,
  vectorDatabaseRepository
};
