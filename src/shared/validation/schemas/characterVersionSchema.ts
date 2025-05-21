import { z } from 'zod';
import { metadataSchema } from '../schemas.js';

export const characterVersionSchema = z.object({
  id: z.string().uuid().optional(),
  characterId: z.string().uuid(),
  name: z.string().min(1, "Version name is required").max(100, "Version name is too long"),
  description: z.string().max(5000, "Description is too long").optional().nullable(),
  versionType: z.string().min(1, "Version type is required"),
  isActive: z.boolean().default(true),
  metadata: metadataSchema,
});
