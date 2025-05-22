/**
 * Create a friendly error message for LLM API errors
 */
export function getFriendlyLlmErrorMessage(error) {
    // Check for a status code
    const statusCode = error?.statusCode || error?.context?.statusCode;
    // Provide helpful messages based on common error codes
    switch (statusCode) {
        case 401:
            return 'Authentication failed. Please check your API key in the settings.';
        case 403:
            return 'Access denied. Your API key may not have permission to use this model.';
        case 429:
            return 'Rate limit exceeded. Please try again later or adjust your usage settings.';
        case 500:
            return 'The AI service encountered an internal error. Please try again later.';
        case 503:
            return 'The AI service is temporarily unavailable. Please try again later.';
        default:
            if (error?.message?.includes('timeout') || error?.message?.includes('ECONNREFUSED')) {
                return 'Could not connect to the AI service. Please check your internet connection.';
            }
            if (error?.message?.includes('insufficient_quota')) {
                return 'Your API quota has been exceeded. Please check your billing settings.';
            }
            // Default message
            return 'An error occurred with the AI service. Please try again or check your settings.';
    }
}
