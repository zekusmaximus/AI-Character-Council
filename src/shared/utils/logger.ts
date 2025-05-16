import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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
  private logDir: string;
  private currentLogFile: string;
  private currentLogSize: number = 0;
  
  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Set up log directory
    if (this.config.logDirectory) {
      this.logDir = this.config.logDirectory;
    } else {
      const userDataPath = app?.getPath('userData') || path.join(os.homedir(), '.ai-character-council');
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
      version: app?.getVersion() || 'unknown',
    });
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
    
    // Log to file if enabled
    if (this.config.logToFile) {
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
  private logToFile(entry: string): void {
    try {
      // Check if file needs rotation
      if (this.currentLogSize + entry.length > this.config.maxFileSize) {
        this.rotateLogFiles();
      }
      
      // Append to log file
      fs.appendFileSync(this.currentLogFile, entry);
      this.currentLogSize += entry.length;
    } catch (err) {
      // Fall back to console if file logging fails
      console.error('Failed to write to log file:', err);
      console.error('Log entry:', entry);
    }
  }
  
  /**
   * Rotate log files when current file exceeds max size
   */
  private rotateLogFiles(): void {
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
    } catch (err) {
      console.error('Failed to rotate log files:', err);
    }
  }
  
  /**
   * Get a list of existing log files
   */
  private getExistingLogFiles(): string[] {
    return fs.readdirSync(this.logDir)
      .filter(file => file.startsWith('app-') && file.endsWith('.log'));
  }
  
  /**
   * Generate the log file path for the current log
   */
  private getLogFilePath(): string {
    const date = new Date();
    const timestamp = date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    return path.join(this.logDir, `app-${timestamp}.log`);
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