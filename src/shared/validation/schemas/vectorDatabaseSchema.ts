// src/shared/validation/schemas/vectorDatabaseSchema.ts

import { z } from 'zod';
import { ValidationError } from '../../utils/errors/AppError.js';

// Define the schema for VectorDatabase validation
export const vectorDatabaseSchema = z.object({
  id: z.string().uuid().optional(),
  collection: z.string().min(1, "Collection name is required"),
  objectId: z.string().min(1, "Object ID is required"),
  vector: z.string().min(1, "Vector data is required"),
  metadata: z.string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || (() => { try { JSON.parse(val); return true; } catch { return false; } })(),
      { message: "Metadata must be valid JSON or empty" }
    ),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Export type based on schema
export type VectorDatabaseInput = z.infer<typeof vectorDatabaseSchema>;

// Export validator function
export const validateVectorDatabase = (data: unknown, operation: string = 'save'): VectorDatabaseInput => {
  try {
    return vectorDatabaseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = `Invalid vector database entry: ${error.errors.map(e => e.message).join(', ')}`;
      
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