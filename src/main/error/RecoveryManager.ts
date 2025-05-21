// src/main/error/RecoveryManager.ts
import { DatabaseError, ApiError } from '../../shared/utils/errors/AppError';
import { createLogger } from '../../shared/utils/logger';
import { prisma } from '../database/database';

const logger = createLogger('RecoveryManager');

export class RecoveryManager {
  private static instance: RecoveryManager;
  
  private constructor() {
    logger.info('Recovery manager initialized');
  }
  
  static getInstance(): RecoveryManager {
    if (!RecoveryManager.instance) {
      RecoveryManager.instance = new RecoveryManager();
    }
    return RecoveryManager.instance;
  }
  
  async attemptRecovery(error: Error): Promise<boolean> {
    try {
      // Database connection errors
      if (error instanceof DatabaseError && error.code === 'DB_CONN_ERROR') {
        logger.info('Attempting database reconnection...');
        await prisma.$disconnect();
        await prisma.$connect();
        return true;
      }
      
      // API rate limit errors
      if (error instanceof ApiError && error.context?.statusCode === 429) {
        const retryAfter = error.context?.responseData?.retry_after || 60;
        logger.info(`API rate limited, recovery scheduled after ${retryAfter}s`);
        return true; // Will be retried later
      }
      
      // No recovery strategy available
      return false;
    } catch (recoveryError) {
      logger.error('Recovery attempt failed', recoveryError);
      return false;
    }
  }
}