import electronPkg from 'electron';
const { app: electronApp } = electronPkg;

// Environment detection
const isNode = typeof window === 'undefined' && typeof process !== 'undefined' && process.versions && process.versions.node;

// Conditionally define and import Node.js specific modules
let app: typeof electronPkg.app | undefined;
let node_os: any;
let node_path: any;
let node_fs: any;

// Conditionally define and import Node.js specific modules
if (isNode) {
  // These variables will only be defined in a Node.js environment
  let _node_os: typeof import('os');
  let _node_path: typeof import('path');
  let _node_fs: typeof import('fs');

  // This function will only be defined and used in a Node.js environment
  const ensureNodeModules = async () => {
    if (!_node_os) _node_os = await import('os');
    if (!_node_path) _node_path = await import('path');
    if (!_node_fs) _node_fs = await import('fs');
    // Assign to outer scope variables for use in the class 
    node_os = _node_os;
    node_path = _node_path;
    node_fs = _node_fs;
  };

  // Make ensureNodeModules available to the class instance methods that need it
  // We'll call this within the constructor and other methods if needed
  (globalThis as any).__ensureNodeModules = ensureNodeModules;

  try {
    app = electronApp;
  } catch (e) {
    console.warn("Running in Node.js environment but 'electron' module is not available. File logging features might be limited.");
    app = undefined;
  }
}

// Define log levels with numeric values for comparison
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Configuration object for the logger
export interface LoggerConfig {
  minLevel: LogLevel;
  logToConsole: boolean;
  logToFile: boolean;
  maxFileSize: number; // in bytes
  maxFiles: number;
  logDirectory?: string;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  logToConsole: true,
  logToFile: true,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 5,
};

