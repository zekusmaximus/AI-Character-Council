
import { prisma } from '../database/database';
import { createLogger } from '../../shared/utils/logger';
import { handleDatabaseError } from '../database/databaseErrorHandler';

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
