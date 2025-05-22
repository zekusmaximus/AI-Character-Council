// src/shared/validation/schemas/characterSchema.ts

import { z } from 'zod';
import { ValidationError } from '../../utils/errors/AppError.js';

// Define the schema for Character validation
export const characterSchema = z.object({
  id: z.string().uuid().optional(),
  projectId: z.string().uuid({
    message: "Project ID is required and must be a valid UUID"
  }),
  name: z.string().min(1, "Character name is required").max(100, "Character name cannot exceed 100 characters"),
  bio: z.string().max(10000, "Bio cannot exceed 10000 characters").optional().nullable(),
  personalityTraits: z.union([
    z.string(),
    z.object({
      core: z.object({
        traits: z.array(
          z.object({
            name: z.string().min(1, "Trait name is required"),
            value: z.number().min(0, "Trait value must be at least 0").max(100, "Trait value cannot exceed 100")
          })
        ).optional(),
        values: z.array(z.string()).optional()
      }).optional(),
      voice: z.object({
        speechPattern: z.string().optional(),
        vocabulary: z.string().optional(),
        mannerisms: z.array(z.string()).optional()
      }).optional(),
      background: z.object({
        formativeEvents: z.array(
          z.object({
            event: z.string(),
            impact: z.string()
          })
        ).optional(),
        education: z.string().optional(),
        relationships: z.array(
          z.object({
            person: z.string(),
            nature: z.string()
          })
        ).optional()
      }).optional(),
      worldview: z.object({
        beliefs: z.array(z.string()).optional(),
        biases: z.array(
          z.object({
            topic: z.string(),
            attitude: z.string()
          })
        ).optional(),
        moral: z.object({
          valuesMost: z.string().optional(),
          valuesLeast: z.string().optional(),
          lines: z.array(z.string()).optional()
        }).optional()
      }).optional()
    }).optional()
  ]).optional().nullable(),
  characterAttributes: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
  image: z.string().max(1000, "Image path/URL is too long").optional().nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Export type based on schema
export type CharacterInput = z.infer<typeof characterSchema>;

// Export validator function
export const validateCharacter = (data: unknown, operation: string = 'save'): CharacterInput => {
  try {
    return characterSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = `Invalid character data: ${error.errors.map(e => e.message).join(', ')}`;
      
      // Format validation errors as a record
      const validationErrors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.') || 'value';
        validationErrors[path] = err.message;
      });
      
      // Create a validation error
      throw new ValidationError(
        errorMessage,
        validationErrors,
        { context: { operation, data } }
      );
    }
    throw error;
  }
};