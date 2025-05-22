import { registerIpcHandler } from './ipcHandler.js';
import { TagRepository } from '../../shared/repositories/TagRepository.js';

const tagRepo = new TagRepository();

export function initTagIpcHandlers() {
  registerIpcHandler('tag:getAll', async (_event, projectId: string) => {
    return tagRepo.getByProject(projectId);
  });
  registerIpcHandler('tag:create', async (_event, data: any) => {
    return tagRepo.create(data);
  });
  registerIpcHandler('tag:update', async (_event, { id, data }: { id: string, data: any }) => {
    return tagRepo.update(id, data);
  });
  registerIpcHandler('tag:delete', async (_event, id: string) => {
    return tagRepo.delete(id);
  });
} 