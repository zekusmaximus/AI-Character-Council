import { z } from 'zod';

/**
 * Validation schemas for AI Character Council data models
 * 
 * These schemas validate data before it reaches the database layer.
 * They ensure data integrity and provide clear error messages.
 */

// Helper regex patterns
const colorHexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const urlPattern = /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)$/;

// URL validation schema
export const urlSchema = z.string().refine((val) => urlPattern.test(val), {
    message: "Invalid URL format",
});

// Helper schemas that are reused across multiple models
const metadataSchema = z.string().optional()
  .refine(
    (val) => !val || (() => { try { JSON.parse(val); return true; } catch { return false; } })(),
    { message: "Metadata must be valid JSON or empty" }
  );

const dateOrStringSchema = z.union([
  z.date(),
  z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date string format"
  })
]);

// Project schema
export const projectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Project name is required").max(100, "Project name is too long"),
  description: z.string().max(5000, "Description is too long").optional().nullable(),
});

// Character schema
export const characterSchema = z.object({
  id: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  name: z.string().min(1, "Character name is required").max(100, "Character name is too long"),
  bio: z.string().max(10000, "Bio is too long").optional().nullable(),
  image: z.string().max(1000, "Image path/URL is too long").optional().nullable(),
  // personalityTraits and characterAttributes (formerly characterSheet) are now relational
  // and will be handled by their own schemas and repository logic if direct input is needed.
  // For create/update operations, they will be part of the nested write.
  // If direct validation of these as input arrays is needed later, define schemas here.
  personalityTraits: z.array(personalityTraitInputSchema).optional(),
  characterAttributes: z.array(characterAttributeInputSchema).optional(),
});

// Schema for PersonalityTrait (as input, an array of these would be used)
export const personalityTraitInputSchema = z.object({
  name: z.string().min(1, "Trait name is required"),
  value: z.string().min(1, "Trait value is required"),
});
export type PersonalityTraitInput = z.infer<typeof personalityTraitInputSchema>;

// Schema for CharacterAttribute (as input, an array of these would be used)
export const characterAttributeInputSchema = z.object({
  name: z.string().min(1, "Attribute name is required"),
  value: z.string().min(1, "Attribute value is required"),
});
export type CharacterAttributeInput = z.infer<typeof characterAttributeInputSchema>;


// Character version schema
export const characterVersionSchema = z.object({
  id: z.string().uuid().optional(),
  characterId: z.string().uuid(),
  name: z.string().min(1, "Version name is required").max(100, "Version name is too long"),
  description: z.string().max(5000, "Description is too long").optional().nullable(),
  versionType: z.string().min(1, "Version type is required"),
  isActive: z.boolean().default(true),
  metadata: metadataSchema,
});

// Character memory schema
export const characterMemorySchema = z.object({
  id: z.string().uuid().optional(),
  characterId: z.string().uuid(),
  memoryType: z.string().min(1, "Memory type is required"),
  content: z.string().min(1, "Memory content is required").max(10000, "Memory content is too long"),
  source: z.string().max(200, "Source is too long").optional().nullable(),
  importance: z.number().int().min(0).max(100).default(50),
  embedding: z.string().optional().nullable(),
  timestamp: dateOrStringSchema.optional().default(() => new Date()),
  expiresAt: dateOrStringSchema.optional().nullable(),
  metadata: metadataSchema,
});

// Conversation schema
export const conversationSchema = z.object({
  id: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  title: z.string().min(1, "Conversation title is required").max(200, "Title is too long"),
  description: z.string().max(5000, "Description is too long").optional().nullable(),
  isRoundtable: z.boolean().default(false),
});

// Conversation message schema
export const conversationMessageSchema = z.object({
  id: z.string().uuid().optional(),
  conversationId: z.string().uuid(),
  characterId: z.string().uuid().optional().nullable(),
  content: z.string().min(1, "Message content is required"),
  role: z.enum(["user", "assistant", "system"]),
  timestamp: dateOrStringSchema.optional().default(() => new Date()),
  metadata: metadataSchema,
  isMemory: z.boolean().default(false),
});

// Timeline schema
export const timelineSchema = z.object({
  id: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  name: z.string().min(1, "Timeline name is required").max(100, "Timeline name is too long"),
  description: z.string().max(5000, "Description is too long").optional().nullable(),
  color: z.string().regex(colorHexPattern, "Invalid color format").optional().nullable(),
  isMainline: z.boolean().default(false),
});

// Timeline event schema
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

// Character event link schema
export const characterEventLinkSchema = z.object({
  id: z.string().uuid().optional(),
  characterId: z.string().uuid(),
  eventId: z.string().uuid(),
  role: z.string().max(100, "Role is too long").optional().nullable(),
  impact: z.number().int().min(0).max(100).optional().nullable(),
  notes: z.string().max(1000, "Notes are too long").optional().nullable(),
});

// Note schema
export const noteSchema = z.object({
  id: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  title: z.string().min(1, "Note title is required").max(200, "Title is too long"),
  content: z.string().min(1, "Note content is required"),
  type: z.string().max(100, "Type is too long").optional().nullable(),
});

// Tag schema
export const tagSchema = z.object({
  id: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  name: z.string().min(1, "Tag name is required").max(50, "Tag name is too long"),
  color: z.string().regex(colorHexPattern, "Invalid color format").optional().nullable(),
});

// Tagged item schema
export const taggedItemSchema = z.object({
  id: z.string().uuid().optional(),
  tagId: z.string().uuid(),
  itemType: z.string().min(1, "Item type is required"),
  itemId: z.string().min(1, "Item ID is required"),
  noteId: z.string().uuid().optional().nullable(),
});

// User settings schema
export const userSettingsSchema = z.object({
  id: z.string().uuid().optional(),
  theme: z.enum(["light", "dark"]).default("light"),
  llmProvider: z.string().min(1, "LLM provider is required"),
  llmModel: z.string().min(1, "LLM model is required"),
  llmApiKey: z.string().max(1000, "API key is too long").optional().nullable(),
  maxMemoriesPerCall: z.number().int().min(1).max(100).default(10),
});

// Vector database schema
export const vectorDatabaseSchema = z.object({
  id: z.string().uuid().optional(),
  collection: z.string().min(1, "Collection name is required"),
  objectId: z.string().min(1, "Object ID is required"),
  vector: z.string().min(1, "Vector data is required"),
  metadata: metadataSchema,
});

// Export types generated from schemas
export type ProjectInput = z.infer<typeof projectSchema>;
export type CharacterInput = z.infer<typeof characterSchema>;
export type CharacterVersionInput = z.infer<typeof characterVersionSchema>;
export type CharacterMemoryInput = z.infer<typeof characterMemorySchema>;
export type ConversationInput = z.infer<typeof conversationSchema>;
export type ConversationMessageInput = z.infer<typeof conversationMessageSchema>;
export type TimelineInput = z.infer<typeof timelineSchema>;
export type TimelineEventInput = z.infer<typeof timelineEventSchema>;
export type CharacterEventLinkInput = z.infer<typeof characterEventLinkSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type TagInput = z.infer<typeof tagSchema>;
export type TaggedItemInput = z.infer<typeof taggedItemSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
export type VectorDatabaseInput = z.infer<typeof vectorDatabaseSchema>;