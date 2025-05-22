import { BaseRepository } from './BaseRepository.js';
import { prisma } from '../../main/database/database.js';
import { createLogger } from '../utils/logger.js';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler.js';
import { characterSchema } from '../validation/schemas.js';
const logger = createLogger('CharacterRepositoryV2');
export class CharacterRepositoryV2 extends BaseRepository {
    constructor() {
        super('character', characterSchema);
    }
    async getByIdWithRelations(id) {
        try {
            return await prisma.character.findUnique({
                where: { id }
            });
        }
        catch (error) {
            return handleDatabaseError(error, {
                operation: 'getByIdWithRelations',
                table: 'character',
                id
            });
        }
    }
}
