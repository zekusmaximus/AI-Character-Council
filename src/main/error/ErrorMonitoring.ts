import pkg from 'electron';
const { app } = pkg;
import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from '../../shared/utils/logger.js';
import { AppError } from '../../shared/utils/errors/AppError.js';

const logger = createLogger('ErrorMonitoring');

interface ErrorRecord {
  id: string;
  timestamp: string;
  name: string;
  message: string;
  code: string;
  stack?: string;
  count: number;
  lastOccurrence: string;
  isOperational: boolean;
  context?: Record<string, any>;
}

/**
 * Service for monitoring application errors
 */
export class ErrorMonitoring {
  private static instance: ErrorMonitoring;
  private errorRecords: Map<string, ErrorRecord> = new Map();
  private errorLogPath: string;
  private maxErrors: number = 100;
  
  private constructor() {
    // Set up error log file
    const userDataPath = app?.getPath('userData') || '';
    this.errorLogPath = path.join(userDataPath, 'error-history.json');
    
    // Load existing error records
    this.loadErrorRecords();
    
    logger.info('Error monitoring service initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): ErrorMonitoring {
    if (!ErrorMonitoring.instance) {
      ErrorMonitoring.instance = new ErrorMonitoring();
    }
    return ErrorMonitoring.instance;
  }
  
  /**
   * Record an error
   */
  public recordError(error: Error | AppError): string {
    const timestamp = new Date().toISOString();
    const isAppError = error instanceof AppError;
    
    // Generate error ID based on name, message, and stack
    const errorKey = this.generateErrorKey(error);
    
    // Check if we've seen this error before
    if (this.errorRecords.has(errorKey)) {
      // Update existing record
      const record = this.errorRecords.get(errorKey)!;
      record.count += 1;
      record.lastOccurrence = timestamp;
      
      // Update context if new error has more information
      if (isAppError && error.context && Object.keys(error.context).length > 0) {
        record.context = { ...record.context, ...error.context };
      }
      
      this.errorRecords.set(errorKey, record);
      this.saveErrorRecords();
      
      return record.id;
    }
    
    // Create new error record
    const id = this.generateUniqueId();
    const newRecord: ErrorRecord = {
      id,
      timestamp,
      name: error.name,
      message: error.message,
      code: isAppError ? error.code : 'UNKNOWN_ERROR',
      stack: error.stack,
      count: 1,
      lastOccurrence: timestamp,
      isOperational: isAppError ? error.isOperational : false,
      context: isAppError ? error.context : undefined
    };
    
    // Add to records
    this.errorRecords.set(errorKey, newRecord);
    
    // Trim records if needed
    this.trimErrorRecords();
    
    // Save to disk
    this.saveErrorRecords();
    
    return id;
  }
  
  /**
   * Get all error records
   */
  public getErrorRecords(): ErrorRecord[] {
    return Array.from(this.errorRecords.values())
      .sort((a, b) => new Date(b.lastOccurrence).getTime() - new Date(a.lastOccurrence).getTime());
  }
  
  /**
   * Get error record by ID
   */
  public getErrorById(id: string): ErrorRecord | undefined {
    return this.getErrorRecords().find(record => record.id === id);
  }
  
  /**
   * Clear all error records
   */
  public clearErrorRecords(): void {
    this.errorRecords.clear();
    this.saveErrorRecords();
  }
  
  /**
   * Generate a somewhat unique key for an error
   */
  private generateErrorKey(error: Error): string {
    // Generate a key based on error properties to identify similar errors
    const namePart = error.name || 'Error';
    const messagePart = error.message || '';
    
    // Extract first line of stack trace if available
    let stackLine = '';
    if (error.stack) {
      const stackLines = error.stack.split('\n');
      if (stackLines.length > 1) {
        stackLine = stackLines[1].trim();
      }
    }
    
    return `${namePart}:${messagePart}:${stackLine}`;
  }
  
  /**
   * Generate a unique ID
   */
  private generateUniqueId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
  
  /**
   * Trim error records to stay under the maximum
   */
  private trimErrorRecords(): void {
    if (this.errorRecords.size <= this.maxErrors) {
      return;
    }
    
    // Get records sorted by last occurrence (oldest first)
    const records = this.getErrorRecords().reverse();
    
    // Remove oldest records
    const recordsToKeep = records.slice(0, this.maxErrors);
    this.errorRecords.clear();
    
    // Rebuild map with records to keep
    for (const record of recordsToKeep) {
      const key = `${record.name}:${record.message}`;
      this.errorRecords.set(key, record);
    }
  }
  
  /**
   * Load error records from disk
   */
  private loadErrorRecords(): void {
    try {
      if (!fs.existsSync(this.errorLogPath)) {
        return;
      }
      
      const data = fs.readFileSync(this.errorLogPath, 'utf-8');
      const records: ErrorRecord[] = JSON.parse(data);
      
      this.errorRecords = new Map();
      for (const record of records) {
        const key = this.generateErrorKey(new Error(record.message));
        this.errorRecords.set(key, record);
      }
      
      logger.info(`Loaded ${records.length} error records from disk`);
    } catch (error) {
      logger.error('Failed to load error records from disk', error);
      this.errorRecords = new Map();
    }
  }
  
  /**
   * Save error records to disk
   */
  private saveErrorRecords(): void {
    try {
      const records = this.getErrorRecords();
      fs.writeFileSync(this.errorLogPath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (error) {
      logger.error('Failed to save error records to disk', error);
    }
  }
}