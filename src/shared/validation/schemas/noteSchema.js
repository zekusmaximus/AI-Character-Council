// src/shared/validation/schemas/noteSchema.ts
import { z } from 'zod';
// Define the schema for Note validation
export const noteSchema = z.object({
    id: z.string().uuid().optional(),
    projectId: z.string().uuid({
        message: "Project ID is required and must be a valid UUID"
    }),
    title: z.string().min(1, "Title is required").max(200, "Title cannot exceed 200 characters"),
    content: z.string().min(1, "Content is required"),
    type: z.string().max(100, "Type cannot exceed 100 characters").optional().nullable(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
// Export validator function
export const validateNote = (data, operation = 'save') => {
    try {
        return noteSchema.parse(data);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = `Invalid note data: ${error.errors.map(e => e.message).join(', ')}`;
            // Format validation errors as a record
            const validationErrors = {};
            error.errors.forEach(err => {
                const path = err.path.join('.') || 'value';
                validationErrors[path] = err.message;
            });
            // Create a validation error
            const ValidationError = require('../../utils/errors/AppError').ValidationError;
            throw new ValidationError(errorMessage, validationErrors, { context: { operation, data } });
        }
        throw error;
    }
};
