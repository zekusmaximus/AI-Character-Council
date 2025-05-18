// src/shared/validation/schemas/characterMemorySchema.ts

import { z } from 'zod';

// Define the schema for CharacterMemory validation
export const characterMemorySchema = z.object({
  id: z.string().uuid().optional(),
  characterId: z.string().uuid({
    message: "Character ID is required and must be a valid UUID"
  }),
  memoryType: z.string().min(1, "Memory type is required"),
  content: z.string().min(1, "Memory content is required").max(10000, "Memory content cannot exceed 10000 characters"),
  source: z.string().max(200, "Source cannot exceed 200 characters").optional().nullable(),
  importance: z.number().int().min(0, "Importance must be at least 0").max(100, "Importance cannot exceed 100").default(50),
  embedding: z.string().optional().nullable(),
  timestamp: z.union([
    z.string().datetime(),
    z.date()
  ]).optional().default(() => new Date().toISOString()),
  expiresAt: z.union([
    z.string().datetime(),
    z.date()
  ]).optional().nullable(),
  metadata: z.union([
    z.string(),
    z.object({
      contextualRelevance: z.number().optional(),
      associatedMemories: z.array(z.string()).optional(),
      emotionalTone: z.string().optional(),
      sourceDetails: z.object({
        type: z.string(),
        id: z.string().optional(),
        date: z.string().optional()
      }).optional()
    }).optional()
  ]).optional().nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Export type based on schema
export type CharacterMemoryInput = z.infer<typeof characterMemorySchema>;

// Export validator function
export const validateCharacterMemory = (data: unknown, operation: string = 'save'): CharacterMemoryInput => {
  try {
    return characterMemorySchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = `Invalid memory data: ${error.errors.map(e => e.message).join(', ')}`;
      
      // Format validation errors as a record
      const validationErrors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.') || 'value';
        validationErrors[path] = err.message;
      });
      
      // Create a validation error
      const ValidationError = require('../../utils/errors/AppError').ValidationError;
      throw new ValidationError(
        errorMessage,
        validationErrors,
        { context: { operation, data } }
      );
    }
    throw error;
  }
};