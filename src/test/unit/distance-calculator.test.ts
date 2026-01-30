/**
 * Unit tests for distance calculation utility
 */

import { describe, it, expect } from 'vitest';
import { calculateDistance, calculateDistanceRounded } from '../../lib/distance-calculator';

describe('Distance Calculator', () => {
    describe('calculateDistance', () => {
        it('should calculate distance between Mumbai and Delhi correctly', () => {
            // Mumbai coordinates
            const mumbaiLat = 19.0760;
            const mumbaiLng = 72.8777;

            // Delhi coordinates
            const delhiLat = 28.6139;
            const delhiLng = 77.2090;

            const distance = calculateDistance(mumbaiLat, mumbaiLng, delhiLat, delhiLng);

            // Distance should be approximately 1155 km (with some tolerance)
            expect(distance).toBeGreaterThan(1100);
            expect(distance).toBeLessThan(1200);
        });

        it('should return 0 for same location', () => {
            const lat = 12.9716;
            const lng = 77.5946;

            const distance = calculateDistance(lat, lng, lat, lng);
            expect(distance).toBe(0);
        });

        it('should calculate short distances accurately', () => {
            // Two points approximately 50km apart
            const point1Lat = 12.9716;
            const point1Lng = 77.5946;
            const point2Lat = 13.3499;
            const point2Lng = 77.0993;

            const distance = calculateDistance(point1Lat, point1Lng, point2Lat, point2Lng);

            // Should be around 50-60 km
            expect(distance).toBeGreaterThan(45);
            expect(distance).toBeLessThan(65);
        });

        it('should calculate long distances accurately', () => {
            // Mumbai to Kolkata (approximately 2000 km)
            const mumbaiLat = 19.0760;
            const mumbaiLng = 72.8777;
            const kolkataLat = 22.5726;
            const kolkataLng = 88.3639;

            const distance = calculateDistance(mumbaiLat, mumbaiLng, kolkataLat, kolkataLng);

            expect(distance).toBeGreaterThan(1900);
            expect(distance).toBeLessThan(2100);
        });

        it('should handle negative coordinates correctly', () => {
            // London to Sydney (opposite hemispheres)
            const londonLat = 51.5074;
            const londonLng = -0.1278;
            const sydneyLat = -33.8688;
            const sydneyLng = 151.2093;

            const distance = calculateDistance(londonLat, londonLng, sydneyLat, sydneyLng);

            // Should be around 17,000 km
            expect(distance).toBeGreaterThan(16000);
            expect(distance).toBeLessThan(18000);
        });

        it('should throw error for invalid latitude', () => {
            expect(() => {
                calculateDistance(100, 77.5946, 12.9716, 77.5946);
            }).toThrow('Invalid coordinates');
        });

        it('should throw error for invalid longitude', () => {
            expect(() => {
                calculateDistance(12.9716, 200, 12.9716, 77.5946);
            }).toThrow('Invalid coordinates');
        });

        it('should throw error for NaN coordinates', () => {
            expect(() => {
                calculateDistance(NaN, 77.5946, 12.9716, 77.5946);
            }).toThrow('Invalid coordinates');
        });
    });

    describe('calculateDistanceRounded', () => {
        it('should round to 2 decimal places by default', () => {
            const distance = calculateDistanceRounded(19.0760, 72.8777, 28.6139, 77.2090);

            // Check that it has at most 2 decimal places
            const decimalPlaces = (distance.toString().split('.')[1] || '').length;
            expect(decimalPlaces).toBeLessThanOrEqual(2);
        });

        it('should respect custom precision', () => {
            const distance = calculateDistanceRounded(19.0760, 72.8777, 28.6139, 77.2090, 1);

            const decimalPlaces = (distance.toString().split('.')[1] || '').length;
            expect(decimalPlaces).toBeLessThanOrEqual(1);
        });

        it('should handle zero precision', () => {
            const distance = calculateDistanceRounded(19.0760, 72.8777, 28.6139, 77.2090, 0);

            expect(Number.isInteger(distance)).toBe(true);
        });
    });
});
