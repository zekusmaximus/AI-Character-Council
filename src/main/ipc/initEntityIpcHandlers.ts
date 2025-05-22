import { initProjectIpcHandlers } from './projectHandlers.js';
import { initCharacterIpcHandlers } from './characterHandlers.js';
import { initMemoryIpcHandlers } from './memoryHandlers.js';
import { initConversationIpcHandlers } from './conversationHandlers.js';
import { initMessageIpcHandlers } from './messageHandlers.js';
import { initTimelineIpcHandlers } from './timelineHandlers.js';
import { initEventIpcHandlers } from './eventHandlers.js';
import { initCharacterEventLinkIpcHandlers } from './characterEventLinkHandlers.js';
import { initNoteIpcHandlers } from './noteHandlers.js';
import { initTagIpcHandlers } from './tagHandlers.js';
import { initSettingsIpcHandlers } from './settingsHandlers.js';

export function initEntityIpcHandlers() {
  initProjectIpcHandlers();
  initCharacterIpcHandlers();
  initMemoryIpcHandlers();
  initConversationIpcHandlers();
  initMessageIpcHandlers();
  initTimelineIpcHandlers();
  initEventIpcHandlers();
  initCharacterEventLinkIpcHandlers();
  initNoteIpcHandlers();
  initTagIpcHandlers();
  initSettingsIpcHandlers();
} 