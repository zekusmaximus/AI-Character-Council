import { getFriendlyLlmErrorMessage } from '../../shared/api/apiErrorHandler';

/**
 * Get a user-friendly error message from different error types
 */
export function getFriendlyErrorMessage(error: Error | any): string {
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
        return 'A database error occurred. Please try again later.';
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
  
  // Fallback to original message
  return error?.message || 'An unexpected error occurred';
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