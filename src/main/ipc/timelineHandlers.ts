import { registerIpcHandler } from './ipcHandler.js';
import { TimelineRepository } from '../../shared/repositories/TimelineRepository.js';

const timelineRepo = new TimelineRepository();

export function initTimelineIpcHandlers() {
  registerIpcHandler('timeline:getAll', async (_event, projectId: string) => {
    return timelineRepo.getByProject(projectId);
  });
  registerIpcHandler('timeline:getById', async (_event, id: string) => {
    return timelineRepo.getByIdWithEvents(id);
  });
  registerIpcHandler('timeline:create', async (_event, data: any) => {
    return timelineRepo.create(data);
  });
  registerIpcHandler('timeline:update', async (_event, { id, data }: { id: string, data: any }) => {
    return timelineRepo.update(id, data);
  });
  registerIpcHandler('timeline:delete', async (_event, id: string) => {
    return timelineRepo.delete(id);
  });
} 