import { registerIpcHandler } from './ipcHandler.js';
import { TaggedItemRepository } from '../../shared/repositories/TagRepository.js';

const characterEventLinkRepo = new TaggedItemRepository();

export function initCharacterEventLinkIpcHandlers() {
  registerIpcHandler('characterEventLink:create', async (_event, data: any) => {
    // Assuming data contains tagId, itemType, itemId
    return characterEventLinkRepo.tagItem(data.tagId, data.itemType, data.itemId);
  });
  registerIpcHandler('characterEventLink:delete', async (_event, id: string) => {
    // Assuming id is the taggedItem id
    return characterEventLinkRepo.delete(id);
  });
} 