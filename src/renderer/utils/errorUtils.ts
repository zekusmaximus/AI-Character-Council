import { getFriendlyLlmErrorMessage } from '../../shared/api/apiErrorHandler';

/**
 * Get a user-friendly error message from different error types
 */
export function getErrorMessage(error: any): string {
  // Use the LLM error handler for API-related errors
  if (error?.isApiError) {
    return getFriendlyLlmErrorMessage(error);
  }
  
  // Handle other types of errors
  if (error instanceof Error) {
    return error.message;
  }
  
  // For unknown error types
  return String(error || 'An unknown error occurred');
}