export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logDir: string | null = null;
  private currentLogFile: string | null = null;
  private currentLogSize: number = 0;
  
  private constructor(config: Partial<LoggerConfig> = {}) {
    // Assign config first
    this.config = { ...DEFAULT_CONFIG, ...config };

    // All code using this.config is after assignment
    if (isNode && this.config.logToFile) {
      // Use a helper function to avoid referencing this.config before assignment
      this.setupFileLogging();
    } else {
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
  
  private async setupFileLogging() {
    if (isNode && (globalThis as any).__ensureNodeModules) {
      await (globalThis as any).__ensureNodeModules();
    }
    // Set up log directory
    if (this.config.logDirectory) {
      this.logDir = this.config.logDirectory;
    } else {
      const userDataPath = app?.getPath('userData') || node_path.join(node_os.homedir(), '.ai-character-council');
      this.logDir = node_path.join(userDataPath, 'logs');
    }
    // Ensure log directory exists
    if (this.logDir && !node_fs.existsSync(this.logDir)) {
      node_fs.mkdirSync(this.logDir, { recursive: true });
    }
    this.currentLogFile = this.getLogFilePath();
    // Check if file exists and get its size
    if (this.currentLogFile && node_fs.existsSync(this.currentLogFile)) {
      const stats = node_fs.statSync(this.currentLogFile);
      this.currentLogSize = stats.size;
    }
  }
  
  /**
   * Get the singleton logger instance
   */
  public static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }
  
  /**
   * Reconfigure the logger
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.info('Logger reconfigured', { newConfig: this.config });
  }
  
  /**
   * Log a debug message
   */
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  /**
   * Log an info message
   */
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }
  
  /**
   * Log a warning message
   */
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }
  
  /**
   * Log an error message
   */
  public error(message: string, error?: Error | any, additionalData?: any): void {
    const errorData = this.formatError(error);
    this.log(LogLevel.ERROR, message, { ...errorData, ...additionalData });
  }
  
  /**
   * Log a fatal error message
   */
  public fatal(message: string, error?: Error | any, additionalData?: any): void {
    const errorData = this.formatError(error);
    this.log(LogLevel.FATAL, message, { ...errorData, ...additionalData });
  }
  
  /**
   * Internal method to log a message with the specified level
   */
  private log(level: LogLevel, message: string, data?: any): void {
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
  private logToConsole(level: LogLevel, message: string): void {
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
  private async logToFile(entry: string): Promise<void> {
    if (!isNode || !this.config.logToFile || !this.currentLogFile || !this.logDir) {
      return; // Skip file logging if not in Node, disabled, or paths not set
    }
    try {
      if (isNode && (globalThis as any).__ensureNodeModules) {
        await (globalThis as any).__ensureNodeModules();
      }
      // Check if file needs rotation
      if (this.currentLogSize + entry.length > this.config.maxFileSize) {
        await this.rotateLogFiles();
      }
      // Append to log file
      if (this.currentLogFile) {
        node_fs.appendFileSync(this.currentLogFile, entry);
        this.currentLogSize += entry.length;
      }
    } catch (err) {
      // Fall back to console if file logging fails
      console.error('Failed to write to log file:', err);
      console.error('Log entry:', entry);
      this.config.logToFile = false; // Disable further file logging attempts if an error occurs
    }
  }
  
  /**
   * Rotate log files when current file exceeds max size
   */
  private async rotateLogFiles(): Promise<void> {
    if (!isNode || !this.config.logToFile || !this.logDir) {
      return;
    }
    try {
      if (isNode && (globalThis as any).__ensureNodeModules) {
        await (globalThis as any).__ensureNodeModules();
      }
      const files = this.getExistingLogFiles();
      if (files === null) return;
      if (files.length >= this.config.maxFiles) {
        files.sort();
        const oldestFile = files[0];
        if (this.logDir) {
          node_fs.unlinkSync(node_path.join(this.logDir, oldestFile));
        }
      }
      this.currentLogFile = this.getLogFilePath();
      this.currentLogSize = 0;
    } catch (err) {
      console.error('Failed to rotate log files:', err);
      this.config.logToFile = false;
    }
  }
  
  /**
   * Get a list of existing log files
   */
  private getExistingLogFiles(): string[] | null {
    if (!isNode || !this.logDir) {
      return null;
    }
    try {
      if (!node_fs) return null;
      return node_fs.readdirSync(this.logDir)
        .filter((file: string) => file.startsWith('app-') && file.endsWith('.log'));
    } catch (err) {
      console.error('Failed to read log directory:', err);
      this.config.logToFile = false;
      return null;
    }
  }
  
  /**
   * Generate the log file path for the current log
   */
  private getLogFilePath(): string | null {
    if (!isNode || !this.logDir) {
      return null;
    }
    if (!node_path) return null;
    const date = new Date();
    const timestamp = date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    return node_path.join(this.logDir, `app-${timestamp}.log`);
  }
  
  /**
   * Format an error object for logging
   */
  private formatError(error: Error | any): any {
    if (!error) return {};
    
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (typeof error === 'object') {
      return error;
    } else {
      return { rawError: String(error) };
    }
  }
}

// Export a default logger instance
export const logger = Logger.getInstance();

// Export the createLogger function as a named export
export function createLogger(module: string): {
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, error?: any, additionalData?: any) => void;
  fatal: (message: string, error?: any, additionalData?: any) => void;
} {
  const moduleLogger = Logger.getInstance();
  
  return {
    debug: (message: string, data?: any) => moduleLogger.debug(`[${module}] ${message}`, data),
    info: (message: string, data?: any) => moduleLogger.info(`[${module}] ${message}`, data),
    warn: (message: string, data?: any) => moduleLogger.warn(`[${module}] ${message}`, data),
    error: (message: string, error?: any, additionalData?: any) => 
      moduleLogger.error(`[${module}] ${message}`, error, additionalData),
    fatal: (message: string, error?: any, additionalData?: any) => 
      moduleLogger.fatal(`[${module}] ${message}`, error, additionalData),
  };
}