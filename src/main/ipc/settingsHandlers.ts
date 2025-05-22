import { registerIpcHandler } from './ipcHandler.js';
import { UserSettingsRepository } from '../../shared/repositories/UserSettingsRepository.js';

const settingsRepo = new UserSettingsRepository();

export function initSettingsIpcHandlers() {
  registerIpcHandler('settings:get', async () => {
    return settingsRepo.getCurrent();
  });
  registerIpcHandler('settings:update', async (_event, data: any) => {
    return settingsRepo.updateSettings(data);
  });
} 