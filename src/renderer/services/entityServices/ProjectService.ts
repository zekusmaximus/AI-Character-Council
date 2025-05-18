// src/renderer/services/entityServices/ProjectService.ts

import type { Project } from '@prisma/client';
import { validateProject } from '../../../shared/validation';
import { invokeIpc } from './ipcUtils';
import { createLogger } from '../../../shared/utils/logger';
import { RendererErrorHandler } from '../../error/RendererErrorHandler';

const logger = createLogger('ProjectService');

/**
 * Service for project-related operations
 */
export class ProjectService {
  // Get all projects
  static async getAll(): Promise<Project[]> {
    try {
      const data = await invokeIpc<Project[]>('projects.getAll');
      return data || [];
    } catch (error) {
      logger.error('Failed to get all projects', error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
  
  // Get a project by ID
  static async getById(id: string): Promise<Project | null> {
    try {
      const data = await invokeIpc<Project>('projects.getById', id);
      return data || null;
    } catch (error) {
      logger.error(`Failed to get project ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Create a new project
  static async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project | null> {
    try {
      // Validate the data
      const validatedData = validateProject(data, 'create');
      
      // Create the project
      const result = await invokeIpc<Project>('projects.create', validatedData);
      return result || null;
    } catch (error) {
      logger.error('Failed to create project', error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Update a project
  static async update(id: string, data: Partial<Project>): Promise<Project | null> {
    try {
      // Validate the data
      const validatedData = validateProject({ ...data, id }, 'update');
      
      // Update the project
      const result = await invokeIpc<Project>('projects.update', id, data);
      return result || null;
    } catch (error) {
      logger.error(`Failed to update project ${id}`, error);
      RendererErrorHandler.handleError(error);
      return null;
    }
  }
  
  // Delete a project
  static async delete(id: string): Promise<boolean> {
    try {
      await invokeIpc<any>('projects.delete', id);
      return true;
    } catch (error) {
      logger.error(`Failed to delete project ${id}`, error);
      RendererErrorHandler.handleError(error);
      return false;
    }
  }
  
  // Get project with counts of related entities
  static async getAllWithCounts(): Promise<any[]> {
    try {
      const data = await invokeIpc<any[]>('projects.getAllWithCounts');
      return data || [];
    } catch (error) {
      logger.error('Failed to get projects with counts', error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
  
  // Get recently updated projects
  static async getRecentlyUpdated(days: number = 7): Promise<Project[]> {
    try {
      const data = await invokeIpc<Project[]>('projects.getRecentlyUpdated', days);
      return data || [];
    } catch (error) {
      logger.error(`Failed to get recently updated projects (${days} days)`, error);
      RendererErrorHandler.handleError(error);
      return [];
    }
  }
}