import { registerIpcHandler } from './ipcHandler.js';
import { ConversationRepository } from '../../shared/repositories/ConversationRepository.js';

const conversationRepo = new ConversationRepository();

export function initConversationIpcHandlers() {
  registerIpcHandler('conversation:getAll', async (_event, projectId: string) => {
    return conversationRepo.getByProject(projectId);
  });
  registerIpcHandler('conversation:getById', async (_event, id: string) => {
    return conversationRepo.getByIdWithMessages(id);
  });
  registerIpcHandler('conversation:create', async (_event, data: any) => {
    return conversationRepo.create(data);
  });
  registerIpcHandler('conversation:update', async (_event, { id, data }: { id: string, data: any }) => {
    return conversationRepo.update(id, data);
  });
  registerIpcHandler('conversation:delete', async (_event, id: string) => {
    return conversationRepo.delete(id);
  });
} 