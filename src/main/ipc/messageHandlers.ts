import { registerIpcHandler } from './ipcHandler.js';
import { ConversationMessageRepository } from '../../shared/repositories/ConversationRepository.js';

const messageRepo = new ConversationMessageRepository();

export function initMessageIpcHandlers() {
  registerIpcHandler('message:create', async (_event, data: any) => {
    return messageRepo.create(data);
  });
} 