
import { z } from 'zod';

export const characterEventLinkSchema = z.object({
  id: z.string().uuid().optional(),
  characterId: z.string().uuid(),
  eventId: z.string().uuid(),
  role: z.string().max(100, "Role is too long").optional().nullable(),
  impact: z.number().int().min(0).max(100).optional().nullable(),
  notes: z.string().max(1000, "Notes are too long").optional().nullable(),
});
