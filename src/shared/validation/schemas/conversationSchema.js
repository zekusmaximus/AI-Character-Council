import { z } from 'zod';
export const conversationSchema = z.object({
    id: z.string().uuid().optional(),
    projectId: z.string().uuid(),
    title: z.string().min(1, "Conversation title is required").max(200, "Title is too long"),
    description: z.string().max(5000, "Description is too long").optional().nullable(),
    isRoundtable: z.boolean().default(false),
});
