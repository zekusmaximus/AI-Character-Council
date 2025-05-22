import { z } from 'zod';
export const timelineSchema = z.object({
    id: z.string().uuid().optional(),
    projectId: z.string().uuid(),
    name: z.string().min(1, "Timeline name is required").max(100, "Timeline name is too long"),
    description: z.string().max(5000, "Description is too long").optional().nullable(),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional().nullable(),
    isMainline: z.boolean().default(false),
});
