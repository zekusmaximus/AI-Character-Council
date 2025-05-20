"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserSettings = exports.validateTag = exports.validateNote = exports.validateTimelineEvent = exports.validateTimeline = exports.validateConversationMessage = exports.validateConversation = exports.validateCharacterMemory = exports.validateCharacter = exports.validateProject = exports.ValidationUtils = exports.ValidationService = exports.schemas = void 0;
// Export all validation-related modules from a central location
const schemas = __importStar(require("./schemas"));
exports.schemas = schemas;
const ValidationService_1 = require("./ValidationService");
Object.defineProperty(exports, "ValidationService", { enumerable: true, get: function () { return ValidationService_1.ValidationService; } });
const utils_1 = require("./utils");
Object.defineProperty(exports, "ValidationUtils", { enumerable: true, get: function () { return utils_1.ValidationUtils; } });
Object.defineProperty(exports, "validateProject", { enumerable: true, get: function () { return utils_1.validateProject; } });
Object.defineProperty(exports, "validateCharacter", { enumerable: true, get: function () { return utils_1.validateCharacter; } });
Object.defineProperty(exports, "validateCharacterMemory", { enumerable: true, get: function () { return utils_1.validateCharacterMemory; } });
Object.defineProperty(exports, "validateConversation", { enumerable: true, get: function () { return utils_1.validateConversation; } });
Object.defineProperty(exports, "validateConversationMessage", { enumerable: true, get: function () { return utils_1.validateConversationMessage; } });
Object.defineProperty(exports, "validateTimeline", { enumerable: true, get: function () { return utils_1.validateTimeline; } });
Object.defineProperty(exports, "validateTimelineEvent", { enumerable: true, get: function () { return utils_1.validateTimelineEvent; } });
Object.defineProperty(exports, "validateNote", { enumerable: true, get: function () { return utils_1.validateNote; } });
Object.defineProperty(exports, "validateTag", { enumerable: true, get: function () { return utils_1.validateTag; } });
Object.defineProperty(exports, "validateUserSettings", { enumerable: true, get: function () { return utils_1.validateUserSettings; } });
// Export all schemas and types
__exportStar(require("./schemas"), exports);
