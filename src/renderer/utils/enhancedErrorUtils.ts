// src/renderer/utils/enhancedErrorUtils.ts

import { createLogger } from '../../shared/utils/logger';
import { getFriendlyLlmErrorMessage } from '../../shared/api/apiErrorHandler';

const logger = createLogger('EnhancedErrorUtils');

/**
 * Get a user-friendly error message from different error types
 * with improved validation error handling
 */
export function getFriendlyErrorMessage(error: Error | any): string {
  // Handle validation errors
  if (isValidationError(error)) {
    return getValidationErrorSummary(error);
  }
  
  // If it's an LLM API error, use specialized friendly message
  if (error?.code === 'LLM_API_ERROR' || error?.name === 'LlmApiError') {
    return getFriendlyLlmErrorMessage(error);
  }
  
  // Database errors
  if (error?.code?.startsWith('DB_')) {
    switch (error.code) {
      case 'DB_CONN_ERROR':
        return 'Unable to connect to the database. Please restart the application.';
      case 'DB_ERROR_P2025':
        return 'The requested item was not found in the database.';
      case 'DB_ERROR_P2002':
        return 'An item with the same name already exists.';
      default:
        return `A database error occurred: ${error.message || 'Please try again later.'}`;
    }
  }
  
  // File system errors
  if (error?.code === 'FILESYSTEM_ERROR') {
    return `File operation failed: ${error.message}`;
  }
  
  // Network errors
  if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return 'Network connection error. Please check your internet connection.';
  }
  
  // Authentication errors
  if (error?.code === 'UNAUTHORIZED' || error?.message?.includes('authentication') || error?.message?.includes('auth')) {
    return 'Authentication failed. Please check your API keys in settings.';
  }
  
  // Not found errors
  if (error?.code === 'NOT_FOUND') {
    return `The requested ${error.context?.entityType || 'item'} was not found.`;
  }
  
  // Configuration errors
  if (error?.code === 'CONFIGURATION_ERROR') {
    return `Configuration error: ${error.message}`;
  }
  
  // Fallback to original message
  return error?.message || 'An unexpected error occurred';
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: any): boolean {
  return (
    error?.name === 'ValidationError' ||
    error?.code === 'VALIDATION_ERROR' ||
    Boolean(error?.validationErrors) ||
    Boolean(error?.fieldErrors) ||
    Boolean(error?.context?.validationErrors)
  );
}

/**
 * Get a summary message for validation errors
 */
export function getValidationErrorSummary(error: any): string {
  // Extract validation errors
  const validationErrors = getValidationErrors(error);
  
  if (!validationErrors || Object.keys(validationErrors).length === 0) {
    return 'Validation failed. Please check your input.';
  }
  
  // Get the first few error messages
  const errorMessages = Object.values(validationErrors);
  const firstErrors = errorMessages.slice(0, 2);
  
  if (errorMessages.length > 2) {
    return `${firstErrors.join(', ')} and ${errorMessages.length - 2} more validation ${errorMessages.length === 3 ? 'error' : 'errors'}.`;
  }
  
  return firstErrors.join(', ');
}

/**
 * Extract validation errors from any error object
 */
export function getValidationErrors(error: any): Record<string, string> | null {
  // Handle Zod validation errors format
  if (error?.name === 'ValidationError' || error?.code === 'VALIDATION_ERROR') {
    return error.validationErrors || error.errors || error.context?.validationErrors || {};
  }
  
  // Handle generic validation errors format
  if (error?.validationErrors) {
    return error.validationErrors;
  }
  
  // Handle specific field error format
  if (error?.fieldErrors) {
    return error.fieldErrors;
  }
  
  // If the error has a known structure with nested validation details
  if (error?.context?.errors) {
    return error.context.errors;
  }
  
  // If the error.context contains validation details
  if (error?.context?.validationErrors) {
    return error.context.validationErrors;
  }
  
  return null;
}

/**
 * Extract error details for display
 */
export function getErrorDetails(error: Error | any): Record<string, any> {
  const details: Record<string, any> = {};
  
  // Add error name and code
  details.name = error?.name || 'Error';
  if (error?.code) {
    details.code = error.code;
  }
  
  // Add validation errors if present
  const validationErrors = getValidationErrors(error);
  if (validationErrors) {
    details.validationErrors = validationErrors;
  }
  
  // Add context if available
  if (error?.context && Object.keys(error.context).length > 0) {
    details.context = error.context;
  }
  
  // Add API details if available
  if (error?.apiError) {
    details.api = error.apiError;
  }
  
  // Add stack trace if available
  if (error?.stack) {
    details.stack = error.stack.split('\n');
  }
  
  return details;
}

/**
 * Format error details for display
 */
export function formatErrorDetails(details: Record<string, any>): string {
  try {
    return JSON.stringify(details, null, 2);
  } catch (e) {
    return `Unable to format error details: ${e instanceof Error ? e.message : String(e)}`;
  }
}