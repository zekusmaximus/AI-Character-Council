
// src/shared/repositories/index.ts
import { prisma } from '../../main/database/database';

// Import repositories
import { BaseRepository } from './BaseRepository';
import { CharacterRepositoryV2 } from './CharacterRepositoryV2';
import { MemoryRepository } from './MemoryRepository';
import { ConversationRepository, ConversationMessageRepository } from './ConversationRepository';
import { TimelineRepository, TimelineEventRepository } from './TimelineRepository';
import { ProjectRepository } from './ProjectRepository';

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

// Export instances
export {
  characterRepository,
  memoryRepository,
  conversationRepository,
  messageRepository,
  timelineRepository,
  eventRepository,
  projectRepository
};
