// src/shared/validation/schemas/projectSchema.ts
import { z } from 'zod';
// Define the schema for Project validation
export const projectSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, "Project name is required").max(100, "Project name cannot exceed 100 characters"),
    description: z.string().max(5000, "Description cannot exceed 5000 characters").optional().nullable(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
// Export validator function
export const validateProject = (data, operation = 'save') => {
    try {
        return projectSchema.parse(data);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = `Invalid project data: ${error.errors.map(e => e.message).join(', ')}`;
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
