"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorDatabaseSchema = exports.userSettingsSchema = exports.taggedItemSchema = exports.tagSchema = exports.noteSchema = exports.characterEventLinkSchema = exports.timelineEventSchema = exports.timelineSchema = exports.conversationMessageSchema = exports.conversationSchema = exports.characterMemorySchema = exports.characterVersionSchema = exports.characterAttributeInputSchema = exports.personalityTraitInputSchema = exports.characterSchema = exports.projectSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation schemas for AI Character Council data models
 *
 * These schemas validate data before it reaches the database layer.
 * They ensure data integrity and provide clear error messages.
 */
// Helper regex patterns
const colorHexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const urlPattern = /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)$/;
// Helper schemas that are reused across multiple models
const metadataSchema = zod_1.z.string().optional()
    .refine((val) => !val || (() => { try {
    JSON.parse(val);
    return true;
}
catch {
    return false;
} })(), { message: "Metadata must be valid JSON or empty" });
const dateOrStringSchema = zod_1.z.union([
    zod_1.z.date(),
    zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Invalid date string format"
    })
]);
// Project schema
exports.projectSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(1, "Project name is required").max(100, "Project name is too long"),
    description: zod_1.z.string().max(5000, "Description is too long").optional().nullable(),
});
// Character schema
exports.characterSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    projectId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, "Character name is required").max(100, "Character name is too long"),
    bio: zod_1.z.string().max(10000, "Bio is too long").optional().nullable(),
    image: zod_1.z.string().max(1000, "Image path/URL is too long").optional().nullable(),
    // personalityTraits and characterAttributes (formerly characterSheet) are now relational
    // and will be handled by their own schemas and repository logic if direct input is needed.
    // For create/update operations, they will be part of the nested write.
    // If direct validation of these as input arrays is needed later, define schemas here.
    personalityTraits: zod_1.z.array(exports.personalityTraitInputSchema).optional(),
    characterAttributes: zod_1.z.array(exports.characterAttributeInputSchema).optional(),
});
// Schema for PersonalityTrait (as input, an array of these would be used)
exports.personalityTraitInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Trait name is required"),
    value: zod_1.z.string().min(1, "Trait value is required"),
});
// Schema for CharacterAttribute (as input, an array of these would be used)
exports.characterAttributeInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Attribute name is required"),
    value: zod_1.z.string().min(1, "Attribute value is required"),
});
// Character version schema
exports.characterVersionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    characterId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, "Version name is required").max(100, "Version name is too long"),
    description: zod_1.z.string().max(5000, "Description is too long").optional().nullable(),
    versionType: zod_1.z.string().min(1, "Version type is required"),
    isActive: zod_1.z.boolean().default(true),
    metadata: metadataSchema,
});
// Character memory schema
exports.characterMemorySchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    characterId: zod_1.z.string().uuid(),
    memoryType: zod_1.z.string().min(1, "Memory type is required"),
    content: zod_1.z.string().min(1, "Memory content is required").max(10000, "Memory content is too long"),
    source: zod_1.z.string().max(200, "Source is too long").optional().nullable(),
    importance: zod_1.z.number().int().min(0).max(100).default(50),
    embedding: zod_1.z.string().optional().nullable(),
    timestamp: dateOrStringSchema.optional().default(() => new Date()),
    expiresAt: dateOrStringSchema.optional().nullable(),
    metadata: metadataSchema,
});
// Conversation schema
exports.conversationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    projectId: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1, "Conversation title is required").max(200, "Title is too long"),
    description: zod_1.z.string().max(5000, "Description is too long").optional().nullable(),
    isRoundtable: zod_1.z.boolean().default(false),
});
// Conversation message schema
exports.conversationMessageSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    conversationId: zod_1.z.string().uuid(),
    characterId: zod_1.z.string().uuid().optional().nullable(),
    content: zod_1.z.string().min(1, "Message content is required"),
    role: zod_1.z.enum(["user", "assistant", "system"]),
    timestamp: dateOrStringSchema.optional().default(() => new Date()),
    metadata: metadataSchema,
    isMemory: zod_1.z.boolean().default(false),
});
// Timeline schema
exports.timelineSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    projectId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, "Timeline name is required").max(100, "Timeline name is too long"),
    description: zod_1.z.string().max(5000, "Description is too long").optional().nullable(),
    color: zod_1.z.string().regex(colorHexPattern, "Invalid color format").optional().nullable(),
    isMainline: zod_1.z.boolean().default(false),
});
// Timeline event schema
exports.timelineEventSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    timelineId: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1, "Event title is required").max(200, "Title is too long"),
    description: zod_1.z.string().max(5000, "Description is too long").optional().nullable(),
    date: zod_1.z.string().max(100, "Date string is too long").optional().nullable(),
    order: zod_1.z.number().int(),
    importance: zod_1.z.number().int().min(0).max(100).default(50),
    metadata: metadataSchema,
});
// Character event link schema
exports.characterEventLinkSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    characterId: zod_1.z.string().uuid(),
    eventId: zod_1.z.string().uuid(),
    role: zod_1.z.string().max(100, "Role is too long").optional().nullable(),
    impact: zod_1.z.number().int().min(0).max(100).optional().nullable(),
    notes: zod_1.z.string().max(1000, "Notes are too long").optional().nullable(),
});
// Note schema
exports.noteSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    projectId: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1, "Note title is required").max(200, "Title is too long"),
    content: zod_1.z.string().min(1, "Note content is required"),
    type: zod_1.z.string().max(100, "Type is too long").optional().nullable(),
});
// Tag schema
exports.tagSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    projectId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, "Tag name is required").max(50, "Tag name is too long"),
    color: zod_1.z.string().regex(colorHexPattern, "Invalid color format").optional().nullable(),
});
// Tagged item schema
exports.taggedItemSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    tagId: zod_1.z.string().uuid(),
    itemType: zod_1.z.string().min(1, "Item type is required"),
    itemId: zod_1.z.string().min(1, "Item ID is required"),
    noteId: zod_1.z.string().uuid().optional().nullable(),
});
// User settings schema
exports.userSettingsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    theme: zod_1.z.enum(["light", "dark"]).default("light"),
    llmProvider: zod_1.z.string().min(1, "LLM provider is required"),
    llmModel: zod_1.z.string().min(1, "LLM model is required"),
    llmApiKey: zod_1.z.string().max(1000, "API key is too long").optional().nullable(),
    maxMemoriesPerCall: zod_1.z.number().int().min(1).max(100).default(10),
});
// Vector database schema
exports.vectorDatabaseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    collection: zod_1.z.string().min(1, "Collection name is required"),
    objectId: zod_1.z.string().min(1, "Object ID is required"),
    vector: zod_1.z.string().min(1, "Vector data is required"),
    metadata: metadataSchema,
});
