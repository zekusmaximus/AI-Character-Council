import { registerIpcHandler } from './ipcHandler.js';
import { MemoryRepository } from '../../shared/repositories/MemoryRepository.js';

const memoryRepo = new MemoryRepository();

export function initMemoryIpcHandlers() {
  registerIpcHandler('memory:getByCharacter', async (_event, characterId: string) => {
    return memoryRepo.getByCharacter(characterId);
  });
  registerIpcHandler('memory:create', async (_event, data: any) => {
    return memoryRepo.create(data);
  });
  registerIpcHandler('memory:update', async (_event, { id, data }: { id: string, data: any }) => {
    return memoryRepo.update(id, data);
  });
  registerIpcHandler('memory:delete', async (_event, id: string) => {
    return memoryRepo.delete(id);
  });
} 