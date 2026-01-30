/**
 * Distance calculation utilities using the Haversine formula
 * This module provides a single source of truth for distance calculations
 * across all edge functions.
 */

/**
 * Calculate the great-circle distance between two points on Earth
 * using the Haversine formula.
 * 
 * @param lat1 - Latitude of the first point in degrees
 * @param lon1 - Longitude of the first point in degrees
 * @param lat2 - Latitude of the second point in degrees
 * @param lon2 - Longitude of the second point in degrees
 * @returns Distance in kilometers
 * 
 * @example
 * const distance = calculateDistance(28.6139, 77.2090, 19.0760, 72.8777); // Delhi to Mumbai
 * console.log(distance); // ~1155 km
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    // Validate input coordinates
    if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
        throw new Error('Invalid coordinates provided');
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Validate that coordinates are within valid ranges
 * @param lat - Latitude (-90 to 90)
 * @param lon - Longitude (-180 to 180)
 * @returns true if valid, false otherwise
 */
function isValidCoordinate(lat: number, lon: number): boolean {
    return (
        typeof lat === 'number' &&
        typeof lon === 'number' &&
        !isNaN(lat) &&
        !isNaN(lon) &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180
    );
}

/**
 * Calculate distance and return formatted result
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @param precision - Number of decimal places (default: 2)
 * @returns Distance rounded to specified precision
 */
export function calculateDistanceRounded(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    precision: number = 2
): number {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    return Math.round(distance * Math.pow(10, precision)) / Math.pow(10, precision);
}
