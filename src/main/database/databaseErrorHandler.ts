const {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError
} = require('@prisma/client/runtime/library');
const { DatabaseError, NotFoundError, ValidationError } = require('../../shared/utils/errors/AppError');
const { createLogger } = require('../../shared/utils/logger');

const logger = createLogger('DatabaseErrorHandler');

/**
 * Handle and standardize Prisma database errors
 */
function handleDatabaseError(
  error: any,
  options: {
    operation?: string;
    table?: string;
    data?: any;
    id?: string | number;
  } = {}
): never {
  const { operation = 'database operation', table, data, id } = options;
  
  // Handle specific Prisma error types
  if (error instanceof PrismaClientKnownRequestError) {
    // Handle not found errors (P2025)
    if (error.code === 'P2025') {
      const entity = table || 'Record';
      const identifier = id || 'specified ID';
      throw new NotFoundError(entity, String(identifier), { cause: error });
    }
    
    // Handle unique constraint violations (P2002)
    if (error.code === 'P2002') {
      const fields = error.meta?.target as string[] || ['field'];
      const fieldStr = fields.join(', ');
      
      throw new ValidationError(
        `A record with the same ${fieldStr} already exists`,
        { [fields[0]]: 'Value must be unique' },
        {
          cause: error,
          context: {
            code: error.code,
            fields,
            data: sanitizeData(data)
          }
        }
      );
    }
    
    // Handle foreign key constraint failures (P2003)
    if (error.code === 'P2003') {
      const field = error.meta?.field_name as string || 'field';
      
      throw new ValidationError(
        `Invalid reference in ${field}`,
        { [field]: 'Invalid reference' },
        {
          cause: error,
          context: {
            code: error.code,
            field,
            data: sanitizeData(data)
          }
        }
      );
    }
    
    // Handle required field violations (P2012)
    if (error.code === 'P2012') {
      const field = error.meta?.path as string || 'unknown field';
      
      throw new ValidationError(
        `Missing required field: ${field}`,
        { [field]: 'This field is required' },
        {
          cause: error,
          context: {
            code: error.code,
            field,
            data: sanitizeData(data)
          }
        }
      );
    }
    
    // For other known request errors
    logger.error(`Database error (${error.code}) during ${operation}`, error, {
      table,
      data: sanitizeData(data),
      meta: error.meta
    });
    
    throw new DatabaseError(
      `Database error during ${operation}: ${error.message}`,
      `DB_ERROR_${error.code}`,
      {
        cause: error,
        operation,
        table,
        context: {
          code: error.code,
          meta: error.meta,
          data: sanitizeData(data)
        }
      }
    );
  }
  
  if (error instanceof PrismaClientValidationError) {
    logger.error(`Validation error during ${operation}`, error, {
      table,
      data: sanitizeData(data)
    });
    
    throw new ValidationError(
      `Validation error during ${operation}: ${error.message}`,
      ['Invalid data format'],
      {
        cause: error,
        context: {
          operation,
          table,
          data: sanitizeData(data)
        }
      }
    );
  }
  
  // Handle initialization errors
  if (error instanceof PrismaClientInitializationError) {
    logger.error('Database initialization error', error);
    
    throw new DatabaseError(
      `Database initialization error: ${error.message}`,
      'DB_INIT_ERROR',
      {
        cause: error,
        context: {
          errorCode: error.errorCode,
          clientVersion: error.clientVersion
        },
        isOperational: false // Initialization errors are usually not operational
      }
    );
  }
  
  // Handle general Prisma errors
  if (error instanceof PrismaClientRustPanicError) {
    logger.error('Critical database error (Rust panic)', error);
    
    throw new DatabaseError(
      'A critical database error occurred',
      'DB_CRITICAL_ERROR',
      {
        cause: error,
        isOperational: false // Rust panics are never operational
      }
    );
  }
  
  // For unknown errors, just wrap them
  logger.error(`Unknown database error during ${operation}`, error, {
    table,
    data: sanitizeData(data)
  });
  
  throw new DatabaseError(
    `An unexpected database error occurred during ${operation}`,
    'DB_UNKNOWN_ERROR',
    {
      cause: error,
      operation,
      table,
      context: {
        data: sanitizeData(data)
      },
      isOperational: false // Unknown errors are assumed to be non-operational
    }
  );
}
exports.handleDatabaseError = handleDatabaseError;

/**
 * Higher-order function to wrap database operations with error handling
 */
function withDatabaseErrorHandling<T>(
  fn: () => Promise<T>,
  options: {
    operation?: string;
    table?: string;
    data?: any;
    id?: string | number;
  } = {}
): Promise<T> {
  return fn().catch(error => {
    handleDatabaseError(error, options);
    // The above function always throws, this is just to satisfy TypeScript
    throw error;
  });
}
exports.withDatabaseErrorHandling = withDatabaseErrorHandling;

/**
 * Sanitize potentially sensitive data for logging
 */
function sanitizeData(data: any): any {
  if (!data) return data;
  
  const sensitiveFields = ['password', 'apiKey', 'token', 'secret', 'credentials'];
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}