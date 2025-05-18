// src/shared/repositories/UserSettingsRepository.ts

import { UserSettings } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { userSettingsSchema, UserSettingsInput } from '../validation/schemas';
import { createLogger } from '../utils/logger';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler';

const logger = createLogger('UserSettingsRepository');

/**
 * Repository for UserSettings operations
 */
export class UserSettingsRepository extends BaseRepository<
  UserSettings,
  UserSettingsInput,
  Partial<UserSettingsInput>
> {
  constructor() {
    super('userSettings', userSettingsSchema);
  }
  
  /**
   * Get the current user settings
   * Returns the first settings record or creates default settings if none exist
   */
  async getCurrent(): Promise<UserSettings> {
    try {
      // Get the first settings record
      const settings = await this.prisma.userSettings.findFirst();
      
      // If settings exist, return them
      if (settings) {
        return settings;
      }
      
      // Otherwise, create default settings
      logger.info('No settings found, creating defaults');
      return await this.prisma.userSettings.create({
        data: {
          theme: 'light',
          llmProvider: 'openai',
          llmModel: 'gpt-4',
          maxMemoriesPerCall: 10,
          autoSave: true
        }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getCurrent',
        table: this.tableName
      });
    }
  }
  
  /**
   * Update the current settings
   */
  async updateSettings(data: Partial<UserSettingsInput>): Promise<UserSettings> {
    try {
      // Get current settings
      const currentSettings = await this.getCurrent();
      
      // Validate the updated data
      const validatedData = this.validate({
        ...data,
        id: currentSettings.id
      }, 'update');
      
      // Remove id from the data to update
      const { id: _, ...dataToUpdate } = validatedData;
      
      // Update settings
      return await this.prisma.userSettings.update({
        where: { id: currentSettings.id },
        data: dataToUpdate
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'updateSettings',
        table: this.tableName,
        data
      });
    }
  }
  
  /**
   * Update a specific setting by key
   */
  async updateSetting(key: keyof UserSettings, value: any): Promise<UserSettings> {
    try {
      // Get current settings
      const currentSettings = await this.getCurrent();
      
      // Create data object with the specific key
      const data = { [key]: value } as Partial<UserSettings>;
      
      // Update the setting
      return await this.prisma.userSettings.update({
        where: { id: currentSettings.id },
        data
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'updateSetting',
        table: this.tableName,
        data: { key, value }
      });
    }
  }
}