// Environment detection
const isNode = typeof window === 'undefined' && typeof process !== 'undefined' && process.versions && process.versions.node;
let app;
if (isNode) {
    try {
        // Dynamically require electron only in Node.js environment
        app = require('electron').app;
    }
    catch (e) {
        console.warn("Running in Node.js environment but 'electron' module is not available. File logging features might be limited.");
        app = undefined;
    }
}
// Define log levels with numeric values for comparison
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 4] = "FATAL";
})(LogLevel || (LogLevel = {}));
// Default configuration
const DEFAULT_CONFIG = {
    minLevel: LogLevel.INFO,
    logToConsole: true,
    logToFile: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
};
export class Logger {
    constructor(config = {}) {
        this.logDir = null;
        this.currentLogFile = null;
        this.currentLogSize = 0;
        this.config = { ...DEFAULT_CONFIG, ...config };
        if (isNode && this.config.logToFile) {
            const node_os = require('os');
            const node_path = require('path');
            const node_fs = require('fs');
            // Set up log directory
            if (this.config.logDirectory) {
                this.logDir = this.config.logDirectory;
            }
            else {
                const userDataPath = app?.getPath('userData') || node_path.join(node_os.homedir(), '.ai-character-council');
                this.logDir = node_path.join(userDataPath, 'logs');
            }
            // Ensure log directory exists
            if (this.logDir && !node_fs.existsSync(this.logDir)) {
                node_fs.mkdirSync(this.logDir, { recursive: true });
            }
            this.currentLogFile = this.getLogFilePath(); // getLogFilePath will also use require for path
            // Check if file exists and get its size
            if (this.currentLogFile && node_fs.existsSync(this.currentLogFile)) {
                const stats = node_fs.statSync(this.currentLogFile);
                this.currentLogSize = stats.size;
            }
        }
        else {
            this.config.logToFile = false; // Disable file logging if not in Node.js or explicitly disabled
        }
        // Log startup information
        this.info('Logger initialized', {
            logDir: this.logDir,
            config: this.config,
            timestamp: new Date().toISOString(),
            version: app?.getVersion() || 'unknown',
            isNode,
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
        // Log to file if enabled and in Node.js environment
        if (isNode && this.config.logToFile && this.currentLogFile) {
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
        if (!isNode || !this.config.logToFile || !this.currentLogFile || !this.logDir) {
            return; // Skip file logging if not in Node, disabled, or paths not set
        }
        try {
            const node_fs = require('fs');
            // Check if file needs rotation
            if (this.currentLogSize + entry.length > this.config.maxFileSize) {
                this.rotateLogFiles(); // rotateLogFiles will use its own require for fs
            }
            // Append to log file
            if (this.currentLogFile) { // Ensure currentLogFile is not null
                node_fs.appendFileSync(this.currentLogFile, entry);
                this.currentLogSize += entry.length;
            }
        }
        catch (err) {
            // Fall back to console if file logging fails
            console.error('Failed to write to log file:', err);
            console.error('Log entry:', entry);
            this.config.logToFile = false; // Disable further file logging attempts if an error occurs
        }
    }
    /**
     * Rotate log files when current file exceeds max size
     */
    rotateLogFiles() {
        if (!isNode || !this.config.logToFile || !this.logDir) {
            return;
        }
        try {
            const node_fs = require('fs');
            const node_path = require('path');
            const files = this.getExistingLogFiles(); // getExistingLogFiles will use its own require for fs
            if (files === null)
                return; // Could not get existing files
            // Remove oldest file if we're at max files
            if (files.length >= this.config.maxFiles) {
                files.sort();
                const oldestFile = files[0];
                if (this.logDir) { // Ensure logDir is not null
                    node_fs.unlinkSync(node_path.join(this.logDir, oldestFile));
                }
            }
            // Create new log file
            this.currentLogFile = this.getLogFilePath(); // getLogFilePath will use its own require for path
            this.currentLogSize = 0;
        }
        catch (err) {
            console.error('Failed to rotate log files:', err);
            this.config.logToFile = false; // Disable further file logging attempts
        }
    }
    /**
     * Get a list of existing log files
     */
    getExistingLogFiles() {
        if (!isNode || !this.logDir) {
            return null;
        }
        try {
            const node_fs = require('fs');
            return node_fs.readdirSync(this.logDir)
                .filter((file) => file.startsWith('app-') && file.endsWith('.log'));
        }
        catch (err) {
            console.error('Failed to read log directory:', err);
            this.config.logToFile = false; // Disable file logging
            return null;
        }
    }
    /**
     * Generate the log file path for the current log
     */
    getLogFilePath() {
        if (!isNode || !this.logDir) {
            return null;
        }
        const node_path = require('path');
        const date = new Date();
        const timestamp = date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
        return node_path.join(this.logDir, `app-${timestamp}.log`);
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
// Export a default logger instance
export const logger = Logger.getInstance();
// Export the createLogger function as a named export
export function createLogger(module) {
    const moduleLogger = Logger.getInstance();
    return {
        debug: (message, data) => moduleLogger.debug(`[${module}] ${message}`, data),
        info: (message, data) => moduleLogger.info(`[${module}] ${message}`, data),
        warn: (message, data) => moduleLogger.warn(`[${module}] ${message}`, data),
        error: (message, error, additionalData) => moduleLogger.error(`[${module}] ${message}`, error, additionalData),
        fatal: (message, error, additionalData) => moduleLogger.fatal(`[${module}] ${message}`, error, additionalData),
    };
}
