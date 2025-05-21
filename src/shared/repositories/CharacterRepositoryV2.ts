
import { Character, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { prisma } from '../../main/database/database';
import { createLogger } from '../utils/logger';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler';
import { characterSchema } from '../validation/schemas';

const logger = createLogger('CharacterRepositoryV2');

type CharacterCreateInput = Prisma.CharacterCreateInput;
type CharacterUpdateInput = Prisma.CharacterUpdateInput;

export class CharacterRepositoryV2 extends BaseRepository<Character, CharacterCreateInput, CharacterUpdateInput> {
  constructor() {
    super('character', characterSchema);
  }

  async getByIdWithRelations(id: string): Promise<Character | null> {
    try {
      return await prisma.character.findUnique({
        where: { id },
        include: {
          personalityTraits: true,
          characterAttributes: true,
          characterVersions: true,
          characterMemories: true
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
