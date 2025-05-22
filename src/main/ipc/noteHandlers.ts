import { registerIpcHandler } from './ipcHandler.js';
import { NoteRepository } from '../../shared/repositories/NoteRepository.js';

const noteRepo = new NoteRepository();

export function initNoteIpcHandlers() {
  registerIpcHandler('note:getAll', async (_event, projectId: string) => {
    return noteRepo.getByProject(projectId);
  });
  registerIpcHandler('note:getById', async (_event, id: string) => {
    return noteRepo.getById(id);
  });
  registerIpcHandler('note:create', async (_event, data: any) => {
    return noteRepo.create(data);
  });
  registerIpcHandler('note:update', async (_event, { id, data }: { id: string, data: any }) => {
    return noteRepo.update(id, data);
  });
  registerIpcHandler('note:delete', async (_event, id: string) => {
    return noteRepo.delete(id);
  });
} 