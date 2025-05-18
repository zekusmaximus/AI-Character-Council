// src/shared/repositories/index.ts
import { prisma } from '../../main/database/database'; // Use a single prisma import

// Export repositories
export { BaseRepository } from './BaseRepository';
export { CharacterRepositoryV2 as CharacterRepository } from './CharacterRepositoryV2';
export { MemoryRepository } from './MemoryRepository';
export { ConversationRepository, ConversationMessageRepository } from './ConversationRepository';
export { TimelineRepository, TimelineEventRepository } from './TimelineRepository';
export { ProjectRepository } from './ProjectRepository';

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