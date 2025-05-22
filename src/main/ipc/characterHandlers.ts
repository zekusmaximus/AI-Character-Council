import { registerIpcHandler } from './ipcHandler.js';
import { CharacterRepositoryV2 } from '../../shared/repositories/CharacterRepositoryV2.js';

const characterRepo = new CharacterRepositoryV2();

export function initCharacterIpcHandlers() {
  registerIpcHandler('character:getAll', async (_event, projectId: string) => {
    return characterRepo.getAll({ where: { projectId } });
  });
  registerIpcHandler('character:getById', async (_event, id: string) => {
    return characterRepo.getByIdWithRelations(id);
  });
  registerIpcHandler('character:create', async (_event, data: any) => {
    return characterRepo.create(data);
  });
  registerIpcHandler('character:update', async (_event, { id, data }: { id: string, data: any }) => {
    return characterRepo.update(id, data);
  });
  registerIpcHandler('character:delete', async (_event, id: string) => {
    return characterRepo.delete(id);
  });
} 