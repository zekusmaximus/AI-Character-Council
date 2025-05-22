import { registerIpcHandler } from './ipcHandler.js';
import { ProjectRepository } from '../../shared/repositories/ProjectRepository.js';

const projectRepo = new ProjectRepository();

export function initProjectIpcHandlers() {
  registerIpcHandler('project:getAll', async () => {
    return projectRepo.getAllWithCounts();
  });
  registerIpcHandler('project:getById', async (_event, id: string) => {
    return projectRepo.getByIdWithRelations(id);
  });
  registerIpcHandler('project:create', async (_event, data: any) => {
    return projectRepo.create(data);
  });
  registerIpcHandler('project:update', async (_event, { id, data }: { id: string, data: any }) => {
    return projectRepo.update(id, data);
  });
  registerIpcHandler('project:delete', async (_event, id: string) => {
    return projectRepo.delete(id);
  });
} 