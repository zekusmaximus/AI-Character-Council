import { registerIpcHandler } from './ipcHandler.js';
import { TimelineEventRepository } from '../../shared/repositories/TimelineRepository.js';

const eventRepo = new TimelineEventRepository();

export function initEventIpcHandlers() {
  registerIpcHandler('event:create', async (_event, data: any) => {
    return eventRepo.create(data);
  });
  registerIpcHandler('event:update', async (_event, { id, data }: { id: string, data: any }) => {
    return eventRepo.update(id, data);
  });
  registerIpcHandler('event:delete', async (_event, id: string) => {
    return eventRepo.delete(id);
  });
} 