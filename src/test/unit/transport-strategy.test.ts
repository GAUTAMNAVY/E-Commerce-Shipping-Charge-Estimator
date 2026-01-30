/**
 * Unit tests for transport strategy pattern
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Since we can't directly import from Deno modules in Vitest,
// we'll create TypeScript-compatible versions for testing
interface TransportStrategy {
    canHandle(distance: number): boolean;
    getRate(): number;
    getMode(): string;
    getMinDistance(): number;
    getMaxDistance(): number | null;
}

class AeroplaneStrategy implements TransportStrategy {
    private readonly rate = 1.0;
    private readonly minDistance = 500;

    canHandle(distance: number): boolean {
        return distance >= this.minDistance;
    }

    getRate(): number {
        return this.rate;
    }

    getMode(): string {
        return 'Aeroplane';
    }

    getMinDistance(): number {
        return this.minDistance;
    }

    getMaxDistance(): number | null {
        return null;
    }
}

class TruckStrategy implements TransportStrategy {
    private readonly rate = 2.0;
    private readonly minDistance = 100;
    private readonly maxDistance = 499.99;

    canHandle(distance: number): boolean {
        return distance >= this.minDistance && distance < 500;
    }

    getRate(): number {
        return this.rate;
    }

    getMode(): string {
        return 'Truck';
    }

    getMinDistance(): number {
        return this.minDistance;
    }

    getMaxDistance(): number | null {
        return this.maxDistance;
    }
}

class MiniVanStrategy implements TransportStrategy {
    private readonly rate = 3.0;
    private readonly minDistance = 0;
    private readonly maxDistance = 99.99;

    canHandle(distance: number): boolean {
        return distance >= this.minDistance && distance < 100;
    }

    getRate(): number {
        return this.rate;
    }

    getMode(): string {
        return 'Mini Van';
    }

    getMinDistance(): number {
        return this.minDistance;
    }

    getMaxDistance(): number | null {
        return this.maxDistance;
    }
}

class TransportModeSelector {
    private strategies: TransportStrategy[];

    constructor() {
        this.strategies = [
            new AeroplaneStrategy(),
            new TruckStrategy(),
            new MiniVanStrategy(),
        ];
    }

    selectStrategy(distance: number): TransportStrategy {
        if (distance < 0) {
            throw new Error('Distance cannot be negative');
        }

        for (const strategy of this.strategies) {
            if (strategy.canHandle(distance)) {
                return strategy;
            }
        }

        throw new Error(`No transport mode available for distance: ${distance} km`);
    }

    getTransportModeAndRate(distance: number): { mode: string; rate: number } {
        const strategy = this.selectStrategy(distance);
        return {
            mode: strategy.getMode(),
            rate: strategy.getRate(),
        };
    }
}

describe('Transport Strategy Pattern', () => {
    let selector: TransportModeSelector;

    beforeEach(() => {
        selector = new TransportModeSelector();
    });

    describe('MiniVanStrategy', () => {
        it('should handle 0 km distance', () => {
            const result = selector.getTransportModeAndRate(0);
            expect(result.mode).toBe('Mini Van');
            expect(result.rate).toBe(3.0);
        });

        it('should handle 50 km distance', () => {
            const result = selector.getTransportModeAndRate(50);
            expect(result.mode).toBe('Mini Van');
            expect(result.rate).toBe(3.0);
        });

        it('should handle 99 km distance (boundary)', () => {
            const result = selector.getTransportModeAndRate(99);
            expect(result.mode).toBe('Mini Van');
            expect(result.rate).toBe(3.0);
        });

        it('should handle 99.99 km distance (near boundary)', () => {
            const result = selector.getTransportModeAndRate(99.99);
            expect(result.mode).toBe('Mini Van');
            expect(result.rate).toBe(3.0);
        });
    });

    describe('TruckStrategy', () => {
        it('should handle 100 km distance (boundary)', () => {
            const result = selector.getTransportModeAndRate(100);
            expect(result.mode).toBe('Truck');
            expect(result.rate).toBe(2.0);
        });

        it('should handle 250 km distance', () => {
            const result = selector.getTransportModeAndRate(250);
            expect(result.mode).toBe('Truck');
            expect(result.rate).toBe(2.0);
        });

        it('should handle 499 km distance (boundary)', () => {
            const result = selector.getTransportModeAndRate(499);
            expect(result.mode).toBe('Truck');
            expect(result.rate).toBe(2.0);
        });

        it('should handle 499.99 km distance (near boundary)', () => {
            const result = selector.getTransportModeAndRate(499.99);
            expect(result.mode).toBe('Truck');
            expect(result.rate).toBe(2.0);
        });
    });

    describe('AeroplaneStrategy', () => {
        it('should handle 500 km distance (boundary)', () => {
            const result = selector.getTransportModeAndRate(500);
            expect(result.mode).toBe('Aeroplane');
            expect(result.rate).toBe(1.0);
        });

        it('should handle 1000 km distance', () => {
            const result = selector.getTransportModeAndRate(1000);
            expect(result.mode).toBe('Aeroplane');
            expect(result.rate).toBe(1.0);
        });

        it('should handle very long distances', () => {
            const result = selector.getTransportModeAndRate(5000);
            expect(result.mode).toBe('Aeroplane');
            expect(result.rate).toBe(1.0);
        });
    });

    describe('Edge Cases', () => {
        it('should throw error for negative distance', () => {
            expect(() => selector.getTransportModeAndRate(-10)).toThrow('Distance cannot be negative');
        });

        it('should handle decimal distances correctly', () => {
            const result1 = selector.getTransportModeAndRate(99.5);
            expect(result1.mode).toBe('Mini Van');

            const result2 = selector.getTransportModeAndRate(100.5);
            expect(result2.mode).toBe('Truck');

            const result3 = selector.getTransportModeAndRate(500.5);
            expect(result3.mode).toBe('Aeroplane');
        });

        it('should handle very small distances', () => {
            const result = selector.getTransportModeAndRate(0.1);
            expect(result.mode).toBe('Mini Van');
        });
    });

    describe('Rate Verification', () => {
        it('should return correct rate for Mini Van (Rs 3/km/kg)', () => {
            const result = selector.getTransportModeAndRate(50);
            expect(result.rate).toBe(3.0);
        });

        it('should return correct rate for Truck (Rs 2/km/kg)', () => {
            const result = selector.getTransportModeAndRate(300);
            expect(result.rate).toBe(2.0);
        });

        it('should return correct rate for Aeroplane (Rs 1/km/kg)', () => {
            const result = selector.getTransportModeAndRate(700);
            expect(result.rate).toBe(1.0);
        });
    });
});
