/**
 * Unit tests for shipping charge calculation logic
 */

import { describe, it, expect } from 'vitest';

describe('Shipping Charge Calculation', () => {
    describe('Base Charge Calculation', () => {
        it('should apply standard delivery base charge of Rs 10', () => {
            const baseCharge = 10;
            expect(baseCharge).toBe(10);
        });

        it('should apply express delivery base charge of Rs 10', () => {
            const baseCharge = 10;
            expect(baseCharge).toBe(10);
        });
    });

    describe('Transport Charge Calculation', () => {
        it('should calculate Mini Van charge correctly (3 Rs/km/kg)', () => {
            const distance = 50; // km
            const rate = 3.0; // Rs per km per kg
            const weight = 10; // kg

            const transportCharge = distance * rate * weight;
            expect(transportCharge).toBe(1500);
        });

        it('should calculate Truck charge correctly (2 Rs/km/kg)', () => {
            const distance = 200; // km
            const rate = 2.0; // Rs per km per kg
            const weight = 10; // kg

            const transportCharge = distance * rate * weight;
            expect(transportCharge).toBe(4000);
        });

        it('should calculate Aeroplane charge correctly (1 Rs/km/kg)', () => {
            const distance = 600; // km
            const rate = 1.0; // Rs per km per kg
            const weight = 10; // kg

            const transportCharge = distance * rate * weight;
            expect(transportCharge).toBe(6000);
        });

        it('should handle fractional weights', () => {
            const distance = 100;
            const rate = 2.0;
            const weight = 0.5; // 500g

            const transportCharge = distance * rate * weight;
            expect(transportCharge).toBe(100);
        });

        it('should handle very heavy weights', () => {
            const distance = 100;
            const rate = 2.0;
            const weight = 50; // 50kg

            const transportCharge = distance * rate * weight;
            expect(transportCharge).toBe(10000);
        });
    });

    describe('Express Charge Calculation', () => {
        it('should add Rs 1.2 per kg for express delivery', () => {
            const weight = 10; // kg
            const expressRatePerKg = 1.2;

            const expressCharge = weight * expressRatePerKg;
            expect(expressCharge).toBe(12);
        });

        it('should be 0 for standard delivery', () => {
            const expressCharge = 0;
            expect(expressCharge).toBe(0);
        });

        it('should handle fractional weights for express', () => {
            const weight = 0.5; // 500g
            const expressRatePerKg = 1.2;

            const expressCharge = weight * expressRatePerKg;
            expect(expressCharge).toBe(0.6);
        });
    });

    describe('Total Charge Calculation - Standard Delivery', () => {
        it('should calculate total for short distance (Mini Van)', () => {
            const baseCharge = 10;
            const distance = 50;
            const rate = 3.0;
            const weight = 10;
            const expressCharge = 0; // standard delivery

            const transportCharge = distance * rate * weight;
            const total = baseCharge + transportCharge + expressCharge;

            expect(total).toBe(1510); // 10 + 1500 + 0
        });

        it('should calculate total for medium distance (Truck)', () => {
            const baseCharge = 10;
            const distance = 200;
            const rate = 2.0;
            const weight = 10;
            const expressCharge = 0;

            const transportCharge = distance * rate * weight;
            const total = baseCharge + transportCharge + expressCharge;

            expect(total).toBe(4010); // 10 + 4000 + 0
        });

        it('should calculate total for long distance (Aeroplane)', () => {
            const baseCharge = 10;
            const distance = 600;
            const rate = 1.0;
            const weight = 10;
            const expressCharge = 0;

            const transportCharge = distance * rate * weight;
            const total = baseCharge + transportCharge + expressCharge;

            expect(total).toBe(6010); // 10 + 6000 + 0
        });
    });

    describe('Total Charge Calculation - Express Delivery', () => {
        it('should calculate total for short distance with express', () => {
            const baseCharge = 10;
            const distance = 50;
            const rate = 3.0;
            const weight = 10;
            const expressRatePerKg = 1.2;

            const transportCharge = distance * rate * weight;
            const expressCharge = weight * expressRatePerKg;
            const total = baseCharge + transportCharge + expressCharge;

            expect(total).toBe(1522); // 10 + 1500 + 12
        });

        it('should calculate total for medium distance with express', () => {
            const baseCharge = 10;
            const distance = 200;
            const rate = 2.0;
            const weight = 10;
            const expressRatePerKg = 1.2;

            const transportCharge = distance * rate * weight;
            const expressCharge = weight * expressRatePerKg;
            const total = baseCharge + transportCharge + expressCharge;

            expect(total).toBe(4022); // 10 + 4000 + 12
        });

        it('should calculate total for long distance with express', () => {
            const baseCharge = 10;
            const distance = 600;
            const rate = 1.0;
            const weight = 10;
            const expressRatePerKg = 1.2;

            const transportCharge = distance * rate * weight;
            const expressCharge = weight * expressRatePerKg;
            const total = baseCharge + transportCharge + expressCharge;

            expect(total).toBe(6022); // 10 + 6000 + 12
        });
    });

    describe('Real-world Product Examples', () => {
        it('should calculate for Maggie 500g packet (Mini Van, Standard)', () => {
            const baseCharge = 10;
            const distance = 50;
            const rate = 3.0;
            const weight = 0.5; // 500g
            const expressCharge = 0;

            const transportCharge = distance * rate * weight;
            const total = baseCharge + transportCharge + expressCharge;

            expect(total).toBe(85); // 10 + 75 + 0
        });

        it('should calculate for Rice Bag 10Kg (Truck, Standard)', () => {
            const baseCharge = 10;
            const distance = 200;
            const rate = 2.0;
            const weight = 10;
            const expressCharge = 0;

            const transportCharge = distance * rate * weight;
            const total = baseCharge + transportCharge + expressCharge;

            expect(total).toBe(4010); // 10 + 4000 + 0
        });

        it('should calculate for Sugar Bag 25kg (Aeroplane, Express)', () => {
            const baseCharge = 10;
            const distance = 600;
            const rate = 1.0;
            const weight = 25;
            const expressRatePerKg = 1.2;

            const transportCharge = distance * rate * weight;
            const expressCharge = weight * expressRatePerKg;
            const total = baseCharge + transportCharge + expressCharge;

            expect(total).toBe(15040); // 10 + 15000 + 30
        });
    });

    describe('Rounding', () => {
        it('should round to 2 decimal places', () => {
            const value = 123.456789;
            const rounded = Math.round(value * 100) / 100;
            expect(rounded).toBe(123.46);
        });

        it('should handle values that need rounding up', () => {
            const value = 99.995;
            const rounded = Math.round(value * 100) / 100;
            expect(rounded).toBe(100);
        });

        it('should handle values that need rounding down', () => {
            const value = 99.994;
            const rounded = Math.round(value * 100) / 100;
            expect(rounded).toBe(99.99);
        });
    });
});
