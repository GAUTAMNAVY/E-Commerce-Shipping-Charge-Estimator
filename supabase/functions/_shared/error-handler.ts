/**
 * Centralized Error Handling Utilities
 * Provides custom error classes and structured error response builders
 * for consistent error handling across all API endpoints
 */

/**
 * Base class for all application errors
 * Extends standard Error with HTTP status code and additional context
 */
export class AppError extends Error {
    public statusCode: number;
    public context?: Record<string, unknown>;
    public isOperational: boolean;

    constructor(
        message: string,
        statusCode: number,
        context?: Record<string, unknown>,
        isOperational = true
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.context = context;
        this.isOperational = isOperational;
    }
}

/**
 * Error thrown when no active warehouses are found in the system
 * HTTP Status: 503 Service Unavailable
 */
export class NoWarehousesFoundError extends AppError {
    constructor(context?: Record<string, unknown>) {
        super(
            'No active warehouses found in the system',
            503,
            context
        );
    }
}

/**
 * Error thrown when delivery location coordinates are invalid or unsupported
 * HTTP Status: 422 Unprocessable Entity
 */
export class UnsupportedLocationError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(
            message,
            422,
            context
        );
    }
}

/**
 * Error thrown when database connection or query fails
 * HTTP Status: 503 Service Unavailable
 */
export class DatabaseConnectionError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(
            message,
            503,
            { ...context, category: 'database' },
            false // Non-operational error
        );
    }
}

/**
 * Error thrown when required configuration or environment variables are missing
 * HTTP Status: 500 Internal Server Error
 */
export class ConfigurationError extends AppError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(
            message,
            500,
            { ...context, category: 'configuration' },
            false // Non-operational error
        );
    }
}

/**
 * Error thrown when a requested resource is not found
 * HTTP Status: 404 Not Found
 */
export class ResourceNotFoundError extends AppError {
    constructor(resourceType: string, resourceId: string, context?: Record<string, unknown>) {
        super(
            `${resourceType} not found: ${resourceId}`,
            404,
            { ...context, resourceType, resourceId }
        );
    }
}

/**
 * Error response structure for API responses
 */
export interface ErrorResponse {
    error: string;
    message: string;
    hint?: string;
    details?: unknown;
    requestId?: string;
    timestamp: string;
}

/**
 * Build a structured error response for API endpoints
 * @param error - Error object (can be AppError, Error, or unknown)
 * @param requestId - Optional request ID for tracking
 * @returns Structured error response object
 */
export function buildErrorResponse(
    error: unknown,
    requestId?: string
): { response: ErrorResponse; statusCode: number } {
    const timestamp = new Date().toISOString();

    // Handle custom AppError instances
    if (error instanceof AppError) {
        return {
            response: {
                error: error.name,
                message: error.message,
                hint: getErrorHint(error),
                details: error.context,
                requestId,
                timestamp,
            },
            statusCode: error.statusCode,
        };
    }

    // Handle standard Error instances
    if (error instanceof Error) {
        // Check for specific error patterns in message
        const statusCode = determineStatusCode(error.message);
        return {
            response: {
                error: error.name,
                message: error.message,
                hint: getHintFromMessage(error.message),
                requestId,
                timestamp,
            },
            statusCode,
        };
    }

    // Handle unknown errors
    return {
        response: {
            error: 'UnknownError',
            message: 'An unexpected error occurred',
            hint: 'Please try again later or contact support if the issue persists',
            requestId,
            timestamp,
        },
        statusCode: 500,
    };
}

/**
 * Get helpful hint message based on error type
 * @param error - AppError instance
 * @returns User-friendly hint message
 */
function getErrorHint(error: AppError): string {
    if (error instanceof NoWarehousesFoundError) {
        return 'The system has no active warehouses configured. Please contact the administrator to activate warehouses.';
    }

    if (error instanceof UnsupportedLocationError) {
        return 'Verify that latitude is between -90 and 90, and longitude is between -180 and 180. Ensure the location is within the serviceable area.';
    }

    if (error instanceof DatabaseConnectionError) {
        return 'Database connection issue. Please try again in a few moments. Contact support if the problem persists.';
    }

    if (error instanceof ConfigurationError) {
        return 'System configuration error. Please contact the administrator.';
    }

    if (error instanceof ResourceNotFoundError) {
        return 'Verify that the provided ID exists in the database and is spelled correctly.';
    }

    return 'Please review your request and try again.';
}

/**
 * Determine HTTP status code based on error message patterns
 * @param message - Error message
 * @returns HTTP status code
 */
function determineStatusCode(message: string): number {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('not found')) return 404;
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) return 400;
    if (lowerMessage.includes('unauthorized') || lowerMessage.includes('authentication')) return 401;
    if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission')) return 403;
    if (lowerMessage.includes('database') || lowerMessage.includes('connection')) return 503;

    return 500;
}

/**
 * Get hint message based on error message content
 * @param message - Error message
 * @returns Helpful hint for the user
 */
function getHintFromMessage(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('not found')) {
        return 'Verify that the provided IDs exist in the database';
    }

    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
        return 'Check your request parameters for correct format and values';
    }

    if (lowerMessage.includes('database') || lowerMessage.includes('connection')) {
        return 'Database connection issue. Please try again in a few moments';
    }

    return 'Please try again later or contact support if the issue persists';
}

/**
 * Log error with structured context for debugging
 * @param error - Error object
 * @param context - Additional context information
 */
export function logError(
    error: unknown,
    context?: Record<string, unknown>
): void {
    const timestamp = new Date().toISOString();

    if (error instanceof AppError) {
        console.error('✗', timestamp, `[${error.name}]`, error.message, {
            statusCode: error.statusCode,
            isOperational: error.isOperational,
            context: { ...error.context, ...context },
        });
    } else if (error instanceof Error) {
        console.error('✗', timestamp, `[${error.name}]`, error.message, {
            context,
            stack: error.stack,
        });
    } else {
        console.error('✗', timestamp, '[UnknownError]', error, { context });
    }
}
