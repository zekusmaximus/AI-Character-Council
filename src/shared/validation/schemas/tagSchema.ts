// src/shared/validation/schemas/tagSchema.ts

import { z } from 'zod';

// Define color hex pattern
const colorHexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Define the schema for Tag validation
export const tagSchema = z.object({
  id: z.string().uuid().optional(),
  projectId: z.string().uuid({
    message: "Project ID is required and must be a valid UUID"
  }),
  name: z.string().min(1, "Tag name is required").max(50, "Tag name cannot exceed 50 characters"),
  color: z.string()
    .regex(colorHexPattern, "Color must be a valid hex code (e.g., #FF5500)")
    .optional()
    .nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Export type based on schema
export type TagInput = z.infer<typeof tagSchema>;

// Export validator function
export const validateTag = (data: unknown, operation: string = 'save'): TagInput => {
  try {
    return tagSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = `Invalid tag data: ${error.errors.map(e => e.message).join(', ')}`;
      
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