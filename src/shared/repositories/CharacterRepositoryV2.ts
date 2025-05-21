
import { Character, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { prisma } from '../../main/database/database';
import { createLogger } from '../utils/logger';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler';

const logger = createLogger('CharacterRepositoryV2');

export class CharacterRepositoryV2 extends BaseRepository<Character> {
  constructor() {
    super(prisma.character);
  }

  async getByIdWithRelations(id: string): Promise<Character | null> {
    try {
      return await prisma.character.findUnique({
        where: { id },
        include: {
          personalityTraits: true,
          characterAttributes: true,
          memories: {
            orderBy: [
              { importance: 'desc' },
              { timestamp: 'desc' }
            ]
          }
        }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByIdWithRelations',
        table: 'character',
        id
      });
    }
  }
}
