/**
 * Input Validation Utilities for API Endpoints
 * 
 * Provides reusable validation functions with clear error messages and
 * consistent error handling across all shipping API endpoints.
 * 
 * All validation functions throw ValidationException on failure, which
 * can be caught and converted to appropriate HTTP error responses.
 * 
 * @module validation
 */

export interface ValidationError {
    field: string;
    message: string;
}

export class ValidationException extends Error {
    public errors: ValidationError[];

    constructor(errors: ValidationError[]) {
        super('Validation failed');
        this.name = 'ValidationException';
        this.errors = errors;
    }
}

/**
 * Validate that a string is a valid UUID v4
 * @param value - String to validate
 * @param fieldName - Name of the field for error messages
 * @returns true if valid
 * @throws ValidationException if invalid
 */
export function validateUUID(value: string, fieldName: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!value) {
        throw new ValidationException([{
            field: fieldName,
            message: `${fieldName} is required`
        }]);
    }

    if (!uuidRegex.test(value)) {
        throw new ValidationException([{
            field: fieldName,
            message: `${fieldName} must be a valid UUID`
        }]);
    }

    return true;
}

/**
 * Validate delivery speed parameter
 * @param value - Delivery speed value
 * @returns true if valid
 * @throws ValidationException if invalid
 */
export function validateDeliverySpeed(value: string): boolean {
    const validSpeeds = ['standard', 'express'];

    if (!value) {
        throw new ValidationException([{
            field: 'deliverySpeed',
            message: 'deliverySpeed is required'
        }]);
    }

    if (!validSpeeds.includes(value)) {
        throw new ValidationException([{
            field: 'deliverySpeed',
            message: `deliverySpeed must be one of: ${validSpeeds.join(', ')}`
        }]);
    }

    return true;
}

/**
 * Validate required parameters exist
 * @param params - Object with parameter names and values
 * @throws ValidationException if any required parameter is missing
 */
export function validateRequired(params: Record<string, unknown>): boolean {
    const errors: ValidationError[] = [];

    for (const [field, value] of Object.entries(params)) {
        if (value === null || value === undefined || value === '') {
            errors.push({
                field,
                message: `${field} is required`
            });
        }
    }

    if (errors.length > 0) {
        throw new ValidationException(errors);
    }

    return true;
}

/**
 * Validate that coordinates (latitude/longitude) are within valid geographic ranges
 * @param latitude - Latitude value to validate
 * @param longitude - Longitude value to validate
 * @param fieldPrefix - Optional prefix for field names in error messages
 * @returns true if valid
 * @throws ValidationException if coordinates are invalid
 * 
 * @example
 * validateCoordinates(28.6139, 77.2090); // Valid Delhi coordinates
 * validateCoordinates(95, 200); // Throws ValidationException
 */
export function validateCoordinates(
    latitude: number,
    longitude: number,
    fieldPrefix = ''
): boolean {
    const errors: ValidationError[] = [];

    // Validate latitude is a number and within range [-90, 90]
    if (typeof latitude !== 'number' || isNaN(latitude)) {
        errors.push({
            field: fieldPrefix + 'latitude',
            message: `${fieldPrefix}latitude must be a valid number`
        });
    } else if (latitude < -90 || latitude > 90) {
        errors.push({
            field: fieldPrefix + 'latitude',
            message: `${fieldPrefix}latitude must be between -90 and 90 degrees`
        });
    }

    // Validate longitude is a number and within range [-180, 180]
    if (typeof longitude !== 'number' || isNaN(longitude)) {
        errors.push({
            field: fieldPrefix + 'longitude',
            message: `${fieldPrefix}longitude must be a valid number`
        });
    } else if (longitude < -180 || longitude > 180) {
        errors.push({
            field: fieldPrefix + 'longitude',
            message: `${fieldPrefix}longitude must be between -180 and 180 degrees`
        });
    }

    if (errors.length > 0) {
        throw new ValidationException(errors);
    }

    return true;
}

/**
 * Validate that a number is positive (greater than 0)
 * Used for validating weights, prices, and dimensions
 * @param value - Number to validate
 * @param fieldName - Field name for error messages
 * @returns true if valid
 * @throws ValidationException if not positive
 * 
 * @example
 * validatePositiveNumber(10.5, 'weight_kg'); // Valid
 * validatePositiveNumber(-5, 'price'); // Throws ValidationException
 * validatePositiveNumber(0, 'quantity'); // Throws ValidationException
 */
export function validatePositiveNumber(
    value: number,
    fieldName: string
): boolean {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new ValidationException([{
            field: fieldName,
            message: `${fieldName} must be a valid number`
        }]);
    }

    if (value <= 0) {
        throw new ValidationException([{
            field: fieldName,
            message: `${fieldName} must be greater than 0`
        }]);
    }

    return true;
}

/**
 * Validate numeric value is within range
 * @param value - Number to validate
 * @param fieldName - Field name for error messages
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns true if valid
 * @throws ValidationException if out of range
 */
export function validateRange(
    value: number,
    fieldName: string,
    min: number,
    max: number
): boolean {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new ValidationException([{
            field: fieldName,
            message: `${fieldName} must be a valid number`
        }]);
    }

    if (value < min || value > max) {
        throw new ValidationException([{
            field: fieldName,
            message: `${fieldName} must be between ${min} and ${max}`
        }]);
    }

    return true;
}

/**
 * Create a validation error response
 * @param error - Validation exception or generic error
 * @returns Response object with error details
 */
export function createValidationErrorResponse(error: unknown): {
    error: string;
    details?: ValidationError[];
    message?: string;
} {
    if (error instanceof ValidationException) {
        return {
            error: 'Validation failed',
            details: error.errors
        };
    }

    if (error instanceof Error) {
        return {
            error: 'Invalid request',
            message: error.message
        };
    }

    return {
        error: 'Invalid request',
        message: 'Unknown validation error'
    };
}
