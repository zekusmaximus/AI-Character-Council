// src/renderer/hooks/useCharacterData.ts

import { useState, useEffect } from 'react';
import { Character, CharacterService } from '../services/databaseService';
import { useLogger } from '../utils/LoggerProvider';

export function useCharacter(characterId: string | null) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const logger = useLogger().createComponentLogger('useCharacter');

  useEffect(() => {
    async function loadCharacter() {
      if (!characterId) {
        setCharacter(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await CharacterService.getById(characterId);
        setCharacter(result);
        
        if (!result) {
          throw new Error(`Character not found: ${characterId}`);
        }
      } catch (err) {
        logger.error(`Failed to load character ${characterId}`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }

    loadCharacter();
  }, [characterId, logger]);

  // Function to update character data
  const updateCharacter = async (data: Partial<Character>): Promise<boolean> => {
    if (!character || !characterId) return false;
    
    try {
      const updated = await CharacterService.update(characterId, data);
      
      if (updated) {
        setCharacter(updated);
        return true;
      }
      
      return false;
    } catch (err) {
      logger.error(`Failed to update character ${characterId}`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  // Function to update just the personality traits
  const updatePersonalityTraits = async (personalityTraits: any): Promise<boolean> => {
    return updateCharacter({ personalityTraits });
  };

  // Function to update character attributes
  const updateCharacterAttributes = async (characterAttributes: any): Promise<boolean> => {
    return updateCharacter({ characterAttributes });
  };

  return {
    character,
    loading,
    error,
    updateCharacter,
    updatePersonalityTraits,
    updateCharacterAttributes
  };
}