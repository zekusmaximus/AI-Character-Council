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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
exports.createLogger = createLogger;
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
// Define log levels with numeric values for comparison
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 4] = "FATAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
// Default configuration
const DEFAULT_CONFIG = {
    minLevel: LogLevel.INFO,
    logToConsole: true,
    logToFile: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
};
class Logger {
    constructor(config = {}) {
        this.currentLogSize = 0;
        this.config = { ...DEFAULT_CONFIG, ...config };
        // Set up log directory
        if (this.config.logDirectory) {
            this.logDir = this.config.logDirectory;
        }
        else {
            const userDataPath = electron_1.app?.getPath('userData') || path.join(os.homedir(), '.ai-character-council');
            this.logDir = path.join(userDataPath, 'logs');
        }
        // Ensure log directory exists
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        this.currentLogFile = this.getLogFilePath();
        // Check if file exists and get its size
        if (fs.existsSync(this.currentLogFile)) {
            const stats = fs.statSync(this.currentLogFile);
            this.currentLogSize = stats.size;
        }
        // Log startup information
        this.info('Logger initialized', {
            logDir: this.logDir,
            config: this.config,
            timestamp: new Date().toISOString(),
            version: electron_1.app?.getVersion() || 'unknown',
        });
    }
    /**
     * Get the singleton logger instance
     */
    static getInstance(config) {
        if (!Logger.instance) {
            Logger.instance = new Logger(config);
        }
        return Logger.instance;
    }
    /**
     * Reconfigure the logger
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        this.info('Logger reconfigured', { newConfig: this.config });
    }
    /**
     * Log a debug message
     */
    debug(message, data) {
        this.log(LogLevel.DEBUG, message, data);
    }
    /**
     * Log an info message
     */
    info(message, data) {
        this.log(LogLevel.INFO, message, data);
    }
    /**
     * Log a warning message
     */
    warn(message, data) {
        this.log(LogLevel.WARN, message, data);
    }
    /**
     * Log an error message
     */
    error(message, error, additionalData) {
        const errorData = this.formatError(error);
        this.log(LogLevel.ERROR, message, { ...errorData, ...additionalData });
    }
    /**
     * Log a fatal error message
     */
    fatal(message, error, additionalData) {
        const errorData = this.formatError(error);
        this.log(LogLevel.FATAL, message, { ...errorData, ...additionalData });
    }
    /**
     * Internal method to log a message with the specified level
     */
    log(level, message, data) {
        // Skip if log level is below minimum
        if (level < this.config.minLevel) {
            return;
        }
        const timestamp = new Date().toISOString();
        const levelName = LogLevel[level];
        // Format log entry
        const logEntry = {
            timestamp,
            level: levelName,
            message,
            ...(data ? { data } : {}),
        };
        const serializedEntry = JSON.stringify(logEntry);
        const formattedLog = `[${timestamp}] [${levelName}] ${message} ${data ? serializedEntry : ''}`;
        // Log to console if enabled
        if (this.config.logToConsole) {
            this.logToConsole(level, formattedLog);
        }
        // Log to file if enabled
        if (this.config.logToFile) {
            this.logToFile(serializedEntry + '\n');
        }
    }
    /**
     * Log to the console with appropriate styling
     */
    logToConsole(level, message) {
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(message);
                break;
            case LogLevel.INFO:
                console.info(message);
                break;
            case LogLevel.WARN:
                console.warn(message);
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(message);
                break;
        }
    }
    /**
     * Log to the current log file and handle rotation if needed
     */
    logToFile(entry) {
        try {
            // Check if file needs rotation
            if (this.currentLogSize + entry.length > this.config.maxFileSize) {
                this.rotateLogFiles();
            }
            // Append to log file
            fs.appendFileSync(this.currentLogFile, entry);
            this.currentLogSize += entry.length;
        }
        catch (err) {
            // Fall back to console if file logging fails
            console.error('Failed to write to log file:', err);
            console.error('Log entry:', entry);
        }
    }
    /**
     * Rotate log files when current file exceeds max size
     */
    rotateLogFiles() {
        try {
            const files = this.getExistingLogFiles();
            // Remove oldest file if we're at max files
            if (files.length >= this.config.maxFiles) {
                files.sort();
                const oldestFile = files[0];
                fs.unlinkSync(path.join(this.logDir, oldestFile));
            }
            // Create new log file
            this.currentLogFile = this.getLogFilePath();
            this.currentLogSize = 0;
        }
        catch (err) {
            console.error('Failed to rotate log files:', err);
        }
    }
    /**
     * Get a list of existing log files
     */
    getExistingLogFiles() {
        return fs.readdirSync(this.logDir)
            .filter(file => file.startsWith('app-') && file.endsWith('.log'));
    }
    /**
     * Generate the log file path for the current log
     */
    getLogFilePath() {
        const date = new Date();
        const timestamp = date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
        return path.join(this.logDir, `app-${timestamp}.log`);
    }
    /**
     * Format an error object for logging
     */
    formatError(error) {
        if (!error)
            return {};
        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }
        else if (typeof error === 'object') {
            return error;
        }
        else {
            return { rawError: String(error) };
        }
    }
}
exports.Logger = Logger;
// Export a default logger instance
exports.logger = Logger.getInstance();
// Export the createLogger function as a named export
function createLogger(module) {
    const moduleLogger = Logger.getInstance();
    return {
        debug: (message, data) => moduleLogger.debug(`[${module}] ${message}`, data),
        info: (message, data) => moduleLogger.info(`[${module}] ${message}`, data),
        warn: (message, data) => moduleLogger.warn(`[${module}] ${message}`, data),
        error: (message, error, additionalData) => moduleLogger.error(`[${module}] ${message}`, error, additionalData),
        fatal: (message, error, additionalData) => moduleLogger.fatal(`[${module}] ${message}`, error, additionalData),
    };
}
