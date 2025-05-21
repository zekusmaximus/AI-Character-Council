import { z } from 'zod';
import { metadataSchema } from '../schemas.js';

export const timelineEventSchema = z.object({
  id: z.string().uuid().optional(),
  timelineId: z.string().uuid(),
  title: z.string().min(1, "Event title is required").max(200, "Title is too long"),
  description: z.string().max(5000, "Description is too long").optional().nullable(),
  date: z.string().max(100, "Date string is too long").optional().nullable(),
  order: z.number().int(),
  importance: z.number().int().min(0).max(100).default(50),
  metadata: metadataSchema,
});
