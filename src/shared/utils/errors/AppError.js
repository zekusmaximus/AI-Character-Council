"use strict";
/**
 * Custom error types for the AI Character Council application
 *
 * These provide structured error information and consistent handling
 * throughout the application.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationError = exports.FileSystemError = exports.LlmApiError = exports.ApiError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.DatabaseError = exports.AppError = void 0;
/**
 * Base application error class that all other errors extend
 */
class AppError extends Error {
    constructor(message, code = 'INTERNAL_ERROR', options = {}) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.httpStatusCode = options.httpStatusCode;
        this.timestamp = new Date().toISOString();
        this.context = options.context || {};
        // Operational errors are expected errors that we can handle gracefully
        // Non-operational errors are unexpected and may require a restart or other drastic measures
        this.isOperational = options.isOperational !== undefined ? options.isOperational : true;
        // Maintains proper stack trace for where error was thrown (only in V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    /**
     * Safely serialize the error for logging or IPC
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            httpStatusCode: this.httpStatusCode,
            timestamp: this.timestamp,
            context: this.context,
            isOperational: this.isOperational,
            stack: this.stack,
            cause: this.cause instanceof Error ?
                {
                    name: this.cause.name,
                    message: this.cause.message,
                    stack: this.cause.stack
                } : this.cause
        };
    }
}
exports.AppError = AppError;
/**
 * Database-related errors
 */
class DatabaseError extends AppError {
    constructor(message, code = 'DATABASE_ERROR', options = {}) {
        super(message, code, {
            cause: options.cause,
            httpStatusCode: 500,
            context: {
                ...options.context,
                operation: options.operation,
                table: options.table
            },
            isOperational: options.isOperational
        });
    }
}
exports.DatabaseError = DatabaseError;
/**
 * Validation errors for input validation failures
 */
class ValidationError extends AppError {
    constructor(message, validationErrors, options = {}) {
        super(message, 'VALIDATION_ERROR', {
            cause: options.cause,
            httpStatusCode: 400,
            context: {
                ...options.context,
                validationErrors
            },
            isOperational: true
        });
    }
}
exports.ValidationError = ValidationError;
/**
 * Not found errors
 */
class NotFoundError extends AppError {
    constructor(entityType, identifier, options = {}) {
        super(`${entityType} not found with identifier: ${identifier}`, 'NOT_FOUND', {
            cause: options.cause,
            httpStatusCode: 404,
            context: {
                ...options.context,
                entityType,
                identifier
            },
            isOperational: true
        });
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Unauthorized errors
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', options = {}) {
        super(message, 'UNAUTHORIZED', {
            cause: options.cause,
            httpStatusCode: 401,
            context: options.context,
            isOperational: true
        });
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * API errors for external service failures
 */
class ApiError extends AppError {
    constructor(message, options = {}) {
        super(message, 'API_ERROR', {
            cause: options.cause,
            httpStatusCode: 502, // Bad Gateway
            context: {
                ...options.context,
                service: options.service,
                endpoint: options.endpoint,
                statusCode: options.statusCode,
                responseData: options.responseData
            },
            isOperational: options.isOperational !== undefined ? options.isOperational : true
        });
    }
}
exports.ApiError = ApiError;
/**
 * LLM-specific API errors
 */
class LlmApiError extends ApiError {
    constructor(message, options = {}) {
        super(message, {
            cause: options.cause,
            service: options.provider || 'LLM Provider',
            endpoint: options.endpoint,
            statusCode: options.statusCode,
            responseData: options.responseData,
            context: {
                ...options.context,
                model: options.model,
                promptTokens: options.promptTokens,
                completionTokens: options.completionTokens
            },
            isOperational: options.isOperational
        });
        Object.defineProperty(this, 'code', { value: 'LLM_API_ERROR', writable: false, configurable: false });
    }
}
exports.LlmApiError = LlmApiError;
/**
 * File system errors
 */
class FileSystemError extends AppError {
    constructor(message, options = {}) {
        super(message, 'FILESYSTEM_ERROR', {
            cause: options.cause,
            httpStatusCode: 500,
            context: {
                ...options.context,
                operation: options.operation,
                path: options.path
            },
            isOperational: options.isOperational !== undefined ? options.isOperational : true
        });
    }
}
exports.FileSystemError = FileSystemError;
/**
 * Configuration errors
 */
class ConfigurationError extends AppError {
    constructor(message, options = {}) {
        super(message, 'CONFIGURATION_ERROR', {
            cause: options.cause,
            httpStatusCode: 500,
            context: {
                ...options.context,
                configKey: options.configKey
            },
            isOperational: true
        });
    }
}
exports.ConfigurationError = ConfigurationError;
