import { Character, Prisma, PersonalityTrait, CharacterAttribute } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { characterSchema, CharacterInput, PersonalityTraitInput, CharacterAttributeInput } from '../validation/schemas';
import { createLogger } from '../utils/logger';
import { handleDatabaseError } from '../../main/database/databaseErrorHandler';

const logger = createLogger('CharacterRepositoryV2');

/**
 * Repository for Character-related database operations using BaseRepository
 */
export class CharacterRepositoryV2 extends BaseRepository<
  Character,
  CharacterInput,
  Partial<CharacterInput>
> {
  constructor() {
    super('character', characterSchema);
  }

  /**
   * Get all characters for a project
   */
  async getAllByProject(projectId: string): Promise<Character[]> {
    try {
      return await this.prisma.character.findMany({
        where: { projectId },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getAllByProject',
        table: this.tableName,
        data: { projectId }
      });
    }
  }

  /**
   * Get a character with related data
   */
  async getByIdWithRelations(id: string): Promise<(Character & {
    characterMemories: Prisma.CharacterMemoryGetPayload<{}>[];
    characterVersions: Prisma.CharacterVersionGetPayload<{}>[];
    characterEventLinks: Prisma.CharacterEventLinkGetPayload<{ include: { event: true } }>[];
    personalityTraits: PersonalityTrait[];
    characterAttributes: CharacterAttribute[];
  }) | null> {
    try {
      const result = await this.prisma.character.findUnique({
        where: { id },
        include: {
          characterMemories: true,
          characterVersions: true,
          characterEventLinks: {
            include: {
              event: true
            }
          },
          personalityTraits: true,
          characterAttributes: true
        }
      });
      if (!result) {
        logger.warn(`Character with id ${id} not found for getByIdWithRelations.`);
        return null;
      }
      return result as (Character & {
        characterMemories: Prisma.CharacterMemoryGetPayload<{}>[];
        characterVersions: Prisma.CharacterVersionGetPayload<{}>[];
        characterEventLinks: Prisma.CharacterEventLinkGetPayload<{ include: { event: true } }>[];
        personalityTraits: PersonalityTrait[];
        characterAttributes: CharacterAttribute[];
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'getByIdWithRelations',
        table: this.tableName,
        id
      });
    }
  }

  /**
   * Search characters by name
   */
  async searchByName(name: string, projectId?: string): Promise<Character[]> {
    try {
      const where: Prisma.CharacterWhereInput = {
        name: {
          contains: name
        }
      };

      if (projectId) {
        where.projectId = projectId;
      }

      return await this.prisma.character.findMany({
        where,
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      return handleDatabaseError(error, {
        operation: 'searchByName',
        table: this.tableName,
        data: { name, projectId }
      });
    }
  }

  /**
   * Handle special case for character creation with personality traits
   */
  async create(data: CharacterInput): Promise<Character & { personalityTraits: PersonalityTrait[], characterAttributes: CharacterAttribute[] }> {
    try {
      const validatedData = this.validate(data, 'create');
      const { personalityTraits, characterAttributes, ...characterCoreData } = validatedData;

      const createData: Prisma.CharacterCreateInput = {
        ...characterCoreData
      };

      if (personalityTraits && personalityTraits.length > 0) {
        createData.personalityTraits = {
          create: personalityTraits.map((pt: PersonalityTraitInput) => ({ name: pt.name, value: pt.value }))
        };
      }

      if (characterAttributes && characterAttributes.length > 0) {
        createData.characterAttributes = {
          create: characterAttributes.map((ca: CharacterAttributeInput) => ({ name: ca.name, value: ca.value }))
        };
      }

      return await this.prisma.character.create({
        data: createData,
        include: {
          personalityTraits: true,
          characterAttributes: true
        }
      });
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        throw error;
      }

      return handleDatabaseError(error, {
        operation: 'create',
        table: this.tableName,
        data
      });
    }
  }

  /**
   * Handle special case for character update with personality traits
   */
  async update(id: string, data: Partial<CharacterInput>): Promise<Character & { personalityTraits: PersonalityTrait[], characterAttributes: CharacterAttribute[] }> {
    try {
      const validatedData = this.validate({ ...data, id }, 'update');
      const { id: validatedId, personalityTraits, characterAttributes, ...characterCoreData } = validatedData;

      return await this.prisma.$transaction(async (tx) => {
        // 1. Update core character data
        const coreDataKeys = Object.keys(characterCoreData);
        let charUpdatePromise;
        if (coreDataKeys.length > 0 && Object.values(characterCoreData).some(v => v !== undefined)) {
          charUpdatePromise = tx.character.update({
            where: { id },
            data: characterCoreData
          });
        } else {
          charUpdatePromise = tx.character.findUniqueOrThrow({ where: { id } });
        }

        const updatedCoreCharacter = await charUpdatePromise;

        // 2. Handle personalityTraits
        if (personalityTraits !== undefined) {
          await tx.personalityTrait.deleteMany({ where: { characterId: id } });
          if (personalityTraits.length > 0) {
            await tx.personalityTrait.createMany({
              data: personalityTraits.map((pt: PersonalityTraitInput) => ({
                characterId: id,
                name: pt.name,
                value: pt.value
              })),
              skipDuplicates: true
            });
          }
        }

        // 3. Handle characterAttributes
        if (characterAttributes !== undefined) {
          await tx.characterAttribute.deleteMany({ where: { characterId: id } });
          if (characterAttributes.length > 0) {
            await tx.characterAttribute.createMany({
              data: characterAttributes.map((ca: CharacterAttributeInput) => ({
                characterId: id,
                name: ca.name,
                value: ca.value
              })),
              skipDuplicates: true
            });
          }
        }

        // 4. Return final character with relations
        return tx.character.findUniqueOrThrow({
          where: { id },
          include: {
            personalityTraits: true,
            characterAttributes: true
          }
        });
      });
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        throw error;
      }

      return handleDatabaseError(error, {
        operation: 'update',
        table: this.tableName,
        id,
        data
      });
    }
  }
}