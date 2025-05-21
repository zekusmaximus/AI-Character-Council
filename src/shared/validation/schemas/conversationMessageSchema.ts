import { z } from 'zod';
import { metadataSchema } from '../schemas.js';

export const conversationMessageSchema = z.object({
  id: z.string().uuid().optional(),
  conversationId: z.string().uuid(),
  characterId: z.string().uuid().optional().nullable(),
  content: z.string().min(1, "Message content is required"),
  role: z.enum(["user", "assistant", "system"]),
  timestamp: z.union([z.date(), z.string()]).optional(),
  metadata: metadataSchema,
  isMemory: z.boolean().default(false),
});
