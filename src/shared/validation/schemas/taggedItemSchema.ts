// src/shared/validation/schemas/taggedItemSchema.ts

import { z } from 'zod';
import { ValidationError } from '../../utils/errors/AppError.js';

// Define the schema for TaggedItem validation
export const taggedItemSchema = z.object({
  id: z.string().uuid().optional(),
  tagId: z.string().uuid({
    message: "Tag ID is required and must be a valid UUID"
  }),
  itemType: z.string().min(1, "Item type is required")
    .refine(val => ['character', 'note', 'timeline', 'event', 'conversation'].includes(val), {
      message: "Item type must be one of: character, note, timeline, event, conversation"
    }),
  itemId: z.string().min(1, "Item ID is required"),
  noteId: z.string().uuid().optional().nullable(),
  createdAt: z.string().datetime().optional(),
});

// Export type based on schema
export type TaggedItemInput = z.infer<typeof taggedItemSchema>;

// Export validator function
export const validateTaggedItem = (data: unknown, operation: string = 'save'): TaggedItemInput => {
  try {
    return taggedItemSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = `Invalid tagged item data: ${error.errors.map(e => e.message).join(', ')}`;
      
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