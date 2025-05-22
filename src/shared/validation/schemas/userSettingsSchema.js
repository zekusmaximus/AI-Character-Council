// src/shared/validation/schemas/userSettingsSchema.ts
import { z } from 'zod';
// Define the schema for UserSettings validation
export const userSettingsSchema = z.object({
    id: z.string().uuid().optional(),
    theme: z.enum(['light', 'dark'], {
        errorMap: (issue) => ({ message: "Theme must be either 'light' or 'dark'" })
    }).default('light'),
    llmProvider: z.string().min(1, "LLM provider is required"),
    llmModel: z.string().min(1, "LLM model is required"),
    llmApiKey: z.string().max(1000, "API key is too long").optional().nullable(),
    maxMemoriesPerCall: z.number().int()
        .min(1, "Must retrieve at least 1 memory")
        .max(100, "Cannot retrieve more than 100 memories")
        .default(10),
    autoSave: z.boolean().default(true),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});
// Export validator function
export const validateUserSettings = (data, operation = 'save') => {
    try {
        return userSettingsSchema.parse(data);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = `Invalid settings data: ${error.errors.map(e => e.message).join(', ')}`;
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
