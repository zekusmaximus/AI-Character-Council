import { prisma } from '../database/database.js';
import { createLogger } from '../../shared/utils/logger.js';
import { handleDatabaseError } from '../database/databaseErrorHandler.js';

const logger = createLogger('DatabaseInit');

export async function initDatabase() {
  try {
    logger.info('Initializing database connection');
    await prisma.$connect();
    logger.info('Database connection established');
  } catch (error) {
    return handleDatabaseError(error, {
      operation: 'initDatabase',
      table: 'system'
    });
  }
}
